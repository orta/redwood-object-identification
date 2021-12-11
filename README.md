# Redwood Object Identification Pattern Example

The [GraphQL Object Identification Pattern](https://relay.dev/graphql/objectidentification.htm) is a design pattern where you ensure that every object in your GraphQL schema conforms to a single interface:

```graphql
interface Node {
  id: ID!
}
```

Which means you can write something like:

```graphql
type Query {
  node(id: ID): Node! @skipAuth
}
```

This is interesting, because now you have a guaranteed query to be able to get the info for any object in your graph! This feature gives you a [bunch of caching super-powers in Relay](https://relay.dev/docs/guided-tour/reusing-cached-data/) and probably with Apollo (I don't know their caching strats, but it would make re-fetching trivial).

## This Repo

That said, for my case this repo currently handles `Node` in a different place, I wanted to create the anti-`node` resolver:

```graphql
type Mutation {
  deleteNode(id: ID): Node! @requireAuth
}
```

This is useful for the sample because I only need one model to be useful and also because [queries](https://github.com/redwoodjs/redwood/issues/3873) with inline fragments crash ATM.

## Getting Set Up

1. We're going to need some GraphQL SDL and corresponding resolvers:

> [`api/src/graphql/objectIdentification.sdl.ts`](./api/src/graphql/objectIdentification.sdl.ts):

```graphql
export const schema = gql`
  scalar ID

  interface Node {
    id: ID!
  }

  type Query {
    node(id: ID): Node! @skipAuth
  }

  type Mutation {
    deleteNode(id: ID): Node! @requireAuth
  }
`
```

This sets up some new graphql fields, and declares the new primitive `ID` which is an arbitrary string under the hood.

To understand the `ID`, let's look at how I implement it in

> [`./api/src/services/users/users.ts`](./api/src/services/users/users.ts):
```ts
import cuid from "cuid"
import { db } from "src/lib/db"

export const createUser = ({ input }: CreateUserArgs) => {
  input.id = cuid() + ":user"
  input.slug = cuid.slug()

  return db.user.create({
    data: input,
  })
}
```

Prior to setting up for Object Identification, I would have made a prisma schema like:

```prisma
model User {
  id String @id @default(cuid())
}
```

This... doesn't _really_ work in the Object Identification era because a `cuid` is as good UUID, but there's no (safe/simple/easy) of going from the UUID string back to the original object without

<details>
  <summary markdown="span">Really though?</summary>

I had a few ideas for this, starting with making an object-identification query that looks in all potential db tables via a custom query... That's a bit dangerous and then you need to figure out which table you found the object in and _then_ start thinking about that objects access rights. That's tricky.

Another alternative I explored was having prisma generate a `dbID` via  `dbID String @id @default(cuid())` then have a postgres function run on a row write to generate an `id` with the suffix indicating the type. This kinda worked, but was a bit meh. At that point I gave up on letting prisma handle it at all.

So I recommend having a totally globally unique `id` via a cuid + prefix, and then have a `slug` if you ever need to present it to the user via a URL.

To handle this case, I've been using this for resolving a single item:

```ts
export const user = async (args: { id: string }) => {
  // Allow looking up with the same function with either slug or id
  const query = args.id.length > 10 ? { id: args.id } : { slug: args.id }
  const user = await db.user.findUnique({ where: query })

  return user
}
```

Which allows you to resolve a user with either `slug` or `id`.

</details>

So instead:

```prisma
model User {
  id String  @id @unique
}
```

Under the hood `ID` is a real `cuid` mixed with an identifier prefix which lets you know which object it came from. The simplest implementation would look like this:

```ts
import { user } from "./users/users"

export const node = (args: { id: string }) => {
  if (args.id.endsWith(":user")) {
    return user({ id: args.id })
  }

  throw new Error(`Did not find a resolver for node with ${args.id}`)
}
```

Basically, by looking at the end of the `ID` we can know which underlying graphql resolver we should forward the request to, this means no duplication of access control inside the `node` function - it just forwards to other resolvers.

The next thing you would hit is kind of only something you hit when you try this in practice. We're now writing to `interface`s and not concrete types, which means there are new GraphQL things to handle. We have to have [a way in](https://github.com/graphql/graphql-js/issues/876#issuecomment-304398882) the GraphQL server to go from an `interface` (or `union`) to the concrete type.

That is done by one of two methods, depending on your needs:

- A single function which can disambiguate the types ( `Node.resolveType` )
- Each concrete type can have a way to declare if the JS object is one of this GraphQL type ( `User.isTypeOf` )

Now, today (v1.0rc), doing either of these things isn't possible via the normal RedwoodJS APIs, it's complicated but roughly the `*.sdl.ts` files only let you create resolvers and not manipulate the schema objects in your app. So, we'll write a quick `envelop` plugin do handle that for us:

```ts
export const createNodeResolveEnvelopPlugin = (): Plugin => {
  return {
    onSchemaChange({ schema }) {
      const node: { resolveType?: (obj: { id: string }) => string } = schema.getType("Node") as unknown
      node.resolveType = (obj) => {
        if (obj.id.endsWith(":user")) {
          return "User"
        }

        throw new Error(`Did not find a resolver for deleteNode with ${args.id}`)
      }
    }
  }
}

```

And then add that to the graphql function:

```diff
+ import { createNodeResolveEnvelopPlugin } from "src/services/objectIdentification"

export const handler = createGraphQLHandler({
  loggerConfig: { logger, options: {} },
  directives,
  sdls,
  services,
+  extraPlugins: [createNodeResolveEnvelopPlugin()],
  onException: () => {
    // Disconnect from your database with an unhandled exception.
    db.$disconnect()
  },
})

```

The real implementation in this app is a little more abstract [`/api/src/services/objectIdentification.ts](./api/src/services/objectIdentification.ts) but it does the work well. Then you can see the new `DeleteButton` which I added using the `deleteNode`:

```ts
import { navigate, routes } from "@redwoodjs/router"
import { useMutation } from "@redwoodjs/web"
import { toast } from "@redwoodjs/web/dist/toast"

const DELETE_NODE_MUTATION = gql`
  mutation DeleteNodeMutation($id: ID!) {
    deleteNode(id: $id) {
      id
    }
  }
`

export const DeleteButton = (props: { id: string; displayName: string }) => {
  const [deleteUser] = useMutation(DELETE_NODE_MUTATION, {
    onCompleted: () => {
      toast.success(`${props.displayName} deleted`)
      navigate(routes.users())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = () => {
    if (confirm(`Are you sure you want to delete ${props.displayName}?`)) {
      deleteUser({ variables: { id: props.id } })
    }
  }
  return (
    <button type="button" title={`Delete ${props.displayName}`} className="rw-button rw-button-small rw-button-red" onClick={onDeleteClick}>
      Delete
    </button>
  )
}
```

It can delete any object which conforms to the `Node` protocol. :+1:

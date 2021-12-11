import { deleteUser, user } from "./users/users"
import type { Plugin } from "@envelop/types"

const nodeTypes = {
  ":user": {
    type: "User",
    get: user,
    delete: deleteUser,
  },
}

const keys = Object.keys(nodeTypes)

export const node = (args: { id: string }) => {
  for (const key of keys) {
    if (args.id.endsWith(key)) {
      return nodeTypes[key].get({ id: args.id })
    }
  }

  throw new Error(`Did not find a resolver for node with ${args.id}`)
}

export const deleteNode = (args) => {
  for (const key of keys) {
    if (args.id.endsWith(key)) {
      return nodeTypes[key].delete({ id: args.id })
    }
  }
  throw new Error(`Did not find a resolver for deleteNode with ${args.id}`)
}

export const createNodeResolveEnvelopPlugin = (): Plugin => {
  return {
    onSchemaChange({ schema }) {
      const node: { resolveType?: (obj: { id: string }) => string } = schema.getType("Node") as unknown
      node.resolveType = (obj) => {
        for (const key of keys) {
          if (obj.id.endsWith(key)) {
            return nodeTypes[key].type
          }
        }
        throw new Error(`Did not find a resolver for deleteNode with ${args.id}`)
      }
    },
  }
}

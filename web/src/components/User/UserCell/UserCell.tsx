import type { FindUserById } from "types/graphql"
import type { CellSuccessProps, CellFailureProps } from "@redwoodjs/web"

import User from "src/components/User/User"

export const QUERY = gql`
  query FindUserById($slug: String!) {
    user: user(id: $slug) {
      id
      slug
      email
      name
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>User not found</div>

export const Failure = ({ error }: CellFailureProps) => <div className="rw-cell-error">{error.message}</div>

export const Success = ({ user }: CellSuccessProps<FindUserById>) => {
  return <User user={user} />
}

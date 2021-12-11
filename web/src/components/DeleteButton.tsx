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

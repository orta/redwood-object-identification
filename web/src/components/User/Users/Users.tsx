import { Link, routes } from "@redwoodjs/router"
import { DeleteButton } from "src/components/DeleteButton"

const MAX_STRING_LENGTH = 150

const truncate = (text) => {
  let output = text
  if (text && text.length > MAX_STRING_LENGTH) {
    output = output.substring(0, MAX_STRING_LENGTH) + "..."
  }
  return output
}

const UsersList = ({ users }) => {
  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>id</th>
            <th>slug</th>
            <th>Email</th>
            <th>Name</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{truncate(user.id)}</td>
              <td>{truncate(user.slug)}</td>
              <td>{truncate(user.email)}</td>
              <td>{truncate(user.name)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.user({ slug: user.slug })}
                    title={"Show user " + user.id + " detail"}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editUser({ slug: user.slug })}
                    title={"Edit user " + user.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <DeleteButton id={user.id} displayName="user" />
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersList

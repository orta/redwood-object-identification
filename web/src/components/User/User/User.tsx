import { Link, routes } from "@redwoodjs/router"
import { DeleteButton } from "src/components/DeleteButton"

const User = ({ user }) => {
  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">User {user.id} Detail</h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>id</th>
              <td>{user.id}</td>
            </tr>
            <tr>
              <th>slug</th>
              <td>{user.slug}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{user.email}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{user.name}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link to={routes.editUser({ slug: user.slug })} className="rw-button rw-button-blue">
          Edit
        </Link>
        <DeleteButton id={user.id} displayName={user.name || "user"} />
      </nav>
    </>
  )
}

export default User

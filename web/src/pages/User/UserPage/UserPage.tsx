import UserCell from "src/components/User/UserCell"

type UserPageProps = {
  slug: string
}

const UserPage = ({ slug }: UserPageProps) => {
  return <UserCell slug={slug} />
}

export default UserPage

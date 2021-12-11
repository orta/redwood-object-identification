import EditUserCell from "src/components/User/EditUserCell"

type UserPageProps = {
  slug: string
}

const EditUserPage = ({ slug }: UserPageProps) => {
  return <EditUserCell slug={slug} />
}

export default EditUserPage

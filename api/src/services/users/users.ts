import type { Prisma } from "@prisma/client"
import cuid from "cuid"
import { db } from "src/lib/db"

export const users = () => {
  return db.user.findMany()
}

export const user = async (args: { id: string }) => {
  // Allow looking up with the same function with either slug or id
  const query = args.id.length > 10 ? { id: args.id } : { slug: args.id }
  const user = await db.user.findUnique({ where: query })

  return user
}

interface CreateUserArgs {
  input: Prisma.UserCreateInput
}

export const createUser = ({ input }: CreateUserArgs) => {
  input.id = cuid() + ":user"
  input.slug = cuid.slug()

  return db.user.create({
    data: input,
  })
}

export const updateUser = (args: { id: string; input: Prisma.UserUpdateInput }) => {
  return db.user.update({
    data: args.input,
    where: { id: args.id },
  })
}

export const deleteUser = ({ id }: { id: string }) => {
  return db.user.delete({
    where: { id },
  })
}

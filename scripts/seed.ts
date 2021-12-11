import type { Prisma } from "@prisma/client"
import { db } from "api/src/lib/db"
import cuid from "cuid"

export default async () => {
  type Data = Omit<Prisma.UserCreateArgs["data"], "id" | "slug">

  const data: Data[] = [
    { name: "alice", email: "alice@example.com" },
    { name: "bob", email: "bob@example.com" },
    {
      name: "charlie",
      email: "charlie@example.com",
    },
    {
      name: "danielle",
      email: "dani@example.com",
    },
    { name: "eli", email: "eli@example.com" },
  ]

  Promise.all(
    data.map(async (userExample) => {
      const record = await db.user.create({
        data: {
          id: cuid() + ":user",
          slug: cuid.slug(),
          ...userExample,
        },
      })
      console.log(record)
    })
  )
}

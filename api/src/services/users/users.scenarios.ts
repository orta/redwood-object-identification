import type { Prisma } from "@prisma/client"

export const standard = defineScenario<Prisma.UserCreateArgs>({
  user: {
    one: { data: { email: "String7803398" } },
    two: { data: { email: "String9118803" } },
  },
})

export type StandardScenario = typeof standard

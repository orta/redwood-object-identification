import { users, user, createUser, updateUser, deleteUser } from "./users"
import type { StandardScenario } from "./users.scenarios"

describe("users", () => {
  scenario("returns all users", async (scenario: StandardScenario) => {
    const result = await users()

    expect(result.length).toEqual(Object.keys(scenario.user).length)
  })

  scenario("returns a single user", async (scenario: StandardScenario) => {
    const result = await user({ id: scenario.user.one.id })

    expect(result).toEqual(scenario.user.one)
  })

  scenario("creates a user", async () => {
    const result = await createUser({
      input: { email: "String7075649" },
    })

    expect(result.email).toEqual("String7075649")
  })

  scenario("updates a user", async (scenario: StandardScenario) => {
    const original = await user({ id: scenario.user.one.id })
    const result = await updateUser({
      id: original.id,
      input: { email: "String81914542" },
    })

    expect(result.email).toEqual("String81914542")
  })

  scenario("deletes a user", async (scenario: StandardScenario) => {
    const original = await deleteUser({ id: scenario.user.one.id })
    const result = await user({ id: original.id })

    expect(result).toEqual(null)
  })
})

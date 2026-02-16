import { db } from "@tokistack/db";
import { user } from "@tokistack/db/schema";

describe("API", () => {
  it("should connect to the database and query users", async () => {
    const users = await db.select().from(user);
    expect(users).toEqual([]);
  });
});

import { TestingDatabase } from "../../src/mongodb/_specs/mongo-test-utils";
import migration from "../20250820215229-create_system_tenant";

const database = new TestingDatabase();

describe("20250820215229-create_system_tenant", () => {
  beforeAll(async () => {
    await database.start();
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.close();
  });

  it("up", async () => {
    await migration.up(database.db, database.client);

    const tenants = await database.db.collection("tenants").find({}).toArray();

    expect(tenants).toEqual([
      {
        _id: "system",
        name: "System",
        ownerId: "system_owner",
        slug: "system",
        status: "active",
        subscription: {
          status: "ready",
        },
      },
    ]);
  });

  it("down", async () => {
    await migration.up(database.db, database.client);
    await migration.down(database.db, database.client);

    const tenants = await database.db.collection("tenants").find({}).toArray();

    expect(tenants).toHaveLength(0);
  });
});

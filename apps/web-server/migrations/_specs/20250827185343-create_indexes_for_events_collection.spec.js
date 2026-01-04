import { TestingDatabase } from "@org/common/mongo";

import migrate from "../20250827185343-create_indexes_for_events_collection";

const database = new TestingDatabase();

describe("20250827185343-create_indexes_for_events_collection", () => {
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
    await migrate.up(database.db);

    const indexes = await database.db
      .collection("events")
      .listIndexes()
      .toArray();

    expect(indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "status_1_occurredAt_1",
          key: { status: 1, occurredAt: 1 },
        }),
      ]),
    );
  });

  it("down", async () => {
    await migrate.up(database.db);

    await migrate.down(database.db);

    const indexes = await database.db
      .collection("events")
      .listIndexes()
      .toArray();

    expect(indexes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "status_1_occurredAt_1",
          key: { status: 1, occurredAt: 1 },
        }),
      ]),
    );
  });
});

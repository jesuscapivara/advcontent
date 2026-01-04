/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from "mongodb";

import { env } from "@org/common/env";
import { CollectionType, MongoConnection } from "@org/common/mongo";
import { ArrayUtils } from "@org/common/utils";

class TestingDatabase<Fixtures extends Record<CollectionType, any[]>> {
  static Collections = CollectionType;
  private idCache = new Map<string, ObjectId>();
  databaseName: string;

  defaultFixtures: Fixtures = {} as Fixtures;

  constructor() {
    this.databaseName = `testing_db_${Date.now()}`;
  }

  async start() {
    await MongoConnection.getInstance().connect(env.database.uri);
    await this.applyFixtures(this.defaultFixtures);
  }

  get db() {
    return MongoConnection.getInstance().getDb(this.databaseName);
  }

  get client() {
    return MongoConnection.getInstance().getClient();
  }

  async clear() {
    const collections = await this.db.listCollections().toArray();
    for (const coll of collections) {
      await this.db.collection(coll.name).deleteMany({
        $nor: [{ tenantId: "system" }, { _id: "system" as any }],
      });
    }

    this.idCache.clear();
  }

  async close() {
    await this.db.dropDatabase();
    await MongoConnection.getInstance().disconnect();
  }

  async applyFixtures(fixtures: Partial<Fixtures>) {
    await ArrayUtils.parallelFor(
      [...Object.entries(fixtures)],
      // eslint-disable-next-line @typescript-eslint/require-await
      async ([collection, data]) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        data.length && this.db.collection(collection).insertMany(data),
    );
  }

  createId(name?: string) {
    const id = new ObjectId();
    const _name = name || id.toHexString();

    const exists = this.idCache.has(_name);

    if (exists) throw new Error(`Essa key ${_name} ja existe no cache de id`);

    this.idCache.set(_name, id);

    return id;
  }

  getId(name: string) {
    const id = this.idCache.get(name);
    if (!id) throw new Error(`Id nao encontrado no cache para o nome ${name}`);

    return id;
  }
}

export { TestingDatabase };

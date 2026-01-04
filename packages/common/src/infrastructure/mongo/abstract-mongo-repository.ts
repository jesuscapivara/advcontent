import { Collection, Db, Document, ObjectId } from "mongodb";

import { Env } from "../../env";

import { CollectionType } from "./collection-type";
import { MongoConnection } from "./mongo-connection";
import { MongoTransaction } from "./mongo-transaction";
import { TenantIdSchema } from "./tenant-id-schema";

type Context = {
  tenantId: TenantIdSchema;
  env: Env;
};

type WithLookup<T, Extra> = T & Extra;

abstract class AbstractMongoRepository<Schema extends Document> {
  protected abstract collectionName: CollectionType;
  private db: Db;

  protected get collection(): Collection<Schema> {
    return this.db.collection<Schema>(this.collectionName);
  }

  protected get tenantId() {
    if (!this.context.tenantId) throw new Error("Tenant was not found");

    return this.context.tenantId;
  }

  constructor(
    private context: Context,
    private mongoTransaction?: MongoTransaction,
  ) {
    this.db = MongoConnection.getInstance().getDb(context.env.database.name);
  }

  nextIdentity(): string {
    return new ObjectId().toHexString();
  }

  get session() {
    return this?.mongoTransaction?.session;
  }
}

export { AbstractMongoRepository };

export type { WithLookup };

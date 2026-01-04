import { AbstractMongoRepository, CollectionType } from "@org/common/mongo";

import { Subscription } from "../../../domain/subscription/subscription";
import { SubscriptionRepository } from "../../../domain/subscription/subscription-repository";

import { SubscriptionMapper } from "./mapper";
import { SubscriptionSchema } from "./schema";

class MongoSubscriptionRepository
  extends AbstractMongoRepository<SubscriptionSchema>
  implements SubscriptionRepository
{
  protected collectionName = CollectionType.Subscriptions;

  async add(subscription: Subscription): Promise<void> {
    const schema = SubscriptionMapper.toSchema(subscription);

    await this.collection.insertOne(schema, { session: this.session });
  }

  async save(subscription: Subscription): Promise<void> {
    const schema = SubscriptionMapper.toSchema(subscription);

    const result = await this.collection.updateOne(
      { tenantId: schema.tenantId, _id: schema._id, version: schema.version },
      { $set: { ...schema, version: schema.version + 1 } },
      { session: this.session },
    );

    if (!result.modifiedCount) {
      throw new Error("conflict error");
    }
  }
}

export { MongoSubscriptionRepository };

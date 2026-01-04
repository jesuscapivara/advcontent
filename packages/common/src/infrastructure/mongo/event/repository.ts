import { Event, EventRepository } from "@org/common/event";

import { AbstractMongoRepository } from "../abstract-mongo-repository";
import { CollectionType } from "../collection-type";

import { EventMapper } from "./mapper";
import { EventSchema } from "./schema";

class MongoEventRepository
  extends AbstractMongoRepository<EventSchema>
  implements EventRepository
{
  collectionName = CollectionType.Events;

  async add(event: Event): Promise<void> {
    const schema = EventMapper.toSchema(event);

    await this.collection.insertOne(schema);
  }

  async nextPending(quantity: number): Promise<Event[]> {
    const docs = await this.collection
      .find({ status: "pending" })
      .sort({ occurredAt: 1 })
      .limit(quantity)
      .toArray();

    return docs.map((d) => EventMapper.toDomain(d));
  }

  async markAsDispatched(eventId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: eventId },
      { $set: { status: "dispatched" } },
    );
  }
}

export { MongoEventRepository };

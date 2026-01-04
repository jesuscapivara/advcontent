import { Event } from "@org/common/event";

import { TenantIdSchemaFactory } from "../tenant-id-schema";

import { EventSchema } from "./schema";

class EventMapper {
  static toSchema(event: Event): EventSchema {
    return {
      _id: event.id,
      tenantId: TenantIdSchemaFactory.create(event.tenantId),
      name: event.name,
      occurredAt: event.occurredAt,
      payload: event.payload,
      status: "pending",
    };
  }

  static toDomain(schema: EventSchema): Event {
    return new Event({
      name: schema.name,
      payload: schema.payload,
      id: schema._id,
      tenantId: schema.tenantId.toString(),
      occurredAt: schema.occurredAt,
    });
  }
}

export { EventMapper };

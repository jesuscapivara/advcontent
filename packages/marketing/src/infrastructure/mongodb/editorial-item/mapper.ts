import { ObjectId } from "mongodb";
import { TenantIdSchemaFactory } from "@org/common/mongo";
import { EditorialItem, EditorialStatus } from "../../../domain/editorial-calendar/editorial-item";
import { EditorialItemSchema } from "./schema";

export class EditorialItemMapper {
  static toDomain(schema: EditorialItemSchema): EditorialItem {
    return new EditorialItem({
      id: schema._id.toString(), // Converte ObjectId para string
      tenantId:
        typeof schema.tenantId === "string"
          ? schema.tenantId
          : schema.tenantId.toString(),
      topic: schema.topic,
      content: schema.content,
      status: schema.status as EditorialStatus,
      scheduledAt: schema.scheduledAt,
      complianceCheck: schema.complianceCheck,
      version: schema.version,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }

  static toSchema(domain: EditorialItem): EditorialItemSchema {
    return {
      _id: ObjectId.createFromHexString(domain.id),
      tenantId: TenantIdSchemaFactory.create(domain.tenantId),
      topic: domain.topic,
      content: domain.content,
      status: domain.status,
      scheduledAt: domain.scheduledAt,
      complianceCheck: domain.complianceCheck,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      version: domain.version,
    };
  }
}

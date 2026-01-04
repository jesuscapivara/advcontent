import { ObjectId } from "mongodb";
import {
  AbstractMongoRepository,
  CollectionType,
  TenantIdSchemaFactory,
} from "@org/common/mongo";
import {
  EditorialItem,
  EditorialStatus,
} from "../../../domain/editorial-calendar/editorial-item";
import { EditorialItemRepository } from "../../../domain/editorial-calendar/editorial-item-repository";
import { EditorialItemMapper } from "./mapper";
import { EditorialItemSchema } from "./schema";

export class MongoEditorialItemRepository
  extends AbstractMongoRepository<EditorialItemSchema>
  implements EditorialItemRepository
{
  protected collectionName = CollectionType.EditorialItems;

  async add(item: EditorialItem): Promise<void> {
    const schema = EditorialItemMapper.toSchema(item);
    await this.collection.insertOne(schema, { session: this.session });
  }

  async save(item: EditorialItem): Promise<void> {
    const schema = EditorialItemMapper.toSchema(item);

    const result = await this.collection.updateOne(
      {
        _id: schema._id,
        version: schema.version,
      },
      {
        $set: {
          ...schema,
          version: schema.version + 1,
          updatedAt: new Date(),
        },
      },
      { session: this.session }
    );

    if (!result.modifiedCount) {
      throw new Error("conflict error");
    }
  }

  async getById(id: string): Promise<EditorialItem | null> {
    const schema = await this.collection.findOne({
      _id: ObjectId.createFromHexString(id),
    });

    if (!schema) {
      return null;
    }

    return EditorialItemMapper.toDomain(schema);
  }

  // Método Especial: O Worker vai usar isso a cada minuto
  async findScheduledToPublish(now: Date): Promise<EditorialItem[]> {
    const cursor = this.collection.find({
      status: EditorialStatus.Scheduled,
      scheduledAt: { $lte: now }, // Agendado para AGORA ou ANTES
    });

    const schemas = await cursor.toArray();
    return schemas.map(EditorialItemMapper.toDomain);
  }

  // Método para o Dashboard (Calendário)
  async findByMonth(
    tenantId: string,
    month: number,
    year: number
  ): Promise<EditorialItem[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const cursor = this.collection.find({
      tenantId: TenantIdSchemaFactory.create(tenantId),
      scheduledAt: { $gte: start, $lte: end },
    });

    const schemas = await cursor.toArray();
    return schemas.map(EditorialItemMapper.toDomain);
  }

  // Método para o Feed (Lista todos os posts do tenant)
  async findByTenant(tenantId: string): Promise<EditorialItem[]> {
    const cursor = this.collection
      .find({
        tenantId: TenantIdSchemaFactory.create(tenantId),
      })
      .sort({ createdAt: -1 }); // Mais recentes primeiro

    const schemas = await cursor.toArray();
    return schemas.map(EditorialItemMapper.toDomain);
  }
}

import { ObjectId } from "mongodb";

type TenantIdSchema = ObjectId | "system" | "testing";

class TenantIdSchemaFactory {
  static create(id: string): TenantIdSchema {
    if (["system", "testing"].includes(id)) return id as TenantIdSchema;

    return ObjectId.createFromHexString(id);
  }
}

export { TenantIdSchemaFactory };
export type { TenantIdSchema };

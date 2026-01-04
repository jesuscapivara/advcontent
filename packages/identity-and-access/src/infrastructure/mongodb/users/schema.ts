import { ObjectId } from "mongodb";

import { MongoSchema, TenantIdSchema } from "@org/common/mongo";

type UserSchema = {
  tenantId: TenantIdSchema;
  roleId: ObjectId;

  name: string;
  email: string;
  status: string;
  hashPassword: string;
} & MongoSchema;

export type { UserSchema };

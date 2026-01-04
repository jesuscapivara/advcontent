import { ObjectId } from "mongodb";

import { MongoSchema, TenantIdSchema } from "@org/common/mongo";

type AccountVerificationSchema = {
  tenantId: TenantIdSchema;
  userId: ObjectId;

  status: string;
  hashToken: string;
  expiresAt: Date;
} & MongoSchema;

export type { AccountVerificationSchema };

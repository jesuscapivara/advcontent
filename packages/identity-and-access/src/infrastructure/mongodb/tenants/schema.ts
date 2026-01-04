import { ObjectId } from "mongodb";

import { MongoSchema, TenantIdSchema } from "@org/common/mongo";

import { TenantStatus } from "../../../domain/tenant/tenant-status";

type TenantSchema = {
  slug: string;
  owner: { ownerId: ObjectId; email: string };
  name: string;
  status: TenantStatus;
  subscription: {
    subscriptionId?: ObjectId;
    status: string;
  };
  contactInformation?: { email: string; phone: string; address: string };
} & MongoSchema<TenantIdSchema>;

export type { TenantSchema, TenantIdSchema };

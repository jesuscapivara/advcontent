import { ObjectId } from "mongodb";

import { MongoSchema } from "@org/common/mongo";

type PermissionSchema = {
  tenantId: ObjectId | "system";

  code: string;
  name: string;
  description: string;
} & MongoSchema;

export type { PermissionSchema };

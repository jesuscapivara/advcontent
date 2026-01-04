import { ObjectId } from "mongodb";

import { MongoSchema, TenantIdSchema } from "@org/common/mongo";

type RolePermissionSchema = {
  permissionId: ObjectId;
  code: string;
  name: string;
  description: string;
};

type RoleSchema = {
  tenantId: TenantIdSchema;

  name: string;
  description: string;
  type: string;
  permissions: RolePermissionSchema[];
} & MongoSchema;

export type { RoleSchema };

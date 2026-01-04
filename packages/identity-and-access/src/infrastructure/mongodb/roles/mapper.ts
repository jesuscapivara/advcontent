import { ObjectId } from "mongodb";

import { TenantIdSchemaFactory } from "@org/common/mongo";

import { Role } from "../../../domain/role/role";

import { RoleSchema } from "./schema";

class RoleMapper {
  static toSchema(role: Role): RoleSchema {
    return {
      _id: ObjectId.createFromHexString(role.id),
      tenantId: TenantIdSchemaFactory.create(role.tenantId),
      name: role.name,
      description: role.description,
      type: role.type,
      permissions: role.permissions.map((p) => ({
        ...p,
        permissionId: ObjectId.createFromHexString(p.permissionId),
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      version: role.version,
    };
  }

  static toDomain(schema: RoleSchema): Role {
    return new Role({
      id: schema._id.toHexString(),
      tenantId: schema.tenantId.toString(),
      name: schema.name,
      type: schema.type as Role["type"],
      permissions: schema.permissions.map(({ permissionId, ...rest }) => ({
        ...rest,
        permissionId: permissionId.toString(),
      })) as Role["permissions"],
      description: schema.description,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      version: schema.version,
    });
  }
}

export { RoleMapper };

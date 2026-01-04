import { ObjectId } from "mongodb";

import { TenantIdSchemaFactory, WithLookup } from "@org/common/mongo";

import { PermissionCode } from "../../../domain/permission/permission-code";
import { RoleType } from "../../../domain/role/role-type";
import { User } from "../../../domain/user/user";
import { UserRole } from "../../../domain/user/user-role";
import { UserStatus } from "../../../domain/user/user-status";
import { RoleSchema } from "../roles/schema";

import { UserSchema } from "./schema";

class UserMapper {
  static toSchema(user: User): UserSchema {
    return {
      _id: ObjectId.createFromHexString(user.id),
      tenantId: TenantIdSchemaFactory.create(user.tenantId),
      roleId: ObjectId.createFromHexString(user.role.roleId),

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hashPassword: user?.hashPassword?.value as any,
      name: user.name,
      status: user.status,
      version: user.version,
    };
  }

  static toDomain(user: WithLookup<UserSchema, { role: RoleSchema }>): User {
    return new User({
      id: user._id.toHexString(),
      tenantId: user.tenantId.toString(),
      role: new UserRole({
        roleId: user.role._id.toString(),
        type: user.role.type as RoleType,
        permissions: user.role.permissions.map(
          (i) => i.code,
        ) as PermissionCode[],
      }),
      name: user.name,
      email: user.email,
      status: user.status as UserStatus,
      version: user.version,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}

export { UserMapper };

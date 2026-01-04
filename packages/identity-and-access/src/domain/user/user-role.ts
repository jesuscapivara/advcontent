import z from "zod";

import { PermissionCode } from "../permission/permission-code";
import { Role } from "../role/role";
import { RoleType } from "../role/role-type";

type Props = {
  roleId: string;
  type: RoleType;
  permissions: PermissionCode[];
};

const Schema = z.object({
  roleId: z.string(),
  type: z.enum(RoleType),
  permissions: z.array(z.enum(PermissionCode)),
});

class UserRole {
  roleId: string;

  type: RoleType;

  permissions: PermissionCode[];

  constructor(props: Props) {
    this.roleId = props.roleId;
    this.type = props.type;
    this.permissions = props.permissions;

    Schema.parse(this);
  }

  static fromRole(role: Role) {
    return new UserRole({
      roleId: role.id,
      type: role.type,
      permissions: role.permissions.map((i) => i.code),
    });
  }
}

export { UserRole };

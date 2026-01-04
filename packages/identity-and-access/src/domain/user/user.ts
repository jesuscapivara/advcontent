import z from "zod";

import { Entity, EntityProps } from "@org/common/entity";

import { RoleType } from "../role/role-type";

import { HashPassword } from "./hash-password";
import { UserRole } from "./user-role";
import { UserStatus } from "./user-status";

type Props = {
  tenantId: string;
  role: UserRole;

  name: string;
  email: string;
  status: UserStatus;
  hashPassword?: HashPassword;
} & EntityProps;

const UserSchema = z.object({
  tenantId: z.string(),
  name: z.string(),
  email: z.email(),
  status: z.enum(UserStatus),
  hashPassword: z.object({ value: z.string() }).optional(),
});

class User extends Entity {
  tenantId: string;

  role: UserRole;

  name: string;

  email: string;

  status: UserStatus;

  hashPassword?: HashPassword;

  constructor(props: Props) {
    super(props);
    this.tenantId = props.tenantId;
    this.role = props.role;

    this.name = props.name;
    this.email = props.email;
    this.status = props.status;
    this.hashPassword = props.hashPassword;

    UserSchema.parse(this);
  }

  get isActive() {
    return this.status === UserStatus.Active;
  }

  get isTenantOwner() {
    return this.role.type === RoleType.TenantOwner;
  }

  activate() {
    this.status = UserStatus.Active;
  }

  assignRole(role: UserRole) {
    this.role = role;
  }
}

export { User };

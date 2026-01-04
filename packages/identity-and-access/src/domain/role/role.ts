import { Entity, EntityProps } from "@org/common/entity";

import { RolePermission } from "./role-permission";
import { RoleType } from "./role-type";

type Props = {
  tenantId: string;

  name: string;
  description: string;
  type: RoleType;
  permissions: RolePermission[];
} & EntityProps;

class Role extends Entity {
  tenantId: string;

  type: RoleType;

  name: string;

  description: string;

  permissions: RolePermission[];

  constructor(props: Props) {
    super(props);

    this.tenantId = props.tenantId;
    this.type = props.type;
    this.name = props.name;
    this.description = props.description;
    this.permissions = props.permissions;
  }

  get isTenantOwner() {
    return this.type === RoleType.TenantOwner;
  }
}

export { Role };

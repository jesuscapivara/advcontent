import { PermissionCode } from "../permission/permission-code";

type Props = {
  permissionId: string;
  code: PermissionCode;
  name: string;
  description: string;
};

class RolePermission {
  permissionId: string;

  code: PermissionCode;

  name: string;

  description: string;

  constructor(props: Props) {
    this.permissionId = props.permissionId;
    this.code = props.code;
    this.name = props.name;
    this.description = props.description;
  }
}

export { RolePermission };

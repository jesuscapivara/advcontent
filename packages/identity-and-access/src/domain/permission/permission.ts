import { Entity, EntityProps } from "@org/common/entity";

import { PermissionCode } from "./permission-code";

type Props = {
  code: PermissionCode;
  name: string;
  description: string;
} & EntityProps;

class Permission extends Entity {
  code: PermissionCode;

  name: string;

  description: string;

  constructor(props: Props) {
    super(props);

    this.code = props.code;
    this.name = props.name;
    this.description = props.description;
  }
}

export { Permission };

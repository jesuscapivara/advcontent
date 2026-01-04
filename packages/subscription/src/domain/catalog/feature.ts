import z from "zod";

import { PermissionCode } from "@org/identity-and-access/permission";

type Props = {
  code: PermissionCode;
  name: string;
  description: string;
  limit?: number;
};

const Schema = z.object({
  code: z.enum(PermissionCode),
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(255),
  limit: z.number().optional(),
});

class Feature {
  code: PermissionCode;

  name: string;

  description: string;

  limit?: number;

  constructor(props: Props) {
    this.code = props.code;
    this.name = props.name;
    this.description = props.description;
    this.limit = props.limit;

    Schema.parse(this);
  }
}

export { Feature };
export type { Props as FeatureProps };

import { TenantIdSchema } from "../tenant-id-schema";

type EventSchema = {
  _id: string;
  tenantId: TenantIdSchema;
  occurredAt: Date;
  name: string;
  payload: object;
  status: "pending" | "dispatched";
};

export type { EventSchema };

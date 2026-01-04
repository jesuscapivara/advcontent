import { MongoSchema, TenantIdSchema } from "@org/common/mongo";

import { Status } from "../../../domain/subscription/subscription";

type SubscriptionSchema = {
  tenantId: TenantIdSchema;
  status: Status;
  plan: {
    name: string;
    description: string;
    price: {
      amount: number;
      currency: string;
    };
    features: {
      code: string;
      name: string;
      description: string;
      limit?: number;
    }[];
    billingCycle: {
      durationInDays: number;
      discount: number;
      isDefault: boolean;
      type: string;
    };
  };
  startDate: Date;
  endDate: Date;
} & MongoSchema;

export type { SubscriptionSchema };

import { MongoSchema } from "@org/common/mongo";

type PlanSchema = {
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
  billingCycles: {
    durationInDays: number;
    discount: number;
    isDefault: boolean;
    type: string;
  }[];
  isTrial: boolean;
} & MongoSchema;

export type { PlanSchema };

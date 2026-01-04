import { ObjectId } from "mongodb";

import { Currency } from "@org/common/money";
import { PermissionCode } from "@org/identity-and-access/permission";

import { BillingCycleType } from "../../../domain/catalog/billing-cycle";
import { Plan } from "../../../domain/catalog/plan";

import { PlanSchema } from "./schema";

class PlanMapper {
  static toDomain(schema: PlanSchema): Plan {
    return new Plan({
      id: schema._id.toString(),
      name: schema.name,
      description: schema.description,
      price: {
        amount: schema.price.amount,
        currency: schema.price.currency as Currency,
      },
      features: schema.features.map((f) => ({
        code: f.code as PermissionCode,
        name: f.name,
        description: f.description,
        limit: f.limit || undefined,
      })),
      billingCycles: schema.billingCycles.map((b) => ({
        discount: b.discount,
        durationInDays: b.durationInDays,
        isDefault: b.isDefault,
        type: b.type as BillingCycleType,
      })),
      isTrial: schema.isTrial,

      version: schema.version,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }

  static toSchema(domain: Plan): PlanSchema {
    return {
      _id: ObjectId.createFromHexString(domain.id),
      name: domain.name,
      description: domain.description,
      price: {
        amount: domain.price.amount,
        currency: domain.price.currency,
      },
      features: domain.features.map((f) => ({
        code: f.code,
        name: f.name,
        description: f.description,
        limit: f.limit,
      })),
      billingCycles: domain.billingCycles.map((b) => ({
        discount: b.discount,
        durationInDays: b.durationInDays,
        isDefault: b.isDefault,
        type: b.type,
      })),
      isTrial: domain.isTrial,

      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      version: domain.version,
    };
  }
}

export { PlanMapper };

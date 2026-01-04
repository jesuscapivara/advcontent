import { ObjectId } from "mongodb";

import { Currency } from "@org/common/money";
import { TenantIdSchemaFactory } from "@org/common/mongo";
import { PermissionCode } from "@org/identity-and-access/permission";

import { BillingCycleType } from "../../../domain/catalog/billing-cycle";
import { Subscription } from "../../../domain/subscription/subscription";

import { SubscriptionSchema } from "./schema";

class SubscriptionMapper {
  static toDomain(schema: SubscriptionSchema): Subscription {
    return new Subscription({
      id: schema._id.toString(),
      tenantId: schema.tenantId.toString(),
      status: schema.status,
      plan: {
        name: schema.plan.name,
        description: schema.plan.description,
        price: {
          amount: schema.plan.price.amount,
          currency: schema.plan.price.currency as Currency,
        },
        features: schema.plan.features.map((f) => ({
          code: f.code as PermissionCode,
          name: f.name,
          description: f.description,
          limit: f.limit || undefined,
        })),
        billingCycle: {
          discount: schema.plan.billingCycle.discount,
          durationInDays: schema.plan.billingCycle.durationInDays,
          isDefault: schema.plan.billingCycle.isDefault,
          type: schema.plan.billingCycle.type as BillingCycleType,
        },
      },
      startDate: schema.startDate,
      endDate: schema.endDate,
      version: schema.version,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }

  static toSchema(domain: Subscription): SubscriptionSchema {
    return {
      _id: ObjectId.createFromHexString(domain.id),
      tenantId: TenantIdSchemaFactory.create(domain.tenantId),
      status: domain.status,
      plan: {
        name: domain.plan.name,
        description: domain.plan.description,
        price: {
          amount: domain.plan.price.amount,
          currency: domain.plan.price.currency,
        },
        features: domain.plan.features.map((f) => ({
          code: f.code,
          name: f.name,
          description: f.description,
          limit: f.limit,
        })),
        billingCycle: {
          discount: domain.plan.billingCycle.discount,
          durationInDays: domain.plan.billingCycle.durationInDays,
          isDefault: domain.plan.billingCycle.isDefault,
          type: domain.plan.billingCycle.type,
        },
      },
      startDate: domain.startDate,
      endDate: domain.endDate,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      version: domain.version,
    };
  }
}

export { SubscriptionMapper };

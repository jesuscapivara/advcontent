import { ObjectId } from "mongodb";

import { Slug } from "../../../domain/tenant/slug";
import { Subscription } from "../../../domain/tenant/subscription";
import { Tenant } from "../../../domain/tenant/tenant";

import { TenantSchema } from "./schema";

class TenantMapper {
  static toSchema(tenant: Tenant): TenantSchema {
    return {
      _id: ObjectId.createFromHexString(tenant.id),
      slug: tenant.slug.value,
      owner: {
        ownerId: ObjectId.createFromHexString(tenant.owner.ownerId),
        email: tenant.owner.email,
      },
      subscription: {
        status: tenant.subscription.status,
        subscriptionId: tenant.subscription.subscriptionId
          ? ObjectId.createFromHexString(tenant.subscription.subscriptionId)
          : undefined,
      },
      name: tenant.name,
      status: tenant.status,
      contactInformation: tenant.contactAddress,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      version: tenant.version,
    };
  }

  static toDomain(schema: TenantSchema): Tenant {
    return new Tenant({
      id: schema._id.toString(),
      owner: {
        ownerId: schema.owner.ownerId.toHexString(),
        email: schema.owner.email,
      },
      slug: new Slug(schema.slug),
      name: schema.name,
      status: schema.status,
      subscription: new Subscription({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: schema.subscription.status as any,
        subscriptionId: schema.subscription.subscriptionId?.toHexString(),
      }),
      contactInformation: schema.contactInformation || undefined,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      version: schema.version,
    });
  }
}

export { TenantMapper };

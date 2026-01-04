import { ObjectId } from "mongodb";

import { Branding } from "../../../domain/tenant/branding";
import { ProfessionalProfile } from "../../../domain/tenant/professional-profile";
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
      branding: tenant.branding
        ? {
            primaryColor: tenant.branding.primaryColor,
            secondaryColor: tenant.branding.secondaryColor,
            logoUrl: tenant.branding.logoUrl,
            fontFamily: tenant.branding.fontFamily,
          }
        : undefined,
      profile: tenant.profile
        ? {
            fullName: tenant.profile.fullName,
            oabNumber: tenant.profile.oabNumber,
            expertiseAreas: tenant.profile.expertiseAreas,
            toneOfVoice: tenant.profile.toneOfVoice,
          }
        : undefined,
      onboardingCompletedAt: tenant.onboardingCompletedAt,
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
      branding: schema.branding ? Branding.create(schema.branding) : undefined,
      profile: schema.profile
        ? ProfessionalProfile.create(schema.profile)
        : undefined,
      onboardingCompletedAt: schema.onboardingCompletedAt,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      version: schema.version,
    });
  }
}

export { TenantMapper };

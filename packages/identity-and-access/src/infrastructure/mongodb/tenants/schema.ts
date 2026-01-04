import { ObjectId } from "mongodb";

import { MongoSchema, TenantIdSchema } from "@org/common/mongo";

import {
  ExpertiseArea,
  ToneOfVoice,
} from "../../../domain/tenant/professional-profile";
import { TenantStatus } from "../../../domain/tenant/tenant-status";

type BrandingSchema = {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  fontFamily?: string;
};

type ProfessionalProfileSchema = {
  fullName: string;
  oabNumber?: string;
  expertiseAreas: ExpertiseArea[];
  toneOfVoice: ToneOfVoice;
};

type TenantSchema = {
  slug: string;
  owner: { ownerId: ObjectId; email: string };
  name: string;
  status: TenantStatus;
  subscription: {
    subscriptionId?: ObjectId;
    status: string;
  };
  contactInformation?: { email: string; phone: string; address: string };
  branding?: BrandingSchema;
  profile?: ProfessionalProfileSchema;
  onboardingCompletedAt?: Date;
} & MongoSchema<TenantIdSchema>;

export type {
  TenantSchema,
  TenantIdSchema,
  BrandingSchema,
  ProfessionalProfileSchema,
};

export { Tenant } from "../domain/tenant/tenant";
export { Slug } from "../domain/tenant/slug";
export { Subscription } from "../domain/tenant/subscription";
export { TenantStatus } from "../domain/tenant/tenant-status";
export { Branding } from "../domain/tenant/branding";
export {
  ProfessionalProfile,
  ExpertiseArea,
  ToneOfVoice,
} from "../domain/tenant/professional-profile";
export { CreateTenantUseCase } from "../application/create-tenant/create-tenant";
export { CompleteOnboardingUseCase } from "../application/complete-onboarding";
export * from "../domain/tenant/errors";
export { TenantCreatedEvent } from "../domain/tenant/tenant-created-event";
export { TenantOnboardingCompletedEvent } from "../domain/tenant/tenant-onboarding-completed-event";

export type { TenantCreatedEventProps } from "../domain/tenant/tenant-created-event";
export type { TenantRepository } from "../domain/tenant/tenant-repository";
export type {
  CreateTenantInput,
  CreateTenantOutput,
} from "../application/create-tenant/create-tenant";
export type { BrandingProps } from "../domain/tenant/branding";
export type { ProfessionalProfileProps } from "../domain/tenant/professional-profile";

export type { TenantSchema } from "../infrastructure/mongodb/tenants/schema";
export { MongoTenantRepository } from "../infrastructure/mongodb/tenants/repository";

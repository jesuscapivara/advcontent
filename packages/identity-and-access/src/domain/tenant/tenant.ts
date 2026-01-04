import z from "zod";

import { Entity, EntityProps } from "@org/common/entity";
import { Event } from "@org/common/event";

import { Branding, BrandingProps } from "./branding";
import { ContactInformation, ContactInformationProps } from "./contact-address";
import { Owner, OwnerProps } from "./owner";
import { ProfessionalProfile, ProfessionalProfileProps } from "./professional-profile";
import { Slug } from "./slug";
import { Subscription, SubscriptionProps } from "./subscription";
import { TenantOnboardingCompletedEvent } from "./tenant-onboarding-completed-event";
import { TenantStatus } from "./tenant-status";

type Props = {
  owner: OwnerProps;

  name: string;
  status: TenantStatus;
  slug: Slug;
  subscription: Subscription;

  contactInformation?: ContactInformationProps;
  branding?: Branding;
  profile?: ProfessionalProfile;
  onboardingCompletedAt?: Date;
} & EntityProps;

const TenantSchema = z.object({
  name: z.string(),
  status: z.enum(TenantStatus),
});

class Tenant extends Entity {
  owner: Owner;

  subscription: Subscription;

  name: string;

  status: TenantStatus;

  slug: Slug;

  contactAddress?: ContactInformation;

  branding?: Branding;

  profile?: ProfessionalProfile;

  onboardingCompletedAt?: Date;

  private domainEvents: Event[] = [];

  constructor(props: Props) {
    super(props);
    this.owner = new Owner(props.owner);

    this.name = props.name;
    this.status = props.status;
    this.slug = props.slug;

    this.contactAddress =
      props.contactInformation &&
      new ContactInformation(props.contactInformation);

    this.subscription = props.subscription;
    this.branding = props.branding;
    this.profile = props.profile;
    this.onboardingCompletedAt = props.onboardingCompletedAt;

    TenantSchema.parse(this);
  }

  get isActive() {
    return this.status === TenantStatus.Active;
  }

  get isOnboardingCompleted() {
    return !!this.onboardingCompletedAt;
  }

  activate() {
    this.status = TenantStatus.Active;
  }

  applySubscription(subscriptionId: SubscriptionProps["subscriptionId"]) {
    this.subscription = new Subscription({
      subscriptionId,
      status: Subscription.Status.Ready,
    });
  }

  completeOnboarding(branding: BrandingProps, profile: ProfessionalProfileProps): void {
    if (this.isOnboardingCompleted) {
      throw new Error("Onboarding já foi completado para este tenant");
    }

    this.branding = Branding.create(branding);
    this.profile = ProfessionalProfile.create(profile);
    this.onboardingCompletedAt = new Date();
    this.updatedAt = new Date();

    // Dispara evento para o Contexto de Marketing
    this.addDomainEvent(
      TenantOnboardingCompletedEvent.create({
        tenantId: this.id,
        expertiseAreas: this.profile.expertiseAreas,
        toneOfVoice: this.profile.toneOfVoice,
      }),
    );
  }

  private addDomainEvent(event: Event): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): Event[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  static create(id: string, owner: OwnerProps, name: string, slug: string) {
    return new Tenant({
      id,
      owner,
      name,
      slug: new Slug(slug),
      status: TenantStatus.PendingForEmailConfirmation,
      subscription: new Subscription({
        status: Subscription.Status.PendingSetup,
      }),
    });
  }
}

export { Tenant };

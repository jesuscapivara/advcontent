import z from "zod";

import { Entity, EntityProps } from "@org/common/entity";

import { ContactInformation, ContactInformationProps } from "./contact-address";
import { Owner, OwnerProps } from "./owner";
import { Slug } from "./slug";
import { Subscription, SubscriptionProps } from "./subscription";
import { TenantStatus } from "./tenant-status";

type Props = {
  owner: OwnerProps;

  name: string;
  status: TenantStatus;
  slug: Slug;
  subscription: Subscription;

  contactInformation?: ContactInformationProps;
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

    TenantSchema.parse(this);
  }

  get isActive() {
    return this.status === TenantStatus.Active;
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

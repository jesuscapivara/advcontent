import { Entity, EntityProps } from "@org/common/entity";
import { MoneyProps } from "@org/common/money";
import { PermissionCode } from "@org/identity-and-access/permission";

import { BillingCycle } from "../catalog/billing-cycle";
import { FeatureProps } from "../catalog/feature";

import { FeatureNotAvailableError, SubscriptionExpiredError } from "./errors";

enum Status {
  Active = "active",
  Canceled = "canceled",
  Expired = "expired",
}

type PlanSnapshot = {
  name: string;
  description: string;
  price: MoneyProps;
  features: FeatureProps[];
  billingCycle: BillingCycle;
};

type Props = {
  tenantId: string;
  status: Status;
  plan: PlanSnapshot;
  startDate: Date;
  endDate: Date;
} & EntityProps;

class Subscription extends Entity {
  static Status = Status;

  tenantId: string;

  status: Status;

  plan: PlanSnapshot;

  startDate: Date;

  endDate: Date;

  constructor(props: Props) {
    super(props);

    this.tenantId = props.tenantId;
    this.status = props.status;
    this.plan = props.plan;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
  }

  isFeatureIncluded(code: PermissionCode): boolean {
    return this.plan.features.some((f) => f.code === code);
  }

  get isExpired(): boolean {
    return new Date() > this.endDate;
  }

  canPerformAction(code: PermissionCode) {
    if (this.isExpired) throw new SubscriptionExpiredError();
    if (!this.isFeatureIncluded(code)) throw new FeatureNotAvailableError(code);
  }

  static create(id: string, tenantId: string, plan: PlanSnapshot) {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.billingCycle.durationInDays);

    return new Subscription({
      id,
      tenantId,
      startDate,
      endDate,
      plan,
      status: Status.Active,
    });
  }
}

export { Subscription, Status };
export type { PlanSnapshot };

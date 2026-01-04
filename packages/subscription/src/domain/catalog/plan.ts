import z from "zod";

import { Entity, EntityProps } from "@org/common/entity";
import { Money, MoneyProps } from "@org/common/money";
import { PermissionCode } from "@org/identity-and-access/permission";

import {
  BillingCycle,
  BillingCycleProps,
  BillingCycleType,
} from "./billing-cycle";
import {
  DefaultBillingCycleRequiredError,
  DuplicatedDefaultBillingCycleError,
  PermissionDuplicatedError,
} from "./errors";
import { FeatureProps, Feature } from "./feature";

type Props = {
  name: string;
  description: string;
  price: MoneyProps;
  features: FeatureProps[];
  billingCycles: BillingCycleProps[];
  isTrial?: boolean;
} & EntityProps;

const Schema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(255),
  features: z.array(z.instanceof(Feature)).min(1),
  billingCycles: z.array(z.instanceof(BillingCycle)).min(1),
  isTrial: z.boolean().optional(),
});

class Plan extends Entity {
  name: string;

  description: string;

  price: Money;

  features: FeatureProps[];

  billingCycles: BillingCycleProps[];

  isTrial: boolean;

  constructor(props: Props) {
    super(props);
    this.name = props.name;
    this.description = props.description;
    this.price = new Money(props.price);
    this.features = props.features?.map((f) => new Feature(f));
    this.billingCycles = props.billingCycles?.map((b) => new BillingCycle(b));
    this.isTrial = props.isTrial ?? false;

    Schema.parse(this);
    this.validateFeatures();
    this.validateBillingCycles();
  }

  private validateFeatures() {
    const permissions = new Set<PermissionCode>();

    this.features.forEach((f) => {
      if (permissions.has(f.code)) throw new PermissionDuplicatedError(f.code);

      permissions.add(f.code);
    });
  }

  private validateBillingCycles() {
    const defaultBillings = this.billingCycles.filter((i) => i.isDefault);

    if (defaultBillings.length > 1)
      throw new DuplicatedDefaultBillingCycleError();

    if (defaultBillings.length === 0)
      throw new DefaultBillingCycleRequiredError();
  }

  defaultBillingCycle() {
    return this.billingCycles.find((i) => i.isDefault)!;
  }

  isTrialPlan(): boolean {
    return this.isTrial;
  }

  asSnapshot(type: BillingCycleType) {
    const billingCycle = this.billingCycles.find((i) => i.type === type);
    if (!billingCycle)
      throw new Error(
        `The following Billing cycle does not exist. Billing cycle = ${type}`,
      );

    return {
      name: this.name,
      description: this.description,
      features: this.features,
      price: this.price.multiply(billingCycle.discount),
      billingCycle,
    };
  }
}

export { Plan };
export type { Props as PlanProps };

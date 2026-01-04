import z from "zod";

enum BillingCycleType {
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}

type Props = {
  durationInDays: number;
  type: BillingCycleType;
  discount: number;
  isDefault: boolean;
};

const Schema = z.object({
  durationInDays: z.number().min(0),
  discount: z.number().min(0).max(1),
  isDefault: z.boolean(),
  type: z.enum(BillingCycleType),
});

class BillingCycle {
  static Cycle = BillingCycleType;

  durationInDays: number;

  discount: number;

  type: BillingCycleType;

  isDefault: boolean;

  constructor(props: Props) {
    this.durationInDays = props.durationInDays;
    this.type = props.type;
    this.discount = props.discount;
    this.isDefault = props.isDefault;

    Schema.parse(this);
  }

  static weekly(discount: number, isDefault: boolean) {
    return new BillingCycle({
      durationInDays: 7,
      discount,
      type: BillingCycleType.Weekly,
      isDefault,
    });
  }

  static monthly(discount: number, isDefault: boolean) {
    return new BillingCycle({
      durationInDays: 30,
      discount,
      type: BillingCycleType.Monthly,
      isDefault,
    });
  }

  static yearly(discount: number, isDefault: boolean) {
    return new BillingCycle({
      durationInDays: 365,
      discount,
      type: BillingCycleType.Yearly,
      isDefault,
    });
  }
}

export { BillingCycle, BillingCycleType };
export type { Props as BillingCycleProps };

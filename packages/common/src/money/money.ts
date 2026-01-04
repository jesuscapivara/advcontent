import z from "zod";

type Props = {
  amount: number;
  currency: Currency;
};

enum Currency {
  BRL = "BRL",
}

const Schema = z.object({
  amount: z.number().min(0),
  currency: z.enum(Currency),
});

class Money {
  static Currency = Currency;

  amount: number;

  currency: Currency;

  constructor(props: Props) {
    this.amount = props?.amount;
    this.currency = props?.currency;

    Schema.parse(this);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency)
      throw new Error("Currencies must match");

    return new Money({
      amount: this.amount + other.amount,
      currency: this.currency,
    });
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency)
      throw new Error("Currencies must match");

    return new Money({
      amount: this.amount - other.amount,
      currency: this.currency,
    });
  }

  multiply(factor: number): Money {
    return new Money({ amount: this.amount * factor, currency: this.currency });
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}

export { Money, Currency };
export type { Props as MoneyProps };

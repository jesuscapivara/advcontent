import { Currency } from "@org/common/money";
import { PermissionCode } from "@org/identity-and-access/permission";

import { BillingCycle } from "../catalog/billing-cycle";
import {
  DefaultBillingCycleRequiredError,
  DuplicatedDefaultBillingCycleError,
  PermissionDuplicatedError,
} from "../catalog/errors";
import { Plan } from "../catalog/plan";

describe("Plan", () => {
  it("should throw when there are duplicated Permission on features list", () => {
    expect(
      () =>
        new Plan({
          id: "any_id",
          name: "any_name",
          description: "any_description",
          price: { amount: 0, currency: Currency.BRL },
          billingCycles: [BillingCycle.weekly(1, true)],
          features: [
            {
              code: PermissionCode.CreateRole,
              name: "any_name",
              description: "any_description",
            },
            {
              code: PermissionCode.CreateRole,
              name: "any_name",
              description: "any_description",
            },
          ],
        }),
    ).toThrow(new PermissionDuplicatedError(PermissionCode.CreateRole));
  });

  it("should throw when there are duplicated default Billing cycles", () => {
    expect(
      () =>
        new Plan({
          id: "any_id",
          name: "any_name",
          description: "any_description",
          price: { amount: 0, currency: Currency.BRL },
          billingCycles: [
            BillingCycle.weekly(1, true),
            BillingCycle.monthly(1, true),
          ],
          features: [
            {
              code: PermissionCode.CreateRole,
              name: "any_name",
              description: "any_description",
            },
          ],
        }),
    ).toThrow(DuplicatedDefaultBillingCycleError);
  });

  it("should throw when there is not default Billing cycles", () => {
    expect(
      () =>
        new Plan({
          id: "any_id",
          name: "any_name",
          description: "any_description",
          price: { amount: 0, currency: Currency.BRL },
          billingCycles: [
            BillingCycle.weekly(1, false),
            BillingCycle.monthly(1, false),
          ],
          features: [
            {
              code: PermissionCode.CreateRole,
              name: "any_name",
              description: "any_description",
            },
          ],
        }),
    ).toThrow(DefaultBillingCycleRequiredError);
  });
});

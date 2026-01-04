import { Currency } from "@org/common/money";
import { PermissionCode } from "@org/identity-and-access/permission";

import { BillingCycle } from "../catalog/billing-cycle";
import {
  FeatureNotAvailableError,
  SubscriptionExpiredError,
} from "../subscription/errors";
import { PlanSnapshot, Subscription } from "../subscription/subscription";

describe("Subscription (with mocked system date)", () => {
  const FIXED_NOW = new Date("2025-01-01T00:00:00Z");

  const planSnapshot: PlanSnapshot = {
    name: "Trial Plan",
    description: "Trial Plan Description",
    price: { amount: 0, currency: Currency.BRL },
    features: [
      {
        code: PermissionCode.CreateRole,
        description: "Can read",
        name: "Name",
      },
      {
        code: PermissionCode.DeleteRole,
        description: "Can write",
        name: "Name",
      },
    ],
    billingCycle: BillingCycle.weekly(1, true),
  };

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(FIXED_NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should create a Subscription with correct start and end dates", () => {
    const subscription = Subscription.create("sub-1", "tenant-1", planSnapshot);

    expect(subscription.tenantId).toBe("tenant-1");
    expect(subscription.status).toBe(Subscription.Status.Active);
    expect(subscription.startDate).toEqual(FIXED_NOW);
    expect(subscription.endDate).toEqual(new Date("2025-01-08T00:00:00.000Z"));
  });

  it("should return true if feature is included", () => {
    const subscription = Subscription.create("sub-2", "tenant-1", planSnapshot);

    expect(subscription.isFeatureIncluded(PermissionCode.DeleteRole)).toBe(
      true,
    );
    expect(subscription.isFeatureIncluded(PermissionCode.CreateRole)).toBe(
      true,
    );
  });

  it("should return false if feature is not included", () => {
    const subscription = Subscription.create("sub-3", "tenant-1", planSnapshot);

    expect(subscription.isFeatureIncluded(PermissionCode.UpdateRole)).toBe(
      false,
    );
  });

  it("should throw SubscriptionExpiredError when trying to perform an action if expired", () => {
    const expired = new Subscription({
      id: "sub-4",
      tenantId: "tenant-1",
      plan: planSnapshot,
      status: Subscription.Status.Active,
      startDate: FIXED_NOW,
      endDate: new Date("2025-01-01T23:59:59Z"),
    });

    jest.setSystemTime(new Date("2025-02-01T00:00:00Z"));

    expect(() => expired.canPerformAction(PermissionCode.CreateRole)).toThrow(
      SubscriptionExpiredError,
    );

    jest.setSystemTime(FIXED_NOW);
  });

  it("should throw an Error if feature is not available to perform an action", () => {
    const subscription = Subscription.create("sub-5", "tenant-1", planSnapshot);

    expect(() =>
      subscription.canPerformAction("delete" as PermissionCode),
    ).toThrow(FeatureNotAvailableError);
  });

  it("should allow action if subscription is active and feature exists", () => {
    const subscription = Subscription.create("sub-6", "tenant-1", planSnapshot);

    expect(() =>
      subscription.canPerformAction(PermissionCode.CreateRole),
    ).not.toThrow();
  });

  it("should detect expiration correctly", () => {
    const expired = new Subscription({
      id: "sub-7",
      tenantId: "tenant-1",
      plan: planSnapshot,
      status: Subscription.Status.Active,
      startDate: FIXED_NOW,
      endDate: new Date("2025-01-02T00:00:00Z"),
    });

    jest.setSystemTime(new Date("2025-01-10T00:00:00Z"));
    expect(expired.isExpired).toBe(true);

    jest.setSystemTime(FIXED_NOW);
    const active = Subscription.create("sub-8", "tenant-1", planSnapshot);
    expect(active.isExpired).toBe(false);
  });
});

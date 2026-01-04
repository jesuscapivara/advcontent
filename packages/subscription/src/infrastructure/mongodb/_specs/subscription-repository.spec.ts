import { Env } from "@org/common/env";
import { Currency } from "@org/common/money";
import { TestingDatabase } from "@org/common/mongo";
import { PermissionCode } from "@org/identity-and-access/permission";

import { BillingCycle } from "../../../domain/catalog/billing-cycle";
import {
  Subscription,
  Status,
} from "../../../domain/subscription/subscription";
import { MongoSubscriptionRepository } from "../subscription/repository";

const database = new TestingDatabase();

const createSut = () => {
  const sut = new MongoSubscriptionRepository({
    tenantId: "system",
    env: { database: { name: database.databaseName } } as Env,
  });

  return { sut };
};

const createMockPlanSnapshot = () => ({
  name: "Test Plan",
  description: "Test Plan Description",
  price: { amount: 100, currency: Currency.BRL },
  features: [
    {
      code: PermissionCode.CreateRole,
      name: "Create Role",
      description: "Can create roles",
    },
    {
      code: PermissionCode.DeleteRole,
      name: "Delete Role",
      description: "Can delete roles",
      limit: 10,
    },
  ],
  billingCycle: BillingCycle.weekly(1, true),
});

describe("MongoSubscriptionRepository", () => {
  beforeAll(async () => {
    await database.start();
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.close();
  });

  it("should add subscription", async () => {
    const { sut } = createSut();

    const planSnapshot = createMockPlanSnapshot();
    const subscription = Subscription.create(
      database.createId("sub_1").toHexString(),
      database.createId("tenant_123").toString(),
      planSnapshot,
    );

    await sut.add(subscription);

    const subscriptions = await database.db
      .collection(TestingDatabase.Collections.Subscriptions)
      .find({})
      .toArray();

    expect(subscriptions).toEqual([
      {
        _id: database.getId("sub_1"),
        tenantId: database.getId("tenant_123"),
        status: "active",
        plan: {
          name: "Test Plan",
          description: "Test Plan Description",
          price: { amount: 100, currency: "BRL" },
          features: [
            {
              code: "create_role",
              name: "Create Role",
              description: "Can create roles",
              limit: null,
            },
            {
              code: "delete_role",
              name: "Delete Role",
              description: "Can delete roles",
              limit: 10,
            },
          ],
          billingCycle: {
            durationInDays: 7,
            discount: 1,
            isDefault: true,
            type: "weekly",
          },
        },
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        version: 0,
      },
    ]);
  });

  it("should save subscription", async () => {
    const { sut } = createSut();

    const planSnapshot = createMockPlanSnapshot();
    const subscription = Subscription.create(
      database.createId("sub_2").toHexString(),
      database.createId("tenant_123").toString(),
      planSnapshot,
    );

    await sut.add(subscription);

    subscription.status = Status.Canceled;
    await sut.save(subscription);

    const subscriptions = await database.db
      .collection(TestingDatabase.Collections.Subscriptions)
      .find({})
      .toArray();

    expect(subscriptions).toEqual([
      {
        _id: database.getId("sub_2"),
        tenantId: database.getId("tenant_123"),
        status: "canceled",
        plan: {
          name: "Test Plan",
          description: "Test Plan Description",
          price: { amount: 100, currency: "BRL" },
          features: [
            {
              code: "create_role",
              name: "Create Role",
              description: "Can create roles",
              limit: null,
            },
            {
              code: "delete_role",
              name: "Delete Role",
              description: "Can delete roles",
              limit: 10,
            },
          ],
          billingCycle: {
            durationInDays: 7,
            discount: 1,
            isDefault: true,
            type: "weekly",
          },
        },
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        version: 1,
      },
    ]);
  });

  it("should throw error when trying to save non-existent subscription", async () => {
    const { sut } = createSut();

    const planSnapshot = createMockPlanSnapshot();
    const subscription = new Subscription({
      id: database.createId("sub_3").toHexString(),
      tenantId: database.createId("tenant_123").toString(),
      status: Status.Active,
      plan: planSnapshot,
      startDate: new Date(),
      endDate: new Date(),
      version: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(sut.save(subscription)).rejects.toThrow("conflict error");

    const subscriptions = await database.db
      .collection(TestingDatabase.Collections.Subscriptions)
      .find({})
      .toArray();

    expect(subscriptions).toEqual([]);
  });
});

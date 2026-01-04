import { Job } from "bullmq";

import { Env } from "@org/common/env";
import { TestingDatabase } from "@org/common/mongo";
import { TestUtils } from "@org/common/utils";
import { RoleType } from "@org/identity-and-access/role";
import {
  Subscription,
  TenantCreatedEvent,
  TenantStatus,
} from "@org/identity-and-access/tenant";
import { UserStatus } from "@org/identity-and-access/user";

import { ProvisionTrialSubscriptionHandler } from "../provision-trial-subscription-handler";

const database = new TestingDatabase();

describe("ProvisionTrialSubscriptionHandler", () => {
  beforeAll(async () => {
    await database.start();
    await database.applyFixtures({
      tenants: [
        {
          _id: database.createId("tenant-a"),
          name: "Tenant A",
          slug: "tenant-a",
          status: TenantStatus.PendingForEmailConfirmation,
          owner: {
            ownerId: database.createId("tenant-a_owner"),
            email: "tenant-a@email.com",
          },
          subscription: { status: Subscription.Status.PendingSetup },
          version: 0,
        },
      ],
      users: [
        {
          _id: database.getId("tenant-a_owner"),
          tenantId: database.getId("tenant-a"),
          name: "Owner A",
          email: "email@email.com",
          status: UserStatus.PendingForEmailConfirmation,
          roleId: database.getId(RoleType.TenantOwner),
          version: 0,
        },
      ],
      plans_catalog: [
        {
          _id: database.createId("trial-plan"),
          name: "trial",
          description: "Trial Plan for new tenants",
          price: { amount: 0, currency: "BRL" },
          features: [
            {
              code: "create_role",
              name: "Create Role",
              description: "Can create roles",
            },
            {
              code: "delete_role",
              name: "Delete Role",
              description: "Can delete roles",
              limit: 10,
            },
          ],
          billingCycles: [
            {
              durationInDays: 7,
              discount: 1,
              isDefault: true,
              type: "weekly",
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 0,
        },
      ],
    });
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.close();
  });

  it("should provision trial subscription for new tenant", async () => {
    const tenantCreatedEvent = TenantCreatedEvent.create({
      tenantId: database.getId("tenant-a").toString(),
      ownerId: database.getId("tenant-a_owner").toString(),
      name: "Username",
      email: "email@email.com",
    });

    const sut = new ProvisionTrialSubscriptionHandler({
      database: { name: database.databaseName },
    } as Env);

    await sut.handle(
      TestUtils.mockClass<Job<TenantCreatedEvent>>({
        data: tenantCreatedEvent,
      }),
    );

    const subscriptions = await database.db
      .collection(TestingDatabase.Collections.Subscriptions)
      .find({})
      .toArray();

    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0]).toEqual({
      _id: expect.any(Object),
      tenantId: database.getId("tenant-a").toString(),
    });

    const tenant = await database.db
      .collection(TestingDatabase.Collections.Tenants)
      .findOne({ _id: database.getId("tenant-a") });

    expect(tenant!.subscription).toEqual({
      status: "ready",
      subscriptionId: subscriptions[0]!._id.toString(),
    });
  });
});

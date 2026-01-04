import { Job } from "bullmq";

import { Env } from "@org/common/env";
import { TestingDatabase } from "@org/common/mongo";
import { TestUtils } from "@org/common/utils";
import { AccountVerificationService } from "@org/identity-and-access/account-verification";
import { RoleType } from "@org/identity-and-access/role";
import {
  Subscription,
  TenantCreatedEvent,
  TenantStatus,
} from "@org/identity-and-access/tenant";
import { UserStatus } from "@org/identity-and-access/user";

import { RequestAccountVerificationHandler } from "../request-account-verification-handler";

const database = new TestingDatabase();

describe("requestAccountVerificationWorker", () => {
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
    });
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.close();
  });

  it("should request for account verification", async () => {
    const tenantCreatedEvent = TenantCreatedEvent.create({
      tenantId: database.getId("tenant-a").toString(),
      ownerId: database.getId("tenant-a_owner").toString(),
      name: "Username",
      email: "email@email.com",
    });

    const accountVerificationService =
      TestUtils.mockClass<AccountVerificationService>({
        sendEmailVerification: jest.fn(),
      });

    const sut = new RequestAccountVerificationHandler(
      { database: { name: database.databaseName } } as Env,
      accountVerificationService,
    );

    await sut.handle(
      TestUtils.mockClass<Job<TenantCreatedEvent>>({
        data: tenantCreatedEvent,
      }),
    );

    expect(accountVerificationService.sendEmailVerification).toHaveBeenCalled();

    const accountsVerifications = await database.db
      .collection(TestingDatabase.Collections.AccountsVerification)
      .find({})
      .toArray();

    expect(accountsVerifications).toHaveLength(1);
  });
});

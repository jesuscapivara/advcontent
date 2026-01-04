import Fastify, { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";

import { Env } from "@org/common/env";
import {
  AccountVerificationStatus,
  HashToken,
  Token,
} from "@org/identity-and-access/account-verification";
import { RoleType } from "@org/identity-and-access/role";
import { Subscription, TenantStatus } from "@org/identity-and-access/tenant";
import { UserStatus } from "@org/identity-and-access/user";

import { TestingDatabase } from "../../mongodb/testing-database";
import { registerRoutes } from "../../routes";
import { VerifyAccountInputDto } from "../verify-account-controller";

const database = new TestingDatabase();

const ownerId = new ObjectId();
const tenantId = new ObjectId();

describe("VerifyACcountController", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    await database.start();
    await database.applyFixtures({
      tenants: [
        {
          _id: tenantId,
          name: "Tenant A",
          slug: "tenant-a",
          status: TenantStatus.PendingForEmailConfirmation,
          owner: { ownerId, email: "tenant-a@email.com" },
          subscription: { status: Subscription.Status.PendingSetup },
          version: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      users: [
        {
          _id: ownerId,
          tenantId,
          name: "Owner A",
          email: "email@email.com",
          status: UserStatus.PendingForEmailConfirmation,
          roleId: database.getId(RoleType.TenantOwner),
          version: 0,
          hashPassword: "hash",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      accounts_verification: [
        {
          _id: new ObjectId(),
          tenantId,
          status: AccountVerificationStatus.Pending,
          userId: ownerId,
          hashToken: HashToken.fromToken(new Token("token")).value,
          version: 0,
          expiresAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
    server = Fastify({ logger: true });
    registerRoutes(server, {
      database: { name: database.databaseName },
    } as Env);
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.close();
    await server.close();
  });

  it("should verify tenant owner account", async () => {
    const body: VerifyAccountInputDto = {
      token: "token",
    };

    const response = await server.inject({
      method: "post",
      url: "/api/v1/accounts-verification/verify-account",
      body,
      headers: {
        host: "tenant-a.app.com",
      },
    });

    const tenant = await database.db
      .collection(TestingDatabase.Collections.Tenants)
      .findOne({ _id: tenantId });

    const owner = await database.db
      .collection(TestingDatabase.Collections.Users)
      .findOne({ _id: ownerId });

    const accountVerification = await database.db
      .collection(TestingDatabase.Collections.AccountsVerification)
      .findOne({ userId: ownerId });

    expect(response.statusCode).toBe(200);

    expect(owner).toMatchObject({ status: UserStatus.Active });
    expect(accountVerification).toMatchObject({
      status: AccountVerificationStatus.Used,
    });
    expect(tenant).toMatchObject({ status: TenantStatus.Active });
  });
});

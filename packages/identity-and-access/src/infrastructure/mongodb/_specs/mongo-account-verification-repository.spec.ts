import { ObjectId } from "mongodb";

import { Env } from "@org/common/env";
import { TestingDatabase } from "@org/common/mongo";

import {
  AccountVerification,
  AccountVerificationStatus,
} from "../../../domain/account-verification/account-verification";
import { HashToken } from "../../../domain/account-verification/hash-token";
import { MongoAccountVerificationRepository } from "../accounts-verification/repository";

const database = new TestingDatabase();
const tenantId = new ObjectId();

const createSut = () => {
  const sut = new MongoAccountVerificationRepository({
    tenantId,
    env: { database: { name: database.databaseName } } as Env,
  });
  return { sut };
};

describe("MongoAccountVerificationRepository", () => {
  beforeAll(async () => {
    await database.start();
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.close();
  });

  it("should add", async () => {
    const { sut } = createSut();

    const accountVerification = new AccountVerification({
      id: new ObjectId().toHexString(),
      tenantId: tenantId.toHexString(),
      userId: new ObjectId().toHexString(),
      expiresAt: new Date(),
      hashToken: new HashToken("hash_token"),
      status: AccountVerificationStatus.Pending,
    });

    await sut.add(accountVerification);

    const added = await database.db
      .collection("accounts_verification")
      .find({})
      .toArray();

    expect(added).toEqual([
      {
        tenantId,
        _id: new ObjectId(accountVerification.id),
        userId: new ObjectId(accountVerification.userId),
        hashToken: "hash_token",
        status: "pending",
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
        version: 0,
      },
    ]);
  });

  it("should save", async () => {
    const { sut } = createSut();

    const accountVerification = new AccountVerification({
      id: new ObjectId().toHexString(),
      tenantId: tenantId.toHexString(),
      userId: new ObjectId().toHexString(),
      expiresAt: new Date(),
      hashToken: new HashToken("hash_token"),
      status: AccountVerificationStatus.Pending,
    });

    await sut.add(accountVerification);

    accountVerification.hashToken = new HashToken("any");

    await sut.save(accountVerification);

    const added = await database.db
      .collection("accounts_verification")
      .find({})
      .toArray();

    expect(added).toEqual([
      {
        tenantId,
        _id: new ObjectId(accountVerification.id),
        userId: new ObjectId(accountVerification.userId),
        hashToken: "any",
        status: "pending",
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
        version: 1,
      },
    ]);
  });

  it("should check if has existing", async () => {
    const { sut } = createSut();

    const accountVerification = new AccountVerification({
      id: new ObjectId().toHexString(),
      tenantId: tenantId.toHexString(),
      userId: new ObjectId().toHexString(),
      expiresAt: new Date(),
      hashToken: new HashToken("hash_token"),
      status: AccountVerificationStatus.Pending,
    });

    await sut.add(accountVerification);

    const hasExisting = await sut.hasExisting(accountVerification.userId);

    expect(hasExisting).toBe(true);
  });

  it("should getByHashToken", async () => {
    const { sut } = createSut();

    const accountVerification = new AccountVerification({
      id: new ObjectId().toHexString(),
      tenantId: tenantId.toHexString(),
      userId: new ObjectId().toHexString(),
      expiresAt: new Date(),
      hashToken: new HashToken("hash_token"),
      status: AccountVerificationStatus.Pending,
    });

    await sut.add(accountVerification);

    const existing = (
      await sut.getByHashToken(accountVerification.hashToken)
    ).getData();

    expect(existing).toEqual(accountVerification);
  });
});

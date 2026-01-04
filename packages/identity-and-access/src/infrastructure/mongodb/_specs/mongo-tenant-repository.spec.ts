import { ObjectId } from "mongodb";

import { Env } from "@org/common/env";
import { TestingDatabase } from "@org/common/mongo";

import {
  TenantInUseError,
  TenantNotFoundError,
  TenantSlugInUseError,
} from "../../../domain/tenant/errors";
import { Slug } from "../../../domain/tenant/slug";
import { Tenant } from "../../../domain/tenant/tenant";
import { MongoTenantRepository } from "../tenants/repository";
import { TenantSchema } from "../tenants/schema";

const database = new TestingDatabase();
const tenantId = new ObjectId();

const createSut = () => {
  const sut = new MongoTenantRepository({
    tenantId,
    env: { database: { name: database.databaseName } } as Env,
  });
  return { sut };
};

describe("MongoTenantRepository", () => {
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

    const tenant = Tenant.create(
      new ObjectId().toHexString(),
      { ownerId: new ObjectId().toHexString(), email: "email@email.com" },
      "Default",
      "default",
    );
    tenant.contactAddress = {
      address: "address",
      email: "email@email.com",
      phone: "6599999999",
    };
    tenant.subscription.subscriptionId = new ObjectId().toHexString();

    await sut.add(tenant);

    const added = await database.db
      .collection("tenants")
      .findOne({ _id: new ObjectId(tenant.id) });

    expect(added).toEqual<TenantSchema>({
      _id: new ObjectId(tenant.id),
      owner: {
        ownerId: new ObjectId(tenant.owner.ownerId),
        email: "email@email.com",
      },
      slug: tenant.slug.value,
      status: tenant.status,
      name: tenant.name,
      subscription: {
        status: tenant.subscription.status,
        subscriptionId: new ObjectId(tenant.subscription.subscriptionId),
      },
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      version: tenant.version,
      contactInformation: tenant.contactAddress,
    });
  });

  it("should save", async () => {
    const { sut } = createSut();

    const tenant = Tenant.create(
      new ObjectId().toHexString(),
      { ownerId: new ObjectId().toHexString(), email: "email@email.com" },
      "Default",
      "default",
    );

    await sut.add(tenant);

    tenant.contactAddress = {
      address: "address",
      email: "email@email.com",
      phone: "6599999999",
    };
    tenant.subscription.subscriptionId = new ObjectId().toHexString();

    await sut.save(tenant);

    const edited = await database.db.collection("tenants").findOne({
      _id: new ObjectId(tenant.id),
    });

    expect(edited).toEqual<TenantSchema>({
      _id: new ObjectId(tenant.id),
      owner: {
        ownerId: new ObjectId(tenant.owner.ownerId),
        email: "email@email.com",
      },
      slug: tenant.slug.value,
      status: tenant.status,
      name: tenant.name,
      subscription: {
        status: tenant.subscription.status,
        subscriptionId: new ObjectId(tenant.subscription.subscriptionId),
      },
      contactInformation: tenant.contactAddress,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      version: 1,
    });
  });

  it("should getById", async () => {
    const { sut } = createSut();

    const tenant = Tenant.create(
      new ObjectId().toHexString(),
      { ownerId: new ObjectId().toHexString(), email: "email@email.com" },
      "Default",
      "default",
    );

    await sut.add(tenant);

    const result = await sut.getById(tenant.id);

    expect(result.getData()).toEqual(tenant);
  });

  it("should return TenantNotFoundError when getById", async () => {
    const { sut } = createSut();

    const tenant = Tenant.create(
      new ObjectId().toHexString(),
      { ownerId: new ObjectId().toHexString(), email: "email@email.com" },
      "Default",
      "default",
    );

    const result = await sut.getById(tenant.id);

    expect(result.getError()).toEqual(new TenantNotFoundError(tenant.id));
  });

  it("should check if slug exists", async () => {
    const { sut } = createSut();

    const tenant = Tenant.create(
      new ObjectId().toHexString(),
      { ownerId: new ObjectId().toHexString(), email: "email@email.com" },
      "Default",
      "default",
    );

    await sut.add(tenant);

    const exists = await sut.slugExists(tenant.slug);

    expect(exists).toBe(true);
  });

  it("should check if is unique", async () => {
    const { sut } = createSut();

    const tenant = Tenant.create(
      new ObjectId().toHexString(),
      { ownerId: new ObjectId().toHexString(), email: "email@email.com" },
      "Default",
      "default",
    );

    await sut.add(tenant);

    const isUnique1 = await sut.isUnique(tenant);
    const isUnique2 = await sut.isUnique(
      Tenant.create(
        new ObjectId().toHexString(),
        { ownerId: new ObjectId().toHexString(), email: "email@email.com" },
        "Default",
        "default-2",
      ),
    );
    const isUnique3 = await sut.isUnique(
      Tenant.create(
        new ObjectId().toHexString(),
        {
          ownerId: new ObjectId().toHexString(),
          email: "email2@email.com",
        },
        "Default",
        "default-2",
      ),
    );

    expect(() => isUnique1.getDataOrThrow()).toThrow(
      new TenantSlugInUseError(new Slug("default")),
    );

    expect(() => isUnique2.getDataOrThrow()).toThrow(
      new TenantInUseError("email@email.com"),
    );

    expect(isUnique3.getDataOrThrow()).toBe(true);
  });
});

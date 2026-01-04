import { Env } from "@org/common/env";
import { Currency } from "@org/common/money";
import { TestingDatabase } from "@org/common/mongo";
import { PermissionCode } from "@org/identity-and-access/permission";

import { BillingCycle } from "../../../domain/catalog/billing-cycle";
import { PlanNotFoundErrorError } from "../../../domain/catalog/errors";
import { Plan } from "../../../domain/catalog/plan";
import { MongoPlanRepository } from "../plan/repository";

const database = new TestingDatabase();

const createSut = () => {
  const sut = new MongoPlanRepository({
    tenantId: "system",
    env: { database: { name: database.databaseName } } as Env,
  });

  return { sut };
};

describe("MongoPlanRepository", () => {
  beforeAll(async () => {
    await database.start();
  });

  afterEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.close();
  });

  it("should create", async () => {
    const { sut } = createSut();

    const plan = new Plan({
      id: database.createId("plan_1").toHexString(),
      name: "Name",
      description: "description",
      price: { amount: 0, currency: Currency.BRL },
      features: [
        {
          code: PermissionCode.CreateRole,
          name: "name",
          description: "description",
        },
      ],
      billingCycles: [BillingCycle.weekly(1, true)],
    });

    await sut.create(plan);

    const plans = await database.db
      .collection(TestingDatabase.Collections.PlansCatalog)
      .find({})
      .toArray();

    expect(plans).toEqual([
      {
        _id: database.getId("plan_1"),
        name: "Name",
        description: "description",
        price: { amount: 0, currency: "BRL" },
        features: [
          {
            code: "create_role",
            name: "name",
            description: "description",
            limit: null,
          },
        ],
        billingCycles: [
          {
            discount: 1,
            durationInDays: 7,
            isDefault: true,
            type: "weekly",
          },
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        version: 0,
        isTrial: false,
      },
    ]);
  });

  it("should edit", async () => {
    const { sut } = createSut();

    const plan = new Plan({
      id: database.createId("plan_2").toHexString(),
      name: "Name",
      description: "description",
      price: { amount: 0, currency: Currency.BRL },
      features: [
        {
          code: PermissionCode.CreateRole,
          name: "name",
          description: "description",
        },
      ],
      billingCycles: [BillingCycle.weekly(1, true)],
    });

    await sut.create(plan);

    plan.name = "Another";
    plan.features = [
      { code: PermissionCode.DeleteRole, name: "other", description: "other" },
    ];

    await sut.edit(plan);

    const plans = await database.db
      .collection(TestingDatabase.Collections.PlansCatalog)
      .find({})
      .toArray();

    expect(plans).toEqual([
      {
        _id: database.getId("plan_2"),
        name: "Another",
        description: "description",
        price: { amount: 0, currency: "BRL" },
        features: [
          {
            code: "delete_role",
            name: "other",
            description: "other",
            limit: null,
          },
        ],
        billingCycles: [
          {
            discount: 1,
            durationInDays: 7,
            isDefault: true,
            type: "weekly",
          },
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        version: 1,
        isTrial: false,
      },
    ]);
  });

  it("should return PlanNotFoundError when trying to edit a Plan", async () => {
    const { sut } = createSut();

    const plan = new Plan({
      id: database.createId("plan_2").toHexString(),
      name: "Name",
      description: "description",
      price: { amount: 0, currency: Currency.BRL },
      features: [
        {
          code: PermissionCode.CreateRole,
          name: "name",
          description: "description",
        },
      ],
      billingCycles: [BillingCycle.weekly(1, true)],
    });

    const result = await sut.edit(plan);

    const plans = await database.db
      .collection(TestingDatabase.Collections.PlansCatalog)
      .find({})
      .toArray();

    expect(result.getError()).toEqual(new PlanNotFoundErrorError(plan.id));
    expect(plans).toEqual([]);
  });

  it("should get all", async () => {
    const { sut } = createSut();

    const plan = new Plan({
      id: database.createId("plan_1").toHexString(),
      name: "Name",
      description: "description",
      price: { amount: 0, currency: Currency.BRL },
      features: [
        {
          code: PermissionCode.CreateRole,
          name: "name",
          description: "description",
        },
        {
          code: PermissionCode.DeleteRole,
          name: "name",
          description: "description",
          limit: 1,
        },
      ],
      billingCycles: [BillingCycle.weekly(1, true)],
    });

    await sut.create(plan);

    const plans = await sut.getAll();

    expect(plans).toEqual([plan]);
  });
});

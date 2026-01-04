import Fastify, { FastifyInstance } from "fastify";

import { Env } from "@org/common/env";
import { Currency } from "@org/common/money";
import { PermissionCode } from "@org/identity-and-access/permission";
import { BillingCycle } from "@org/subscription/catalog";

import { TestingDatabase } from "../../mongodb/testing-database";
import { registerRoutes } from "../../routes";
import { CreatePlanInputDtoController } from "../create-plan-controller";

const database = new TestingDatabase();

describe("CreatePlanController", () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    await database.start();
    server = Fastify();
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

  it("should create a plan and return it", async () => {
    const planData: CreatePlanInputDtoController = {
      name: "Basic Plan",
      description: "A basic subscription plan",
      price: { amount: 1000, currency: Currency.BRL },
      features: [
        {
          code: PermissionCode.CreateRole,
          name: "Create Role",
          description: "Allows role creation",
        },
        {
          code: PermissionCode.ViewRole,
          name: "View Role",
          description: "Allows viewing roles",
          limit: 10,
        },
      ],
      billingCycles: [BillingCycle.monthly(1, true)],
    };

    const response = await server.inject({
      method: "POST",
      url: "/api/v1/system/plans",
      payload: planData,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();

    expect(body).toMatchObject({
      id: expect.any(String),
      version: 0,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      name: "Basic Plan",
      description: "A basic subscription plan",
      price: { amount: 1000, currency: "BRL" },
      features: [
        {
          code: "create_role",
          name: "Create Role",
          description: "Allows role creation",
        },
        {
          code: "view_role",
          name: "View Role",
          description: "Allows viewing roles",
          limit: 10,
        },
      ],
      billingCycles: [
        { name: "Monthly", durationInMonths: 1 },
        { name: "Yearly", durationInMonths: 12 },
      ],
    });
  });
});

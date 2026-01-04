/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import Fastify, { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";

import { Env } from "@org/common/env";

import { TestingDatabase } from "../../mongodb/testing-database";
import { registerRoutes } from "../../routes";
import { CreateTenantInputDto } from "../create-tenant-controller";

const database = new TestingDatabase();

describe("CreateTenantController", () => {
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

  it("should create a Tenant", async () => {
    const body: CreateTenantInputDto = {
      tenantName: "A Tenant",
      tenantSlug: "a-tenant",
      ownerName: "A owner",
      ownerEmail: "owner@email.com",
      password: "Password123@",
      confirmPassword: "Password123@",
    };

    const response = await server.inject({
      method: "post",
      url: "/api/v1/tenants",
      body,
    });

    const output = response.json();
    expect(response.statusCode).toBe(201);
    expect(output).toEqual({ id: expect.any(String) });

    const tenants = await database.db
      .collection(TestingDatabase.Collections.Tenants)
      .find({ _id: new ObjectId(output.id) })
      .toArray();

    const users = await database.db
      .collection(TestingDatabase.Collections.Users)
      .find({ tenantId: new ObjectId(output.id) })
      .toArray();

    const events = await database.db
      .collection(TestingDatabase.Collections.Events)
      .find({ tenantId: new ObjectId(output.id) })
      .toArray();

    expect(tenants).toHaveLength(1);
    expect(users).toHaveLength(1);
    expect(events).toHaveLength(1);
  });
});

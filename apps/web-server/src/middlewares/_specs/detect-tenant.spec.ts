/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

import { Env } from "@org/common/env";
import { TestingDatabase } from "@org/common/mongo";
import {
  MongoTenantRepository,
  Slug,
  TenantNotFoundError,
} from "@org/identity-and-access/tenant";

import { detectTenantMiddleware } from "../detect-tenant";

const database = new TestingDatabase();

const createSut = () => {
  const tenantRepository = new MongoTenantRepository({
    tenantId: "system",
    env: { database: { name: database.databaseName } } as Env,
  });

  const sut = (
    request: FastifyRequest,
    reply: FastifyReply,
    environment: Env["environment"],
  ) =>
    detectTenantMiddleware(request, reply, tenantRepository, {
      environment,
    } as Env);

  return { sut, tenantRepository };
};

const makeRequestReply = (host: string) => {
  const request = { headers: { host }, tenant: undefined } as any;
  const reply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as unknown as FastifyReply;

  return { request, reply };
};

describe("detectTenantMiddleware", () => {
  beforeAll(async () => {
    await database.start();

    await database.db
      .collection(TestingDatabase.Collections.Tenants)
      .insertOne({
        _id: new ObjectId(),
        name: "Testing",
        slug: "testing",
        ownerId: new ObjectId(),
        status: "active",
        subscription: {
          status: "ready",
          subscriptionId: new ObjectId(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 0,
      } as any);
  });

  afterAll(async () => {
    await database.close();
  });

  it("should detect Tenant when exists", async () => {
    const { sut, tenantRepository } = createSut();
    const { request, reply } = makeRequestReply("testing.app.com.br");

    await sut(request, reply, "production");

    const tenant = await tenantRepository.getBySlug(new Slug("testing"));

    expect(request.tenant).toEqual(tenant.getData());
    expect(reply.status).not.toHaveBeenCalled();
  });

  it("should fallback to testing in development", async () => {
    const { sut, tenantRepository } = createSut();
    const { request, reply } = makeRequestReply("localhost:3000");

    await sut(request, reply, "development");

    const tenant = await tenantRepository.getBySlug(new Slug("testing"));

    expect(request.tenant).toEqual(tenant.getData());
    expect(reply.status).not.toHaveBeenCalled();
  });

  it("should throw error when Tenant not found", async () => {
    const { sut } = createSut();
    const { request, reply } = makeRequestReply("not-found.app.com.br");

    await sut(request, reply, "production");

    expect(request.tenant).toBeUndefined();
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(TenantNotFoundError) }),
    );
  });

  it("should block access to the system tenant", async () => {
    const { sut } = createSut();
    const { request, reply } = makeRequestReply("system.app.com.br");

    await sut(request, reply, "production");

    expect(request.tenant).toBeUndefined();
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(TenantNotFoundError) }),
    );
  });
});

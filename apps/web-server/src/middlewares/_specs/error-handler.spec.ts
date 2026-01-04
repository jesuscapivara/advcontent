/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import { DomainError } from "@org/common/error";
import { Logger } from "@org/common/logger";
import { TestUtils } from "@org/common/utils";

import { errorHandlerMiddleware } from "../error-handler";

class TestingDomainError extends DomainError {}

describe("errorHandlerMiddleware", () => {
  let logger: Logger;
  let reply: FastifyReply;
  let request: FastifyRequest;

  beforeEach(() => {
    logger = TestUtils.mockClass<Logger>({
      debug: jest.fn(),
      error: jest.fn(),
    });

    reply = TestUtils.mockClass<FastifyReply>({
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    });

    request = TestUtils.mockClass<FastifyRequest>({
      id: "req-123",
      method: "POST",
      url: "/test",
      params: {},
      query: {},
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (request as any).tenant = { id: "tenant-1" };
  });

  it("should handle DomainError and return 400", () => {
    const handler = errorHandlerMiddleware(logger);
    const error = new TestingDomainError("Test domain error", "TEST_CODE");

    handler(error, request, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      error: {
        name: "TestingDomainError",
        code: "TEST_CODE",
        message: "Test domain error",
      },
    });
    expect(logger.debug).toHaveBeenCalledWith(error);
  });

  it("should handle ZodError and return 422", () => {
    const handler = errorHandlerMiddleware(logger);
    const zodError = new ZodError([
      {
        path: ["password"],
        message: "Invalid password",
        code: "custom",
      },
    ]) as any;

    handler(zodError, request, reply);

    expect(reply.status).toHaveBeenCalledWith(422);
    expect(reply.send).toHaveBeenCalledWith({
      error: {
        issues: [
          {
            path: ["password"],
            message: "Invalid password",
            code: "custom",
          },
        ],
      },
    });
    expect(logger.debug).toHaveBeenCalledWith(zodError);
  });

  it("should handle generic error and return 500", () => {
    const handler = errorHandlerMiddleware(logger);
    const error = new Error("Unexpected error");

    handler(error as any, request, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: {
        type: "InternalServerError",
        message: "Something went wrong",
      },
    });
    expect(logger.debug).toHaveBeenCalledWith(error);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Unexpected error",
        payload: expect.objectContaining({
          error,
          request: expect.objectContaining({
            id: "req-123",
            method: "POST",
            url: "/test",
          }),
        }),
        tenantId: "tenant-1",
      }),
    );
  });
});

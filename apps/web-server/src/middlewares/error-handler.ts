import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import { DomainError } from "@org/common/error";
import { Logger } from "@org/common/logger";

const errorHandlerMiddleware = (logger: Logger) => {
  return (
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    console.log(error);
    if (error instanceof DomainError) {
      return reply.status(400).send({
        error: {
          name: error.name,
          code: error.code,
          message: error.message,
        },
      });
    }

    if (error instanceof ZodError) {
      return reply.status(422).send({
        error: {
          issues: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
            code: issue.code,
          })),
        },
      });
    }

    const requestContext = {
      id: request.id,
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      tenantId: (request as any).tenant?.id,
    };

    logger.error({
      message: error.message,
      payload: { error, request: requestContext },
      tenantId: requestContext?.tenantId,
    });

    return reply.status(500).send({
      error: {
        type: "InternalServerError",
        message: "Something went wrong",
      },
    });
  };
};

export { errorHandlerMiddleware };

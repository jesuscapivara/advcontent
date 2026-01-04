import "dotenv/config";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";

import { env } from "@org/common/env";
import { JsonLogger } from "@org/common/logger";
import { MongoConnection } from "@org/common/mongo";

import { registerRoutes } from "./routes";

const startServer = async () => {
  const logger = new JsonLogger(env);
  const server = Fastify({
    logger: false,
  });

  logger.info({ message: "Starting the server..." });

  try {
    await MongoConnection.getInstance().connect(env.database.uri);

    await server.register(helmet);
    await server.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
      keyGenerator: (req) => req.ip,
    });
    await server.register(cors, {
      origin: env.server.allowedOrigins,
      methods: "*",
    });

    server.get("/health", () => ({ status: "ok" }));

    registerRoutes(server, env);

    await server.listen({ port: env.server.port });
    logger.info({ message: `Server is ready at localhost:${env.server.port}` });
  } catch (err) {
    await MongoConnection.getInstance().disconnect();
    logger.error({
      message: "Error when starting the server",
      payload: err as object,
    });
    logger.debug({
      message: "Error when starting the server",
      payload: err as object,
    });
    process.exit(1);
  }
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startServer();

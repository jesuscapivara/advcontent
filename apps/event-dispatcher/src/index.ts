/* eslint-disable @typescript-eslint/no-explicit-any */
import IORedis from "ioredis";

import { env } from "@org/common/env";
import { LoggerFactory, MongoEventRepository } from "@org/common/event";
import { MongoConnection } from "@org/common/mongo";
import { RequestAccountVerificationListener } from "@org/identity-and-access/account-verification";
import { ProvisionTrialSubscriptionListener } from "@org/subscription/subscription";
import { GenerateOnboardingContentListener } from "@org/marketing";

import { BullMQEventBus } from "./bullmq-event-bus";
import { EventDispatcher } from "./event-dispatcher";

const logger = LoggerFactory.createDefault();

const startServer = async () => {
  await MongoConnection.getInstance().connect(env.database.uri);
  const redis = new IORedis(env.redis);

  const eventBus = new BullMQEventBus(env.redis, logger);

  eventBus.registerListener(RequestAccountVerificationListener.asObject());
  eventBus.registerListener(ProvisionTrialSubscriptionListener.asObject());
  eventBus.registerListener(GenerateOnboardingContentListener.asObject());

  const dispatcher = new EventDispatcher({
    eventBus,
    eventRepository: new MongoEventRepository({ env, tenantId: "system" }),
    logger,
  });

  dispatcher.start();
  logger.debug("[dispatcher] started");

  const shutdown = async (signal: string) => {
    logger.debug(`[dispatcher] received ${signal}, shutting down...`);
    try {
      dispatcher.stop();
      await MongoConnection.getInstance().disconnect();
      await redis.quit();
      logger.debug("[dispatcher] shutdown complete");
      process.exit(0);
    } catch (err: any) {
      logger.error({
        message: "[dispatcher] error during shutdown",
        payload: err,
      });
      process.exit(1);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on("SIGINT", () => shutdown("SIGINT"));
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch((e: any) => {
  logger.error({ message: "[dispatcher] failed to start", payload: e });
  process.exit(1);
});

import { env } from "@org/common/env";
import { LoggerFactory } from "@org/common/event";
import { MongoConnection } from "@org/common/mongo";
import { sleep } from "@org/common/utils";
import { RequestAccountVerificationListener } from "@org/identity-and-access/account-verification";
import { ProvisionTrialSubscriptionListener } from "@org/subscription/subscription";
import { GenerateOnboardingContentListener } from "@org/marketing";

import { ProvisionTrialSubscriptionHandler } from "./handlers/provision-trial-subscription-handler";
import { RequestAccountVerificationHandler } from "./handlers/request-account-verification-handler";
import { TenantOnboardingCompletedHandler } from "./handlers/tenant-onboarding-completed-handler";
import { WorkerManager } from "./worker-manager";

const logger = LoggerFactory.createDefault();

const startServer = async () => {
  logger.info({ message: "[Worker] Starting..." });

  await MongoConnection.getInstance().connect(env.database.uri);
  logger.info({ message: "[Worker] MongoDB connected." });

  const workerManager = new WorkerManager(env, logger);

  workerManager.add(
    RequestAccountVerificationListener.createQueueName(),
    new RequestAccountVerificationHandler(env, {
      sendEmailVerification: async () => {
        console.log("enviado!");
        await sleep(2000);
      },
    })
  );

  workerManager.add(
    ProvisionTrialSubscriptionListener.createQueueName(),
    new ProvisionTrialSubscriptionHandler(env)
  );

  workerManager.add(
    GenerateOnboardingContentListener.createQueueName(),
    new TenantOnboardingCompletedHandler(env)
  );

  logger.info({ message: "[Worker] Started." });

  const shutdown = async (signal: string) => {
    logger.info({ message: `[Worker] received ${signal}, shutting down...` });
    await workerManager.shutdown();
    await MongoConnection.getInstance().disconnect();
    logger.info({ message: "[Worker] shutdown complete" });
    process.exit(0);
  };

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on("SIGINT", () => shutdown("SIGINT"));
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
startServer().catch((e: any) => {
  logger.error({ message: "[Worker] failed to start", payload: e });
  process.exit(1);
});

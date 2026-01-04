import { Worker } from "bullmq";
import IORedis from "ioredis";

import { Env } from "@org/common/env";
import { Logger } from "@org/common/logger";
import { ArrayUtils } from "@org/common/utils";

import { BullMQHandler } from "./bullmq-handler";

class WorkerManager {
  constructor(
    private env: Env,
    private logger: Logger,
  ) {}

  private workers = new Map<string, Worker>();

  add<Payload>(name: string, handler: BullMQHandler<Payload>): void {
    const connection = new IORedis({
      ...this.env.redis,
      maxRetriesPerRequest: null,
    });

    const worker = new Worker(
      name,
      (job) => {
        this.logger.info({
          message: `[Event Worker] -- Executing Job = ${job.name}`,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return handler.handle(job);
      },
      {
        connection,
      },
    );

    worker.on("failed", (_, err) =>
      this.logger.error({
        message: `[Worker] Job failed in queue ${name}`,
        payload: err,
      }),
    );

    this.workers.set(name, worker);
  }

  async shutdown() {
    const workers = [...this.workers.values()];

    await ArrayUtils.parallelFor(workers, async (w) => w.close());
  }
}

export { WorkerManager };

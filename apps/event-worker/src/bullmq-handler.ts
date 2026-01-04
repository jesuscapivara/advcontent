import { Job } from "bullmq";

import { Env } from "@org/common/env";

abstract class BullMQHandler<EventObject> {
  constructor(protected env: Env) {}

  abstract handle(job: Job<EventObject>): Promise<void>;
}

export { BullMQHandler };

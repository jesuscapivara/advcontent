import { Job } from "bullmq";
import { ObjectId } from "mongodb";

import { Env } from "@org/common/env";
import { MongoTransaction } from "@org/common/mongo";
import { TransactionalUseCaseDecorator } from "@org/common/use-case";
import {
  MongoTenantRepository,
  TenantCreatedEvent,
  TenantCreatedEventProps,
} from "@org/identity-and-access/tenant";
import {
  MongoPlanRepository,
  MongoSubscriptionRepository,
  ProvisionTrialSubscriptionListener,
  ProvisionTrialSubscriptionUseCase,
} from "@org/subscription/subscription";

import { BullMQHandler } from "../bullmq-handler";

class ProvisionTrialSubscriptionHandler extends BullMQHandler<TenantCreatedEventProps> {
  constructor(env: Env) {
    super(env);
  }

  async handle(job: Job<TenantCreatedEventProps>): Promise<void> {
    const event = new TenantCreatedEvent(job.data);
    const env = this.env;

    const tenantId = new ObjectId(event.tenantId);
    const transaction = new MongoTransaction();

    const tenantRepository = new MongoTenantRepository(
      {
        env,
        tenantId,
      },
      transaction,
    );

    const planRepository = new MongoPlanRepository(
      {
        env,
        tenantId,
      },
      transaction,
    );

    const subscriptionRepository = new MongoSubscriptionRepository(
      {
        env,
        tenantId,
      },
      transaction,
    );

    const useCase = new ProvisionTrialSubscriptionUseCase({
      tenantRepository,
      planRepository,
      subscriptionRepository,
    });

    return new ProvisionTrialSubscriptionListener(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      new TransactionalUseCaseDecorator({ transaction }, useCase) as any,
    ).execute(event);
  }
}

export { ProvisionTrialSubscriptionHandler };

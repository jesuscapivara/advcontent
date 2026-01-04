import { Job } from "bullmq";
import { ObjectId } from "mongodb";

import { Env } from "@org/common/env";
import { MongoTransaction } from "@org/common/mongo";
import { TransactionalUseCaseDecorator } from "@org/common/use-case";
import {
  AccountVerificationService,
  MongoAccountVerificationRepository,
  RequestAccountVerificationListener,
  RequestAccountVerificationUseCase,
} from "@org/identity-and-access/account-verification";
import {
  MongoTenantRepository,
  TenantCreatedEvent,
  TenantCreatedEventProps,
} from "@org/identity-and-access/tenant";
import { MongoUserRepository } from "@org/identity-and-access/user";

import { BullMQHandler } from "../bullmq-handler";

class RequestAccountVerificationHandler extends BullMQHandler<TenantCreatedEventProps> {
  constructor(
    env: Env,
    private accountVerificationService: AccountVerificationService,
  ) {
    super(env);
  }

  async handle(job: Job<TenantCreatedEventProps>): Promise<void> {
    const event = new TenantCreatedEvent(job.data);
    const env = this.env;

    const tenantId = new ObjectId(event.tenantId);
    const transaction = new MongoTransaction();

    const userRepository = new MongoUserRepository(
      {
        env,
        tenantId,
      },
      transaction,
    );

    const accountVerificationRepository =
      new MongoAccountVerificationRepository(
        {
          env,
          tenantId,
        },
        transaction,
      );

    const tenantRepository = new MongoTenantRepository(
      {
        env,
        tenantId,
      },
      transaction,
    );

    const useCase = new RequestAccountVerificationUseCase({
      userRepository,
      accountVerificationRepository,
      accountVerificationService: this.accountVerificationService,
      tenantRepository,
    });

    return new RequestAccountVerificationListener(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      new TransactionalUseCaseDecorator({ transaction }, useCase) as any,
    ).execute(event);
  }
}

export { RequestAccountVerificationHandler };

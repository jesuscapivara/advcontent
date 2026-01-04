import { MongoTransaction } from "@org/common/mongo";
import { TransactionalUseCaseDecorator } from "@org/common/use-case";
import {
  MongoAccountVerificationRepository,
  VerifyAccountInput,
  VerifyAccountUseCase,
} from "@org/identity-and-access/account-verification";
import { MongoTenantRepository } from "@org/identity-and-access/tenant";
import { MongoUserRepository } from "@org/identity-and-access/user";

import { AbstractController } from "./abstract-controller";

type VerifyAccountInputDto = VerifyAccountInput;

class VerifyAccountController extends AbstractController<VerifyAccountInputDto> {
  async handle() {
    const transaction = new MongoTransaction();

    const tenantRepository = new MongoTenantRepository(
      {
        env: this.env,
        tenantId: this.tenantId,
      },
      transaction,
    );

    const userRepository = new MongoUserRepository(
      {
        env: this.env,
        tenantId: this.tenantId,
      },
      transaction,
    );

    const accountVerificationRepository =
      new MongoAccountVerificationRepository(
        {
          env: this.env,
          tenantId: this.tenantId,
        },
        transaction,
      );

    const useCase = new TransactionalUseCaseDecorator(
      { transaction },
      new VerifyAccountUseCase({
        accountVerificationRepository,
        tenantRepository,
        userRepository,
      }),
    );

    await useCase.execute(this.body);

    return this.reply.status(200).send();
  }
}

export type { VerifyAccountInputDto };
export { VerifyAccountController };

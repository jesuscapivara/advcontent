import { MongoEventRepository } from "@org/common/event";
import { MongoTransaction } from "@org/common/mongo";
import { TransactionalUseCaseDecorator } from "@org/common/use-case";
import { MongoRoleRepository } from "@org/identity-and-access/role";
import {
  CreateTenantInput,
  CreateTenantOutput,
  CreateTenantUseCase,
  MongoTenantRepository,
} from "@org/identity-and-access/tenant";
import { MongoUserRepository } from "@org/identity-and-access/user";

import { AbstractController } from "./abstract-controller";

type CreateTenantInputDto = CreateTenantInput;
type CreateTenantOutputDto = CreateTenantOutput;

class CreateTenantController extends AbstractController<CreateTenantInputDto> {
  async handle() {
    const tenantId = "system";
    const transaction = new MongoTransaction();

    const roleRepository = new MongoRoleRepository(
      { tenantId, env: this.env },
      transaction,
    );

    const tenantRepository = new MongoTenantRepository(
      { tenantId, env: this.env },
      transaction,
    );

    const userRepository = new MongoUserRepository(
      { tenantId, env: this.env },
      transaction,
    );

    const eventRepository = new MongoEventRepository(
      { tenantId, env: this.env },
      transaction,
    );

    const useCase = new TransactionalUseCaseDecorator(
      { transaction },
      new CreateTenantUseCase({
        eventRepository,
        roleRepository,
        tenantRepository,
        userRepository,
      }),
    );

    const output = await useCase.execute(this.body);

    const response: CreateTenantOutputDto = { id: output.id };

    return this.reply.status(201).send(response);
  }
}

export type { CreateTenantInputDto };
export { CreateTenantController };

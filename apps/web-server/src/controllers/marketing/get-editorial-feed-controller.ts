import { TenantIdSchemaFactory } from "@org/common/mongo";
import {
  GetTenantEditorialItemsUseCase,
  MongoEditorialItemRepository,
} from "@org/marketing";
import { AbstractController } from "../abstract-controller";

export class GetEditorialFeedController extends AbstractController<void> {
  async handle() {
    const repository = new MongoEditorialItemRepository({
      tenantId: TenantIdSchemaFactory.create(this.tenant.id),
      env: this.env,
    });

    const useCase = new GetTenantEditorialItemsUseCase(repository);

    const result = await useCase.execute({
      tenantId: this.tenant.id,
    });

    return this.reply.status(200).send(result);
  }
}

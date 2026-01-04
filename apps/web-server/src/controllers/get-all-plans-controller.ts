import { MongoPlanRepository } from "@org/subscription/catalog";

import { AbstractController } from "./abstract-controller";

class GetAllPlansController extends AbstractController<void> {
  async handle() {
    const repository = new MongoPlanRepository({
      tenantId: "system",
      env: this.env,
    });

    const plans = await repository.getAll();

    return this.reply.status(200).send(plans);
  }
}

export { GetAllPlansController };

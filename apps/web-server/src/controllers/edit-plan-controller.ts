import {
  MongoPlanRepository,
  Plan,
  PlanProps,
} from "@org/subscription/catalog";

import { AbstractController } from "./abstract-controller";

type EditPlanInputDtoController = PlanProps;

class EditPlanController extends AbstractController<EditPlanInputDtoController> {
  async handle() {
    const repository = new MongoPlanRepository({
      tenantId: "system",
      env: this.env,
    });

    const plan = new Plan(this.body);

    const result = await repository.edit(plan);
    result.throwIfError();

    return this.reply.status(200).send(plan);
  }
}

export type { EditPlanInputDtoController };
export { EditPlanController };

import {
  MongoPlanRepository,
  Plan,
  PlanProps,
} from "@org/subscription/catalog";

import { AbstractController } from "./abstract-controller";

type CreatePlanInputDtoController = Omit<
  PlanProps,
  "id" | "version" | "createdAt" | "updatedAt"
>;

class CreatePlanController extends AbstractController<CreatePlanInputDtoController> {
  async handle() {
    const repository = new MongoPlanRepository({
      tenantId: "system",
      env: this.env,
    });

    const plan = new Plan({ ...this.body, id: repository.nextIdentity() });

    await repository.create(plan);

    return this.reply.status(201).send(plan);
  }
}

export type { CreatePlanInputDtoController };
export { CreatePlanController };

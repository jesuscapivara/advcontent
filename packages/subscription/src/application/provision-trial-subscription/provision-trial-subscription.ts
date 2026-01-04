import { UseCase } from "@org/common/use-case";
import { TenantRepository } from "@org/identity-and-access/tenant";

import { PlanRepository } from "../../domain/catalog/plan-repository";
import { Subscription } from "../../domain/subscription/subscription";
import { SubscriptionRepository } from "../../domain/subscription/subscription-repository";

type Input = {
  tenantId: string;
};

type Output = void;

type Deps = {
  tenantRepository: TenantRepository;
  planRepository: PlanRepository;
  subscriptionRepository: SubscriptionRepository;
};

class ProvisionTrialSubscriptionUseCase implements UseCase<Input, Output> {
  constructor(private deps: Deps) {}

  async execute(input: Input): Promise<Output> {
    const plan = (
      await this.deps.planRepository.getTrialPlan()
    ).getDataOrThrow();

    const tenant = (
      await this.deps.tenantRepository.getById(input.tenantId)
    ).getDataOrThrow();

    const subscription = Subscription.create(
      this.deps.subscriptionRepository.nextIdentity(),
      tenant.id,
      plan.asSnapshot(plan.defaultBillingCycle().type),
    );

    tenant.applySubscription(subscription.id);

    await this.deps.subscriptionRepository.add(subscription);
    await this.deps.tenantRepository.save(tenant);
  }
}

export { ProvisionTrialSubscriptionUseCase };

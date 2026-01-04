import { EventListener } from "@org/common/event";
import { TenantCreatedEvent } from "@org/identity-and-access/tenant";

import { ProvisionTrialSubscriptionUseCase } from "./provision-trial-subscription";

class ProvisionTrialSubscriptionListener extends EventListener {
  static listenerName = "provision_trial_subscription_listener";
  static eventName = TenantCreatedEvent.name;

  constructor(private useCase: ProvisionTrialSubscriptionUseCase) {
    super();
  }

  async execute(event: TenantCreatedEvent): Promise<void> {
    await this.useCase.execute({
      tenantId: event.payload.tenantId,
    });
  }
}

export { ProvisionTrialSubscriptionListener };

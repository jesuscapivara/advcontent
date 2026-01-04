import { EventListener } from "@org/common/event";

import { TenantCreatedEvent } from "../../domain/tenant/tenant-created-event";

import { RequestAccountVerificationUseCase } from "./request-account-verification";

class RequestAccountVerificationListener extends EventListener {
  static listenerName = "request_account_verification_listener";
  static eventName = TenantCreatedEvent.name;

  constructor(private useCase: RequestAccountVerificationUseCase) {
    super();
  }

  async execute(event: TenantCreatedEvent): Promise<void> {
    await this.useCase.execute({
      tenantId: event.payload.tenantId,
      userId: event.payload.ownerId,
    });
  }
}

export { RequestAccountVerificationListener };

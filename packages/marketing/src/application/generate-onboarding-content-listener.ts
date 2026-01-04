import { EventListener } from "@org/common/event";
import { TenantOnboardingCompletedEvent } from "@org/identity-and-access/tenant";
import { GenerateOnboardingContentUseCase } from "./generate-onboarding-content";

class GenerateOnboardingContentListener extends EventListener {
  static listenerName = "generate_onboarding_content_listener";
  static eventName = "iam.tenant.onboarding_completed_event";

  constructor(private useCase: GenerateOnboardingContentUseCase) {
    super();
  }

  async execute(event: TenantOnboardingCompletedEvent): Promise<void> {
    await this.useCase.execute({
      tenantId: event.tenantId,
      expertiseAreas: event.payload.expertiseAreas,
      toneOfVoice: event.payload.toneOfVoice,
    });
  }
}

export { GenerateOnboardingContentListener };

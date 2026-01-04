import { EventRepository } from "@org/common/event";
import { UseCase } from "@org/common/use-case";

import { BrandingProps } from "../../domain/tenant/branding";
import { ProfessionalProfileProps } from "../../domain/tenant/professional-profile";
import { TenantRepository } from "../../domain/tenant/tenant-repository";

type Input = {
  tenantId: string;
  branding: BrandingProps;
  profile: ProfessionalProfileProps;
};

type Output = {
  success: boolean;
};

type Deps = {
  tenantRepository: TenantRepository;
  eventRepository: EventRepository;
};

class CompleteOnboardingUseCase implements UseCase<Input, Output> {
  constructor(private deps: Deps) {}

  async execute(input: Input): Promise<Output> {
    const tenantResult = await this.deps.tenantRepository.getById(
      input.tenantId
    );

    const tenant = tenantResult.getDataOrThrow();

    if (tenant.isOnboardingCompleted) {
      return { success: true };
    }

    tenant.completeOnboarding(input.branding, input.profile);

    // Persistir eventos de domínio
    const domainEvents = tenant.getDomainEvents();
    for (const event of domainEvents) {
      await this.deps.eventRepository.add(event);
    }
    tenant.clearDomainEvents();

    await this.deps.tenantRepository.save(tenant);

    return { success: true };
  }
}

export { CompleteOnboardingUseCase };

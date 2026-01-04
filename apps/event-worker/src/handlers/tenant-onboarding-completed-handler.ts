import { Job } from "bullmq";

import { Env } from "@org/common/env";
import { TenantIdSchemaFactory } from "@org/common/mongo";
import {
  TenantOnboardingCompletedEvent,
  TenantOnboardingCompletedEventProps,
} from "@org/identity-and-access/tenant";
import {
  GenerateOnboardingContentListener,
  GenerateOnboardingContentUseCase,
  LocalContentGenerator,
  MongoEditorialItemRepository,
  OpenAIContentGenerator,
} from "@org/marketing";

import { BullMQHandler } from "../bullmq-handler";

class TenantOnboardingCompletedHandler extends BullMQHandler<TenantOnboardingCompletedEventProps> {
  constructor(env: Env) {
    super(env);
  }

  async handle(job: Job<TenantOnboardingCompletedEventProps>): Promise<void> {
    const event = new TenantOnboardingCompletedEvent({
      payload: job.data,
      name: TenantOnboardingCompletedEvent.name,
      tenantId: job.data.tenantId,
    });
    const env = this.env;

    console.log(
      `[Worker] Gerando conteúdo inicial para Tenant: ${event.tenantId}`
    );
    console.log(
      `[Worker] Áreas: ${event.payload.expertiseAreas.join(", ")}, Tom: ${event.payload.toneOfVoice}`
    );

    const tenantId = TenantIdSchemaFactory.create(event.tenantId);

    const repository = new MongoEditorialItemRepository({
      tenantId,
      env,
    });

    const apiKey =
      process.env.OPENAI_API_KEY || process.env.OPEN_AI_SECRET || "";

    let generator;
    if (!apiKey) {
      console.warn(
        "[Worker] OPENAI_API_KEY não configurado. Usando gerador local."
      );
      generator = new LocalContentGenerator();
    } else {
      generator = new OpenAIContentGenerator(apiKey);
    }

    const useCase = new GenerateOnboardingContentUseCase(repository, generator);
    const listener = new GenerateOnboardingContentListener(useCase);

    await listener.execute(event);

    console.log(`[Worker] ✅ Conteúdo gerado para Tenant ${event.tenantId}`);
  }
}

export { TenantOnboardingCompletedHandler };

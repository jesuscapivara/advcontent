import { z } from "zod";

import { MongoEventRepository } from "@org/common/event";
import { TenantIdSchemaFactory } from "@org/common/mongo";
import {
  CompleteOnboardingUseCase,
  MongoTenantRepository,
} from "@org/identity-and-access/tenant";

import { AbstractController } from "./abstract-controller";

const BodySchema = z.object({
  branding: z.object({
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    logoUrl: z.string().url().optional(),
    fontFamily: z.string().optional(),
  }),
  profile: z.object({
    fullName: z.string().min(3),
    oabNumber: z.string().optional(),
    expertiseAreas: z
      .array(
        z.enum([
          "CIVIL",
          "CRIMINAL",
          "TRABALHISTA",
          "FAMILIA",
          "TRIBUTARIO",
          "CONSUMIDOR",
          "EMPRESARIAL",
          "GERAL",
        ])
      )
      .min(1),
    toneOfVoice: z.enum(["COMBATIVE", "EMPATHETIC", "TECHNICAL", "SIMPLIFIED"]),
  }),
});

type CompleteOnboardingBody = z.infer<typeof BodySchema>;

export class CompleteOnboardingController extends AbstractController<CompleteOnboardingBody> {
  async handle() {
    const body = BodySchema.parse(this.body);

    const tenantRepository = new MongoTenantRepository({
      tenantId: TenantIdSchemaFactory.create(this.tenant.id),
      env: this.env,
    });

    const eventRepository = new MongoEventRepository({
      tenantId: TenantIdSchemaFactory.create(this.tenant.id),
      env: this.env,
    });

    const useCase = new CompleteOnboardingUseCase({
      tenantRepository,
      eventRepository,
    });

    const result = await useCase.execute({
      tenantId: this.tenant.id,
      ...body,
    });

    return this.reply.status(200).send(result);
  }
}

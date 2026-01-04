import { TenantIdSchemaFactory } from "@org/common/mongo";
import { z } from "zod";
import {
  CreateDraftPostUseCase,
  MongoEditorialItemRepository,
  OpenAIContentGenerator,
} from "@org/marketing";
import { AbstractController } from "../abstract-controller";

// Validação da entrada (Input Sanitization)
const BodySchema = z.object({
  topic: z.string().min(3),
  tone: z.string().default("Sóbrio"),
  legalArea: z.string().default("Geral"),
});

type CreateDraftPostBody = z.infer<typeof BodySchema>;

export class CreateDraftPostController extends AbstractController<CreateDraftPostBody> {
  async handle() {
    // 1. Validar Body
    const body = BodySchema.parse(this.body);

    // 2. Injeção de Dependência (Manual para MVP)
    // No futuro, isso pode ir para um Container DI
    const repository = new MongoEditorialItemRepository({
      tenantId: TenantIdSchemaFactory.create(this.tenant.id),
      env: this.env,
    });

    // Pegamos a chave direto do process.env (pois ainda não mapeamos no Env do common)
    const apiKey =
      process.env.OPENAI_API_KEY || process.env.OPEN_AI_SECRET || "";
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY ou OPEN_AI_SECRET não configurado no .env"
      );
    }
    // Modelo configurável via variável de ambiente (default: gpt-4o-mini)
    const modelId = process.env.OPENAI_MODEL_ID || "gpt-4o-mini";
    const aiGenerator = new OpenAIContentGenerator(apiKey, modelId);

    const useCase = new CreateDraftPostUseCase(repository, aiGenerator);

    // 3. Executar
    const result = await useCase.execute({
      tenantId: this.tenant.id,
      ...body,
    });

    return this.reply.status(201).send(result);
  }
}

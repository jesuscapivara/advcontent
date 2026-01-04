import { UseCase } from "@org/common/use-case";
import {
  EditorialItem,
  EditorialStatus,
} from "../domain/editorial-calendar/editorial-item";
import { ContentGenerator } from "../domain/content-generation/content-generator";
import { EditorialItemRepository } from "../domain/editorial-calendar/editorial-item-repository";

type Input = {
  tenantId: string;
  topic: string;
  tone: string;
  legalArea: string;
};

type Output = {
  id: string;
  headline: string;
  caption: string;
  status: string;
};

export class CreateDraftPostUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly repository: EditorialItemRepository,
    private readonly generator: ContentGenerator,
  ) {}

  async execute(input: Input): Promise<Output> {
    // 1. O "Robô" trabalha (Gera o conteúdo)
    const generatedContent = await this.generator.generateDraft({
      topic: input.topic,
      tone: input.tone,
      legalArea: input.legalArea,
    });

    // 2. Criamos a Entidade de Domínio
    const post = new EditorialItem({
      id: this.repository.nextIdentity(),
      tenantId: input.tenantId,
      topic: input.topic,
      status: EditorialStatus.Draft, // Nasce como rascunho
      content: {
        headline: generatedContent.headline,
        caption: generatedContent.caption,
        imageUrl: undefined, // Ainda sem imagem renderizada
      },
    });

    // 3. Persistência
    await this.repository.add(post);

    // 4. Retorno Limpo (DTO)
    return {
      id: post.id,
      headline: post.content!.headline,
      caption: post.content!.caption,
      status: post.status,
    };
  }
}

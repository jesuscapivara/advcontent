import { UseCase } from "@org/common/use-case";
import {
  EditorialItem,
  EditorialStatus,
} from "../domain/editorial-calendar/editorial-item";
import { ContentGenerator } from "../domain/content-generation/content-generator";
import { EditorialItemRepository } from "../domain/editorial-calendar/editorial-item-repository";
import { ExpertiseArea, ToneOfVoice } from "@org/identity-and-access/tenant";

type Input = {
  tenantId: string;
  expertiseAreas: ExpertiseArea[];
  toneOfVoice: ToneOfVoice;
};

type Output = {
  generatedPosts: number;
  posts: Array<{
    id: string;
    headline: string;
    topic: string;
  }>;
};

// Mapeamento de áreas para pautas clássicas
const TOPICS_BY_AREA: Record<ExpertiseArea, string[]> = {
  CIVIL: [
    "Responsabilidade Civil e Danos Morais",
    "Contratos e Obrigações",
    "Direito do Consumidor e CDC",
  ],
  CRIMINAL: [
    "Habeas Corpus e Liberdade Provisória",
    "Crimes contra o Patrimônio",
    "Direito Penal Empresarial",
  ],
  TRABALHISTA: [
    "Rescisão Indireta e Justa Causa",
    "Horas Extras e Adicional Noturno",
    "FGTS e Multa de 40%",
  ],
  FAMILIA: [
    "Divórcio Consensual e Litigioso",
    "Pensão Alimentícia e Revisão",
    "Guarda Compartilhada e Unilateral",
  ],
  TRIBUTARIO: [
    "Recuperação de Créditos Tributários",
    "Planejamento Tributário Legal",
    "Impostos sobre Serviços (ISS)",
  ],
  CONSUMIDOR: [
    "Direitos do Consumidor no E-commerce",
    "Produtos Defeituosos e Troca",
    "Cobrança Indevida e Cancelamento",
  ],
  EMPRESARIAL: [
    "Abertura de Empresa e MEI",
    "Contratos Empresariais",
    "Recuperação Judicial e Falência",
  ],
  GERAL: [
    "Direitos Fundamentais na Constituição",
    "Acesso à Justiça e Gratuidade",
    "Mediação e Conciliação",
  ],
};

// Mapeamento de tom de voz para descrição
const TONE_DESCRIPTIONS: Record<ToneOfVoice, string> = {
  COMBATIVE: "Combativo e assertivo",
  EMPATHETIC: "Empático e acolhedor",
  TECHNICAL: "Técnico e preciso",
  SIMPLIFIED: "Simplificado e didático",
};

export class GenerateOnboardingContentUseCase
  implements UseCase<Input, Output>
{
  constructor(
    private readonly repository: EditorialItemRepository,
    private readonly generator: ContentGenerator
  ) {}

  async execute(input: Input): Promise<Output> {
    const { tenantId, expertiseAreas, toneOfVoice } = input;

    // Seleciona a primeira área (ou usa GERAL se não houver)
    const primaryArea = expertiseAreas[0] || ExpertiseArea.Geral;
    const topics = TOPICS_BY_AREA[primaryArea].slice(0, 3); // Pega 3 pautas

    const toneDescription = TONE_DESCRIPTIONS[toneOfVoice];
    const generatedPosts: Array<{
      id: string;
      headline: string;
      topic: string;
    }> = [];

    // Gera 3 posts automaticamente
    for (const topic of topics) {
      try {
        const generatedContent = await this.generator.generateDraft({
          topic,
          tone: toneDescription,
          legalArea: primaryArea,
        });

        const post = EditorialItem.createDraft(tenantId, topic);
        post.content = {
          headline: generatedContent.headline,
          caption: generatedContent.caption,
          imageUrl: undefined,
        };
        post.status = EditorialStatus.Draft;

        await this.repository.add(post);

        generatedPosts.push({
          id: post.id,
          headline: post.content!.headline,
          topic: post.topic,
        });
      } catch (error) {
        console.error(`[Marketing] Erro ao gerar post para "${topic}":`, error);
        // Continua gerando os outros posts mesmo se um falhar
      }
    }

    return {
      generatedPosts: generatedPosts.length,
      posts: generatedPosts,
    };
  }
}

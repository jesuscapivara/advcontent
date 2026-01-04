import { sleep } from "@org/common/utils";
import {
  ContentGenerator,
  GenerationRequest,
  GenerationResult,
} from "../../domain/content-generation/content-generator";

export class LocalContentGenerator implements ContentGenerator {
  async generateDraft(request: GenerationRequest): Promise<GenerationResult> {
    // Simula delay de rede da OpenAI (2 segundos)
    await sleep(2000);

    return {
      headline: `[MOCK] Entenda tudo sobre ${request.topic}`,
      caption: `Este é um texto gerado localmente para validar o layout. 
      
      O tópico escolhido foi: ${request.topic}.
      A área jurídica é: ${request.legalArea}.
      O tom de voz aplicado foi: ${request.tone}.
      
      #direito #advocacia #${request.legalArea.toLowerCase()}`,
      imagePrompt: `Foto realista de um escritório de advocacia com livros de direito e um martelo sobre a mesa, iluminação dramática estilo ${request.tone}`,
    };
  }
}

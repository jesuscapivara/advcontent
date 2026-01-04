import OpenAI from "openai";
import {
  ContentGenerator,
  GenerationRequest,
  GenerationResult,
} from "../../domain/content-generation/content-generator";

export class OpenAIContentGenerator implements ContentGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("OPEN_AI_SECRET is missing");
    this.openai = new OpenAI({ apiKey });
  }

  async generateDraft(request: GenerationRequest): Promise<GenerationResult> {
    const systemPrompt = `
      Você é um especialista em Marketing Jurídico Brasileiro e Compliance (Provimento 205/2021 da OAB).
      Sua função é criar conteúdo para Instagram de advogados.
      
      REGRAS DE OURO (COMPLIANCE OAB):
      1. NUNCA prometa resultado ("ganho de causa", "sucesso garantido").
      2. NUNCA use termos mercantilistas ("promoção", "ligue já", "melhor preço").
      3. Mantenha tom informativo e educativo.
      4. O objetivo é autoridade técnica, não venda direta.

      FORMATO DE SAÍDA (JSON):
      Retorne APENAS um JSON com os campos:
      - headline: Um título curto e impactante (max 50 caracteres).
      - caption: A legenda do post (com emojis moderados e hashtags).
      - imagePrompt: Uma descrição visual para gerar a imagem (em inglês, fotorealista).
    `;

    const userPrompt = `
      Tópico: ${request.topic}
      Área do Direito: ${request.legalArea}
      Tom de Voz: ${request.tone}
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini", // Rápido, barato e inteligente o suficiente
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" }, // Garante que volta JSON limpo
      temperature: 0.7,
    });

    const messageContent = response.choices[0]?.message?.content || "{}";
    const content = JSON.parse(messageContent) as {
      headline?: string;
      caption?: string;
      imagePrompt?: string;
    };

    return {
      headline: content.headline || `Erro ao gerar: ${request.topic}`,
      caption: content.caption || "Não foi possível gerar a legenda.",
      imagePrompt: content.imagePrompt || "Abstract legal background",
    };
  }
}

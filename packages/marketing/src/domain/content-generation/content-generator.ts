export type GenerationRequest = {
  topic: string;
  tone: string; // "Sóbrio", "Combatiivo"
  legalArea: string; // "Trabalhista", "Penal"
};

export type GenerationResult = {
  headline: string;
  caption: string;
  imagePrompt: string;
};

export interface ContentGenerator {
  generateDraft(request: GenerationRequest): Promise<GenerationResult>;
}

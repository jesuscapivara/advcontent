// Lista de palavras e frases proibidas pela OAB (Provimento 205/2021)
// Baseado em termos mercantilistas e promessas de resultado

export const FORBIDDEN_PATTERNS = [
  // Promessas de resultado
  { pattern: /ganho\s+garantido/gi, suggestion: "viabilidade jurídica" },
  { pattern: /sucesso\s+garantido/gi, suggestion: "possibilidade de êxito" },
  { pattern: /resultado\s+garantido/gi, suggestion: "perspectiva favorável" },
  { pattern: /causa\s+ganha/gi, suggestion: "processo com fundamento" },
  { pattern: /vitória\s+garantida/gi, suggestion: "chance de sucesso" },
  {
    pattern: /vencer\s+o\s+processo/gi,
    suggestion: "obter resultado favorável",
  },

  // Termos mercantilistas
  { pattern: /promoção/gi, suggestion: "oportunidade" },
  { pattern: /desconto/gi, suggestion: "condições especiais" },
  { pattern: /oferta\s+imperdível/gi, suggestion: "consulta disponível" },
  { pattern: /ligue\s+já/gi, suggestion: "entre em contato" },
  { pattern: /melhor\s+preço/gi, suggestion: "honorários justos" },
  { pattern: /preço\s+baixo/gi, suggestion: "honorários acessíveis" },
  { pattern: /grátis/gi, suggestion: "consulta inicial" },
  { pattern: /gratuito/gi, suggestion: "sem custo inicial" },
  { pattern: /barato/gi, suggestion: "acessível" },

  // Superlativos proibidos
  { pattern: /melhor\s+advogado/gi, suggestion: "advogado experiente" },
  { pattern: /número\s+1/gi, suggestion: "referência" },
  { pattern: /top\s+do\s+mercado/gi, suggestion: "reconhecido no mercado" },
];

export function checkCompliance(text: string): {
  score: number; // 0-100 (100 = perfeito)
  violations: Array<{
    match: string;
    suggestion: string;
    position: number;
  }>;
} {
  const violations: Array<{
    match: string;
    suggestion: string;
    position: number;
  }> = [];

  FORBIDDEN_PATTERNS.forEach(({ pattern, suggestion }) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        match: match[0],
        suggestion,
        position: match.index || 0,
      });
    }
  });

  // Score: 100 - (número de violações * 10)
  // Mínimo de 0
  const score = Math.max(0, 100 - violations.length * 10);

  return { score, violations };
}

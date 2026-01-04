"use client";

import Highlighter from "react-highlight-words";
import { FORBIDDEN_PATTERNS } from "@/lib/compliance/forbidden-words";

interface TextHighlighterProps {
  text: string;
  className?: string;
}

export function TextHighlighter({
  text,
  className = "",
}: TextHighlighterProps) {
  // Extrai todas as palavras/frases proibidas para highlight
  const searchWords = FORBIDDEN_PATTERNS.map((pattern) => {
    const matches = text.match(pattern.pattern);
    return matches || [];
  }).flat();

  return (
    <Highlighter
      highlightClassName="bg-red-200 text-red-900 font-semibold underline"
      searchWords={searchWords}
      textToHighlight={text}
      className={className}
    />
  );
}

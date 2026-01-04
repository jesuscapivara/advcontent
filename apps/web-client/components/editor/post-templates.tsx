"use client";

import React from "react";

export type TemplateId = "classic-serif" | "modern-clean" | "breaking-news";

export interface TemplateProps {
  headline: string;
  category: string;
  caption?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  fontFamily?: string;
}

// Template 1: Classic Serif (Estilo "Banca Tradicional")
export function ClassicSerifTemplate({
  headline,
  category,
  caption,
  primaryColor,
  secondaryColor,
  logoUrl,
  fontFamily = "Georgia, serif",
}: TemplateProps) {
  return (
    <div
      className="w-full h-full flex flex-col justify-between p-8 bg-gradient-to-br text-white relative"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
        fontFamily,
      }}
    >
      {logoUrl && (
        <div className="absolute top-8 right-8 w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/10">
          <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-full" />
        </div>
      )}
      <div className="mt-8 relative z-10">
        <span
          className="inline-block px-4 py-2 text-black text-xs font-bold tracking-widest uppercase rounded mb-4"
          style={{ backgroundColor: secondaryColor }}
        >
          {category}
        </span>
        <h1
          className="text-4xl font-serif leading-tight"
          style={{ color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
        >
          {headline}
        </h1>
      </div>
      <div className="border-t border-white/20 pt-4 flex justify-between items-end">
        <div className="text-xs text-white/80 uppercase tracking-widest">
          Informativo Jurídico
        </div>
        <div className="text-xs text-white font-bold">@seuescritorio</div>
      </div>
    </div>
  );
}

// Template 2: Modern Clean (Estilo "Startup Jurídica")
export function ModernCleanTemplate({
  headline,
  category,
  caption,
  primaryColor,
  secondaryColor,
  logoUrl,
  fontFamily = "Inter, sans-serif",
}: TemplateProps) {
  return (
    <div
      className="w-full h-full flex flex-col justify-center p-10 bg-white relative"
      style={{ fontFamily }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-2"
        style={{ backgroundColor: primaryColor }}
      />
      {logoUrl && (
        <div className="absolute top-6 right-6 w-12 h-12">
          <img src={logoUrl} alt="Logo" className="w-full h-full" />
        </div>
      )}
      <div className="space-y-6">
        <div
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: secondaryColor }}
        >
          {category}
        </div>
        <h1
          className="text-3xl font-bold leading-tight"
          style={{ color: primaryColor }}
        >
          {headline}
        </h1>
        {caption && (
          <div
            className="w-16 h-1"
            style={{ backgroundColor: secondaryColor }}
          />
        )}
      </div>
      <div className="absolute bottom-6 left-10 text-xs text-slate-400">
        @seuescritorio
      </div>
    </div>
  );
}

// Template 3: Breaking News (Estilo "Jornalístico")
export function BreakingNewsTemplate({
  headline,
  category,
  caption,
  primaryColor,
  secondaryColor,
  logoUrl,
  fontFamily = "Georgia, serif",
}: TemplateProps) {
  return (
    <div
      className="w-full h-full flex flex-col bg-white relative overflow-hidden"
      style={{ fontFamily }}
    >
      {/* Header com barra colorida */}
      <div
        className="h-20 flex items-center px-6 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-10 w-auto mr-4" />
        )}
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">
            {category}
          </div>
          <div className="text-sm font-semibold">NOTÍCIAS JURÍDICAS</div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col justify-center p-8">
        <div
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: secondaryColor }}
        >
          BREAKING NEWS
        </div>
        <h1
          className="text-4xl font-bold leading-tight mb-6"
          style={{ color: primaryColor }}
        >
          {headline}
        </h1>
        {caption && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
            {caption}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="h-12 flex items-center justify-between px-6 text-white text-xs"
        style={{ backgroundColor: primaryColor }}
      >
        <span>@seuescritorio</span>
        <span>{new Date().toLocaleDateString("pt-BR")}</span>
      </div>
    </div>
  );
}

// Mapa de Templates (Strategy Pattern)
export const TEMPLATES: Record<
  TemplateId,
  React.ComponentType<TemplateProps>
> = {
  "classic-serif": ClassicSerifTemplate,
  "modern-clean": ModernCleanTemplate,
  "breaking-news": BreakingNewsTemplate,
};

// Componente wrapper que renderiza o template selecionado
export function PostTemplateRenderer({
  templateId,
  ...props
}: TemplateProps & { templateId: TemplateId }) {
  const Template = TEMPLATES[templateId];
  return <Template {...props} />;
}

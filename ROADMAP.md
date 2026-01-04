# 🗺️ Roadmap - AdvContent SaaS Jurídico

> **Objetivo**: Transformar o MVP funcional em um SaaS premium vendável a R$ 149/mês, focado em compliance e autoridade jurídica.

---

## 📊 Status Geral

| Feature | Status | Prioridade | Estimativa |
|---------|--------|------------|------------|
| Compliance HUD | ✅ **Concluído** | 🔴 Alta | - |
| Templates Dinâmicos | ✅ **Concluído** | 🔴 Alta | - |
| Feed RSS Integration | 🟡 **Pendente** | 🔴 Alta | 2-3 dias |
| Gestão de Imagens | 🟡 **Pendente** | 🟡 Média | 3-4 dias |
| Renderização Server-Side | 🟡 **Pendente** | 🟡 Média | 4-5 dias |
| Auditoria de Compliance | 🔴 **Não Iniciado** | 🟢 Baixa | 2 dias |

---

## ✅ 1. Compliance HUD em Tempo Real (CONCLUÍDO)

### Status: ✅ **Implementado e Funcional**

**O que foi feito:**
- ✅ Sistema de detecção de palavras proibidas (OAB Provimento 205/2021)
- ✅ Componente `ComplianceHUD` com score visual (0-100)
- ✅ Highlight de violações em tempo real (`TextHighlighter`)
- ✅ Sugestões inteligentes de substituição
- ✅ Feedback visual (Aprovado/Atenção/Bloqueado)

**Arquivos criados:**
- `apps/web-client/lib/compliance/forbidden-words.ts` - Lista de padrões proibidos
- `apps/web-client/components/compliance/compliance-hud.tsx` - HUD visual
- `apps/web-client/components/compliance/text-highlighter.tsx` - Highlight de texto

**Próximos passos (melhorias futuras):**
- [ ] Log de alterações para auditoria (provar boa-fé em processos)
- [ ] Validação backend adicional (dupla verificação)
- [ ] Histórico de compliance por post
- [ ] Export de relatório de compliance

---

## ✅ 2. Sistema de Templates Dinâmicos (CONCLUÍDO)

### Status: ✅ **Implementado e Funcional**

**O que foi feito:**
- ✅ Strategy Pattern para templates (`PostTemplateRenderer`)
- ✅ 3 templates disponíveis:
  - `ClassicSerifTemplate` - Estilo "Banca Tradicional"
  - `ModernCleanTemplate` - Estilo "Startup Jurídica"
  - `BreakingNewsTemplate` - Estilo "Jornalístico"
- ✅ Integração com branding do tenant (cores, logo, fonte)
- ✅ Seletor de template no editor

**Arquivos criados:**
- `apps/web-client/components/editor/post-templates.tsx` - Templates e Strategy Pattern
- `apps/web-client/lib/hooks/use-tenant-branding.ts` - Hook para buscar branding
- `apps/web-server/src/controllers/get-tenant-branding-controller.ts` - Endpoint de branding
- Rota `/api/v1/tenant/branding` registrada

**Próximos passos (melhorias futuras):**
- [ ] Mais templates (min. 5-7 opções)
- [ ] Editor visual de templates (drag-and-drop)
- [ ] Templates customizados por tenant
- [ ] Preview de templates antes de selecionar

---

## 🟡 3. Integração Feed RSS (PENDENTE)

### Status: 🟡 **Estrutura Pronta, Falta Implementação**

**O que falta:**
- [ ] Worker de ingestão de feeds RSS (STJ, STF, Migalhas)
- [ ] Sidebar de "Oportunidades" no editor
- [ ] Filtro por área de atuação do advogado
- [ ] Integração: clicar em notícia → preencher topic automaticamente
- [ ] Cache de notícias (evitar requisições repetidas)

**Arquitetura proposta:**

```
apps/event-worker/
  └── handlers/
      └── ingest-legal-news-handler.ts  # Worker que busca RSS

packages/marketing/
  └── domain/
      └── content-feed/
          ├── legal-news-item.ts        # Entidade de notícia
          └── legal-news-repository.ts  # Repositório

apps/web-server/
  └── controllers/
      └── marketing/
          └── get-legal-news-controller.ts  # GET /api/v1/marketing/news
```

**Prioridade:** 🔴 **Alta** - Reduz fricção crítica (usuário não precisa pensar na pauta)

**Estimativa:** 2-3 dias

---

## 🟡 4. Gestão de Imagens (PENDENTE)

### Status: 🟡 **Estrutura Básica, Falta Integração**

**O que falta:**
- [ ] Integração com Unsplash API (busca de imagens por keywords)
- [ ] Botão "Trocar Fundo" no editor
- [ ] Controle de opacidade de overlay (contraste WCAG)
- [ ] Upload de imagens próprias
- [ ] Validação com Google Cloud Vision (bloquear imagens de luxo)
- [ ] Armazenamento em S3/R2

**Arquitetura proposta:**

```
apps/web-client/
  └── components/
      └── editor/
          └── image-selector.tsx        # Seletor de imagens

apps/web-server/
  └── controllers/
      └── marketing/
          ├── search-images-controller.ts    # Busca Unsplash
          └── upload-image-controller.ts     # Upload próprio

packages/marketing/
  └── infrastructure/
      └── image-gateway/
          ├── unsplash-image-gateway.ts      # Integração Unsplash
          └── vision-validator.ts            # Validação Cloud Vision
```

**Prioridade:** 🟡 **Média** - Melhora qualidade visual, mas não é crítico

**Estimativa:** 3-4 dias

---

## 🟡 5. Arquitetura Híbrida de Renderização (PENDENTE)

### Status: 🟡 **Preview Client-Side Funciona, Falta Server-Side**

**Problema atual:**
- ✅ Preview funciona com `html-to-image` (client-side)
- ❌ Bugs no Safari/iPad
- ❌ Inconsistência entre dispositivos
- ❌ Qualidade variável

**O que falta:**
- [ ] Endpoint de renderização server-side (`POST /api/v1/marketing/render`)
- [ ] Worker BullMQ para processar renderização
- [ ] Integração com Puppeteer ou Satori (@vercel/og)
- [ ] Upload para S3/R2 após renderização
- [ ] Retorno de URL da imagem final

**Arquitetura proposta:**

```
apps/web-server/
  └── controllers/
      └── marketing/
          └── render-post-controller.ts      # Recebe JSON, retorna URL

apps/event-worker/
  └── handlers/
      └── render-post-handler.ts             # Processa com Puppeteer

packages/marketing/
  └── infrastructure/
      └── rendering/
          ├── puppeteer-renderer.ts          # Renderização HTML → PNG
          └── s3-uploader.ts                 # Upload para S3/R2
```

**Fluxo:**
1. Usuário clica "Baixar/Agendar" no frontend
2. Frontend envia JSON: `{ templateId, headline, caption, imageUrl, branding }`
3. Backend adiciona job na fila BullMQ
4. Worker renderiza com Puppeteer em ambiente controlado
5. Upload para S3/R2
6. Retorna URL da imagem final

**Prioridade:** 🟡 **Média** - Melhora qualidade, mas preview atual funciona

**Estimativa:** 4-5 dias

---

## 🔴 6. Auditoria de Compliance (NÃO INICIADO)

### Status: 🔴 **Não Iniciado**

**O que falta:**
- [ ] Log de alterações de texto (antes/depois)
- [ ] Histórico de violações por post
- [ ] Export de relatório de compliance
- [ ] Dashboard de compliance por tenant

**Prioridade:** 🟢 **Baixa** - Importante para provar boa-fé, mas não crítico para MVP

**Estimativa:** 2 dias

---

## 📋 Checklist de Implementação

### Sprint 1 (Próxima - Alta Prioridade)
- [ ] **Feed RSS Integration**
  - [ ] Worker de ingestão de feeds
  - [ ] Sidebar de oportunidades no editor
  - [ ] Filtro por área de atuação
  - [ ] Integração com geração de posts

### Sprint 2 (Média Prioridade)
- [ ] **Gestão de Imagens**
  - [ ] Integração Unsplash API
  - [ ] Controle de overlay
  - [ ] Upload de imagens próprias
  - [ ] Validação Cloud Vision

### Sprint 3 (Média Prioridade)
- [ ] **Renderização Server-Side**
  - [ ] Endpoint de renderização
  - [ ] Worker BullMQ
  - [ ] Integração Puppeteer/Satori
  - [ ] Upload S3/R2

### Sprint 4 (Baixa Prioridade)
- [ ] **Auditoria de Compliance**
  - [ ] Log de alterações
  - [ ] Histórico de violações
  - [ ] Export de relatórios

---

## 🎯 Métricas de Sucesso

### MVP Atual
- ✅ Geração de posts com IA
- ✅ Templates personalizáveis
- ✅ Compliance HUD em tempo real
- ✅ Feed de posts gerados

### SaaS Premium (Meta)
- [ ] Curadoria automática de pautas (Feed RSS)
- [ ] Gestão profissional de imagens
- [ ] Renderização consistente (server-side)
- [ ] Auditoria completa de compliance
- [ ] Dashboard de métricas

---

## 📝 Notas Técnicas

### Stack Atual
- **Frontend**: Next.js 15, React, Tailwind CSS, Shadcn UI
- **Backend**: Fastify, MongoDB, BullMQ
- **IA**: OpenAI GPT-4o-mini (configurável via `OPENAI_MODEL_ID`)
- **Renderização Preview**: `html-to-image` (client-side)

### Dependências Futuras
- `puppeteer` ou `@vercel/og` - Renderização server-side
- `@aws-sdk/client-s3` ou `@cloudflare/r2` - Armazenamento de imagens
- `@google-cloud/vision` - Validação de imagens
- `rss-parser` ou `fast-xml-parser` - Parsing de feeds RSS

---

## 🔄 Atualizações

- **2024-12-XX**: Roadmap inicial criado
- **2024-12-XX**: Compliance HUD e Templates Dinâmicos implementados ✅

---

**Última atualização:** 2024-12-XX

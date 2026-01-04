<div align="center">

# AdvContent - SaaS de Marketing Jurídico

Plataforma SaaS multi-tenant para geração de conteúdo para Instagram de advogados, com IA e compliance OAB.

[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-339933?logo=node.js&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)

</div>

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
  - [Workspaces](#workspaces)
  - [Domain-Driven Design](#domain-driven-design)
- [Funcionalidades](#funcionalidades)
- [Execução Local](#execução-local)
  - [Pré-requisitos](#pré-requisitos)
  - [Configuração](#configuração)
  - [Scripts Principais](#scripts-principais)
- [Módulos](#módulos)
  - [Web Server](#web-server)
  - [Web Client](#web-client)
  - [Marketing Package](#marketing-package)
- [API](#api)
- [Banco de Dados](#banco-de-dados)
- [Tecnologias](#tecnologias)
- [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

**AdvContent** é uma plataforma SaaS desenvolvida para escritórios de advocacia gerarem conteúdo profissional para Instagram de forma rápida e em conformidade com as regras da OAB (Provimento 205/2021).

### Principais Características

- 🤖 **Geração de Conteúdo com IA**: Utiliza OpenAI GPT-4o-mini para criar headlines e legendas
- ✅ **Compliance OAB**: Validação automática contra termos proibidos e práticas mercantilistas
- 📅 **Calendário Editorial**: Agendamento e gestão de posts
- 🎨 **Preview Visual**: Visualização em tempo real do post no formato Instagram
- 📥 **Download de Imagem**: Exportação do post como PNG de alta resolução
- 🏢 **Multi-tenancy**: Isolamento completo de dados por escritório

---

## 🏗️ Arquitetura

Este projeto segue os princípios de **Domain-Driven Design (DDD)** e **Clean Architecture**, organizado em um monorepo gerenciado com Turborepo.

### Workspaces

```
apps/
├── web-server/          # API REST (Fastify)
├── web-client/          # Frontend Next.js
├── event-dispatcher/    # Despachante de eventos (BullMQ)
└── event-worker/        # Workers assíncronos

packages/
├── common/              # Utilitários compartilhados
├── identity-and-access/ # Gestão de tenants e usuários
├── subscription/        # Sistema de assinaturas
└── marketing/           # Bounded Context de Marketing ⭐
```

### Domain-Driven Design

O projeto está organizado em **Bounded Contexts**:

- **Identity & Access**: Gestão de tenants, usuários, roles e permissões
- **Subscription**: Catálogo de planos e assinaturas
- **Marketing**: Geração de conteúdo, calendário editorial e compliance

Cada bounded context possui:
- **Domain**: Entidades, value objects e regras de negócio
- **Application**: Casos de uso (use cases)
- **Infrastructure**: Repositórios, integrações externas (MongoDB, OpenAI)

---

## ✨ Funcionalidades

### 1. Geração de Posts com IA

- Input: Tópico, área do direito, tom de voz
- Processamento: OpenAI GPT-4o-mini com prompt especializado
- Output: Headline, legenda e prompt para imagem
- Compliance: Validação automática contra regras da OAB

### 2. Preview Visual

- Interface estilo iPhone mostrando como o post ficará no Instagram
- Preview em tempo real durante a geração
- Design profissional com gradientes e tipografia moderna

### 3. Download de Imagem

- Conversão do preview HTML para PNG de alta resolução
- Pronto para publicação direta no Instagram

### 4. Calendário Editorial

- Status workflow: Draft → Review → Approved → Scheduled → Published
- Agendamento de posts com validação de compliance
- Histórico e auditoria

---

## 🚀 Execução Local

### Pré-requisitos

- **Node.js** >= 22.0.0
- **Yarn** 1.x
- **Docker** e Docker Compose (para MongoDB e Redis)
- **Conta OpenAI** com API Key

### Configuração

1. **Clone o repositório**

```bash
git clone https://github.com/jesuscapivara/advcontent.git
cd advcontent
```

2. **Instale as dependências**

```bash
yarn install
```

3. **Configure as variáveis de ambiente**

Crie o arquivo `apps/web-server/.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/advcontent
DATABASE_NAME=advcontent

# Server
PORT=3333
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001

# JWT (gerar uma chave segura)
JWT_SECRET=your-secret-key-here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
```

4. **Suba os serviços (MongoDB e Redis)**

```bash
docker compose -f apps/web-server/docker-compose.yml up -d
```

5. **Execute as migrations**

```bash
yarn migrate:up
```

6. **Popule o banco com dados de desenvolvimento**

```bash
yarn seed:dev
```

### Scripts Principais

```bash
# Desenvolvimento
yarn dev                # Roda todos os apps em modo watch
yarn dev:server         # Apenas o backend (porta 3333)
yarn dev:client         # Apenas o frontend (porta 3001)

# Testes e Qualidade
yarn test               # Executa todos os testes
yarn lint               # Verifica código com ESLint
yarn check-types        # Verifica tipos TypeScript

# Banco de Dados
yarn migrate:up         # Executa migrations
yarn seed:dev           # Popula banco com dados de dev
```

---

## 📦 Módulos

### Web Server

**Localização**: `apps/web-server/`

API REST construída com Fastify, expondo endpoints para:

- **Marketing**: Geração de posts (`POST /api/v1/marketing/posts/draft`)
- **Identity**: Gestão de tenants e usuários
- **Subscription**: Catálogo de planos

**Tecnologias**: Fastify, MongoDB, Redis (BullMQ), Zod

### Web Client

**Localização**: `apps/web-client/`

Frontend Next.js com interface moderna para:

- **Editor de Posts**: Tela principal de criação
- **Preview Visual**: Visualização estilo Instagram
- **Download**: Exportação de imagem PNG

**Tecnologias**: Next.js 15, React Query, Tailwind CSS, Shadcn UI

### Marketing Package

**Localização**: `packages/marketing/`

Bounded Context completo de marketing jurídico:

#### Domain

- `EditorialItem`: Entidade principal representando um post
- `ContentGenerator`: Interface para geração de conteúdo
- Regras de negócio: Compliance, agendamento, workflow de aprovação

#### Application

- `CreateDraftPostUseCase`: Orquestra geração de conteúdo e persistência

#### Infrastructure

- `MongoEditorialItemRepository`: Repositório MongoDB
- `OpenAIContentGenerator`: Integração com OpenAI
- `LocalContentGenerator`: Mock para desenvolvimento

---

## 🔌 API

### Marketing

#### Criar Rascunho de Post

```http
POST /api/v1/marketing/posts/draft
Content-Type: application/json
x-tenant-slug: testing

{
  "topic": "Nova decisão do STF sobre revisão de vida toda",
  "legalArea": "Civil",
  "tone": "Sóbrio"
}
```

**Resposta**:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "headline": "STF decide sobre revisão de vida toda",
  "caption": "O Supremo Tribunal Federal publicou importante decisão...",
  "status": "draft"
}
```

---

## 🗄️ Banco de Dados

### MongoDB Collections

- `marketing_editorial_items`: Posts gerados
- `tenants`: Escritórios/clientes
- `users`: Usuários do sistema
- `plans_catalog`: Catálogo de planos
- `events`: Eventos do sistema (event sourcing)

### Migrations

As migrations estão em `apps/web-server/migrations/` e são executadas com:

```bash
yarn migrate:up
```

---

## 🛠️ Tecnologias

### Backend

- **Fastify**: Framework web rápido
- **MongoDB**: Banco de dados NoSQL
- **Redis/BullMQ**: Filas de eventos assíncronos
- **OpenAI API**: Geração de conteúdo com IA
- **Zod**: Validação de schemas

### Frontend

- **Next.js 15**: Framework React
- **React Query**: Gerenciamento de estado assíncrono
- **Tailwind CSS**: Estilização utility-first
- **Shadcn UI**: Componentes acessíveis
- **html-to-image**: Conversão HTML → PNG

### Arquitetura

- **Turborepo**: Monorepo build system
- **TypeScript**: Tipagem estática
- **Domain-Driven Design**: Organização por bounded contexts
- **Clean Architecture**: Separação de camadas

---

## 📝 Próximos Passos

> **📋 Para ver o roadmap completo e detalhado, consulte [ROADMAP.md](./ROADMAP.md)**

### Status Atual

✅ **Implementado:**
- Compliance HUD em tempo real
- Sistema de Templates Dinâmicos (3 templates)
- Integração com branding do tenant
- Geração de posts com IA (OpenAI GPT-4o-mini)

🟡 **Em Desenvolvimento:**
- Feed RSS de notícias jurídicas (alta prioridade)
- Gestão profissional de imagens (Unsplash/Cloud Vision)
- Renderização server-side (Puppeteer/Satori)

### Próximas Features

- [ ] **Feed RSS Integration** - Curadoria automática de pautas (STJ, STF, Migalhas)
- [ ] **Gestão de Imagens** - Integração Unsplash, upload próprio, validação Cloud Vision
- [ ] **Renderização Server-Side** - Qualidade consistente em todos os dispositivos
- [ ] **Auditoria de Compliance** - Log de alterações e relatórios

---

## 📄 Licença

MIT

---

## 👥 Contribuindo

Este é um projeto privado. Para contribuições, entre em contato com os mantenedores.

---

<div align="center">

Desenvolvido com ❤️ para advogados que querem crescer no digital

</div>

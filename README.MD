<div align="center">

# Gerenciador de Projetos (Arquitetura e Engenharia)

SaaS multi-tenant com Fastify + MongoDB + Redis (BullMQ) orientado a eventos.

[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-339933?logo=node.js&logoColor=white)](#)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-inactive?logo=githubactions&logoColor=white)](#)
[![License](https://img.shields.io/badge/license-Closed--source-blue)](#)

</div>

## Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
  - [Workspaces](#workspaces)
  - [Fluxo de Eventos](#fluxo-de-eventos)
- [Execução Local](#execução-local)
  - [Pré-requisitos](#pré-requisitos)
  - [Subir Mongo e Redis](#subir-mongo-e-redis)
  - [Scripts Principais](#scripts-principais)
  - [Migrations e Seeds](#migrations-e-seeds)
- [Módulos](#módulos)
  - [Web Server (apps/web-server)](#web-server-appsweb-server)
  - [Event Dispatcher (apps/event-dispatcher)](#event-dispatcher-appsevent-dispatcher)
  - [Event Worker (apps/event-worker)](#event-worker-appsevent-worker)
  - [Pacote common](#pacote-common)
  - [Pacote identity-and-access](#pacote-identity-and-access)
  - [Pacote subscription](#pacote-subscription)
- [Rotas](#rotas)
- [Banco de Dados e Migrations](#banco-de-dados-e-migrations)
- [Ambiente (env)](#ambiente-env)
- [Próximos Passos](#próximos-passos)
- [Design Documents](#design-documents)
- [Apêndice — Design Documents (Completo)](#apêndice--design-documents-completo)

---

## Visão Geral

Este monorepo, gerenciado com Turborepo (Node 22, TypeScript 5.9), estrutura um produto SaaS multi-tenant. A persistência é feita em MongoDB; side-effects e integrações assíncronas acontecem via eventos persistidos e filas BullMQ (Redis).

Pilares já prontos:
- Identidade & Acesso (tenant/usuário, verificação de conta, papéis/permissões)
- Assinaturas (catálogo de planos, provisionamento de trial)
- Servidor HTTP (Fastify)
- Despachante de eventos e Workers (BullMQ)

## Arquitetura

### Workspaces

apps/
- `web-server`: API HTTP (rotas públicas de tenant e rotas do sistema para planos).
- `event-dispatcher`: lê eventos pendentes e publica em filas BullMQ.
- `event-worker`: consome filas e executa casos de uso assíncronos.

packages/
- `common`: env (Zod), logger, infraestrutura Mongo (conexão/tx/repo base), core de eventos, result, decorator transacional, utils.
- `identity-and-access`: domínios tenant/usuário/role/permission/account-verification + repositórios Mongo + casos de uso.
- `subscription`: domínios de catálogo (Plan/Feature/BillingCycle) e de assinatura + repositórios Mongo.

### Fluxo de Eventos

1. `POST /api/v1/tenants` cria tenant + usuário owner (pendente) e grava `TenantCreatedEvent`.
2. `event-dispatcher` despacha eventos pendentes para filas BullMQ.
3. `event-worker` processa listeners:
   - RequestAccountVerification: solicita verificação de conta (serviço de e-mail injetável).
   - ProvisionTrialSubscription: cria assinatura trial do tenant recém-criado.

## Execução Local

### Pré-requisitos

- Node >= 22, Yarn 1.x
- Docker e Docker Compose

### Subir Mongo e Redis

O compose em `apps/web-server/docker-compose.yml` sobe Mongo (ReplicaSet) e Redis:

```bash
docker compose -f apps/web-server/docker-compose.yml up -d
```

### Scripts Principais (root)

```bash
yarn dev                # turbo run dev (todas as apps com watch)
yarn dev:server         # turbo run dev --filter=web-server
yarn dev:dispatcher     # turbo run dev --filter=event-dispatcher
yarn test               # turbo run test
yarn lint               # turbo run lint
yarn check-types        # turbo run check-types
yarn migrate:up         # roda migrations do web-server
yarn seed:dev           # roda seed de desenvolvimento (web-server)
```

### Migrations e Seeds

- Configuração: `apps/web-server/migrate-mongo-config.js`
- Migrations principais:
  - `20250819204103-create_users_collection.js`
  - `20250820000531-create_tenants_collection.js`
  - `20250820184900-create_accounts-verification_collection.js`
  - `20250820200633-create_permissions_collection.js`
  - `20250820200902-add_role_permissions.js`
  - `20250820202959-add_tenant_owner_role.js`
  - `20250820215229-create_system_tenant.js`
  - `20250827185343-create_indexes_for_events_collection.js`
  - `20250828192146-create_plans_catalog_collection.js`
- Seeds: `apps/web-server/src/mongodb/seeds/development-seed.ts`

## Módulos

### Web Server (apps/web-server)

- Fastify com `helmet`, rate limit por IP e CORS.
- Healthcheck: `GET /health`.
- Middlewares:
  - `detect-tenant`: resolve tenant por subdomínio (em dev força `testing`).
  - `error-handler`: trata `DomainError` (400), `ZodError` (422) e demais (500) com logs estruturados.
- Rotas do sistema (`/api/v1/system`):
  - `POST /plans`: cria plano no catálogo (tenant `system`).
  - `PUT /plans`: edita plano.
  - `GET /plans`: lista planos.
- Rotas de tenant (`/api/v1`):
  - `POST /tenants`: cria tenant e dispara `TenantCreatedEvent`.
  - `POST /accounts-verification/verify-account`: confirma e-mail.

### Event Dispatcher (apps/event-dispatcher)

- Conecta Mongo e Redis, registra listeners no BullMQ e despacha eventos pendentes usando `EventDispatcher` (batch, retry/backoff, logs).

### Event Worker (apps/event-worker)

- Inicializa `WorkerManager`, adiciona handlers e faz shutdown gracioso em `SIGINT/SIGTERM`.
  - `RequestAccountVerificationHandler`: orquestra envio de verificação de conta.
  - `ProvisionTrialSubscriptionHandler`: provisiona assinatura trial.

### Pacote common

- `env`: schema Zod com defaults para dev.
- `logger`: logger estruturado; `LoggerFactory` disponível via `@org/common/event`.
- `mongo`: conexão singleton, transação com session, repositório base e helpers.
- `event`: contratos e repositório de eventos; integração com BullMQ pelos apps.
- `result`, `use-case`, `utils`: Result, TransactionalUseCaseDecorator, ArrayUtils, sleep, etc.

### Pacote identity-and-access

- Domínios: tenant (slug, owner, status, evento `TenantCreatedEvent`), user (status, role, senha), role/permission, account-verification.
- Casos de uso: `CreateTenantUseCase`, `VerifyAccountUseCase`, `RequestAccountVerificationUseCase`.
- Infra Mongo: repositórios e mappers; unicidade, versionamento otimista e projeções.

### Pacote subscription

- Catálogo: `Plan` (Money, Features, BillingCycles com default/discount), repo Mongo; CRUD exposto via web-server (âmbito system).
- Subscription: domínio e repo Mongo; caso de uso de trial e listener correspondente.

## Rotas

```
GET  /health

/api/v1/system
POST /plans
PUT  /plans
GET  /plans

/api/v1
POST /tenants
POST /accounts-verification/verify-account
```

## Banco de Dados e Migrations

- MongoDB 7 em ReplicaSet (o compose inicializa o RS e reconfigura host para `localhost:27017`).
- Coleções: `users`, `tenants`, `accounts-verification`, `permissions`, `plans_catalog`, `events` (com índices conforme migrations).

## Ambiente (env)

Definido em `packages/common/src/env/env.ts` via Zod (com defaults para desenvolvimento). Em produção, use variáveis de ambiente.

```ts
environment: "development" | "production" | "staging"
database: { name: string; uri: string }
server: { port: number; allowedOrigins: string[] }
redis: { host: string; port: number }
```

## Próximos Passos

- Autenticação/JWT, refresh tokens, recuperação de senha e middleware de auth.
- Autorização (RBAC) por rota/ação; enforcement por plano/feature.
- Domínio AEC: Project, Client, Team, Task/Subtask, Milestone, Deliverable, revisões, comentários, anexos (S3), notificações.
- Billing real (Stripe/PIX/Cartão), webhooks, portal do assinante, upgrade/downgrade/cancelamento.
- Observabilidade, OpenAPI/Swagger, CI/CD e hardening de CORS/secrets.


## Design Documents

Resumo dos documentos localizados em `design-documents/` que orientam decisões de domínio e funcionalidades:

### Identity and Access Management

- `topics.md` — Agenda de tópicos do IAM:
  - Autenticação (login/logout), recuperação de senha, confirmação de email, MFA.
  - Gestão de sessões: sessões simultâneas, bloqueio/desbloqueio, auditoria e logs.
  - Permissões dinâmicas: atribuição direta excepcional e revogação imediata.
  - Limites por plano no IAM (número de usuários/roles/permissions conforme assinatura).
  - Integrações (SSO: Google/Microsoft/SAML) e API de gestão.
  - Fluxos de exclusão/remoção segura de usuários e tenants.

- `tenant-creation.md` — Caso de uso Registrar Tenant:
  - Coleta de dados do tenant e do administrador, validações, criação de `Tenant` e `User` com `TenantOwner`, envio de email de confirmação e pós-condições.

- `user-creation.md` — Caso de uso Adicionar Usuário:
  - Convite por email, status pendente até ativação, papéis opcionais no convite, fluxos alternativos e pós-condições.

- `basic-entities.md` — Modelagem de entidades IAM:
  - Tabelas e relacionamentos: `Tenant`, `User`, `Role`, `Permission`, `UserRole`, `RolePermission` e diagrama conceitual.

- `roles-and-permissions.md` — Catálogo base de permissões:
  - Escopos: gestão de tenant, usuários, papéis, projetos, tarefas, documentos, comunicação e financeiro.
  - Papéis default sugeridos: `TenantOwner`, `Admin`, `ProjectManager`, `User`, `Viewer`.

- `role-creation.md` — Caso de uso Criar Role Customizado:
  - Fluxo para criação, seleção de permissões, validação de nome, persistência e pós-condições.

### Subscription Management

- `basic-entities.md` — Objetos de domínio:
  - `Plan`, `Feature`, `PlanFeature`, `Subscription`, `Usage`, `BillingCycle`, `PlanSnapshot` e referências a `Tenant`.

- `plan-shopping.md` — Caso de uso Comprar Plano:
  - Seleção do plano/termo, interação com gateway de pagamento, criação de `Subscription` com snapshot, encerramento de assinatura anterior e confirmação.

- `subscription-checking.md` — Caso de uso Validar Acesso a Feature:
  - Façade declarativa para outros módulos: verificação de assinatura ativa, feature habilitada e limites de `Usage` (com códigos de erro específicos).

Observação: estes documentos complementam o que já está implementado (criação de tenant, verificação de conta, catálogo de planos e provisionamento de trial). Próximas iterações devem alinhar a implementação de autenticação/RBAC, compra de plano e checagem de features a estes designs.

## Apêndice — Design Documents (Completo)

### Identity and Access Management

#### topics.md

## 1. **Autenticação e Autorização**

- **Login/Logout** — fluxo de autenticação do usuário, com controle de sessão ou token JWT.
- **Recuperação de senha** — fluxo para resetar senha via email.
- **Confirmação de email** — garantir que o email do usuário está validado para ativação da conta.
- **Autenticação multifator (MFA)** — adicionar camada extra de segurança.

---

## 2. **Gestão de Sessões e Segurança**

- **Controle de sessões simultâneas** — limitar ou gerenciar sessões ativas por usuário.
- **Bloqueio e desbloqueio de usuários** — para casos de suspeita ou solicitações.
- **Auditoria e logs de acesso** — registrar acessos, falhas, mudanças importantes (quem criou/alterou usuário/role).

---

## 3. **Gerenciamento de Permissões Dinâmicas**

- **Permissões diretamente atribuídas a usuários** (opcional, para casos muito específicos, se quiser misturar RBAC + PBAC).
- **Revogação rápida de permissões** — para bloquear acessos imediatamente.

---

## 4. **Gerenciamento de Planos e Limites (Billing - se aplicável)**

- Limites para número de usuários, papéis ou permissões por tenant conforme plano contratado.
- Controle para impedir cadastro acima do limite.

---

---

## 6. **Suporte a Integrações**

- **Single Sign-On (SSO)** — integração com provedores externos (Google, Microsoft, SAML).
- **API para gerenciamento de usuários e papéis** — para automação e integrações futuras.

---

## 7. **Fluxo de Exclusão e Deativação**

- Processo seguro para desativar ou excluir usuários e tenants, com impacto controlado e histórico mantido.

#### tenant-creation.md

## **Caso de Uso: Registrar Tenant**

**Objetivo**
Permitir que uma nova empresa crie um espaço próprio no sistema, com dados cadastrais básicos e um administrador inicial com permissões máximas.

---

### **Atores**

- **Empresa visitante** (representada pelo futuro administrador)
- **Sistema de Identidade e Acesso** (módulo IAM)

---

### **Pré-condições**

- O visitante acessa a página de registro de novo tenant.
- O visitante não possui tenant previamente registrado com o mesmo email ou nome.

---

### **Fluxo principal**

1. **Acessar formulário de cadastro**

   - Link direto de “Começar agora” ou página de registro.

2. **Preencher dados do Tenant**

   - Nome da empresa
   - Endereço (opcional no MVP, mas recomendável)
   - Telefone de contato
   - Email de contato

3. **Preencher dados do Administrador principal**

   - Nome completo
   - Email (será usado para login)
   - Senha

4. **Aceitar termos e políticas**

   - Checkbox obrigatório antes de prosseguir.

5. **Enviar cadastro**

   - O sistema valida dados (unicidade, formato, obrigatoriedade).

6. **Criar registro do Tenant**

   - Gerar identificador único (`TenantId`)
   - Definir status inicial: **ativo** ou **pendente de verificação**

7. **Criar registro do usuário administrador**

   - Vincular ao Tenant
   - Atribuir papel **"TenantOwner"**
   - Definir permissões máximas

8. **Enviar email de confirmação**

   - Link de ativação e instruções de acesso.

9. **Redirecionar para tela de boas-vindas**

   - Mensagem de confirmação
   - Orientação para primeiros passos (ex.: criar membros, configurar logo)

---

### **Fluxos alternativos**

- **Email já cadastrado**: mostrar erro e opção de login.
- **Nome de empresa já registrado**: sugerir contato com suporte ou usar outro nome.
- **Validação falhou**: destacar campos com erro.
- **Cadastro pendente** (se exigir confirmação por email antes de liberar acesso): bloquear login até ativação.

---

### **Pós-condições**

- Existe um Tenant ativo com um administrador principal.
- O administrador recebeu instruções para acessar o painel de configuração.
- Configurações padrão do Tenant estão aplicadas (idioma, fuso horário, plano básico).

---

#### roles-and-permissions.md

## **📜 Catálogo de Permissões Base**

### **1. Gestão do Tenant**

- `tenant.view` — Visualizar informações do tenant
- `tenant.update` — Alterar dados do tenant (nome, endereço, etc.)
- `tenant.delete` — Encerrar tenant
- `tenant.settings.update` — Alterar configurações gerais

---

### **2. Gestão de Usuários**

- `user.view` — Visualizar usuários do tenant
- `user.create` — Criar novo usuário
- `user.update` — Editar informações de usuário
- `user.delete` — Remover usuário
- `user.invite` — Convidar novo usuário por email
- `user.deactivate` — Desativar usuário sem excluir
- `user.role.assign` — Atribuir papéis a usuários

---

### **3. Gestão de Papéis e Permissões**

- `role.view` — Visualizar papéis existentes
- `role.create` — Criar novo papel
- `role.update` — Alterar papel existente
- `role.delete` — Remover papel
- `role.permission.assign` — Atribuir/remover permissões de um papel

---

### **4. Projetos**

- `project.view` — Visualizar projetos
- `project.create` — Criar novo projeto
- `project.update` — Alterar projeto
- `project.delete` — Excluir projeto
- `project.archive` — Arquivar projeto
- `project.assign` — Atribuir usuários a projetos

---

### **5. Tarefas**

- `task.view` — Visualizar tarefas
- `task.create` — Criar nova tarefa
- `task.update` — Alterar tarefa
- `task.delete` — Excluir tarefa
- `task.assign` — Atribuir usuários a tarefas
- `task.status.update` — Alterar status da tarefa

---

### **6. Documentos**

- `document.view` — Visualizar documentos
- `document.upload` — Enviar novo documento
- `document.update` — Alterar documento
- `document.delete` — Remover documento
- `document.comment` — Adicionar comentários em documento

---

### **7. Comunicação**

- `message.send` — Enviar mensagem no chat interno
- `message.delete` — Apagar mensagens próprias
- `meeting.schedule` — Agendar reuniões
- `meeting.delete` — Cancelar reuniões

---

### **8. Financeiro / Orçamentos** (opcional no MVP)

- `billing.view` — Visualizar informações de cobrança
- `billing.update` — Alterar método de pagamento
- `budget.view` — Visualizar orçamentos
- `budget.create` — Criar orçamento
- `budget.update` — Alterar orçamento
- `budget.delete` — Remover orçamento

---

💡 **Sugestão de papéis default no onboarding**

- **TenantOwner** → todas as permissões
- **Admin** → tudo, exceto `tenant.delete` e `billing.update`
- **ProjectManager** → tudo de Projetos, Tarefas, Documentos e Comunicação
- **User** → somente `task.view`, `task.update` (próprias), `document.view`
- **Viewer** → apenas `project.view`, `task.view`, `document.view`

---

#### role-creation.md

## **Caso de Uso: Criar Role Customizado**

**Objetivo**
Permitir que o dono do tenant ou um administrador autorizado crie um novo papel (role) dentro do contexto do tenant, atribuindo permissões específicas para controlar o acesso dos usuários.

---

### **Atores**

- **Administrador do Tenant** (inclui o TenantOwner e Admins com permissão `role.create`)
- **Sistema IAM** (módulo de Identidade e Acesso)

---

### **Pré-condições**

- Administrador está autenticado no sistema.
- Administrador possui permissão `role.create`.
- Administrador atua dentro do contexto de um Tenant válido e ativo.

---

### **Fluxo Principal**

1. **Acessar Gestão de Papéis**

   - Administrador abre o painel de configuração do Tenant.
   - Seleciona “Papéis e Permissões”.

2. **Iniciar criação de papel**

   - Clica em “Novo Papel”.

3. **Preencher dados do papel**

   - Nome do papel (ex.: "Revisor de Projeto").
   - Descrição opcional.

4. **Selecionar permissões**

   - Lista de permissões disponíveis para o Tenant é exibida (checkboxes).
   - Administrador marca as permissões desejadas.

5. **Salvar papel**

   - Sistema valida se o nome não existe no mesmo Tenant.
   - Cria registro na tabela `Role` vinculado ao `TenantId`.
   - Registra permissões selecionadas na tabela `RolePermission`.

6. **Confirmação**

   - Sistema retorna mensagem de sucesso.
   - Papel aparece na lista de papéis disponíveis para atribuição a usuários.

---

### **Fluxos Alternativos**

- **Nome de papel duplicado** → exibir mensagem de erro e pedir novo nome.
- **Nenhuma permissão selecionada** → permitir salvar (pode ser papel “neutro”) ou obrigar ao menos uma permissão (dependendo da política do sistema).
- **Falha de validação** → exibir mensagens nos campos inválidos.

---

### **Pós-condições**

- Papel customizado registrado e pronto para uso no Tenant.
- Permissões associadas definem o escopo de acesso para qualquer usuário vinculado a esse papel.
- Papel pode ser editado ou removido futuramente.

---

#### basic-entities.md (IAM)

---
# Documento de Modelagem das Entidades - Módulo Identidade e Acesso
---

## 1. Entidade: Tenant

**Descrição:**
Representa uma empresa ou organização cliente do sistema. Cada tenant é um ambiente isolado, com seus próprios usuários, papéis e permissões.

| Atributo   | Tipo     | Descrição                                   |
| ---------- | -------- | ------------------------------------------- |
| tenant_id  | UUID     | Identificador único do tenant               |
| name       | String   | Nome da empresa/tenant                      |
| address    | String   | Endereço físico do tenant                   |
| phone      | String   | Telefone de contato                         |
| email      | String   | Email de contato principal                  |
| created_at | DateTime | Data de criação do tenant                   |
| updated_at | DateTime | Data da última atualização                  |
| status     | Enum     | Status do tenant (ativo, inativo, suspenso) |

---

## 2. Entidade: User

**Descrição:**
Representa um usuário do sistema, pertencente a um tenant. Pode ter um ou mais papéis (roles) que definem suas permissões.

| Atributo      | Tipo     | Descrição                                |
| ------------- | -------- | ---------------------------------------- |
| user_id       | UUID     | Identificador único do usuário           |
| tenant_id     | UUID     | Identificador do tenant ao qual pertence |
| name          | String   | Nome completo do usuário                 |
| email         | String   | Email único para login                   |
| password_hash | String   | Hash da senha                            |
| status        | Enum     | Status do usuário (ativo, desativado)    |
| created_at    | DateTime | Data de criação do usuário               |
| updated_at    | DateTime | Data da última atualização               |

**Relacionamentos:**

- Um usuário pode estar associado a um ou vários papéis (roles).
- Um usuário pertence a exatamente um tenant.

---

## 3. Entidade: Role (Papel)

**Descrição:**
Representa um conjunto de permissões nomeadas. Pode ser um papel padrão (system role) ou um criado/customizado pelo tenant.

| Atributo       | Tipo     | Descrição                                            |
| -------------- | -------- | ---------------------------------------------------- |
| role_id        | UUID     | Identificador único do papel                         |
| tenant_id      | UUID     | Identificador do tenant (null se system role global) |
| name           | String   | Nome do papel                                        |
| description    | String   | Descrição do papel                                   |
| is_system_role | Boolean  | Indica se é um papel padrão do sistema               |
| created_at     | DateTime | Data de criação                                      |
| updated_at     | DateTime | Data da última atualização                           |

**Relacionamentos:**

- Um papel possui várias permissões associadas.
- Um papel pertence a um tenant (exceto papéis globais).

---

## 4. Entidade: Permission (Permissão)

**Descrição:**
Representa uma ação atômica que pode ser executada no sistema, como criar projeto, visualizar usuário, etc.

| Atributo      | Tipo     | Descrição                           |
| ------------- | -------- | ----------------------------------- |
| permission_id | UUID     | Identificador único da permissão    |
| code          | String   | Código único (ex: `project.create`) |
| name          | String   | Nome legível da permissão           |
| description   | String   | Descrição detalhada                 |
| created_at    | DateTime | Data de criação                     |
| updated_at    | DateTime | Data da última atualização          |

**Relacionamentos:**

- Uma permissão pode estar associada a vários papéis (roles).

---

## Relacionamentos entre entidades

| Relação                            | Descrição                                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| UserRole (User x Role)             | Relaciona usuários e papéis (muitos-para-muitos). Permite atribuir múltiplos papéis a um usuário.   |
| RolePermission (Role x Permission) | Relaciona papéis e permissões (muitos-para-muitos). Define quais permissões pertencem a cada papel. |

---

## Diagrama simplificado (conceitual)

```
Tenant 1 --- N User
Tenant 1 --- N Role
Role N --- N Permission
User N --- N Role
```

---

#### user-creation.md

### **Entidades principais**

- **Tenant**
  Contexto isolado onde os usuários, papéis e permissões existem.
- **Usuário**
  Representa uma pessoa autenticável no sistema.
  Campos essenciais: `UserId`, `TenantId`, nome, email, senha (hash), status.
- **Papel (Role)**
  Conjunto nomeado de permissões.
  Ex.: `"TenantOwner"`, `"ProjectManager"`, `"Viewer"`.
- **Permissão (Permission)**
  Ação atômica que pode ser concedida.
  Ex.: `project.create`, `document.edit`, `billing.view`.
- **Associação Usuário-Papel (UserRole)**
  Tabela de ligação entre `User` e `Role`.
- **Associação Papel-Permissão (RolePermission)**
  Tabela de ligação entre `Role` e `Permission`.

---

## 2️⃣ Princípios para seu modelo

1. **Isolamento por Tenant**
   Usuário, papéis e permissões existem **dentro do contexto do tenant**.
2. **Dono do Tenant (`TenantOwner`)**
   Papel especial criado no onboarding com **todas permissões** atribuídas.
3. **Usuário comum (padrão)**
   Ao ser adicionado, começa **sem papéis e sem permissões**.
4. **Controle via Papéis**
   As permissões são atribuídas aos papéis, e não diretamente ao usuário (facilita manutenção).
5. **Flexibilidade**
   Administrador pode criar papéis customizados e atribuir permissões conforme necessidade.

---

## Caso de uso: **Adicionar novo usuário ao Tenant**

### **Objetivo**

Permitir que o dono do tenant ou um administrador autorizado convide um novo usuário para participar do sistema, definindo ou não papéis no momento da criação.

---

### **Atores**

- **Administrador do Tenant** (inclui dono do tenant)
- **Sistema IAM**

---

### **Pré-condições**

- Administrador está autenticado no contexto do tenant.
- Administrador possui permissão `user.create`.

---

### **Fluxo principal**

1. Administrador acessa **"Gerenciar usuários"**.
2. Clica em **"Adicionar usuário"**.
3. Preenche:

   - Nome completo
   - Email (será usado para login)
   - Papéis iniciais (opcional, pode ser nenhum)

4. Sistema valida email (formato, duplicidade).
5. Sistema cria registro do usuário:

   - `TenantId` herdado do administrador
   - Status: **pendente** (aguardando ativação)
   - Nenhum papel por padrão se não for selecionado.

6. Sistema envia **convite por email**:

   - Link para criar senha e ativar conta.

7. Usuário convidado acessa o link, cria senha, e ganha acesso de acordo com papéis atribuídos.

---

### **Fluxos alternativos**

- Email já existente no mesmo tenant → erro de duplicidade.
- Email existente em outro tenant → permitido (usuário multi-tenant).
- Administrador não atribui papéis → usuário entra sem permissões (apenas tela de acesso restrito).

---

### **Pós-condições**

- Usuário criado no tenant com status ativo (após aceitar convite).
- Papéis e permissões atribuídos, se definidos.
- Administrador pode editar permissões posteriormente.

---

## 4️⃣ Visual simplificado da relação

```
Tenant
 └── Usuário
      └── UserRole → Role → RolePermission → Permission
```

---

### Subscription Management

#### basic-entities.md (Subscription)

# **Objetos de Domínio Detalhados**

### **Plan**

**Propósito:** Representa um plano comercial disponível no catálogo, definindo quais features estão incluídas e seus limites.
**Propriedades principais:**

- `id: UUID` — Identificador único do plano
- `name: string` — Nome do plano (ex: "Free", "Pro", "Enterprise")
- `description: string` — Descrição do plano
- `price: decimal` — Preço base do plano
- `billingCycles: List<BillingCycle>` — Períodos disponíveis para assinatura (ex: mensal, anual)
- `planFeatures: List<PlanFeature>` — Lista de features associadas e seus limites
- `createdAt: datetime`
- `updatedAt: datetime`

---

### **Feature**

**Propósito:** Define um recurso funcional do sistema que pode estar habilitado em um plano e pode ter limite de uso.
**Propriedades principais:**

- `id: UUID` — Identificador da feature
- `code: string` — Código único identificador da feature (ex: "CREATE_CUSTOM_ROLES")
- `name: string` — Nome amigável da feature
- `description: string` — Descrição detalhada
- `createdAt: datetime`
- `updatedAt: datetime`

---

### **PlanFeature**

**Propósito:** Representa a associação entre um plano e uma feature, definindo habilitação e limites específicos.
**Propriedades principais:**

- `id: UUID`
- `planId: UUID` — Referência ao plano
- `featureId: UUID` — Referência à feature
- `isEnabled: boolean` — Se a feature está habilitada nesse plano
- `limit: int|null` — Limite máximo de uso permitido (null = ilimitado)
- `createdAt: datetime`
- `updatedAt: datetime`

---

### **Subscription**

**Propósito:** Representa uma assinatura ativa de um tenant para um plano, contendo o snapshot do plano no momento da compra.
**Propriedades principais:**

- `id: UUID`
- `tenantId: UUID` — Referência ao tenant assinante
- `planSnapshot: PlanSnapshot` — Snapshot do plano no momento da compra (inclui planFeatures com limites)
- `status: enum { ACTIVE, CANCELED, EXPIRED }` — Status da assinatura
- `term: enum { MONTHLY, QUARTERLY, ANNUAL }` — Período contratado
- `startDate: datetime` — Data de início da assinatura
- `endDate: datetime` — Data de término prevista
- `createdAt: datetime`
- `updatedAt: datetime`

---

### **PlanSnapshot**

_(Objeto de valor contido em Subscription para manter cópia do plano)_
**Propriedades principais:**

- `planId: UUID`
- `planName: string`
- `planFeatures: List<SubscriptionFeature>` — Cópia das features com limites/habilitações no momento da assinatura

---

### **SubscriptionFeature**

**Propósito:** Representa a feature dentro da assinatura com limites e habilitação no momento da compra.
**Propriedades principais:**

- `id: UUID`
- `featureCode: string` — Código da feature (duplicado para fácil acesso)
- `isEnabled: boolean`
- `limit: int|null`
- `createdAt: datetime`
- `updatedAt: datetime`

---

### **Usage**

**Propósito:** Controla o consumo atual de uma feature para uma assinatura, permitindo validação contra limites.
**Propriedades principais:**

- `id: UUID`
- `subscriptionId: UUID` — Referência à assinatura
- `featureCode: string` — Código da feature consumida
- `currentUsage: int` — Quantidade consumida até o momento
- `lastUpdated: datetime`

---

### **Tenant**

**Propósito:** Entidade que representa o cliente (empresa ou usuário principal). Usada para associar assinaturas.
**Propriedades principais (referência):**

- `id: UUID`
- `name: string`
- `contactEmail: string`
- `createdAt: datetime`

_(Nota: o tenant é definido em outro bounded context, mas aqui usamos só referências)_

---

### **BillingCycle**

**Propósito:** Representa o ciclo de cobrança disponível para um plano (ex: mensal, trimestral, anual).
**Propriedades principais:**

- `id: UUID`
- `name: string` — Ex: "Mensal", "Trimestral", "Anual"
- `durationInMonths: int` — Ex: 1, 3, 12
- `createdAt: datetime`
- `updatedAt: datetime`

---

#### plan-shopping.md

# **Documento de Caso de Uso**

**Caso de Uso:** Comprar Plano
**Atores Principais:** TenantOwner (ou Administrador do Tenant)
**Atores Secundários:** Sistema de Pagamento (Gateway), Sistema Interno de Assinaturas
**Objetivo:** Permitir que um tenant adquira um plano do catálogo, gerando uma assinatura ativa com base no snapshot do plano.

---

## **Fluxo Principal**

1. **Início da Compra**

   - O TenantOwner ou Administrador acessa a área de planos disponíveis no sistema.
   - O sistema apresenta a lista de planos (`Plan`) disponíveis no catálogo, com preços e periodicidades (`mensal`, `trimestral`, `anual`).

2. **Seleção do Plano e Termo**

   - O ator seleciona:

     - Plano desejado (`Plan.id`).
     - Periodicidade (termo de assinatura).

   - O sistema exibe o resumo da compra, incluindo preço calculado conforme termo.

3. **Confirmação de Pagamento**

   - O ator confirma a compra.
   - O sistema aciona o **Gateway de Pagamento**.
   - Se o pagamento for aprovado, o sistema prossegue.
   - Se for recusado, o sistema retorna mensagem de erro e encerra o fluxo.

4. **Criação da Assinatura**

   - O sistema cria uma nova `Subscription` associada ao `tenant_id`:

     - `plan_snapshot` (cópia das features e limites no momento da compra).
     - `term` escolhido.
     - `status = active`.
     - `start_date = agora`.
     - `end_date = start_date + duração do termo`.

   - Criação de `Usage` inicial para cada feature (`current_usage = 0`).

5. **Inativação de Assinaturas Anteriores**

   - Caso o tenant já possua uma assinatura ativa:

     - Marcar assinatura antiga como `canceled` ou `expired`.

6. **Confirmação ao Usuário**

   - O sistema retorna confirmação da compra e detalhes da assinatura.

---

## **Fluxos Alternativos**

- **A1 – Pagamento Recusado**

  - No passo 3, se o gateway retorna pagamento negado:

    - O sistema informa a falha ao ator.
    - Nenhuma `Subscription` é criada.

- **A2 – Tenant já possui assinatura ativa**

  - No passo 5, se já existir assinatura ativa:

    - A assinatura anterior é encerrada.
    - O histórico é preservado.

- **A3 – Erro no Gateway de Pagamento**

  - Se houver falha técnica na comunicação com o gateway:

    - O sistema retorna erro e orienta tentar novamente.

---

## **Pré-condições**

- O tenant está ativo e possui um TenantOwner ou Administrador autenticado.
- O plano selecionado existe e está disponível no catálogo.
- O método de pagamento está configurado e válido.

---

## **Pós-condições**

- Uma nova assinatura (`Subscription`) está ativa para o tenant.
- O consumo (`Usage`) foi inicializado para cada feature da assinatura.
- O histórico de assinaturas foi atualizado.

---

## **Regras de Negócio**

1. Apenas 1 assinatura ativa por tenant.
2. Assinaturas armazenam um **snapshot do plano** no momento da compra, garantindo que mudanças no catálogo não afetem assinaturas existentes.
3. Limites e habilitações de features são definidos no momento da criação da assinatura.
4. Assinaturas são vinculadas ao tenant até serem canceladas ou expirarem.

---

#### subscription-checking.md

Segue um documento detalhado para o caso de uso **Validar Acesso a Feature** considerando que o bounded context de planos/assinaturas vai expor isso como uma **API/Façade declarativa** para outros módulos.

---

# **Documento de Caso de Uso**

**Caso de Uso:** Validar Acesso a Feature
**Atores Principais:** Sistema Interno (outros bounded contexts via API/Façade)
**Atores Secundários:** Nenhum (operação interna, sem interação direta com usuário final)
**Objetivo:** Verificar se um `Tenant` possui direito a utilizar determinada feature, considerando assinatura ativa, habilitação e limites de uso.

---

## **Fluxo Principal**

1. **Recebimento da Requisição**

   - Um módulo externo envia uma requisição para o bounded context de assinaturas via API/Façade:

     ```
     validarAcessoFeature(tenant_id, feature_code)
     ```

2. **Identificação da Assinatura Ativa**

   - O sistema busca a `Subscription` associada ao `tenant_id` com `status = active` e `end_date > agora`.
   - Se não encontrar assinatura válida → fluxo alternativo **A1**.

3. **Busca da Feature na Assinatura**

   - O sistema procura na `plan_snapshot` da assinatura a `SubscriptionFeature` cujo `feature_code` corresponda ao informado.
   - Se a feature não existir → fluxo alternativo **A2**.

4. **Verificação de Habilitação**

   - Se `is_enabled = false` → fluxo alternativo **A3**.

5. **Verificação de Limite de Uso**

   - Se `limit` for **null** → significa uso ilimitado → retorna **acesso permitido**.
   - Se `limit` não for **null**:

     - Buscar o `Usage` da feature.
     - Se `current_usage < limit` → acesso permitido.
     - Caso contrário → fluxo alternativo **A4**.

6. **Retorno**

   - O sistema retorna resposta clara:

     - `true` (acesso permitido) ou
     - Erro específico (motivo da negação).

---

## **Fluxos Alternativos**

- **A1 – Sem Assinatura Ativa**

  - Retornar erro `TENANT_NO_ACTIVE_SUBSCRIPTION`.

- **A2 – Feature Não Encontrada**

  - Retornar erro `FEATURE_NOT_INCLUDED_IN_PLAN`.

- **A3 – Feature Desabilitada**

  - Retornar erro `FEATURE_DISABLED`.

- **A4 – Limite de Uso Atingido**

  - Retornar erro `FEATURE_LIMIT_REACHED`.

---

## **Pré-condições**

- O tenant está cadastrado no sistema.
- O bounded context de assinaturas possui dados consistentes de plano, features e usage.

---

## **Pós-condições**

- O resultado da validação é retornado para o módulo chamador.
- Nenhum dado é alterado durante a validação (operação de leitura), exceto se a API também tiver variante de "incrementar uso" junto com a validação.

---

## **Regras de Negócio**

1. Apenas tenants com assinatura ativa e vigente podem usar features.
2. A validação considera **o snapshot da assinatura** (não o plano atual no catálogo).
3. Limites são avaliados com base no uso registrado (`Usage`).
4. O sistema deve fornecer respostas **declarativas e consistentes** para módulos chamadores, evitando que lógica de negócio de assinatura se espalhe por outros bounded contexts.

---

## **Observações de Integração**

- Essa operação deve ser exposta como **API/Façade** com interface clara:

  - **Assinatura simples:** `bool validarAcessoFeature(tenant_id, feature_code)`
  - **Assinatura detalhada:** `ValidationResult validarAcessoFeature(tenant_id, feature_code)` onde `ValidationResult` contém status e motivo.

- Outros bounded contexts **não** acessam diretamente repositórios de planos/assinaturas — somente chamam essa API.

---



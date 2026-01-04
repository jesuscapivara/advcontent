# Roadmap — Próximos Passos

Sumário
- [Prioridade 1 — Segurança e Identidade](#prioridade-1--segurança-e-identidade)
- [Prioridade 2 — Domínio AEC (MVP)](#prioridade-2--domínio-aec-mvp)
- [Prioridade 3 — Assinaturas e Billing](#prioridade-3--assinaturas-e-billing)
- [Prioridade 4 — Plataforma e Qualidade](#prioridade-4--plataforma-e-qualidade)
- [Prioridade 5 — Experiência e Expansão](#prioridade-5--experiência-e-expansão)
- [Tarefas Técnicas Detalhadas](#tarefas-técnicas-detalhadas)

---

## Prioridade 1 — Segurança e Identidade

- [ ] Implementar autenticação (JWT access/refresh): `/auth/login`, `/auth/refresh`, `/auth/logout`
- [ ] Middleware de autenticação e autorização (RBAC) por rota
- [ ] AccountVerificationService real (provider de e-mail + templates)
- [ ] Fluxos de senha: forgot/reset, política de senha e rate limiting

## Prioridade 2 — Domínio AEC (MVP)

- [ ] Modelar `Project`, `Client`, `Team/Member`, `Task/Subtask`, `Milestone`, `Deliverable`
- [ ] CRUDs e validações: prazos, responsáveis, status, dependências, WBS simplificada
- [ ] Comentários/menções, histórico e notificações por e-mail
- [ ] Anexos: S3/Cloud Storage, versionamento e metadados

## Prioridade 3 — Assinaturas e Billing

- [ ] Integração de pagamentos (Stripe/PIX/Cartão), rotas de checkout, webhooks
- [ ] Portal do assinante: visualizar/alterar plano, faturamento, cancelamento
- [ ] Enforcement de features por plano (feature flags/permissions)

## Prioridade 4 — Plataforma e Qualidade

- [ ] OpenAPI/Swagger e validação de entrada nos controllers (Zod)
- [ ] Observabilidade: métricas, logs estruturados e tracing básico
- [ ] CI/CD: lint, build, testes e migrations por ambiente
- [ ] Docker Compose para todos os apps (server/dispatcher/worker) com profiles

## Prioridade 5 — Experiência e Expansão

- [ ] Admin para gestão de roles/permissions custom por tenant
- [ ] Integrações: visualização de PDFs/CAD, BIM (Autodesk/IFC)
- [ ] Internacionalização (i18n) de mensagens e formatos (data/moeda)

## Tarefas Técnicas Detalhadas

- [ ] Externalizar env para `.env` por ambiente e remover defaults de prod
- [ ] Consolidar validação de entrada (Zod) e respostas 422 consistentes
- [ ] Garantir `tenantId` em repositórios do novo domínio (multitenancy)
- [ ] Padronizar taxonomy de erros e códigos na API
- [ ] Testes e2e: criar tenant → dispatcher → workers (trial + verificação)


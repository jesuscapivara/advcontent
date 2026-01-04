# Web Client - LegalAuto

Frontend Next.js para o sistema LegalAuto de geração de posts para Instagram.

## Estrutura

```
web-client/
├── app/
│   ├── (dashboard)/
│   │   └── editor/
│   │       └── page.tsx      # Tela principal de criação de posts
│   ├── globals.css            # Estilos globais Tailwind
│   ├── layout.tsx              # Layout raiz com providers
│   └── providers.tsx          # React Query Provider
├── components/
│   └── ui/                     # Componentes base (Button, Input, etc.)
└── lib/                        # Utilitários e configurações
```

## Instalação

```bash
# Na raiz do monorepo
yarn install

# Ou dentro do diretório web-client
cd apps/web-client
yarn install
```

## Desenvolvimento

```bash
# Rodar o servidor de desenvolvimento
yarn dev

# O app estará disponível em http://localhost:3001
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Tecnologias

- **Next.js 15** - Framework React
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado assíncrono
- **Lucide React** - Ícones
- **TypeScript** - Tipagem estática

## Próximos Passos

1. Configurar autenticação
2. Adicionar rota de calendário
3. Implementar preview de imagem
4. Adicionar validação de compliance visual

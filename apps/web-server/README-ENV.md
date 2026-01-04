# Configuração de Variáveis de Ambiente

## Passo 1: Criar o arquivo .env

Na pasta `apps/web-server/`, crie um arquivo chamado `.env` (sem nome, só a extensão).

## Passo 2: Copiar o template

Copie o conteúdo abaixo e cole no arquivo `.env`:

```env
# --- Conexão com o Banco de Dados (MongoDB) ---
# Substitua <USER>, <PASSWORD> e <DB_NAME> pelos seus dados reais.
# Se for Atlas, a string geralmente começa com mongodb+srv://
# Para desenvolvimento local, use: mongodb://localhost:27017
MONGODB_URI="mongodb://localhost:27017"

# --- Nome do Banco de Dados ---
DATABASE_NAME="org"

# --- Configurações do Servidor ---
PORT=3333
NODE_ENV="development"

# --- Configuração do Frontend (CORS) ---
# Permite que o Next.js (Porta 3000) converse com esse Backend
# Para múltiplas origens, separe por vírgula: "http://localhost:3000,http://localhost:3001"
CORS_ORIGIN="http://localhost:3000"

# --- Redis (Opcional para desenvolvimento) ---
REDIS_HOST="localhost"
REDIS_PORT=6379

# --- Segredos de Autenticação (Gere hashs aleatórios seguros) ---
# Você pode digitar qualquer coisa aleatória aqui para desenvolvimento
JWT_SECRET="segredo_super_secreto_para_desenvolvimento_local_123"

# --- OpenAI API Key (Para geração de conteúdo com IA) ---
# Obtenha sua chave em: https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-..."
# OU use OPEN_AI_SECRET (ambos funcionam)
# OPEN_AI_SECRET="sk-..."
```

## Passo 3: Personalizar os valores

### MongoDB

- **Desenvolvimento Local**: Use `mongodb://localhost:27017`
- **MongoDB Atlas**: Substitua `<USER>`, `<PASSWORD>` e `<CLUSTER>` na string de conexão
  ```
  MONGODB_URI="mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/<DB_NAME>?retryWrites=true&w=majority"
  ```

### Porta do Servidor

- Por padrão: `3333`
- Se quiser mudar, altere o valor de `PORT`

### CORS

- Por padrão: `http://localhost:3000` (porta padrão do Next.js)
- Se o Next.js estiver em outra porta, ajuste o valor

## Variáveis Disponíveis

| Variável         | Descrição                                      | Padrão                      |
| ---------------- | ---------------------------------------------- | --------------------------- |
| `MONGODB_URI`    | URI de conexão com MongoDB                     | `mongodb://localhost:27017` |
| `DATABASE_NAME`  | Nome do banco de dados                         | `org`                       |
| `PORT`           | Porta do servidor                              | `3000`                      |
| `NODE_ENV`       | Ambiente (development/production/staging)      | `development`               |
| `CORS_ORIGIN`    | Origens permitidas (separadas por vírgula)     | `*`                         |
| `REDIS_HOST`     | Host do Redis                                  | `localhost`                 |
| `REDIS_PORT`     | Porta do Redis                                 | `6379`                      |
| `JWT_SECRET`     | Segredo para JWT                               | (nenhum)                    |
| `OPENAI_API_KEY` | Chave da API OpenAI (para geração de conteúdo) | (nenhum)                    |

## Importante

⚠️ **NUNCA** commite o arquivo `.env` no Git! Ele está no `.gitignore` por segurança.

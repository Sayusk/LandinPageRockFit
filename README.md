# RockFit Brasil — Landing Page

Landing page de alta conversão para consultoria fitness online, com checkout integrado ao Mercado Pago e base de dados no Supabase.

**Stack:** React 19 · Vite 8 · Tailwind CSS v4 · Supabase · Mercado Pago · Vercel Serverless Functions

---

## Rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencha as variáveis em .env.local

# 3. Iniciar servidor de desenvolvimento
npm run dev

# 4. Build de produção
npm run build
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Onde usar | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Chave anônima pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend only | Chave de serviço (secreta) |
| `SUPABASE_URL` | Backend only | URL do Supabase para serverless |
| `VITE_MERCADO_PAGO_PUBLIC_KEY` | Frontend | Public key do MP |
| `MERCADO_PAGO_ACCESS_TOKEN` | Backend only | Access token (secreto) |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Backend only | Secret para validar webhooks |
| `VITE_APP_URL` | Frontend | URL pública do deploy |
| `VITE_ADMIN_ACCESS_TOKEN` | Frontend | Token para `/admin/alunos` |

> **Nunca commite valores reais.** `.env.local` está no `.gitignore`.

---

## Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Copie URL e anon key em **Settings > API**
3. Copie o service role key (Settings > API > Service Role)
4. Aplique a migration:
   - Vá em **SQL Editor** no dashboard
   - Cole e execute o conteúdo de `supabase/migrations/001_initial.sql`
5. Ou use a CLI:
   ```bash
   supabase login
   supabase link --project-ref SEU_PROJECT_REF
   supabase db push
   ```

---

## Configurar Mercado Pago

1. Crie uma conta em [mercadopago.com.br](https://mercadopago.com.br)
2. Acesse **Suas integrações > Credenciais**
3. Use credenciais de **sandbox** para testes e **produção** para live
4. Copie **Public Key** → `VITE_MERCADO_PAGO_PUBLIC_KEY`
5. Copie **Access Token** → `MERCADO_PAGO_ACCESS_TOKEN`
6. Configure o webhook em **Suas integrações > Webhooks**:
   - URL: `https://SEU_DOMINIO.vercel.app/api/mercadopago/webhook`
   - Eventos: `preapproval`, `payment`
   - Copie o secret gerado → `MERCADO_PAGO_WEBHOOK_SECRET`

---

## Deploy na Vercel

1. Faça push do código para um repositório GitHub/GitLab
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente em **Settings > Environment Variables**:
   - Adicione todas as variáveis do `.env.example`
   - Variáveis secretas (sem `VITE_`) devem ser marcadas como **Server-side only**
4. A Vercel detecta automaticamente as funções em `/api`
5. Deploy automático em cada push para `main`

---

## Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/plans` | Lista os planos disponíveis |
| `POST` | `/api/mercadopago/create-subscription` | Cria assinatura no MP + Supabase |
| `POST` | `/api/mercadopago/webhook` | Recebe eventos do MP e atualiza status |

### POST /api/mercadopago/create-subscription

**Body:**
```json
{
  "planSlug": "semestral",
  "token": "MP_CARD_TOKEN",
  "installments": 1,
  "paymentMethodId": "visa",
  "issuerId": "24",
  "payer": {
    "email": "cliente@email.com",
    "identification": { "type": "CPF", "number": "12345678900" },
    "first_name": "João Silva"
  },
  "customerData": {
    "name": "João Silva",
    "email": "cliente@email.com",
    "phone": "(11) 99999-9999",
    "cpf": "123.456.789-00"
  }
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "preapprovalId": "MP_PREAPPROVAL_ID",
  "status": "authorized"
}
```

---

## Fluxo do Checkout

1. Usuário clica em "Assinar agora" na landing
2. É redirecionado para `/checkout?plan=semestral`
3. O SDK do Mercado Pago é carregado e monta o CardForm com iframes seguros
4. Usuário preenche dados pessoais + dados do cartão
5. Ao submeter, o SDK tokeniza o cartão no lado do MP
6. O token é enviado para `POST /api/mercadopago/create-subscription`
7. O backend valida o plano, cria o cliente no Supabase e cria a assinatura no MP
8. Em caso de sucesso, o usuário vê tela de confirmação com link para WhatsApp

---

## Fluxo do Webhook

1. Mercado Pago envia evento para `/api/mercadopago/webhook`
2. O handler verifica a assinatura HMAC (se `MERCADO_PAGO_WEBHOOK_SECRET` configurado)
3. O evento raw é salvo na tabela `mercado_pago_webhook_events`
4. O handler busca o recurso completo na API do MP
5. Atualiza `client_subscriptions.status` conforme o evento
6. Para eventos de pagamento, salva em `payment_events`

---

## Admin /admin/alunos

Acesse `/admin/alunos` para ver a lista de clientes.

- Se `VITE_ADMIN_ACCESS_TOKEN` estiver configurado, um token de acesso é exigido
- Funcionalidades: busca, filtro por plano/status, paginação
- **TODO:** Substituir por autenticação real (Supabase Auth ou similar) em produção

---

## Estrutura do projeto

```
├── api/                         # Serverless functions (Vercel)
│   ├── plans.js                 # GET /api/plans
│   └── mercadopago/
│       ├── create-subscription.js
│       └── webhook.js
├── src/
│   ├── assets/                  # Imagens e logos
│   ├── components/
│   │   ├── layout/              # Header, Footer
│   │   └── sections/            # Hero, Benefits, Plans, FAQ...
│   ├── data/                    # Dados estáticos (plans, faq, testimonials)
│   ├── pages/                   # Home, Checkout, admin/Alunos
│   └── services/                # supabaseClient, mercadoPago, plans
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
├── .env.example
└── vite.config.js
```

---

Desenvolvido por [MFactor Tecnologia](https://www.linkedin.com/company/mfactortech/)

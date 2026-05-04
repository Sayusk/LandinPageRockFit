-- ============================================================
-- RockFit Brasil — Schema inicial
-- Aplique via: supabase db push ou Supabase Dashboard > SQL Editor
-- ============================================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELA: clients
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  cpf         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_email ON clients (email);
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON clients (cpf) WHERE cpf IS NOT NULL;

-- ============================================================
-- TABELA: plans
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  description           TEXT,
  price_cents           INTEGER NOT NULL,
  currency              TEXT DEFAULT 'BRL',
  interval              TEXT DEFAULT 'monthly',
  duration_months       INTEGER,
  mercado_pago_plan_id  TEXT,
  is_active             BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans (slug);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans (is_active);

-- Seed dos planos
INSERT INTO plans (slug, name, description, price_cents, duration_months, is_active)
VALUES
  ('mensal',      'Plano Mensal',      '1 mês de acompanhamento personalizado',  10000, 1,  TRUE),
  ('trimestral',  'Plano Trimestral',  '3 meses de acompanhamento contínuo',      8500, 3,  TRUE),
  ('semestral',   'Plano Semestral',   '6 meses de acompanhamento premium',       7500, 6,  TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TABELA: client_subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS client_subscriptions (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                     UUID REFERENCES clients(id) ON DELETE CASCADE,
  plan_id                       UUID REFERENCES plans(id),
  status                        TEXT NOT NULL DEFAULT 'pending',
  mercado_pago_preapproval_id   TEXT,
  mercado_pago_payment_id       TEXT,
  mercado_pago_payer_id         TEXT,
  current_period_start          TIMESTAMPTZ,
  current_period_end            TIMESTAMPTZ,
  next_payment_date             TIMESTAMPTZ,
  raw_response                  JSONB,
  created_at                    TIMESTAMPTZ DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_client_id ON client_subscriptions (client_id);
CREATE INDEX IF NOT EXISTS idx_sub_status ON client_subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_sub_mp_preapproval ON client_subscriptions (mercado_pago_preapproval_id)
  WHERE mercado_pago_preapproval_id IS NOT NULL;

-- ============================================================
-- TABELA: mercado_pago_webhook_events
-- ============================================================
CREATE TABLE IF NOT EXISTS mercado_pago_webhook_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type       TEXT,
  action           TEXT,
  mercado_pago_id  TEXT,
  subscription_id  UUID REFERENCES client_subscriptions(id),
  payload          JSONB NOT NULL,
  processed        BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_mp_id ON mercado_pago_webhook_events (mercado_pago_id);
CREATE INDEX IF NOT EXISTS idx_webhook_processed ON mercado_pago_webhook_events (processed);

-- ============================================================
-- TABELA: payment_events
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_events (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id           UUID REFERENCES client_subscriptions(id),
  mercado_pago_payment_id   TEXT,
  status                    TEXT,
  status_detail             TEXT,
  amount_cents              INTEGER,
  payload                   JSONB,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_sub_id ON payment_events (subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_mp_id ON payment_events (mercado_pago_payment_id);

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_plans_updated_at ON plans;
CREATE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_subs_updated_at ON client_subscriptions;
CREATE TRIGGER trg_subs_updated_at
  BEFORE UPDATE ON client_subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- RLS (Row Level Security) — habilite conforme sua política
-- ============================================================
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE client_subscriptions ENABLE ROW LEVEL SECURITY;
-- Adicione policies de acordo com sua estratégia de autenticação.

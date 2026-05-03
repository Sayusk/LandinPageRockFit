// POST /api/mercadopago/create-subscription
// Cria uma assinatura recorrente (preapproval) no Mercado Pago.
// NUNCA expõe MERCADO_PAGO_ACCESS_TOKEN no frontend.

import { createClient } from '@supabase/supabase-js';

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Planos validados no backend — não confiar no frontend para preço
const PLANS = {
  mensal: {
    slug: 'mensal',
    name: 'Plano Mensal — RockFit Brasil',
    transactionAmount: 100.0,
    currencyId: 'BRL',
    frequencyType: 'months',
    frequency: 1,
  },
  trimestral: {
    slug: 'trimestral',
    name: 'Plano Trimestral — RockFit Brasil',
    transactionAmount: 85.0,
    currencyId: 'BRL',
    frequencyType: 'months',
    frequency: 1,
  },
  semestral: {
    slug: 'semestral',
    name: 'Plano Semestral — RockFit Brasil',
    transactionAmount: 75.0,
    currencyId: 'BRL',
    frequencyType: 'months',
    frequency: 1,
  },
};

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!ACCESS_TOKEN) {
    return res.status(500).json({ message: 'Configuração do servidor incompleta.' });
  }

  const { planSlug, token, installments, paymentMethodId, issuerId, payer, customerData } = req.body;

  // Validate required fields
  if (!planSlug || !token || !payer?.email) {
    return res.status(400).json({ message: 'Dados obrigatórios ausentes.' });
  }

  const plan = PLANS[planSlug];
  if (!plan) {
    return res.status(400).json({ message: 'Plano inválido.' });
  }

  const supabase = getSupabase();
  let clientId = null;
  let subscriptionId = null;
  let planDbId = null;

  try {
    // 1. Upsert client in Supabase
    if (supabase && customerData?.email) {
      const { data: clientRow } = await supabase
        .from('clients')
        .upsert(
          {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            cpf: customerData.cpf?.replace(/\D/g, ''),
          },
          { onConflict: 'email', ignoreDuplicates: false }
        )
        .select('id')
        .single();

      clientId = clientRow?.id;

      // Get plan DB id
      const { data: planRow } = await supabase
        .from('plans')
        .select('id')
        .eq('slug', planSlug)
        .single();
      planDbId = planRow?.id;

      // Create pending subscription
      if (clientId && planDbId) {
        const { data: subRow } = await supabase
          .from('client_subscriptions')
          .insert({
            client_id: clientId,
            plan_id: planDbId,
            status: 'pending',
          })
          .select('id')
          .single();
        subscriptionId = subRow?.id;
      }
    }

    // 2. Create preapproval on Mercado Pago
    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now.setFullYear(now.getFullYear() + 2)).toISOString();

    const mpPayload = {
      preapproval_plan_id: undefined, // use inline plan
      reason: plan.name,
      auto_recurring: {
        frequency: plan.frequency,
        frequency_type: plan.frequencyType,
        transaction_amount: plan.transactionAmount,
        currency_id: plan.currencyId,
        start_date: startDate,
        end_date: endDate,
      },
      payer_email: payer.email,
      card_token_id: token,
      status: 'authorized',
    };

    const mpRes = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${planSlug}-${Date.now()}`,
      },
      body: JSON.stringify(mpPayload),
    });

    const mpData = await mpRes.json();

    // 3. Update subscription in Supabase with MP response
    if (supabase && subscriptionId) {
      const status = mpData.status === 'authorized' ? 'active' : 'pending';
      await supabase
        .from('client_subscriptions')
        .update({
          status,
          mercado_pago_preapproval_id: mpData.id,
          mercado_pago_payer_id: String(mpData.payer_id || ''),
          current_period_start: startDate,
          next_payment_date: mpData.next_payment_date,
          raw_response: mpData,
        })
        .eq('id', subscriptionId);
    }

    if (!mpRes.ok) {
      const errMsg =
        mpData?.message ||
        mpData?.cause?.[0]?.description ||
        'Erro ao processar pagamento no Mercado Pago.';
      return res.status(422).json({ message: errMsg, raw: mpData });
    }

    return res.status(200).json({
      success: true,
      preapprovalId: mpData.id,
      status: mpData.status,
    });
  } catch (err) {
    console.error('[create-subscription] error:', err);
    return res.status(500).json({ message: 'Erro interno. Tente novamente.' });
  }
}

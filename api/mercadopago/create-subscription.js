// POST /api/mercadopago/create-subscription
// Processa o pagamento via /v1/payments com o token do CardPayment Brick.
// NUNCA expõe MERCADO_PAGO_ACCESS_TOKEN no frontend.

import { createClient } from '@supabase/supabase-js';

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Valores validados no backend — não confiar no frontend para preço
const PLANS = {
  mensal: {
    slug: 'mensal',
    name: 'Plano Mensal — RockFit Brasil',
    transactionAmount: 100.0,
  },
  trimestral: {
    slug: 'trimestral',
    name: 'Plano Trimestral — RockFit Brasil',
    transactionAmount: 255.0,
  },
  semestral: {
    slug: 'semestral',
    name: 'Plano Semestral — RockFit Brasil',
    transactionAmount: 450.0,
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
    // 1. Upsert cliente no Supabase
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

      const { data: planRow } = await supabase
        .from('plans')
        .select('id')
        .eq('slug', planSlug)
        .single();
      planDbId = planRow?.id;

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

    // 2. Cobrar via /v1/payments (compatível com token do CardPayment Brick)
    const identification = payer.identification;
    const hasIdentification =
      identification?.type && identification?.number && String(identification.number).replace(/\D/g, '').length > 0;

    const mpPayload = {
      transaction_amount: plan.transactionAmount,
      token,
      description: plan.name,
      installments: Math.max(1, parseInt(installments, 10) || 1),
      payment_method_id: paymentMethodId,
      ...(issuerId && { issuer_id: Number(issuerId) }),
      payer: {
        email: payer.email,
        ...(payer.first_name && { first_name: payer.first_name }),
        ...(hasIdentification && {
          identification: {
            type: identification.type,
            number: String(identification.number).replace(/\D/g, ''),
          },
        }),
      },
    };

    console.log('[create-subscription] payload ->', JSON.stringify(mpPayload));

    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `rockfit-${planSlug}-${Date.now()}`,
      },
      body: JSON.stringify(mpPayload),
    });

    const mpData = await mpRes.json();
    console.log('[create-subscription] mp response ->', mpRes.status, JSON.stringify(mpData));

    // 3. Atualizar status no Supabase
    if (supabase && subscriptionId) {
      const isPaid = mpData.status === 'approved';
      await supabase
        .from('client_subscriptions')
        .update({
          status: isPaid ? 'active' : 'pending',
          mercado_pago_preapproval_id: String(mpData.id || ''),
          mercado_pago_payer_id: String(mpData.payer?.id || ''),
          current_period_start: new Date().toISOString(),
          raw_response: mpData,
        })
        .eq('id', subscriptionId);
    }

    if (!mpRes.ok) {
      // Erro de credenciais trocadas: chave pública e access token são de ambientes diferentes
      if (mpData?.status === 404 && mpData?.message?.includes('token')) {
        return res.status(422).json({
          message:
            'Erro de configuração: a chave pública (VITE_MERCADO_PAGO_PUBLIC_KEY) e o access token (MERCADO_PAGO_ACCESS_TOKEN) devem ser do mesmo ambiente do Mercado Pago (ambos TEST- ou ambos APP_USR-).',
          raw: mpData,
        });
      }

      const errMsg =
        mpData?.message ||
        mpData?.cause?.[0]?.description ||
        'Erro ao processar pagamento no Mercado Pago.';
      return res.status(422).json({ message: errMsg, raw: mpData });
    }

    if (mpData.status === 'rejected') {
      const detail = mpData.status_detail || '';
      const friendlyMsg = REJECTION_MESSAGES[detail] || 'Pagamento recusado. Verifique os dados do cartão ou tente outro cartão.';
      return res.status(422).json({ message: friendlyMsg, raw: mpData });
    }

    return res.status(200).json({
      success: true,
      paymentId: mpData.id,
      status: mpData.status,
      statusDetail: mpData.status_detail,
    });
  } catch (err) {
    console.error('[create-subscription] error:', err);
    return res.status(500).json({ message: 'Erro interno. Tente novamente.' });
  }
}

const REJECTION_MESSAGES = {
  cc_rejected_insufficient_amount: 'Saldo insuficiente no cartão.',
  cc_rejected_bad_filled_card_number: 'Número do cartão incorreto.',
  cc_rejected_bad_filled_date: 'Data de validade incorreta.',
  cc_rejected_bad_filled_security_code: 'Código de segurança incorreto.',
  cc_rejected_blacklist: 'Cartão não autorizado. Entre em contato com seu banco.',
  cc_rejected_call_for_authorize: 'Pagamento não autorizado. Ligue para o banco para autorizar.',
  cc_rejected_duplicated_payment: 'Pagamento duplicado detectado.',
  cc_rejected_high_risk: 'Pagamento recusado por suspeita de fraude.',
  cc_rejected_max_attempts: 'Número máximo de tentativas atingido. Tente outro cartão.',
};

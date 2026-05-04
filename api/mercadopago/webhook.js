// POST /api/mercadopago/webhook
// Recebe eventos do Mercado Pago e atualiza status no Supabase.
// Configure esta URL no painel do Mercado Pago como webhook endpoint.

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

function verifySignature(req, secret) {
  if (!secret) return true; // skip in dev if not configured
  const signature = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  if (!signature || !requestId) return false;

  const parts = signature.split(',');
  const ts = parts.find((p) => p.startsWith('ts='))?.split('=')[1];
  const v1 = parts.find((p) => p.startsWith('v1='))?.split('=')[1];
  if (!ts || !v1) return false;

  const manifest = `id:${req.body?.data?.id};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Acknowledge immediately to avoid MP retries
  res.status(200).json({ received: true });

  const payload = req.body;
  const supabase = getSupabase();

  if (!supabase) {
    console.warn('[webhook] Supabase não configurado, evento ignorado.');
    return;
  }

  // Verify signature
  if (WEBHOOK_SECRET && !verifySignature(req, WEBHOOK_SECRET)) {
    console.warn('[webhook] Assinatura inválida, evento ignorado.');
    return;
  }

  try {
    const eventType = payload.type; // e.g. "preapproval", "payment"
    const action = payload.action; // e.g. "updated"
    const mpId = payload.data?.id;

    // Save raw event
    const { data: eventRow } = await supabase
      .from('mercado_pago_webhook_events')
      .insert({
        event_type: eventType,
        action,
        mercado_pago_id: String(mpId || ''),
        payload,
        processed: false,
      })
      .select('id')
      .single();

    // Fetch full resource from MP API
    if (!ACCESS_TOKEN || !mpId) return;

    let resourceUrl = '';
    if (eventType === 'preapproval') {
      resourceUrl = `https://api.mercadopago.com/preapproval/${mpId}`;
    } else if (eventType === 'payment') {
      resourceUrl = `https://api.mercadopago.com/v1/payments/${mpId}`;
    }

    if (!resourceUrl) return;

    const mpRes = await fetch(resourceUrl, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });
    const mpData = await mpRes.json();

    if (eventType === 'preapproval') {
      // Find subscription by MP preapproval id
      const { data: sub } = await supabase
        .from('client_subscriptions')
        .select('id')
        .eq('mercado_pago_preapproval_id', String(mpId))
        .single();

      if (sub) {
        const statusMap = {
          authorized: 'active',
          paused: 'paused',
          cancelled: 'cancelled',
          pending: 'pending',
        };
        const newStatus = statusMap[mpData.status] || mpData.status;

        await supabase
          .from('client_subscriptions')
          .update({
            status: newStatus,
            next_payment_date: mpData.next_payment_date,
            raw_response: mpData,
          })
          .eq('id', sub.id);

        // Mark webhook event as processed
        if (eventRow?.id) {
          await supabase
            .from('mercado_pago_webhook_events')
            .update({ subscription_id: sub.id, processed: true })
            .eq('id', eventRow.id);
        }
      }
    } else if (eventType === 'payment') {
      // Busca assinatura pelo payment id armazenado em mercado_pago_preapproval_id
      // (campo reaproveitado para pagamentos avulsos) ou pelo preapproval_id se existir
      const lookupId = String(mpData.preapproval_id || mpData.id || '');
      const { data: sub } = lookupId
        ? await supabase
            .from('client_subscriptions')
            .select('id')
            .eq('mercado_pago_preapproval_id', lookupId)
            .single()
        : { data: null };

      if (sub) {
        // Atualiza status da assinatura conforme o pagamento
        const isPaid = mpData.status === 'approved';
        if (isPaid) {
          await supabase
            .from('client_subscriptions')
            .update({ status: 'active', raw_response: mpData })
            .eq('id', sub.id);
        }

        await supabase.from('payment_events').insert({
          subscription_id: sub.id,
          mercado_pago_payment_id: String(mpData.id),
          status: mpData.status,
          status_detail: mpData.status_detail,
          amount_cents: Math.round((mpData.transaction_amount || 0) * 100),
          payload: mpData,
        });

        if (eventRow?.id) {
          await supabase
            .from('mercado_pago_webhook_events')
            .update({ subscription_id: sub.id, processed: true })
            .eq('id', eventRow.id);
        }
      }
    }
  } catch (err) {
    console.error('[webhook] Erro ao processar evento:', err);
  }
}

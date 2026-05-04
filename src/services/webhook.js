import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MP_WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

function getHeader(req, name) {
  return req.headers[name] || req.headers[name.toLowerCase()];
}

function parseSignatureHeader(signatureHeader) {
  if (!signatureHeader) return null;

  const parts = signatureHeader.split(',').map((part) => part.trim());
  const parsed = {};

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value) parsed[key] = value;
  }

  return {
    ts: parsed.ts,
    v1: parsed.v1,
  };
}

function safeCompareHex(a, b) {
  if (!a || !b) return false;

  const bufferA = Buffer.from(a, 'hex');
  const bufferB = Buffer.from(b, 'hex');

  if (bufferA.length !== bufferB.length) return false;

  return crypto.timingSafeEqual(bufferA, bufferB);
}

function getQueryParam(req, key) {
  const host = req.headers.host || 'localhost';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const url = new URL(req.url, `${protocol}://${host}`);

  return url.searchParams.get(key);
}

function getNotificationDataId(req, body) {
  const queryDataId =
    getQueryParam(req, 'data.id') ||
    getQueryParam(req, 'id') ||
    getQueryParam(req, 'data_id');

  const bodyDataId =
    body?.data?.id ||
    body?.id ||
    body?.resource;

  const dataId = queryDataId || bodyDataId;

  if (!dataId) return null;

  return String(dataId).trim().toLowerCase();
}

function validateMercadoPagoSignature(req, body) {
  if (!MP_WEBHOOK_SECRET) {
    throw new Error('MERCADO_PAGO_WEBHOOK_SECRET não configurado');
  }

  const xSignature = getHeader(req, 'x-signature');
  const xRequestId = getHeader(req, 'x-request-id');

  const parsedSignature = parseSignatureHeader(xSignature);

  if (!parsedSignature?.ts || !parsedSignature?.v1) {
    return false;
  }

  const dataId = getNotificationDataId(req, body);

  const manifestParts = [];

  if (dataId) {
    manifestParts.push(`id:${dataId};`);
  }

  if (xRequestId) {
    manifestParts.push(`request-id:${xRequestId};`);
  }

  manifestParts.push(`ts:${parsedSignature.ts};`);

  const manifest = manifestParts.join('');

  const generatedSignature = crypto
    .createHmac('sha256', MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex');

  return safeCompareHex(generatedSignature, parsedSignature.v1);
}

async function fetchMercadoPagoResource(type, id) {
  if (!MP_ACCESS_TOKEN) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
  }

  const normalizedType = String(type || '').toLowerCase();

  let url = null;

  if (
    normalizedType === 'payment' ||
    normalizedType === 'payments'
  ) {
    url = `https://api.mercadopago.com/v1/payments/${id}`;
  }

  if (
    normalizedType === 'subscription_preapproval' ||
    normalizedType === 'preapproval' ||
    normalizedType === 'subscription'
  ) {
    url = `https://api.mercadopago.com/preapproval/${id}`;
  }

  if (
    normalizedType === 'subscription_authorized_payment' ||
    normalizedType === 'authorized_payment' ||
    normalizedType === 'authorized_payments'
  ) {
    url = `https://api.mercadopago.com/authorized_payments/${id}`;
  }

  if (!url) return null;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('Erro ao consultar Mercado Pago:', {
      type,
      id,
      status: response.status,
      data,
    });

    return null;
  }

  return data;
}

function mapSubscriptionStatus(mpStatus) {
  const status = String(mpStatus || '').toLowerCase();

  const map = {
    authorized: 'active',
    active: 'active',
    pending: 'pending',
    paused: 'paused',
    cancelled: 'canceled',
    canceled: 'canceled',
    rejected: 'rejected',
    approved: 'active',
    accredited: 'active',
    in_process: 'pending',
    in_mediation: 'pending',
    refunded: 'refunded',
    charged_back: 'chargeback',
  };

  return map[status] || status || 'unknown';
}

async function saveWebhookEvent({ body, type, action, dataId, resource }) {
  const { data, error } = await supabase
    .from('mercado_pago_webhook_events')
    .insert({
      event_type: type || null,
      action: action || null,
      mercado_pago_id: dataId ? String(dataId) : null,
      payload: {
        notification: body,
        mercado_pago_resource: resource,
      },
      processed: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Erro ao salvar webhook:', error);
    return null;
  }

  return data;
}

async function markWebhookAsProcessed(eventId) {
  if (!eventId) return;

  const { error } = await supabase
    .from('mercado_pago_webhook_events')
    .update({ processed: true })
    .eq('id', eventId);

  if (error) {
    console.error('Erro ao marcar webhook como processado:', error);
  }
}

async function updateSubscriptionFromPreapproval(resource) {
  if (!resource?.id) return;

  const status = mapSubscriptionStatus(resource.status);

  const { error } = await supabase
    .from('client_subscriptions')
    .update({
      status,
      mercado_pago_preapproval_id: resource.id,
      next_payment_date: resource.next_payment_date || null,
      raw_response: resource,
      updated_at: new Date().toISOString(),
    })
    .eq('mercado_pago_preapproval_id', resource.id);

  if (error) {
    console.error('Erro ao atualizar assinatura:', error);
  }
}

async function updateSubscriptionFromAuthorizedPayment(resource) {
  if (!resource?.id) return;

  const preapprovalId =
    resource.preapproval_id ||
    resource.subscription_id ||
    resource.preapproval?.id;

  if (!preapprovalId) {
    console.warn('Pagamento autorizado sem preapproval_id:', resource.id);
    return;
  }

  const status = mapSubscriptionStatus(resource.status);

  const { data: subscription, error: subscriptionError } = await supabase
    .from('client_subscriptions')
    .select('id')
    .eq('mercado_pago_preapproval_id', preapprovalId)
    .maybeSingle();

  if (subscriptionError) {
    console.error('Erro ao buscar assinatura por preapproval_id:', subscriptionError);
    return;
  }

  if (!subscription?.id) {
    console.warn('Assinatura não encontrada para preapproval_id:', preapprovalId);
    return;
  }

  const amountCents = resource.transaction_amount
    ? Math.round(Number(resource.transaction_amount) * 100)
    : null;

  const { error: paymentEventError } = await supabase
    .from('payment_events')
    .insert({
      subscription_id: subscription.id,
      mercado_pago_payment_id: String(resource.id),
      status,
      status_detail: resource.status_detail || null,
      amount_cents: amountCents,
      payload: resource,
    });

  if (paymentEventError) {
    console.error('Erro ao salvar payment_event:', paymentEventError);
  }

  const { error: updateError } = await supabase
    .from('client_subscriptions')
    .update({
      status,
      mercado_pago_payment_id: String(resource.id),
      raw_response: resource,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);

  if (updateError) {
    console.error('Erro ao atualizar assinatura por pagamento autorizado:', updateError);
  }
}

async function updateSubscriptionFromPayment(resource) {
  if (!resource?.id) return;

  const externalReference = resource.external_reference;
  const status = mapSubscriptionStatus(resource.status);

  if (!externalReference) {
    console.warn('Pagamento sem external_reference:', resource.id);
    return;
  }

  const { error } = await supabase
    .from('client_subscriptions')
    .update({
      status,
      mercado_pago_payment_id: String(resource.id),
      raw_response: resource,
      updated_at: new Date().toISOString(),
    })
    .eq('id', externalReference);

  if (error) {
    console.error('Erro ao atualizar assinatura por payment:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Método não permitido',
    });
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body || '{}')
      : req.body || {};

    const isValidSignature = validateMercadoPagoSignature(req, body);

    if (!isValidSignature) {
      return res.status(401).json({
        message: 'Assinatura inválida do Mercado Pago',
      });
    }

    const type = body.type || body.topic || body.action?.split('.')?.[0];
    const action = body.action || null;
    const dataId = body?.data?.id || getNotificationDataId(req, body);

    const resource = dataId
      ? await fetchMercadoPagoResource(type, dataId)
      : null;

    const savedEvent = await saveWebhookEvent({
      body,
      type,
      action,
      dataId,
      resource,
    });

    if (
      type === 'subscription_preapproval' ||
      type === 'preapproval'
    ) {
      await updateSubscriptionFromPreapproval(resource);
    }

    if (
      type === 'subscription_authorized_payment' ||
      type === 'authorized_payment'
    ) {
      await updateSubscriptionFromAuthorizedPayment(resource);
    }

    if (type === 'payment') {
      await updateSubscriptionFromPayment(resource);
    }

    await markWebhookAsProcessed(savedEvent?.id);

    return res.status(200).json({
      received: true,
      processed: true,
    });
  } catch (error) {
    console.error('Erro no webhook Mercado Pago:', error);

    return res.status(500).json({
      message: 'Erro interno no webhook',
    });
  }
}
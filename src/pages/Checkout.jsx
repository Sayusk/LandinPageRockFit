import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CardPayment } from '@mercadopago/sdk-react';
import { getPlanBySlug } from '../data/plans.js';
import { createSubscription } from '../services/mercadoPagoService.js';
import logo from '../assets/Rockfitlogo.png';

// initMercadoPago é chamado em main.jsx para garantir que o script carregue
// antes do usuário navegar para esta página.
const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || '';

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-brand flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function formatPhone(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

const STATUSES = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planSlug = searchParams.get('plan') || 'mensal';
  const plan = getPlanBySlug(planSlug);

  const [status, setStatus] = useState(STATUSES.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  // Aguarda window.MercadoPago estar disponível antes de montar o Brick.
  // Sem esse check o Brick monta antes do script externo do MP terminar de
  // carregar e lança "Card token service not found".
  const [sdkReady, setSdkReady] = useState(() => typeof window !== 'undefined' && !!window.MercadoPago);

  useEffect(() => {
    if (sdkReady) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (window.MercadoPago) {
        setSdkReady(true);
        clearInterval(timer);
      } else if (attempts >= 60) {
        clearInterval(timer);
        setStatus(STATUSES.ERROR);
        setErrorMsg('Erro ao carregar o módulo de pagamento. Recarregue a página.');
      }
    }, 100);
    return () => clearInterval(timer);
  }, [sdkReady]);

  useEffect(() => {
    if (!plan) navigate('/?error=plan-not-found');
  }, [plan, navigate]);

  if (!plan) return null;

  async function handleCardSubmit(formData) {
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg('Preencha seu nome e e-mail antes de pagar.');
      setStatus(STATUSES.ERROR);
      return;
    }

    setStatus(STATUSES.PROCESSING);
    setErrorMsg('');

    try {
      await createSubscription({
        planSlug: plan.slug,
        token: formData.token,
        installments: formData.installments,
        paymentMethodId: formData.payment_method_id,
        issuerId: formData.issuer_id,
        payer: {
          email: form.email,
          identification: formData.payer?.identification,
          first_name: form.name,
          phone: form.phone,
        },
        customerData: {
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
      });
      setStatus(STATUSES.SUCCESS);
    } catch (err) {
      setStatus(STATUSES.ERROR);
      setErrorMsg(err.message || 'Erro ao processar pagamento. Tente novamente.');
    }
  }

  // --- SUCCESS ---
  if (status === STATUSES.SUCCESS) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gradient mb-3">Assinatura confirmada!</h1>
          <p className="text-muted text-sm mb-8">
            Em breve você receberá as instruções por e-mail. Fique à vontade para entrar em contato via WhatsApp para iniciar seu acompanhamento.
          </p>
          <a
            href="https://wa.me/5519996209656?text=Ol%C3%A1%2C%20acabei%20de%20assinar%20o%20plano%20na%20RockFit%20Brasil!"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm px-8 py-4 inline-flex"
          >
            Falar no WhatsApp →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Top bar */}
      <div className="glass-dark sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted hover:text-light transition-colors focus:outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </button>
          <img src={logo} alt="RockFit Brasil" className="h-8 w-auto logo-light" />
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <svg className="w-3.5 h-3.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Pagamento seguro
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

          {/* LEFT: Plan summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="card-dark p-7 sticky top-28">
              <div className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Resumo do plano</div>

              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-xs text-muted mb-0.5">Plano</div>
                  <div className="text-xl font-black text-light">{plan.name}</div>
                </div>
                {plan.badge && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand/10 text-brand border border-brand/20">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="flex items-end gap-1 mb-5">
                <span className="text-sm text-muted">R$</span>
                <span className="text-3xl font-black text-gradient">{plan.priceMonthly}</span>
                <span className="text-sm text-muted mb-0.5">/mês</span>
              </div>
              {plan.durationMonths > 1 && (
                <p className="text-xs text-muted -mt-3 mb-5">
                  Total: R$ {plan.priceTotal} · {plan.durationMonths} meses
                </p>
              )}

              <div className="w-full h-px bg-white/[0.06] mb-5" />

              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-light/70">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-2 text-xs text-muted/60">
                <span>🔒</span>
                <span>Pagamento processado pelo Mercado Pago</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <h1 className="text-2xl md:text-3xl font-black text-gradient mb-2">Finalizar assinatura</h1>
            <p className="text-sm text-muted mb-8">Preencha seus dados para ativar o plano {plan.name}.</p>

            {/* Sem chave pública configurada */}
            {!publicKey && (
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-300">
                ⚠️ Chave pública do Mercado Pago não configurada.
                Configure <code className="font-mono">VITE_MERCADO_PAGO_PUBLIC_KEY</code> no ambiente.
              </div>
            )}

            {/* Error banner */}
            {status === STATUSES.ERROR && errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Dados pessoais */}
            <div className="mb-7">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Dados pessoais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-muted mb-1.5">Nome completo *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Seu nome completo"
                    className="w-full bg-dark-2 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-light placeholder-muted/40 focus:outline-none focus:border-brand/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full bg-dark-2 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-light placeholder-muted/40 focus:outline-none focus:border-brand/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Telefone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-dark-2 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-light placeholder-muted/40 focus:outline-none focus:border-brand/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Brick oficial do Mercado Pago — somente cartão de crédito */}
            {publicKey && (
              <div className="mb-7">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Dados do cartão</h2>

                {/* Aguarda SDK carregar antes de montar o Brick */}
                {!sdkReady && (
                  <div className="flex items-center gap-3 text-sm text-muted py-8">
                    <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                    Carregando formulário de pagamento...
                  </div>
                )}

                {/* Overlay de processamento */}
                <div className={`relative ${!sdkReady ? 'hidden' : ''}`}>
                  {status === STATUSES.PROCESSING && (
                    <div
                      className="absolute inset-0 z-10 flex items-center justify-center rounded-xl"
                      style={{ background: 'rgba(35,32,30,0.80)', backdropFilter: 'blur(4px)' }}
                    >
                      <div className="flex items-center gap-3 text-sm text-muted">
                        <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                        Processando pagamento...
                      </div>
                    </div>
                  )}

                  {sdkReady && <CardPayment
                    initialization={{
                      amount: plan.priceTotal,
                      preferenceId: undefined,
                    }}
                    customization={{
                      paymentMethods: {
                        // Somente cartão de crédito
                        types: { excluded: ['debit_card', 'ticket', 'bank_transfer', 'atm', 'digital_currency', 'digital_wallet', 'prepaid_card'] },
                        minInstallments: 1,
                        maxInstallments: plan.durationMonths > 1 ? plan.durationMonths : 1,
                      },
                      visual: {
                        style: {
                          customVariables: {
                            // Tema escuro para o Brick
                            baseColor: '#c3191f',
                            baseColorSecondVariant: '#a01217',
                            outlinePrimaryColor: '#c3191f',
                            buttonTextColor: '#ffffff',
                            fontSizeSmall: '12px',
                            fontSizeMedium: '14px',
                          },
                          theme: 'dark',
                        },
                        hideFormTitle: true,
                        hidePaymentButton: false,
                      },
                    }}
                    onSubmit={handleCardSubmit}
                    onError={(err) => {
                      console.error('[MP Brick error]', err);
                      setStatus(STATUSES.ERROR);
                      setErrorMsg('Erro no formulário de pagamento. Verifique os dados do cartão.');
                    }}
                  />}
                </div>
              </div>
            )}

            <p className="text-center text-xs text-muted/40 mt-2">
              🔒 Dados protegidos por criptografia SSL · Processado pelo Mercado Pago
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

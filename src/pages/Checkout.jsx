import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getPlanBySlug } from '../data/plans.js';
import { createSubscription, loadMercadoPagoSDK } from '../services/mercadoPagoService.js';
import logo from '../assets/Rockfitlogo.png';

const STATUSES = {
  IDLE: 'idle',
  LOADING_SDK: 'loading_sdk',
  READY: 'ready',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-brand flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function formatCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

function formatPhone(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planSlug = searchParams.get('plan') || 'mensal';
  const plan = getPlanBySlug(planSlug);

  const [status, setStatus] = useState(STATUSES.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [mpInstance, setMpInstance] = useState(null);
  const cardFormRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });

  const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || '';

  // Redirect if plan not found
  useEffect(() => {
    if (!plan) {
      navigate('/?error=plan-not-found');
    }
  }, [plan, navigate]);

  // Load MP SDK and mount CardForm
  useEffect(() => {
    if (!plan || !publicKey) return;

    setStatus(STATUSES.LOADING_SDK);

    loadMercadoPagoSDK()
      .then((MP) => {
        const mp = new MP(publicKey, { locale: 'pt-BR' });
        setMpInstance(mp);

        const cardForm = mp.cardForm({
          amount: String(plan.priceTotal),
          iframe: true,
          form: {
            id: 'mp-card-form',
            cardNumber: { id: 'mp-cardNumber', placeholder: '0000 0000 0000 0000' },
            expirationDate: { id: 'mp-expirationDate', placeholder: 'MM/AA' },
            securityCode: { id: 'mp-securityCode', placeholder: 'CVV' },
            cardholderName: { id: 'mp-cardholderName', placeholder: 'Nome no cartão' },
            installments: { id: 'mp-installments' },
            identificationType: { id: 'mp-identificationType' },
            identificationNumber: { id: 'mp-identificationNumber', placeholder: '000.000.000-00' },
            cardholderEmail: { id: 'mp-cardholderEmail', placeholder: 'email@exemplo.com' },
          },
          callbacks: {
            onFormMounted: (err) => {
              if (err) {
                setStatus(STATUSES.ERROR);
                setErrorMsg('Erro ao montar formulário de pagamento.');
                return;
              }
              setStatus(STATUSES.READY);
            },
            onSubmit: async (event) => {
              event.preventDefault();
              setStatus(STATUSES.PROCESSING);
              setErrorMsg('');

              const {
                paymentMethodId,
                issuerId,
                cardholderEmail,
                token,
                installments,
                identificationNumber,
                identificationType,
              } = cardForm.getCardFormData();

              try {
                await createSubscription({
                  planSlug: plan.slug,
                  token,
                  installments,
                  paymentMethodId,
                  issuerId,
                  payer: {
                    email: cardholderEmail || form.email,
                    identification: { type: identificationType, number: identificationNumber },
                    first_name: form.name,
                    phone: form.phone,
                  },
                  customerData: {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    cpf: form.cpf,
                  },
                });
                setStatus(STATUSES.SUCCESS);
              } catch (err) {
                setStatus(STATUSES.ERROR);
                setErrorMsg(err.message || 'Erro ao processar pagamento. Tente novamente.');
              }
            },
            onFetching: (resource) => {
              // optional: show loading while fetching card token
            },
          },
        });

        cardFormRef.current = cardForm;
      })
      .catch(() => {
        setStatus(STATUSES.ERROR);
        setErrorMsg('Erro ao carregar módulo de pagamento. Verifique sua conexão.');
      });

    return () => {
      cardFormRef.current?.unmount?.();
    };
  }, [plan, publicKey]);

  if (!plan) return null;

  // --- SUCCESS STATE ---
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
            Em breve você receberá as instruções por e-mail. Fique à vontade para entrar em contato via WhatsApp para dar início ao seu acompanhamento.
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

  const isLoading = status === STATUSES.LOADING_SDK || status === STATUSES.PROCESSING;

  return (
    <div className="min-h-screen bg-dark">
      {/* Top bar */}
      <div className="glass-dark sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted hover:text-light transition-colors focus:outline-none">
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

            {/* Error banner */}
            {status === STATUSES.ERROR && errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                {errorMsg}
              </div>
            )}

            {/* MP warning if no public key */}
            {!publicKey && (
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-300">
                ⚠️ Chave pública do Mercado Pago não configurada. Configure a variável <code>VITE_MERCADO_PAGO_PUBLIC_KEY</code> no ambiente.
              </div>
            )}

            <form id="mp-card-form">
              {/* Personal data */}
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
                      className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-light placeholder-muted/50 focus:outline-none focus:border-brand/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">E-mail *</label>
                    <input
                      id="mp-cardholderEmail"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-light placeholder-muted/50 focus:outline-none focus:border-brand/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Telefone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-light placeholder-muted/50 focus:outline-none focus:border-brand/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Card data (MP iframes) */}
              <div className="mb-7">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Dados do cartão</h2>

                {isLoading && status === STATUSES.LOADING_SDK && (
                  <div className="flex items-center gap-3 text-sm text-muted py-6">
                    <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                    Carregando formulário de pagamento...
                  </div>
                )}

                <div className={`space-y-4 ${status === STATUSES.LOADING_SDK ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : ''}`}>
                  <div>
                    <label className="block text-xs text-muted mb-1.5">Nome no cartão</label>
                    <div id="mp-cardholderName" className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm min-h-[46px]" />
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1.5">Número do cartão</label>
                    <div id="mp-cardNumber" className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm min-h-[46px]" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted mb-1.5">Validade</label>
                      <div id="mp-expirationDate" className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm min-h-[46px]" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1.5">CVV</label>
                      <div id="mp-securityCode" className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm min-h-[46px]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted mb-1.5">Tipo de documento</label>
                      <div id="mp-identificationType" className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm min-h-[46px]" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1.5">CPF</label>
                      <div id="mp-identificationNumber" className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm min-h-[46px]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1.5">Parcelas</label>
                    <div id="mp-installments" className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm min-h-[46px]" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || status !== STATUSES.READY}
                className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {status === STATUSES.PROCESSING ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>Assinar Plano {plan.name} — R$ {plan.priceMonthly}/mês →</>
                )}
              </button>

              <p className="text-center text-xs text-muted/50 mt-4">
                🔒 Dados protegidos por criptografia SSL · Processado pelo Mercado Pago
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

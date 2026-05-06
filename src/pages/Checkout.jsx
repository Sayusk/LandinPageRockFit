import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPlanBySlug } from '../data/plans.js';
import { createSubscription } from '../services/mercadoPagoService.js';
import logo from '../assets/Rockfitlogo.png';
import { ShieldCheck, Lock, ChevronLeft } from 'lucide-react';
import { PLANS } from '../data/plans.js';
import Footer from '../components/layout/Footer';

const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || '';
const BRICK_CONTAINER_ID = 'mp-cardpayment-brick';

const STATUSES = {
  IDLE: 'idle',
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

function formatPhone(value) {
  return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planSlug = searchParams.get('plan') || 'mensal';
  const plan = getPlanBySlug(planSlug);

  const [status, setStatus] = useState(STATUSES.IDLE);
  const [errorMsg, setErrorMsg] = useState('');
  const [brickReady, setBrickReady] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [isOpen, setIsOpen] = useState(false);

  // Ref para acessar form atual dentro do callback do Brick sem stale closure
  const formRef = useRef(form);
  formRef.current = form;

  const brickControllerRef = useRef(null);

  useEffect(() => {
    if (!plan) navigate('/?error=plan-not-found');
  }, [plan, navigate]);

  useEffect(() => {
    if (!plan || !publicKey) return;

    let destroyed = false;

    async function initBrick() {
      // Aguarda window.MercadoPago estar disponível (script no <head>)
      let attempts = 0;
      while (!window.MercadoPago) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
        if (attempts > 60) {
          if (!destroyed) {
            setStatus(STATUSES.ERROR);
            setErrorMsg('Erro ao carregar o módulo de pagamento. Recarregue a página.');
          }
          return;
        }
      }

      if (destroyed) return;

      // Destrói brick anterior se existir (evita "Context already exists")
      if (brickControllerRef.current) {
        try { await brickControllerRef.current.unmount(); } catch (_) {}
        brickControllerRef.current = null;
      }

      // Limpa o container manualmente para garantir estado limpo
      const container = document.getElementById(BRICK_CONTAINER_ID);
      if (!container) return;
      container.innerHTML = '';

      try {
        const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
        const bricksBuilder = mp.bricks();

        const controller = await bricksBuilder.create('cardPayment', BRICK_CONTAINER_ID, {
          initialization: {
            amount: plan.priceTotal,
          },
          customization: {
            paymentMethods: {
              types: {
                excluded: ['debit_card', 'ticket', 'bank_transfer', 'atm', 'digital_currency', 'digital_wallet', 'prepaid_card'],
              },
              minInstallments: 1,
              maxInstallments: plan.maxInstallments ?? 1,
            },
            visual: {
              style: {
                theme: 'dark',
                customVariables: {
                  baseColor: '#c3191f',
                  baseColorFirstVariant: '#c3191f',
                  baseColorSecondVariant: '#c3191f',
                  outlinePrimaryColor: '#c3191f',
                  outlineSecondaryColor: '#4a4544',
                  inputBorderColor: '#4a4544',
                  buttonTextColor: '#ffffff',
                },
              },
              hideFormTitle: true,
            },
          },
          callbacks: {
            onReady: () => {
              if (!destroyed) setBrickReady(true);
            },
            onSubmit: async (cardFormData) => {
              if (destroyed) return;

              const currentForm = formRef.current;

              if (!currentForm.name.trim() || !currentForm.email.trim()) {
                setErrorMsg('Preencha seu nome e e-mail antes de pagar.');
                setStatus(STATUSES.ERROR);
                return;
              }

              setStatus(STATUSES.PROCESSING);
              setErrorMsg('');

              try {
                await createSubscription({
                  planSlug: plan.slug,
                  token: cardFormData.token,
                  installments: cardFormData.installments,
                  paymentMethodId: cardFormData.payment_method_id,
                  issuerId: cardFormData.issuer_id,
                  payer: {
                    email: currentForm.email,
                    identification: cardFormData.payer?.identification,
                    first_name: currentForm.name,
                    phone: currentForm.phone,
                  },
                  customerData: {
                    name: currentForm.name,
                    email: currentForm.email,
                    phone: currentForm.phone,
                  },
                });
                if (!destroyed) setStatus(STATUSES.SUCCESS);
              } catch (err) {
                if (!destroyed) {
                  setStatus(STATUSES.ERROR);
                  setErrorMsg(err.message || 'Erro ao processar pagamento. Tente novamente.');
                }
              }
            },
            onError: (err) => {
              if (destroyed) return;
              console.error('[MP Brick]', err);
              setStatus(STATUSES.ERROR);
              setErrorMsg('Erro no formulário de pagamento. Verifique os dados do cartão e tente novamente.');
            },
          },
        });

        if (!destroyed) brickControllerRef.current = controller;
      } catch (err) {
        if (!destroyed) {
          console.error('[MP Brick init]', err);
          setStatus(STATUSES.ERROR);
          setErrorMsg('Erro ao inicializar o formulário de pagamento. Recarregue a página.');
        }
      }
    }

    initBrick();

    return () => {
      destroyed = true;
      if (brickControllerRef.current) {
        try { brickControllerRef.current.unmount(); } catch (_) {}
        brickControllerRef.current = null;
      }
      setBrickReady(false);
    };
  }, [plan, publicKey]);

  if (!plan) return null;

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
            Em breve você receberá as instruções por e-mail. Entre em contato via WhatsApp para iniciar seu acompanhamento.
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
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Top bar */}
      <div className="glass-dark sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/#planos')} className="flex items-center gap-2 text-sm text-muted hover:text-light transition-colors focus:outline-none">
          <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
          <img src={logo} alt="RockFit Brasil" className="h-20 w-auto logo-light" />
          <div className="flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            Pagamento seguro
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

          {/* LEFT: Resumo do plano */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* 🔽 Seletor de planos (Dropdown) */}
            <div className="mb-5">
              <div className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">
                Escolha seu plano
              </div>

              {/* ORDEM FIXA */}
              {(() => {
                const ORDERED_PLANS = ['mensal', 'trimestral', 'semestral'];

                const orderedPlans = ORDERED_PLANS
                  .map((slug) => PLANS.find((p) => p.slug === slug))
                  .filter(Boolean);

                return (
                  <>
                    {/* Botão principal */}
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.08] bg-dark-2 text-left"
                    >
                      <div>
                        <div className="text-sm font-semibold text-light">
                          {plan.name}
                        </div>
                        <div className="text-[11px] text-muted">
                          R$ {plan.priceMonthly}/mês
                        </div>
                      </div>

                      {/* seta animada */}
                      <span
                        className={`text-xs text-muted transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        ▼
                      </span>
                    </button>

                    {/* Lista com animação */}
                    <div
                      className={`mt-2 flex flex-col gap-2 overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {orderedPlans.map((p) => {
                        const isActive = p.slug === plan.slug;

                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              if (!isActive) {
                                setIsOpen(false);
                                navigate(`/checkout?plan=${p.slug}`);
                              }
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                              isActive
                                ? 'border-brand bg-brand/10 text-light cursor-default'
                                : 'border-white/[0.08] text-muted hover:border-brand/40 hover:text-light'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold">{p.name}</span>
                              <span className="text-xs">
                                R$ {p.priceMonthly}/mês
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
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
                    <CheckIcon />{f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-2 text-xs text-muted/60">
                <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
                <span>Pagamento processado pelo Mercado Pago</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Formulário */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <h1 className="text-2xl md:text-3xl font-black text-gradient mb-2">Finalizar assinatura</h1>
            <p className="text-sm text-muted mb-8">Preencha seus dados para ativar o plano {plan.name}.</p>

            {/* Aviso sem chave pública */}
            {!publicKey && (
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-300">
                ⚠️ Configure <code className="font-mono">VITE_MERCADO_PAGO_PUBLIC_KEY</code> no ambiente.
              </div>
            )}

            {/* Banner de erro */}
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

            {/* Container do Brick — sempre no DOM para o SDK montar */}
            {publicKey && (
              <div className="mb-4">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted mb-4">Dados do cartão</h2>

                {/* Spinner enquanto Brick carrega */}
                {!brickReady && status !== STATUSES.ERROR && (
                  <div className="flex items-center gap-3 text-sm text-muted py-8">
                    <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                    Carregando formulário de pagamento...
                  </div>
                )}

                {/* Overlay de processamento sobre o Brick */}
                <div className="relative">
                  {status === STATUSES.PROCESSING && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl"
                      style={{ background: 'rgba(35,32,30,0.85)', backdropFilter: 'blur(4px)' }}>
                      <div className="flex items-center gap-3 text-sm text-muted">
                        <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                        Processando pagamento...
                      </div>
                    </div>
                  )}
                  {/* O Brick do MP é montado aqui via bricksBuilder.create() */}
                  <div id={BRICK_CONTAINER_ID} />
                </div>
              </div>
            )}

          <p className="text-center text-xs text-muted/40 mt-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
            <span>Dados protegidos por criptografia SSL · Processado pelo Mercado Pago</span>
          </p>
          </div>
        </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}

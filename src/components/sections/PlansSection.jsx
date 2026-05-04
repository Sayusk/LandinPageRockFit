import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { PLANS } from '../../data/plans.js';

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-brand flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function PlansSection() {
  const navigate = useNavigate();

  function handleSelectPlan(plan) {
    navigate(`/checkout?plan=${plan.slug}`);
  }

  return (
    <section id="planos" className="section-padding bg-dark-2">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand mb-3 block">
            Invista em você
          </span>

          <h2 className="text-3xl md:text-4xl font-black text-gradient mb-4">
            Escolha seu plano
          </h2>

          <div className="divider-brand mx-auto mb-5" />

          <p className="text-sm text-muted max-w-md mx-auto">
            Quanto mais você investe no tempo, mais economiza e mais resultados conquista.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                plan.highlighted
                  ? 'border-2 border-brand shadow-[0_0_48px_rgba(195,25,31,0.25)] scale-[1.02]'
                  : 'border border-white/[0.08] hover:border-brand/30'
              } bg-dark-2`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px">
                  <div
                    className={`px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-b-lg ${
                      plan.highlighted
                        ? 'bg-brand text-white'
                        : 'bg-dark-3 text-light/70'
                    }`}
                  >
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="p-7 pt-10 flex flex-col flex-1">
                {/* Plan name */}
                <h3 className="text-xs font-semibold tracking-widest uppercase text-muted mb-1">
                  Plano
                </h3>

                <div className="text-2xl font-black text-light mb-1">
                  {plan.name}
                </div>

                {/* Price */}
                <div className="mt-4 mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-sm text-muted font-medium">R$</span>
                    <span className="text-4xl font-black text-gradient">
                      {plan.priceMonthly.toFixed(0)}
                    </span>
                    <span className="text-sm text-muted mb-1">/mês</span>
                  </div>

                  {plan.durationMonths > 1 && (
                    <p className="text-xs text-muted mt-1">
                      R$ {plan.priceTotal} à vista · {plan.durationMonths} meses
                    </p>
                  )}

                  {plan.badge && plan.badge.includes('OFF') && (
                    <p className="text-xs text-brand font-semibold mt-1">
                      Economia de {plan.badge}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-white/[0.06] mb-6" />

                {/* Features */}
                <ul className="flex flex-col gap-3 flex-1 mb-7">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-light/70"
                    >
                      <CheckIcon />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-250 ${
                    plan.highlighted ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <div className="text-center mt-10">
          <p className="text-xs text-muted/60 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
            <span>
              Pagamento seguro via Mercado Pago · Cancele quando quiser
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
const STEPS = [
  {
    number: '01',
    title: 'Escolha seu plano',
    description: 'Selecione o plano que melhor se encaixa na sua meta e no seu momento.',
  },
  {
    number: '02',
    title: 'Preencha seus dados',
    description: 'Informe nome, e-mail, telefone e CPF para criar seu cadastro.',
  },
  {
    number: '03',
    title: 'Faça a assinatura',
    description: 'Pagamento seguro via cartão de crédito direto na plataforma.',
  },
  {
    number: '04',
    title: 'Receba o acesso',
    description: 'Após confirmação, você recebe as instruções para iniciar o acompanhamento.',
  },
  {
    number: '05',
    title: 'Acompanhe sua evolução',
    description: 'Treinos periódicos, suporte direto e ajustes para você sempre avançar.',
  },
];

export default function HowItWorksSection() {
  function scrollToPlans() {
    document.querySelector('#planos')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section id="como-funciona" className="section-padding bg-dark">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand mb-3 block">
            Simples e rápido
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gradient mb-4">
            Como funciona?
          </h2>
          <div className="divider-brand mx-auto" />
        </div>

        {/* Steps */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div
            className="absolute left-6 top-8 bottom-8 w-px hidden md:block"
            style={{ background: 'linear-gradient(to bottom, #c3191f, transparent)' }}
          />

          <div className="flex flex-col gap-8">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex items-start gap-6 md:gap-8 group">
                {/* Step number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center relative z-10 group-hover:bg-brand/20 transition-colors duration-200">
                  <span className="text-xs font-black text-brand">{step.number}</span>
                </div>
                {/* Content */}
                <div className="pt-2 pb-4 flex-1">
                  <h3 className="text-base font-bold text-light mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button onClick={scrollToPlans} className="btn-primary text-sm px-8 py-4">
            Começar agora →
          </button>
        </div>
      </div>
    </section>
  );
}

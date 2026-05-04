const BENEFITS = [
  {
    icon: '🎯',
    title: 'Treino personalizado',
    description: 'Montado exclusivamente para você, levando em conta seus objetivos, nível e rotina.',
  },
  {
    icon: '📲',
    title: 'Acompanhamento direto',
    description: 'Suporte via WhatsApp para tirar dúvidas, ajustar movimentos e manter o foco.',
  },
  {
    icon: '🔄',
    title: 'Ajustes periódicos',
    description: 'Revisão e evolução constante do seu treino conforme você progride.',
  },
  {
    icon: '📅',
    title: 'Plano adaptado à rotina',
    description: 'Treino pensado para caber na sua vida real, seja academia, casa ou ao ar livre.',
  },
  {
    icon: '📈',
    title: 'Evolução com segurança',
    description: 'Progressão inteligente para maximizar resultados e evitar lesões.',
  },
  {
    icon: '📋',
    title: 'Organização completa',
    description: 'Seu programa estruturado de forma clara, fácil de seguir dia a dia.',
  },
];

export default function BenefitsSection() {
  return (
    <section id="beneficios" className="section-padding bg-dark-2">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand mb-3 block">
            Por que escolher a RockFit Brasil
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gradient mb-4">
            Com a consultoria você vai ter:
          </h2>
          <div className="divider-brand mx-auto" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card-dark hover-lift p-7">
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-2xl mb-5">
                {b.icon}
              </div>
              <h3 className="text-lg font-bold text-light mb-2">{b.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

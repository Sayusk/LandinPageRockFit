export const PLANS = [
  {
    id: 'mensal',
    slug: 'mensal',
    name: 'Mensal',
    tagline: 'Comece agora',
    priceMonthly: 100,
    priceTotal: 100,
    durationMonths: 1,
    maxInstallments: 2,
    highlighted: false,
    badge: null,
    savings: null,
    features: [
      '1 mês de acompanhamento completo',
      'Treino personalizado',
      'Anamnese + PAR-Q',
      'Suporte direto via WhatsApp',
      'Revisão mensal do treino',
    ],
    cta: 'Assinar agora',
  },
  {
    id: 'trimestral',
    slug: 'trimestral',
    name: 'Trimestral',
    tagline: 'Economia de 15%',
    priceMonthly: 85,
    priceTotal: 255,
    durationMonths: 3,
    maxInstallments: 3,
    highlighted: false,
    badge: '15% OFF',
    savings: '15%',
    features: [
      '3 meses de acompanhamento contínuo',
      'Treino personalizado e progressivo',
      'Anamnese + PAR-Q',
      'Suporte contínuo via WhatsApp',
      'Revisão periódica do treino',
      'Ajustes de acordo com evolução',
    ],
    cta: 'Assinar agora',
  },
  {
    id: 'semestral',
    slug: 'semestral',
    name: 'Semestral',
    tagline: 'Economia de 25%',
    priceMonthly: 75,
    priceTotal: 450,
    durationMonths: 6,
    maxInstallments: 6,
    highlighted: true,
    badge: 'Mais escolhido',
    savings: '25%',
    features: [
      '6 meses de acompanhamento premium',
      'Treino personalizado e evolutivo',
      'Anamnese + PAR-Q',
      'Suporte premium via WhatsApp',
      'Revisões frequentes do treino',
      'Ajustes contínuos de acordo com a evolução',
      'Acompanhamento de composição corporal',
    ],
    cta: 'Assinar agora',
  },
];

export function getPlanById(id) {
  return PLANS.find((p) => p.id === id) || null;
}

export function getPlanBySlug(slug) {
  return PLANS.find((p) => p.slug === slug) || null;
}
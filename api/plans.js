// GET /api/plans — retorna planos disponíveis (sem dados sensíveis)
const PLANS = [
  {
    id: 'mensal',
    slug: 'mensal',
    name: 'Mensal',
    priceMonthly: 100,
    priceTotal: 100,
    priceCents: 10000,
    durationMonths: 1,
    badge: null,
    features: [
      '1 mês de acompanhamento completo',
      'Treino personalizado',
      'Anamnese + PAR-Q',
      'Suporte direto via WhatsApp',
      'Revisão mensal do treino',
    ],
  },
  {
    id: 'trimestral',
    slug: 'trimestral',
    name: 'Trimestral',
    priceMonthly: 85,
    priceTotal: 255,
    priceCents: 8500,
    durationMonths: 3,
    badge: '15% OFF',
    features: [
      '3 meses de acompanhamento contínuo',
      'Treino personalizado e progressivo',
      'Anamnese + PAR-Q',
      'Suporte contínuo via WhatsApp',
      'Revisão periódica do treino',
      'Ajustes de acordo com evolução',
    ],
  },
  {
    id: 'semestral',
    slug: 'semestral',
    name: 'Semestral',
    priceMonthly: 75,
    priceTotal: 450,
    priceCents: 7500,
    durationMonths: 6,
    badge: 'Mais escolhido',
    features: [
      '6 meses de acompanhamento premium',
      'Treino personalizado e evolutivo',
      'Anamnese + PAR-Q',
      'Suporte premium via WhatsApp',
      'Revisões frequentes do treino',
      'Ajustes contínuos de acordo com a evolução',
      'Acompanhamento de composição corporal',
    ],
  },
];

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  return res.status(200).json(PLANS);
}

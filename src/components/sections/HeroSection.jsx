import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Rockfitlogo.png';
import heroImg from '../../assets/imagem1.jpg';

const CREDIBILITY_ITEMS = [
  { icon: '📍', label: 'Acompanhamento online' },
  { icon: '🏋️', label: 'Treinos personalizados' },
  { icon: '💬', label: 'Suporte direto' },
];

export default function HeroSection() {
  const navigate = useNavigate();

  function scrollToPlans() {
    document.querySelector('#planos')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden bg-dark"
      style={{ paddingTop: '5rem' }}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Treino fitness"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'right top' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/85 to-dark/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
        {/* Red accent glow */}
        <div
          className="absolute bottom-0 left-0 w-2/3 h-1/2 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at bottom left, rgba(195,25,31,0.18) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 w-full py-20 md:py-28">
        <div className="max-w-2xl">
          {/* Logo */}
          <div className="mb-8">
            <img
              src={logo}
              alt="RockFit Brasil"
              className="h-48 md:h-56 w-auto logo-light"
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-light/70">
              Consultoria Online Personalizada
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="text-gradient">Transforme seu</span>
            <br />
            <span className="text-gradient-brand">físico de verdade</span>
            <br />
            <span className="text-gradient">com quem entende.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-light/60 leading-relaxed mb-8 max-w-lg">
            Treino personalizado, acompanhamento real e suporte direto — tudo online, no seu ritmo, adaptado à sua rotina.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button onClick={scrollToPlans} className="btn-primary text-sm px-7 py-4">
              Começar minha transformação →
            </button>
            <button
              onClick={scrollToPlans}
              className="btn-outline text-sm px-7 py-4"
            >
              Ver planos
            </button>
          </div>

          {/* Credibility pills */}
          <div className="flex flex-wrap gap-3">
            {CREDIBILITY_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-light/70"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #23201e)' }}
      />
    </section>
  );
}

import { TESTIMONIALS } from '../../data/testimonials.js';

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function AvatarPlaceholder({ name }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('');
  return (
    <div className="w-11 h-11 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-brand">{initials}</span>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="depoimentos" className="section-padding bg-dark-2">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand mb-3 block">
            Resultados reais
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gradient mb-4">
            O que dizem nossos alunos
          </h2>
          <div className="divider-brand mx-auto" />
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="card-dark p-6 flex flex-col gap-4">
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-light/70 leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                <AvatarPlaceholder name={t.name} />
                <div>
                  <div className="text-sm font-semibold text-light">{t.name}</div>
                  <div className="text-xs text-muted">Plano {t.plan}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted/40 mt-6">
          * Depoimentos placeholder — substituir por depoimentos reais.
        </p>
      </div>
    </section>
  );
}

import foto from '../../assets/Foto.png';

export default function AboutSection() {
  return (
    <section id="sobre" className="section-padding bg-dark-2">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] max-w-md mx-auto lg:mx-0">
              <img
                src={foto}
                alt="João Flávio Francioso Jr. — RockFit Brasil"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(35,32,30,0.7) 0%, transparent 60%)' }}
              />
            </div>
            {/* Accent decoration */}
            <div
              className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl -z-10 opacity-20"
              style={{ background: 'linear-gradient(135deg, #c3191f, transparent)' }}
            />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand mb-3 block">
              Quem somos
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gradient mb-5 leading-tight">
              RockFit Brasil
            </h2>
            <div className="divider-brand mb-6" />

            <div className="space-y-4 text-light/60 leading-relaxed text-sm md:text-base">
              <p>
                A <strong className="text-light">RockFit Brasil</strong> nasceu da paixão pelo treinamento e da vontade de tornar o acompanhamento físico de qualidade acessível para todos — independente de onde você está.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
              <p>
                Nossa metodologia une ciência do treinamento, comunicação direta e adaptação constante para garantir que você evolua de forma segura, consistente e com motivação real.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-5">
              {[
                { value: '100+', label: 'Alunos ativos' },
                { value: '5+', label: 'Anos de experiência' },
                { value: '98%', label: 'Satisfação' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-gradient-brand mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

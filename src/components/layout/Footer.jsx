import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Rockfitlogo.png';
import nervalogo from '../../assets/nervalogo.svg';

const QUICK_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Planos', href: '#planos' },
  // { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'FAQ', href: '#faq' },
];

const SOCIAL_LINKS = [ 
  { label: 'Instagram', 
    href: 'https://instagram.com/rockfitbrasil', 
    icon: ( 
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"> 
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /> 
      </svg> 
      ), 
    }, 
    { 
      label: 'YouTube', 
      href: 'https://youtube.com/@rockfitbrasil', 
      icon: ( 
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"> 
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /> 
        </svg> 
        ), 
      }, 
      { 
        label: 'TikTok', 
        href: 'https://tiktok.com/@rockfitbrasil', 
        icon: ( 
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"> 
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /> 
        </svg> 
        ), 
      }, 
    ];

export default function Footer() {
  const navigate = useNavigate();

  function handleNavClick(href) {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el2 = document.querySelector(href);
          if (el2) el2.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }

  return (
    <footer className="bg-[#1a1816] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14 items-start">

          {/* Brand */}
          <div className="lg:col-span-2">
            <button onClick={() => handleNavClick('#inicio')} className="mb-4">
              <img src={logo} alt="RockFit Brasil" className="h-15 w-auto" />
            </button>

            <p className="text-muted text-sm max-w-xs mb-5">
              Consultoria online personalizada para transformar seu físico com treinos inteligentes, suporte direto e acompanhamento real.
            </p>

            <div className="flex gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted hover:text-brand hover:border-brand/40 transition-colors duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-xs uppercase text-muted mb-4">Navegação</h4>
            {QUICK_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block text-sm text-light/60 hover:text-light mb-2 text-left"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Marca */}
          <div>
            <h4 className="text-xs uppercase text-muted mb-4">Marca</h4>
            <h3 className="text-sm font-semibold text-light">ROCKFIT BRASIL</h3>
            <p className="text-sm text-light/60 mb-3">
              Conheça nossa marca de roupas
            </p>
            <button
              onClick={() => setShowPopup(true)}
              className="text-sm font-semibold text-[#b81d23] hover:text-white transition-colors duration-300 text-left"
            >
              → Visitar Loja
            </button>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-xs uppercase text-muted mb-4">Contato</h4>

            <a
              href="https://wa.me/5519996209656"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-light/60 hover:text-light mb-2"
            >
              WhatsApp (19) 99620-9656
            </a>

            <a
              href="mailto:rockfitbrasil@gmail.com"
              className="block text-sm text-light/60 hover:text-light mb-4"
            >
              rockfitbrasil@gmail.com
            </a>

            <button
              onClick={() => handleNavClick('#planos')}
              className="btn-primary text-xs py-2.5 px-4 w-full"
            >
              Ver planos
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">

          <p className="text-xs text-muted/60">
            © {new Date().getFullYear()} RockFit Brasil. Todos os direitos reservados.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5">

            {/* <div className="flex items-center gap-5">
              <a href="/privacidade" className="text-xs text-muted/60 hover:text-muted">
                Política de Privacidade
              </a>
              <a href="/termos" className="text-xs text-muted/60 hover:text-muted">
                Termos de Uso
              </a>
            </div> */}

            {/* Developed by Nerva */}
            <a
              // href="https://www.linkedin.com/company"
              // target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group opacity-70 hover:opacity-100 transition-all duration-200"
              title="Nerva"
            >
              <span className="text-xs text-muted/70 group-hover:text-muted whitespace-nowrap">
                Desenvolvido por
              </span>

              <img
                src={nervalogo}
                alt="Nerva"
                className="h-6 w-auto transition-all duration-200 group-hover:scale-105"
                style={{ filter: 'brightness(0) invert(0.6)' }}
              />
            </a>

          </div>
        </div>
      </div>

    </footer>
  );
}
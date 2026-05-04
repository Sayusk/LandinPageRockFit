import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Rockfitlogo.png';

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Planos', href: '#planos' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'FAQ', href: '#faq' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleNavClick(href) {
    setMenuOpen(false);
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-dark shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <button onClick={() => handleNavClick('#inicio')} className="flex-shrink-0 focus:outline-none">
          <img
            src={logo}
            alt="RockFit Brasil"
            className="h-9 md:h-11 w-auto logo-light"
          />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-medium text-light/70 hover:text-light transition-colors duration-200 focus:outline-none"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => handleNavClick('#planos')}
            className="btn-primary text-sm px-5 py-2.5"
          >
            Começar agora
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2 focus:outline-none"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
        >
          <span
            className={`block w-6 h-0.5 bg-light transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-light transition-all duration-300 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-light transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 glass-dark ${
          menuOpen ? 'max-h-96 border-t border-white/[0.06]' : 'max-h-0'
        }`}
      >
        <div className="px-5 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-medium text-light/80 hover:text-light text-left transition-colors duration-200 focus:outline-none"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { handleNavClick('#planos'); }}
            className="btn-primary text-sm py-2.5 justify-center mt-1"
          >
            Começar agora
          </button>
        </div>
      </div>
    </header>
  );
}

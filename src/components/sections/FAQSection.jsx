import { useState } from 'react';
import { FAQ_ITEMS } from '../../data/faq.js';

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-5 h-5 text-muted transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-180 text-brand' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function FAQSection() {
  const [openId, setOpenId] = useState(null);

  function toggle(id) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <section id="faq" className="section-padding bg-dark">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand mb-3 block">
            Dúvidas frequentes
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gradient mb-4">FAQ</h2>
          <div className="divider-brand mx-auto" />
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`card-dark overflow-hidden ${
                  isOpen ? 'border-brand/30' : ''
                }`}
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left focus:outline-none"
                >
                  <span
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      isOpen ? 'text-light' : 'text-light/80'
                    }`}
                  >
                    {item.question}
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isOpen ? '400px' : '0',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="px-5 pb-5">
                    <div className="w-full h-px bg-white/[0.06] mb-4" />
                    <p className="text-sm text-muted leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-10">
          <p className="text-sm text-muted mb-4">Ainda tem dúvidas?</p>
          <a
            href="https://wa.me/5519996209656?text=Olá,%20tenho%20uma%20dúvida%20sobre%20a%20consultoria%20RockFit%20Brasil"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm px-6 py-3 inline-flex"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

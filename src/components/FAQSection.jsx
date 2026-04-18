import React, { useState } from "react";
import "./FAQSection.css";

const faqs = [
  { question: "Como funciona o acompanhamento?", answer: "Você terá suporte contínuo com planos personalizados." },
  { question: "Posso cancelar a qualquer momento?", answer: "Sim, você pode cancelar quando quiser sem taxas extras." },
  { question: "Os treinos são adaptados para iniciantes?", answer: "Sim, todos os treinos são ajustados ao seu nível." },
  { question: "Recebo suporte nutricional também?", answer: "Sim, você terá dieta personalizada junto ao treino." },
  { question: "Qual a forma de pagamento?", answer: "Aceitamos cartão de crédito, débito e PIX." },
  { question: "Há desconto para planos longos?", answer: "Sim, planos trimestrais e semestrais têm desconto progressivo." },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <h1>Perguntas Frequentes</h1>
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? "open" : ""}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              <span>{faq.question}</span>
              {/* seta SVG usada na hero */}
              <svg
                className={`arrow ${openIndex === index ? "rotate" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 7l5 5 5-5H5z" />
              </svg>
            </div>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;

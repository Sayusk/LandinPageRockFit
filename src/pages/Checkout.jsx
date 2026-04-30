import React, { useEffect, useState } from "react";
import "./Checkout.css";
import Footer from "../components/Footer";

const planos = [
  {
    nome: "Plano Mensal",
    preco: "R$100/mês",
    detalhes: [
      "1 mês de acompanhamento",
      "Suporte direto comigo",
      "Anamnese",
      "PAR-Q"
    ]
  },
  {
    nome: "Plano Trimestral",
    preco: "R$85/mês ou R$255 à vista",
    detalhes: [
      "3 meses de acompanhamento",
      "Suporte contínuo",
      "Anamnese",
      "PAR-Q",
      "Economia de 15%"
    ]
  },
  {
    nome: "Plano Semestral",
    preco: "R$75/mês ou R$450 à vista",
    detalhes: [
      "6 meses de acompanhamento",
      "Suporte premium",
      "Anamnese",
      "PAR-Q",
      "Economia de 25%"
    ]
  }
];

const Checkout = () => {
  const [planoSelecionado, setPlanoSelecionado] = useState(planos[0]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div className="checkout-page">

      {/* VOLTAR */}
      <div className="back-arrow" onClick={() => window.history.back()}>
        <svg viewBox="0 0 24 24" className="arrow-icon">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </div>

      <div className="checkout-grid">

        {/* ESQUERDA */}
        <div className="plans-section">

          <h2>Escolha seu plano</h2>

          {/* OPÇÕES */}
          <div className="plans-list">
            {planos.map((plano, index) => (
              <div
                key={index}
                className={`plan-card ${
                  plano.nome === planoSelecionado.nome ? "active" : ""
                }`}
                onClick={() => setPlanoSelecionado(plano)}
              >
                <p>{plano.nome}</p>
                <span>{plano.preco}</span>
              </div>
            ))}
          </div>

          {/* DETALHES */}
          <div className="selected-plan">
            <h3>{planoSelecionado.nome}</h3>
            <span className="preco">{planoSelecionado.preco}</span>

            <ul>
              {planoSelecionado.detalhes.map((item, i) => (
                <li key={i}>✓ {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* DIREITA */}
        <div className="payment-section">

          <h2>Pagamento</h2>

          <form className="payment-form">

            <input type="text" placeholder="Nome completo" />
            <input type="email" placeholder="Email" />

            <input type="text" placeholder="Número do cartão" />

            <div className="row">
              <input type="text" placeholder="MM/AA" />
              <input type="text" placeholder="CVV" />
            </div>

            <select>
              <option>Cartão de crédito</option>
              <option>Pix</option>
              <option>Boleto</option>
            </select>

            <button type="submit">
              Pagar {planoSelecionado.preco}
            </button>

          </form>

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
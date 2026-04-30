import React from "react";
import { useNavigate } from "react-router-dom";
import "./PlanosSection.css";

const PlanosSection = () => {
  const navigate = useNavigate();

  const handleCheckout = (plano) => {
    navigate("/checkout", { state: plano });
  };

  return (
    <section id="planos" className="section planos">
      <h1>Nossos Planos</h1>

      <div className="planos-container">

        {/* Plano Mensal */}
        <div className="pack-container">
          <div className="header">
            <p className="title">Plano Mensal</p>
            <div className="price-container">
              <span>R$</span>100<span>/mês</span>
            </div>
          </div>

          <ul className="lists">
            <li className="list"><span>✓</span><p>1 mês de acompanhamento</p></li>
            <li className="list"><span>✓</span><p>Suporte direto comigo</p></li>
            <li className="list"><span>✓</span><p>Anamnese</p></li>
            <li className="list"><span>✓</span><p>PAR-Q</p></li>
          </ul>

          <div className="button-container">
            <button
              onClick={() =>
                handleCheckout({
                  nome: "Plano Mensal",
                  preco: "R$100/mês"
                })
              }
            >
              Assinar
            </button>
          </div>
        </div>

        {/* Plano Trimestral */}
        <div className="pack-container">
          <div className="header">
            <p className="title">Plano Trimestral</p>
            <div className="price-container">
              <span>R$</span>85<span>/mês</span>
            </div>
            <p>ou R$ 255,00 à vista</p>
          </div>

          <ul className="lists">
            <li className="list"><span>✓</span><p>3 meses de acompanhamento</p></li>
            <li className="list"><span>✓</span><p>Suporte contínuo</p></li>
            <li className="list"><span>✓</span><p>Anamnese</p></li>
            <li className="list"><span>✓</span><p>PAR-Q</p></li>
            <li className="list"><span>✓</span><p>Economia de 15%</p></li>
          </ul>

          <div className="button-container">
            <button
              onClick={() =>
                handleCheckout({
                  nome: "Plano Trimestral",
                  preco: "R$85/mês ou R$255 à vista"
                })
              }
            >
              Assinar
            </button>
          </div>
        </div>

        {/* Plano Semestral */}
        <div className="pack-container destaque">
          <div className="header">
            <p className="title">Plano Semestral</p>
            <div className="price-container">
              <span>R$</span>75<span>/mês</span>
            </div>
            <p>ou R$ 450,00 à vista</p>
          </div>

          <ul className="lists">
            <li className="list"><span>✓</span><p>6 meses de acompanhamento</p></li>
            <li className="list"><span>✓</span><p>Suporte premium</p></li>
            <li className="list"><span>✓</span><p>Anamnese</p></li>
            <li className="list"><span>✓</span><p>PAR-Q</p></li>
            <li className="list"><span>✓</span><p>Economia de 25%</p></li>
          </ul>

          <div className="button-container">
            <button
              onClick={() =>
                handleCheckout({
                  nome: "Plano Semestral",
                  preco: "R$75/mês ou R$450 à vista"
                })
              }
            >
              Assinar
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PlanosSection;
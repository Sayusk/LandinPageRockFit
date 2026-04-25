import React from "react";
import "./ConsultoriaSection.css";

const ConsultoriaSection = () => {
  return (
    <section id="beneficios" className="section consultoria">
      <div className="consultoria-content">
        <h1>Com a minha consultoria você vai ter:</h1>
        <div className="cards">
          <div className="card">
            <h2>Planejamento de Rotina</h2>
            <hr />
            <p>Organização da sua rotina de treinos e hábitos para encaixar no seu dia a dia, garantindo consistência e foco nos seus objetivos.</p>
          </div>
          <div className="card">
            <h2>Ajustes Periódicos</h2>
            <hr />
            <p>Acompanhamento contínuo com atualizações estratégicas no seu plano de treino e rotina, conforme sua evolução, resultados e feedback.</p>
          </div>
          <div className="card">
            <h2>Acompanhamento Direto</h2>
            <hr />
            <p>Suporte contínuo comigo para tirar dúvidas e ajustar estratégias.</p>
          </div>
          <div className="card">
            <h2>Resultados Reais</h2>
            <hr />
            <p>Transformação visível com consistência e disciplina.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultoriaSection;

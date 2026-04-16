import React from "react";
import "./App.css";
import Section from "./components/Section";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

function App() {
  return (
    <div className="App">
      {/* Seções principais */}
      <Section id="inicio" title="Transforme seu corpo" content="Acompanhamento fitness personalizado online." />
      <Section id="beneficios" title="Benefícios" content="Treinos e estratégia alimentar ajustados para sua rotina." />
      <Section id="sobre" title="Sobre mim" content="Consultoria Rock Fit Brasil com acompanhamento direto." />
      <Section id="planos" title="Planos" content="Escolha o plano que mais combina com você." />
      <Section id="faq" title="Perguntas Frequentes" content="Tire suas dúvidas sobre nossa consultoria." />

      {/* Footer */}
      <Footer />

      {/* Botão flutuante WhatsApp */}
      <WhatsAppButton />
    </div>
  );
}

export default App;

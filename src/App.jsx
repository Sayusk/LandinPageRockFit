import React from "react";
import "./App.css";
import HeroSection from "./components/HeroSection";
import ConsultoriaSection from "./components/ConsultoriaSection";
import SobreSection from "./components/SobreSection";
import PlanosSection from "./components/PlanosSection";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

function App() {
  return (
    <div className="App">
      <HeroSection />
      <ConsultoriaSection /> 
      <SobreSection />
      <PlanosSection />
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Botão flutuante WhatsApp */}
      <WhatsAppButton />
    </div>
  );
}

export default App;

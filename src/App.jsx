import React from "react";
import "./App.css";
import "./components/Section.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HeroSection from "./components/HeroSection";
import ConsultoriaSection from "./components/ConsultoriaSection";
import PlanosSection from "./components/PlanosSection";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

import Checkout from "./pages/Checkout";

// Página principal (sua landing)
const Home = () => {
  return (
    <>
      <HeroSection />
      <ConsultoriaSection />
      <PlanosSection />
      <FAQSection />
      <Footer />
      <WhatsAppButton />
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </Router>
  );
}

export default App;
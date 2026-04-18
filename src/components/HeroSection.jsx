import React from "react";
import "./HeroSection.css";
import Logo from "../assets/Rockfitlogo.png";
import Imagem1 from "../assets/imagem1.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="hero">
      <div className="hero-content">
        <img src={Logo} alt="RockFit Logo" className="hero-logo" />
        <h1>
          Transforme seu corpo com acompanhamento fitness personalizado online.
        </h1>
        <h2>
          Treinos e estratégia alimentar ajustados para sua rotina, com
          acompanhamento direto comigo.
        </h2>
        <button className="hero-btn">
          COMEÇAR MINHA TRANSFORMAÇÃO →
        </button>
      </div>
      <div className="hero-image">
        <img src={Imagem1} alt="Transformação Fitness" />
      </div>

      <div className="scroll-down">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        <path d="M297.4 438.6C309.9 451.1 330.2 451.1 342.7 438.6L502.7 278.6C515.2 266.1 515.2 245.8 502.7 233.3C490.2 220.8 469.9 220.8 457.4 233.3L320 370.7L182.6 233.4C170.1 220.9 149.8 220.9 137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7L297.3 438.7z"/></svg>
      </div>
    </section>
  );
};

export default HeroSection;

import React from "react";
import "./Footer.css";
import SocialIcons from "./SocialIcons";
import RockfitLogo from "../assets/Rockfitlogo.png"; 
import NervaLogo from "../assets/nervalogo.png"; 

const Footer = () => {
  return (
    <footer>
      <div className="footer-top">
        {/* Logo como botão para o início */}
        <div className="logo">
          <a href="#inicio">
            <img src={RockfitLogo} alt="Rock Fit Brasil Logo" className="footer-logo" />
          </a>
        </div>

        {/* Acesso rápido em lista vertical */}
        <div className="links">
          <ul>
            <li><a href="#inicio">Início</a></li>
            <li><a href="#beneficios">Benefícios</a></li>
            <li><a href="#sobre">Sobre</a></li>
            <li><a href="#planos">Planos</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        {/* Contato */}
        <div className="contato">
          <h3>Contatos</h3>
          <p>Telefone: +55 (19) 99620-9656</p>
          <p>Email: rockfitbrasil@gmail.com</p>
        </div>

        {/* Marca */}
        <div className="marca">
          <h3>ROCKFIT BRASIL</h3>
          <p>Conheça nossa marca de roupas</p>
          <a href="https://rockfit.com" target="_blank" rel="noopener noreferrer">→ Visitar Loja</a>
        </div>

        {/* CTA */}
        <div className="cta">
          <h3>PRONTO PARA COMEÇAR?</h3>
          <button>Agendar Consultoria</button>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <p>© 2026 RockFit Consultoria</p>
        <SocialIcons />
        <div className="dev">
          Developed by <img src={NervaLogo} alt="Nerva Logo" className="nerva-logo" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

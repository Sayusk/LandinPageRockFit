import React from "react";
import "./WhatsAppButton.css";
import WhatsAppIcon from "../assets/whatsapp.svg";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5519996209656"
      className="whatsapp-btn"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src={WhatsAppIcon} alt="WhatsApp" className="whatsapp-icon" />
    </a>
  );
};

export default WhatsAppButton;

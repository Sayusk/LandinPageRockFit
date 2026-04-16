import React from "react";
import FacebookIcon from "../assets/facebook.svg";
import InstagramIcon from "../assets/instagram.svg";
import LinkedinIcon from "../assets/linkedin.svg";
import TiktokIcon from "../assets/tiktok.svg";

const SocialIcons = () => {
  return (
    <div className="social">
      <a href="https://facebook.com/rockfitbrasil" target="_blank" rel="noopener noreferrer">
        <img src={FacebookIcon} alt="Facebook" className="social-icon" />
      </a>
      <a href="https://instagram.com/rockfitbrasil" target="_blank" rel="noopener noreferrer">
        <img src={InstagramIcon} alt="Instagram" className="social-icon" />
      </a>
      <a href="https://linkedin.com/company/rockfitbrasil" target="_blank" rel="noopener noreferrer">
        <img src={LinkedinIcon} alt="LinkedIn" className="social-icon" />
      </a>
      <a href="https://tiktok.com/@rockfitbrasil" target="_blank" rel="noopener noreferrer">
        <img src={TiktokIcon} alt="TikTok" className="social-icon" />
      </a>
    </div>
  );
};

export default SocialIcons;

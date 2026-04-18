import React from "react";
import "./Section.css"; // importa o estilo separado

const Section = ({ id, title, content }) => {
  return (
    <section id={id} className="section">
      <div className="section-content">
        <h1>{title}</h1>
        <p>{content}</p>
      </div>
    </section>
  );
};

export default Section;

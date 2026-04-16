import React from "react";

const Section = ({ id, title }) => {
  return (
    <section id={id}>
      <h2>{title}</h2>
    </section>
  );
};

export default Section;

import React, { useState } from "react";
import "./FAQSection.css";

const faqs = [
  {
    question: "O que é a Consultoria Online Rock Fit Brasil?",
    answer:
      "É um serviço de organização e estratégia de treinos 100% digital. Nós desenhamos um plano de ação personalizado com base nos seus objetivos, nos equipamentos que você tem disponível e na sua rotina. Atuamos como seus guias de percurso, te mostrando o caminho mais eficiente para você aplicar no seu dia a dia com confiança.",
  },
  {
    question: "Como vou receber meus treinos?",
    answer: [
      "Trabalhamos com o aplicativo MFIT Personal, uma plataforma profissional de ponta utilizada no mundo todo para consultoria.",
      "Como funciona: Você baixa o app gratuitamente no celular.",
      "O que você vê: Vídeos demonstrativos de cada movimento, histórico de cargas, número de repetições e descanso.",
      "Por que é bom: Nada de planilhas de Excel confusas ou PDFs perdidos no e-mail.",
      "Seu treino está sempre na palma da sua mão, atualizado em tempo real pela Rock Fit Brasil.",
    ],
  },
  {
    question: "Preciso estar matriculado em uma academia?",
    answer: "Não necessariamente. A metodologia Rock Fit Brasil se adapta ao seu cenário. Se você treina em casa com halteres, elásticos ou apenas o peso do corpo, nós criamos o Mapa de Treino ideal no MFIT. Se você vai à academia, otimizamos sua passagem por lá para que cada minuto seja bem aproveitado.",
  },
  {
    question: "Como eu sei que estou fazendo o movimento correto pelo aplicativo?",
    answer: [
      "A combinação Rock Fit Brasil + MFIT resolve isso:",
      "Demonstração Visual: Cada exercício no app tem um vídeo padrão mostrando a execução.",
      "Correção Humana (Feedback Tático): Você pode gravar a tela do seu treino ou enviar um vídeo curto pelo WhatsApp. A equipe Rock Fit Brasil analisa e te devolve dicas de ajuste fino de postura e ritmo para você evoluir com segurança."
],
  },
  {
    question: "Esse serviço serve para quem está começando do zero?",
    answer: "Sim, e é o nosso público favorito! Ajudamos a descomplicar o mundo dos treinos. Se você se sente perdido na academia ou não sabe qual o primeiro passo para sair do sofá, a Rock Fit Brasil te dá a direção e a confiança que faltam. Nós caminhamos juntos nessa jornada.",
  },
  {
    question: "A Rock Fit Brasil passa dieta?",
    answer: "Nosso foco principal é a estratégia de movimento e treino via MFIT. No entanto, como consultores de estilo de vida, oferecemos orientações básicas e direcionamentos nutricionais gerais (importância da água, proteína e horários de refeição) para complementar seu resultado. Não substituímos um Nutricionista, profissional essencial para um plano alimentar detalhado.",
  },
  {
    question: "Em quanto tempo vejo resultados?",
    answer: "Resultado é construção diária. Em 2 a 3 semanas de consistência seguindo os treinos da Rock Fit Brasil, você já sentirá mais disposição e menos dores. A transformação visual segura e sustentável costuma aparecer entre 8 e 12 semanas.",
  },
  {
    question: "Tenho lesão ou limitação, posso participar?",
    answer: "Sim. A nossa conversa inicial serve exatamente para mapearmos isso. Nós adaptamos o seu Guia para desviar de áreas sensíveis e fortalecer o que precisa ser fortalecido, sempre incentivando você a manter o diálogo com seu médico ou fisioterapeuta de confiança.",
  },
  {
    question: "Ainda estou com dúvida, como falo com a Rock Fit Brasil?",
    answer: "É só chamar no WhatsApp da Rock Fit Brasil. Nosso time está pronto para te ouvir e te explicar como podemos te ajudar a destravar sua melhor versão !",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <h1>Perguntas Frequentes</h1>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? "open" : ""}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              <span>{faq.question}</span>

              <svg
                className={`arrow ${openIndex === index ? "rotate" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 7l5 5 5-5H5z" />
              </svg>
            </div>

            <div className="faq-answer">
              {Array.isArray(faq.answer) ? (
                faq.answer.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))
              ) : (
                <p>{faq.answer}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
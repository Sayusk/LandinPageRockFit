import HeroSection from '../components/sections/HeroSection.jsx';
import BenefitsSection from '../components/sections/BenefitsSection.jsx';
import HowItWorksSection from '../components/sections/HowItWorksSection.jsx';
import AboutSection from '../components/sections/AboutSection.jsx';
import PlansSection from '../components/sections/PlansSection.jsx';
import TestimonialsSection from '../components/sections/TestimonialsSection.jsx';
import FAQSection from '../components/sections/FAQSection.jsx';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      {/* <AboutSection /> */}
      <PlansSection />
      {/* <TestimonialsSection /> */}
      <FAQSection />
    </main>
  );
}

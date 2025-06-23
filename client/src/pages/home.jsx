// File: src/pages/Home.jsx

import CTASection from "../static/CTASection";
import Footer from "../static/Footer";
import FutureDevelopment from "../static/FutureDevelopment";
import Hero from "../static/Hero";
import ImpactSection from "../static/ImpactSection";
import ProblemSection from "../static/ProblemSection";
import SolutionSection from "../static/SolutionSection";
import TechnicalDetails from "../static/TechnicalDetails";

const Home = () => {
  return (
    <>
      <section className="min-h-screen">
        <Hero />
      </section>

      <section className="min-h-screen">
        <ProblemSection />
      </section>

      <section className="min-h-screen">
        <SolutionSection />
      </section>

      <section className="min-h-screen">
        <ImpactSection />
      </section>

      <section className="min-h-screen">
        <TechnicalDetails />
      </section>

      <section className="min-h-screen">
        <FutureDevelopment />
      </section>

      <section className="min-h-screen">
        <CTASection />
      </section>

      <section>
        <Footer />
      </section>
    </>
  );
};

export default Home;

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
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <ImpactSection />
      <TechnicalDetails />
      <FutureDevelopment />
      <CTASection />
      <Footer />
    </>
  );
};

export default Home;

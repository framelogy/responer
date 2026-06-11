import Header from "../components/Header";
import Hero from "../components/Hero";
import SurveySection from "../components/SurveySection";
import WelcomeModal from "../components/WelcomeModal";

export default function HomePage() {
  return (
    <>
      <Header />
      <WelcomeModal />
      <Hero />
      <SurveySection />
    </>
  );
}
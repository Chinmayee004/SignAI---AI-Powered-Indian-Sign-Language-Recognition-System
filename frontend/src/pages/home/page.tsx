import Navbar from '../../components/feature/Navbar';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import FeatureHighlights from './components/FeatureHighlights';
import HowItWorks from './components/HowItWorks';
import CtaSection from './components/CtaSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#08000f] text-white">
      <Navbar />
      <Hero />
      <StatsBar />
      <FeatureHighlights />
      <HowItWorks />
      <CtaSection />
    </div>
  );
}

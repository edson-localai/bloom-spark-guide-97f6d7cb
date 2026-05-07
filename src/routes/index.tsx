import { createFileRoute } from "@tanstack/react-router";
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import StatsBar from '../components/StatsBar';
import ProductsSection from '../components/ProductsSection';
import SegmentsSection from '../components/SegmentsSection';
import WhyUsSection from '../components/WhyUsSection';
import GuaranteeSection from '../components/GuaranteeSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-hcb-black">
      <Header />
      <HeroSection />
      <StatsBar />
      <ProductsSection />
      <SegmentsSection />
      <WhyUsSection />
      <GuaranteeSection />
      <CTASection />
      <Footer />
    </main>
  );
}

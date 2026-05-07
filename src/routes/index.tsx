import { createFileRoute } from "@tanstack/react-router";
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import StatsBar from '../components/StatsBar';
import ProductsSection from '../components/ProductsSection';
import SegmentsSection from '../components/SegmentsSection';
import WhyUsSection from '../components/WhyUsSection';
import GuaranteeSection from '../components/GuaranteeSection';
import CTASection from '../components/CTASection';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#0066CC]/30">
      <Header />
      <HeroSection />
      <StatsBar />
      <ProductsSection />
      <SegmentsSection />
      <WhyUsSection />
      <GuaranteeSection />
      <CTASection />
      <Footer />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import React, { Suspense, lazy } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import StatsBar from '../components/StatsBar';

// Lazy load components below the fold for better initial performance
const WhyUsSection = lazy(() => import('../components/WhyUsSection'));
const ProductsSection = lazy(() => import('../components/ProductsSection'));
const SegmentsSection = lazy(() => import('../components/SegmentsSection'));
const TestimonialsSection = lazy(() => import('../components/TestimonialsSection'));
const CTASection = lazy(() => import('../components/CTASection'));
const Footer = lazy(() => import('../components/Footer'));
const LandingChatBubble = lazy(() => import('../components/LandingChatBubble'));

const LoadingSection = () => <div className="h-40 bg-background" />;

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Header />
      <HeroSection />
      <StatsBar />
      <Suspense fallback={<LoadingSection />}>
        <WhyUsSection />
        <ProductsSection />
        <SegmentsSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
        <LandingChatBubble />
      </Suspense>
    </div>
  );
}

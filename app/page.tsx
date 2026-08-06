'use client';

import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import WhyTwinForge from '@/components/WhyTwinForge';
import ForgeProcess from '@/components/ForgeProcess';
import ProductShowcase from '@/components/ProductShowcase';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import { useLenis } from '@/hooks/useLenis';

export default function HomePage() {
  useLenis();

  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <StatsBar />
      <WhyTwinForge />
      <ForgeProcess />
      <ProductShowcase />
      <Testimonials />
      <CTASection />
    </main>
  );
}

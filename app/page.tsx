'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ProductModelViewer } from '@/components/ProductModelViewer';
import { ForgeLoader } from '@/components/ForgeLoader';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import {
  ArrowRight, Wrench, Palette, Boxes, Gauge, Shield,
  Hammer, Sparkles, Layers, Cpu, Hand, Eye, Scale, Clock, Check, MapPin,
} from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { formatPrice } from '@/lib/configurator';

const heroModels = [
  '/assets/models/1_Honeycomb_Pattern_Handles_+_Improved.glb',
  '/assets/models/1_Arrow_Pattern_Handles_+_Improved.glb',
  '/assets/models/2_Arrow_Pattern_Handles_+_Improved.glb',
];
const heroVariants = [
  { name: 'Honeycomb', color: '#111111' },
  { name: 'Arrow', color: '#F9733E' },
  { name: 'Arrow Pro', color: '#54565A' },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const { currencyCode } = useCurrency();
  const fmt = (omr: number) => formatPrice(omr, currencyCode);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setActiveModel((prev) => (prev + 1) % heroModels.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [loading]);

  return (
    <>
      {loading && <ForgeLoader onComplete={() => setLoading(false)} />}
      <Navigation />
      <main className="overflow-hidden">
        {/* ===== HERO ===== */}
        <section className="relative min-h-screen bg-white dark:bg-[#111111] flex items-center pt-16">
          {/* Subtle grid backdrop */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: 'linear-gradient(#54565A 1px, transparent 1px), linear-gradient(90deg, #54565A 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            }}
          />

          {/* Orange glow accent */}
          <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#F9733E]/10 blur-3xl pointer-events-none" />

          <div className="container-max w-full px-6 md:px-12 lg:px-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-4rem)]">
              {/* Left text column */}
              <div className="flex flex-col gap-6 max-w-xl">
                <ScrollReveal>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F9733E]/10 border border-[#F9733E]/20 text-[#F9733E] text-xs font-semibold tracking-wide">
                    <Sparkles className="w-3 h-3" />
                    MADE IN OMAN · EST. 2026
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={100}>
                  <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-heading font-extrabold leading-[1.05] tracking-tight text-foreground">
                    Custom 3D-crafted hardware,{' '}
                    <span className="text-[#F9733E]">made in Oman.</span>
                  </h1>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Design it. Tune it. Hold it. Premium customizable 3D-printed PLA products —
                    engineered for flippers, gamers, and makers of all ages. Safe plastic construction,
                    built to order, and made your way.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={300}>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link href="/shop" className="btn-primary text-base px-7 py-4">
                      Browse the Shop
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/about" className="btn-secondary text-base px-7 py-4">
                      Our Story
                    </Link>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={400}>
                  <div className="flex items-center gap-6 pt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#F9733E]" />
                      <span>Safe for all ages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hammer className="w-4 h-4 text-[#F9733E]" />
                      <span>Built to order</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#F9733E]" />
                      <span>Fully modular</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right: 3D carousel */}
              <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
                <div
                  className="absolute inset-0 transition-transform duration-300 ease-out"
                  style={{
                    transform: `perspective(1000px) rotateY(${mouse.x * 4}deg) rotateX(${-mouse.y * 4}deg)`,
                  }}
                >
                  {heroModels.map((model, i) => (
                    <div
                      key={model}
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        i === activeModel ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <ProductModelViewer
                        src={model}
                        alt={`Butterfly trainer — ${heroVariants[i].name} handle`}
                        autoRotate
                        autoRotateDelay={2000}
                        cameraControls
                        exposure={1.1}
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Variant indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                  {heroVariants.map((variant, i) => (
                    <button
                      key={variant.name}
                      onClick={() => setActiveModel(i)}
                      className="group flex items-center gap-2"
                      aria-label={`View ${variant.name} variant`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          i === activeModel ? 'w-8 bg-[#F9733E]' : 'bg-foreground/20 group-hover:bg-foreground/40'
                        }`}
                        style={i !== activeModel ? { backgroundColor: variant.color, opacity: 0.4 } : {}}
                      />
                    </button>
                  ))}
                </div>

                {/* Floating spec card */}
                <div
                  className="absolute top-6 right-6 bg-background/80 backdrop-blur-md border border-border rounded-lg p-3 shadow-forge z-10 animate-float"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-semibold text-foreground">{heroVariants[activeModel].name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Live 3D preview</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-float">
            <span className="text-[10px] tracking-widest uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-foreground/30 to-transparent" />
          </div>
        </section>

        {/* ===== TRUST STRIP ===== */}
        <section className="border-y border-border bg-[#F8F8F8] dark:bg-[#1A1A1A]">
          <div className="container-max px-6 md:px-12 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Hammer, label: 'Made in Oman', sub: 'In-house 3D printing' },
                { icon: Shield, label: 'All ages', sub: 'Safe PLA plastic' },
                { icon: Palette, label: 'Fully custom', sub: 'Color, finish, weight' },
                { icon: Clock, label: '5–7 day lead', sub: 'Concept to door' },
                { icon: MapPin, label: 'Based in Oman', sub: 'Ships worldwide' },
              ].map((item, i) => (
                <ScrollReveal key={item.label} delay={i * 80}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-background border border-border">
                      <item.icon className="w-4 h-4 text-[#F9733E]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="section-padding bg-background">
          <div className="container-max">
            <ScrollReveal className="max-w-2xl mb-16">
              <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-3">Why Twin Forge</p>
              <h2 className="text-display-sm font-heading font-extrabold text-foreground">
                Engineering precision, maker soul.
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                Every product is CAD-designed, 3D-printed in PLA plastic, post-processed by hand,
                and QA-tested before it ships. No two are exactly alike — and that&apos;s the point.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Boxes, title: 'Modular by design', body: 'Mix handles, blades, weights, and finishes. Every part is swappable and re-orderable.' },
                { icon: Hand, title: 'Made for your hand', body: 'Ergonomic grips tuned for flipping, EDC, and display. Shape and weight to your taste.' },
                { icon: Cpu, title: 'CAD-precise', body: 'Tolerances measured in tenths of a millimeter. Screws seat flush. Blades balance true.' },
                { icon: Gauge, title: 'Tune the feel', body: 'Light, standard, or heavy weights shift the balance point and momentum to match your style.' },
                { icon: Eye, title: 'Studio-grade finish', body: 'Matte, brushed, black oxide, or orange-accent edges. Each finish hand-applied and inspected.' },
                { icon: Scale, title: 'Balanced & tested', body: 'Every unit is flipped, flipped again, and checked for play before it leaves the bench.' },
              ].map((feature, i) => (
                <ScrollReveal key={feature.title} delay={(i % 3) * 100}>
                  <div className="group h-full p-6 rounded-lg border border-border bg-card hover:border-[#F9733E]/30 hover:shadow-forge transition-all duration-300">
                    <div className="p-3 rounded-md bg-[#F9733E]/10 w-fit mb-4 group-hover:bg-[#F9733E] transition-colors duration-300">
                      <feature.icon className="w-5 h-5 text-[#F9733E] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-heading-md font-heading font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PROCESS ===== */}
        <section className="section-padding bg-[#111111] text-white relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#F9733E]/30 to-transparent" />
          <div className="container-max relative">
            <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-3">The Forge Process</p>
              <h2 className="text-display-sm font-heading font-extrabold">
                From kitchen table to your hands.
              </h2>
              <p className="text-lg text-white/60 mt-4">
                Six steps. Every unit. No shortcuts.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { icon: Sparkles, label: 'Concept', desc: 'Sketch + spec' },
                { icon: Cpu, label: 'CAD', desc: 'Model the parts' },
                { icon: Boxes, label: 'Print', desc: 'PLA plastic' },
                { icon: Wrench, label: 'Post-process', desc: 'Hand-finish' },
                { icon: Shield, label: 'QA', desc: 'Flip-test + inspect' },
                { icon: Hammer, label: 'Ship', desc: 'To your door' },
              ].map((step, i) => (
                <ScrollReveal key={step.label} delay={i * 100}>
                  <div className="group relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#F9733E]/10 border border-[#F9733E]/30 flex items-center justify-center text-[#F9733E] text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#F9733E]/40 transition-all duration-300 h-full">
                      <step.icon className="w-6 h-6 text-[#F9733E] mb-4" />
                      <p className="font-heading font-semibold text-lg">{step.label}</p>
                      <p className="text-xs text-white/50 mt-1">{step.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRODUCT SHOWCASE ===== */}
        <section className="section-padding bg-background">
          <div className="container-max">
            <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div className="max-w-xl">
                <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-3">The Lineup</p>
                <h2 className="text-display-sm font-heading font-extrabold text-foreground">
                  Built for flipping, fidgeting, and carrying.
                </h2>
              </div>
              <Link href="/shop" className="text-sm font-semibold text-foreground hover:text-[#F9733E] transition-colors inline-flex items-center gap-2 group">
                View all products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: 'Butterfly Trainer',
                  tag: 'Bestseller',
                  price: fmt(34),
                  model: '/assets/models/1_Honeycomb_Pattern_Handles_+_Improved.glb',
                  features: ['Fully customizable', 'Honeycomb grip', 'Safe PLA plastic'],
                  href: '/configurator',
                  cta: 'Customize',
                },
                {
                  name: 'Viper Mini Shell Mod',
                  tag: 'Coming soon',
                  price: fmt(17),
                  model: null,
                  features: ['Viper Mini compatible', 'Custom colors', 'Snap-fit'],
                  href: '/shop',
                  cta: 'Learn more',
                },
              ].map((product, i) => (
                <ScrollReveal key={product.name} delay={i * 120}>
                  <Link href={product.href} className="group block h-full">
                    <div className="product-card h-full rounded-lg border border-border bg-card overflow-hidden">
                      <div className="relative h-64 bg-gradient-to-br from-muted/40 to-muted/10 dark:from-white/5 dark:to-transparent">
                        {product.model ? (
                          <ProductModelViewer
                            src={product.model}
                            alt={`${product.name} 3D render`}
                            autoRotate
                            autoRotateDelay={1500}
                            cameraControls={false}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="w-16 h-16 rounded-lg bg-[#F9733E]/10 flex items-center justify-center">
                              <span className="text-2xl font-display font-bold text-[#F9733E]">TF</span>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase bg-[#F9733E] text-white">
                          {product.tag}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-heading-md font-heading font-semibold text-foreground">{product.name}</h3>
                          <span className="price-tag text-xl text-[#F9733E]">{product.price}</span>
                        </div>
                        <ul className="space-y-1.5 mb-4">
                          {product.features.map(feat => (
                            <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-[#F9733E]" />
                              {feat}
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-[#F9733E] transition-colors">
                          {product.cta}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="section-padding bg-[#F8F8F8] dark:bg-[#1A1A1A]">
          <div className="container-max">
            <ScrollReveal>
              <div className="relative rounded-2xl bg-[#111111] text-white p-12 md:p-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9733E]/20 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F9733E]/10 blur-3xl rounded-full" />
                <div className="relative max-w-2xl">
                  <img src="/assets/images/hammer_copy.png" alt="Twin Forge" className="w-8 h-8 object-contain mb-6" />
                  <h2 className="text-display-md font-heading font-extrabold mb-4">
                    Design it. Tune it. Hold it.
                  </h2>
                  <p className="text-lg text-white/70 mb-8 max-w-lg">
                    Build a product that matches your hands, your playstyle, and your taste.
                    Every option updates the price and lead time in real time.
                  </p>
                  <Link href="/shop" className="btn-primary text-base px-8 py-4">
                    Browse the Shop
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

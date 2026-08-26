'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ProductModelViewer } from '@/components/ProductModelViewer';
import { ForgeLoader } from '@/components/ForgeLoader';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { FeaturesScroll } from '@/components/FeaturesScroll';
import {
  ArrowRight, Wrench, Boxes, Gauge, Shield,
  Hammer, Sparkles, Layers, Cpu, Hand, Eye, Scale,
  Check, Quote, Star, Zap, Printer,
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

const PROCESS_STEPS = [
  { icon: Sparkles, label: 'Concept', desc: 'We sketch and spec your idea — blade shape, handle pattern, color palette, weight target.', img: 'https://images.pexels.com/photos/18296466/pexels-photo-18296466.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { icon: Cpu, label: 'CAD', desc: 'Every part is modeled in CAD with tolerances measured in tenths of a millimeter.', img: 'https://images.pexels.com/photos/30720501/pexels-photo-30720501.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { icon: Printer, label: 'Print', desc: 'PLA plastic is extruded layer by layer on our in-house printers in Oman.', img: 'https://images.pexels.com/photos/20552667/pexels-photo-20552667.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { icon: Wrench, label: 'Post-process', desc: 'Supports removed, surfaces hand-finished, edges smoothed, hardware seated flush.', img: 'https://images.pexels.com/photos/17509941/pexels-photo-17509941.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { icon: Shield, label: 'QA', desc: 'Every unit is flipped, tested for play, and inspected before it leaves the bench.', img: 'https://images.pexels.com/photos/19333543/pexels-photo-19333543.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { icon: Hammer, label: 'Ship', desc: 'Packed and shipped worldwide from Oman. 1–5 day delivery.', img: 'https://images.pexels.com/photos/20688553/pexels-photo-20688553.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
];

const TESTIMONIALS = [
  { quote: "The balance is unreal. I've owned metal trainers that felt worse. The honeycomb grip locks into your palm perfectly.", name: 'Ahmed Al-Balushi', role: 'Flipper · Muscat', rating: 5 },
  { quote: "Ordered a custom build with arrow handles in silk blue. The color is gorgeous and the weight distribution is spot on.", name: 'Sara Al-Hinai', role: 'Collector · Dubai', rating: 5 },
  { quote: "These two brothers know what they're doing. You can feel the CAD precision in every screw and pivot.", name: 'Omar Al-Rashdi', role: 'Maker · Salalah', rating: 5 },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [activeStep, setActiveStep] = useState(0);
  const processRef = useRef<HTMLDivElement>(null);
  const { currencyCode } = useCurrency();
  const fmt = (omr: number) => formatPrice(omr, currencyCode);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => { setActiveModel((prev) => (prev + 1) % heroModels.length); }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const onMove = (e: MouseEvent) => {
      setMouse({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [loading]);

  useEffect(() => {
    const onScroll = () => {
      if (!processRef.current) return;
      const rect = processRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight * 0.5)));
      setActiveStep(Math.min(PROCESS_STEPS.length - 1, Math.floor(progress * PROCESS_STEPS.length)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {loading && <ForgeLoader onComplete={() => setLoading(false)} />}
      <Navigation />
      <main className="overflow-hidden pb-16 md:pb-0">

        {/* ── HERO ────────────────────────────────────────────── */}
        <section className="relative min-h-screen bg-background text-foreground flex items-center pt-12 overflow-hidden">
          <div className="absolute inset-0 grid-backdrop opacity-50" />
          <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-black/4 blur-3xl pointer-events-none animate-glow" />
          <div className="absolute bottom-0 -left-32 w-96 h-96 rounded-full bg-black/3 blur-3xl pointer-events-none" />

          <div className="container-wide w-full px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center min-h-[calc(100vh-3rem)]">
              <div className="flex flex-col gap-6">
                <ScrollReveal>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/10 text-foreground text-[11px] font-tag w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F9733E] animate-pulse" />
                    MADE IN OMAN · EST. 2026
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={100}>
                  <h1 className="text-fluid-hero font-display text-foreground">Design it.<br />Tune it.{' '}<span className="text-gradient-orange">Hold it.</span></h1>
                </ScrollReveal>
                <ScrollReveal delay={200}>
                  <p className="text-fluid-body text-muted-foreground max-w-lg font-body">Premium customizable 3D-printed products — engineered by two brothers for flippers, gamers, and makers of all ages. Safe PLA plastic, built to order, made your way.</p>
                </ScrollReveal>
                <ScrollReveal delay={300}>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link href="/shop" className="btn-primary text-sm px-7 py-3.5"><Zap className="w-3.5 h-3.5" />Start Your Build<ArrowRight className="w-3.5 h-3.5" /></Link>
                    <Link href="/about" className="btn-secondary text-sm px-7 py-3.5">Our Story</Link>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={400}>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 text-xs text-muted-foreground font-tag">
                    <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-foreground/50" /><span>Safe for all ages</span></div>
                    <div className="flex items-center gap-2"><Hammer className="w-3.5 h-3.5 text-foreground/50" /><span>Built to order</span></div>
                    <div className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-foreground/50" /><span>Fully modular</span></div>
                  </div>
                </ScrollReveal>
              </div>

              <div className="relative h-[340px] sm:h-[440px] lg:h-[560px]">
                <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: `perspective(1000px) rotateY(${mouse.x * 4}deg) rotateX(${-mouse.y * 4}deg)` }}>
                  {heroModels.map((model, i) => (
                    <div key={model} className={`absolute inset-0 transition-opacity duration-700 ${i === activeModel ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <ProductModelViewer src={model} alt={`Butterfly trainer — ${heroVariants[i].name} handle`} autoRotate autoRotateDelay={2000} cameraControls exposure={1.1} className="w-full h-full" />
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                  {heroVariants.map((variant, i) => (
                    <button key={variant.name} onClick={() => setActiveModel(i)} className="group flex items-center gap-2" aria-label={`View ${variant.name} variant`}>
                      <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === activeModel ? 'w-8 bg-[#111]' : 'bg-foreground/20 group-hover:bg-foreground/40'}`} style={i !== activeModel ? { backgroundColor: variant.color, opacity: 0.5 } : {}} />
                    </button>
                  ))}
                </div>
                <div className="absolute top-6 right-6 glass rounded-xl p-3 shadow-sm z-10 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full bg-black animate-pulse" /><span className="font-heading font-semibold text-foreground">{heroVariants[activeModel].name}</span></div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-tag">Live 3D preview</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40 animate-float">
            <span className="text-[9px] tracking-[0.2em] uppercase font-tag">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-foreground/30 to-transparent" />
          </div>
        </section>

        {/* ── MARQUEE ─────────────────────────────────────────── */}
        <section className="bg-[#111] border-y border-black py-3 overflow-hidden">
          <div className="marquee-track gap-12 text-white/60 text-[10px] font-tag tracking-[0.18em] uppercase">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-12">
                {['Made in Oman', 'Safe PLA Plastic', 'Built to Order', 'Ships Worldwide', 'CAD-Precise', 'Hand-Finished', 'Fully Custom', '1–5 Day Delivery'].map((item, i) => (
                  <span key={`${dup}-${i}`} className="flex items-center gap-12">{item}<span className="text-white/20">·</span></span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES SCROLL ANIMATION (Illoca-style) ────────── */}
        <FeaturesScroll />

        {/* ── THE FORGE PROCESS ───────────────────────────────── */}
        <section ref={processRef} className="bg-background text-foreground relative overflow-hidden">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-px" />
          <div className="absolute left-1/2 top-0 w-px bg-gradient-to-b from-[#111] to-transparent -translate-x-px transition-all duration-300" style={{ height: `${(activeStep + 1) * (100 / PROCESS_STEPS.length)}%` }} />
          <div className="section-padding relative">
            <div className="container-wide">
              <ScrollReveal className="text-center max-w-2xl mx-auto mb-20">
                <p className="text-[10px] font-tag text-muted-foreground mb-3">THE FORGE PROCESS</p>
                <h2 className="text-fluid-display font-display">From idea to your hands.</h2>
                <p className="text-fluid-body text-muted-foreground mt-4 font-body">Six steps. Every unit. No shortcuts. Scroll to follow the journey.</p>
              </ScrollReveal>
              <div className="space-y-16 lg:space-y-24">
                {PROCESS_STEPS.map((step, i) => (
                  <ScrollReveal key={step.label} delay={0}>
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                      <div className={`relative ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                        <div className={`relative rounded-2xl overflow-hidden border transition-all duration-500 ${activeStep >= i ? 'border-black shadow-lg' : 'border-border'}`}>
                          <div className="img-zoom aspect-[4/3]"><img src={step.img} alt={step.label} className="w-full h-full object-cover" loading="lazy" /></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                          <div className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-display text-xl font-bold border-2 border-white transition-colors duration-500 ${activeStep >= i ? 'bg-black' : 'bg-black/40'}`}>{i + 1}</div>
                        </div>
                      </div>
                      <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                        <div className={`flex items-center gap-3 mb-4 transition-all duration-500 ${activeStep >= i ? 'opacity-100' : 'opacity-30'}`}>
                          <step.icon className={`w-5 h-5 ${activeStep >= i ? 'text-[#F9733E]' : 'text-muted-foreground/30'}`} />
                          <span className="text-[10px] font-tag text-muted-foreground">Step {i + 1} of {PROCESS_STEPS.length}</span>
                        </div>
                        <h3 className="text-fluid-heading font-display mb-3">{step.label}</h3>
                        <p className="text-fluid-body text-muted-foreground font-body leading-relaxed max-w-md">{step.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── THE LINEUP ──────────────────────────────────────── */}
        <section className="section-padding bg-[#f7f7f7]">
          <div className="container-wide">
            <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div className="max-w-xl">
                <p className="text-[10px] font-tag text-muted-foreground mb-3">THE LINEUP</p>
                <h2 className="text-fluid-display font-display text-foreground">Built for flipping, fidgeting, and carrying.</h2>
              </div>
              <Link href="/shop" className="text-xs font-tag text-foreground hover:text-[#F9733E] transition-colors inline-flex items-center gap-2 group">View all products<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></Link>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScrollReveal>
                <Link href="/configurator" className="group block h-full">
                  <div className="product-card h-full rounded-2xl border-2 border-black bg-white overflow-hidden">
                    <div className="relative h-72 bg-[#f5f5f5]">
                      <ProductModelViewer src="/assets/models/1_Honeycomb_Pattern_Handles_+_Improved.glb" alt="Butterfly Trainer 3D render" autoRotate autoRotateDelay={1500} cameraControls={false} className="w-full h-full" />
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-tag bg-black text-white border border-black">Bestseller</div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-3"><h3 className="text-heading-lg font-heading font-semibold text-foreground">Butterfly Trainer</h3><span className="price-tag text-xl text-[#F9733E]">{fmt(2.5)}</span></div>
                      <ul className="space-y-1.5 mb-4">{['Fully customizable', 'Honeycomb grip', 'Safe PLA plastic'].map(feat => <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground font-body"><Check className="w-3 h-3 text-foreground" />{feat}</li>)}</ul>
                      <div className="flex items-center gap-2 text-xs font-tag text-foreground group-hover:text-[#F9733E] transition-colors">Customize<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
              <ScrollReveal delay={120}>
                <Link href="/shop" className="group block h-full">
                  <div className="product-card h-full rounded-2xl border-2 border-border bg-white overflow-hidden">
                    <div className="relative h-72 img-zoom">
                      <img src="https://images.pexels.com/photos/31336812/pexels-photo-31336812.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="3D printed products coming soon" className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-tag bg-white text-foreground border border-black/20">Coming soon</div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-3"><h3 className="text-heading-lg font-heading font-semibold text-foreground">Viper Mini Shell Mod</h3><span className="price-tag text-xl text-muted-foreground">{fmt(1.5)}</span></div>
                      <ul className="space-y-1.5 mb-4">{['Viper Mini compatible', 'Custom colors', 'Snap-fit'].map(feat => <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground font-body"><Check className="w-3 h-3 text-foreground" />{feat}</li>)}</ul>
                      <div className="flex items-center gap-2 text-xs font-tag text-foreground group-hover:text-[#F9733E] transition-colors">Learn more<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────── */}
        <section className="section-padding bg-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-black/3 blur-3xl pointer-events-none" />
          <div className="container-wide relative">
            <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-[10px] font-tag text-muted-foreground mb-3">FROM THE COMMUNITY</p>
              <h2 className="text-fluid-display font-display">What flippers say.</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <ScrollReveal key={t.name} delay={i * 120}>
                  <div className="h-full p-8 rounded-2xl bg-white border-2 border-black/8 hover:border-black transition-all duration-500 hover:-translate-y-1">
                    <Quote className="w-7 h-7 text-black/15 mb-4" />
                    <p className="text-fluid-body text-foreground/80 font-body leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-9 h-9 rounded-full bg-black/8 border border-black/15 flex items-center justify-center font-display font-bold text-foreground">{t.name.charAt(0)}</div>
                      <div><p className="text-sm font-heading font-semibold text-foreground">{t.name}</p><p className="text-xs text-muted-foreground font-tag">{t.role}</p></div>
                      <div className="ml-auto flex gap-0.5">{Array.from({ length: t.rating }).map((_, s) => <Star key={s} className="w-3 h-3 text-[#F9733E] fill-[#F9733E]" />)}</div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section className="section-padding bg-background">
          <div className="container-wide">
            <ScrollReveal>
              <div className="relative rounded-3xl bg-[#111] text-white p-12 md:p-20 overflow-hidden border-2 border-[#111]">
                {/* Grid overlay */}
                <div className="absolute inset-0 grid-backdrop opacity-10" />
                <Zap className="absolute top-6 right-6 w-24 h-24 text-white/5" fill="white" strokeWidth={0} />
                <div className="relative max-w-2xl">
                  <p className="text-[10px] font-tag text-white/40 mb-4">READY TO BUILD</p>
                  <h2 className="text-fluid-display font-display mb-4">Build something that&apos;s{' '}<span className="text-[#F9733E]">yours.</span></h2>
                  <p className="text-fluid-body text-white/70 font-body mb-8 max-w-lg">Every product is made to order. Browse the shop and spec one to your exact taste — color, weight, finish.</p>
                  <Link href="/shop" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#111] text-sm font-tag rounded-lg hover:-translate-y-0.5 hover:shadow-lg hover:bg-[#F9733E] hover:text-white border-2 border-white transition-all duration-200">
                    <Zap className="w-3.5 h-3.5" />
                    Start Your Build
                    <ArrowRight className="w-3.5 h-3.5" />
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

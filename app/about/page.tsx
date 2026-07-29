'use client';

import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ScrollReveal } from '@/components/ScrollReveal';
import {
  Zap, Hammer, Cpu, Boxes, Wrench, Shield, Sparkles, ArrowRight,
  Heart, Target, Users, MapPin, Layers,
} from 'lucide-react';

const TIMELINE = [
  { year: '2026', title: 'Kitchen table', desc: 'Two brothers, Marwan and Muhannad, borrow a 3D printer. First prototype: a janky balisong with layers of PLA.' },
  { year: '2026', title: 'First designs', desc: 'Arrow and honeycomb handle patterns finalized. PLA plastic chosen for safety and durability.' },
  { year: '2026', title: 'Twin Forge Co.', desc: 'Brand launched by Marwan & Muhannad. First trainers shipped to a community of flippers and makers.' },
  { year: '2026', title: 'The configurator', desc: 'Full custom build tool goes live. Every trainer now ships spec\'d to the buyer.' },
];

const VALUES = [
  { icon: Target, title: 'Build for the user', body: 'No two hands are the same. No two trainers should be either. Customization is the default, not the upgrade.' },
  { icon: Shield, title: 'Quality over speed', body: 'Every unit is printed, post-processed, and flip-tested by hand. If it doesn\'t pass QA, it doesn\'t ship.' },
  { icon: Heart, title: 'Maker soul', body: 'We\'re tinkerers first. Every product started as a prototype on our bench — and we still iterate on shipped designs.' },
];

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="pt-16 bg-background pb-16 md:pb-0">

        {/* Hero */}
        <section className="section-padding bg-[#0a0a0a] text-white relative overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#F9733E]/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#F9733E]/5 blur-3xl" />
          <div className="grid-backdrop absolute inset-0 opacity-30" />
          <div className="container-wide relative">
            <ScrollReveal className="max-w-3xl">
              <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-4">Our Story</p>
              <h1 className="text-fluid-hero font-display leading-[0.95]">
                Two brothers.<br />
                A printer.<br />
                <span className="text-gradient">A desire to make things personal.</span>
              </h1>
              <p className="text-fluid-body text-white/60 max-w-xl mt-6 leading-relaxed">
                Twin Forge Co. started at a kitchen table in Oman — two brothers, Marwan and Muhannad,
                a 3D printer, and a frustration with one-size-fits-all gear. We design
                components for gamers, tinkerers, and anyone who wants something built their way.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Founder section */}
        <section className="section-padding bg-background">
          <div className="container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal>
                <div className="relative">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-border img-zoom">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.pexels.com/photos/5089174/pexels-photo-5089174.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                      alt="A craftsman working in a workshop"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-[#F9733E] text-white px-5 py-4 rounded-xl shadow-forge-orange">
                    <p className="font-display text-3xl font-bold leading-none">2</p>
                    <p className="text-xs mt-1">brothers</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={150}>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-3">The mission</p>
                  <h2 className="text-fluid-display font-display text-foreground mb-6">
                    To let users design products that match their hands, playstyles, and tastes.
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      We come from engineering and making — Marwan lives in CAD, Muhannad
                      lives on the printer. Between us we&apos;ve broken, rebuilt, and refined
                      hundreds of prototypes to get the weight, balance, and feel right.
                    </p>
                    <p>
                      The plastic butterfly trainer was our first real product because it sits at the
                      intersection of everything we love: mechanical precision, tactile feel,
                      and the satisfaction of holding something you designed yourself. Made from
                      safe PLA plastic, it&apos;s suitable for flippers of all ages.
                    </p>
                    <p>
                      Everything we ship is made to order in small batches in Oman. No warehouses of
                      inventory. No compromise on the finish. Just the forge, the two of us,
                      and whatever you dream up in the configurator.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-[#0a0a0a] text-white relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#F9733E]/5 blur-3xl" />
          <div className="container-wide relative">
            <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-3">What we believe</p>
              <h2 className="text-fluid-display font-display">Three things we won&apos;t compromise on.</h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VALUES.map((value, i) => (
                <ScrollReveal key={value.title} delay={i * 120}>
                  <div className="h-full p-8 rounded-2xl glass hover:border-[#F9733E]/30 transition-all duration-500 hover:-translate-y-1">
                    <div className="p-3 rounded-lg bg-[#F9733E]/10 w-fit mb-5">
                      <value.icon className="w-6 h-6 text-[#F9733E]" />
                    </div>
                    <h3 className="text-heading-md font-heading font-semibold mb-3">{value.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{value.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section-padding bg-background">
          <div className="container-wide">
            <ScrollReveal className="max-w-2xl mb-16">
              <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-3">The timeline</p>
              <h2 className="text-fluid-display font-display text-foreground">From kitchen table to your hands.</h2>
            </ScrollReveal>

            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />
              <div className="space-y-12">
                {TIMELINE.map((item, i) => (
                  <ScrollReveal key={item.year + i} delay={i * 100}>
                    <div className={`relative flex flex-col md:flex-row gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className="absolute left-4 md:left-1/2 top-2 w-3 h-3 rounded-full bg-[#F9733E] -translate-x-1/2 ring-4 ring-background" />
                      <div className="md:w-1/2 pl-12 md:pl-0 md:pr-12 md:text-right">
                        {i % 2 === 0 ? (
                          <div className="p-6 rounded-xl border border-border bg-card hover:border-[#F9733E]/30 transition-colors duration-300">
                            <p className="font-display text-2xl font-bold text-[#F9733E] mb-1">{item.year}</p>
                            <h3 className="text-heading-md font-heading font-semibold text-foreground mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        ) : (
                          <div className="md:invisible hidden md:block" />
                        )}
                      </div>
                      <div className="md:w-1/2 pl-12 md:pl-12">
                        {i % 2 !== 0 ? (
                          <div className="p-6 rounded-xl border border-border bg-card hover:border-[#F9733E]/30 transition-colors duration-300">
                            <p className="font-display text-2xl font-bold text-[#F9733E] mb-1">{item.year}</p>
                            <h3 className="text-heading-md font-heading font-semibold text-foreground mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        ) : (
                          <div className="md:invisible hidden md:block" />
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Process diagram */}
        <section className="section-padding bg-[#0a0a0a] text-white relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#F9733E]/30 to-transparent" />
          <div className="container-wide relative">
            <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-3">Small factory process</p>
              <h2 className="text-fluid-display font-display">How a Twin Forge trainer is made.</h2>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Sparkles, label: 'Concept', desc: 'Sketch + spec', img: 'https://images.pexels.com/photos/18296466/pexels-photo-18296466.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
                { icon: Cpu, label: 'CAD', desc: 'Model the parts', img: 'https://images.pexels.com/photos/30720501/pexels-photo-30720501.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
                { icon: Boxes, label: 'Print', desc: 'PLA plastic', img: 'https://images.pexels.com/photos/20552667/pexels-photo-20552667.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
                { icon: Wrench, label: 'Post-process', desc: 'Hand-finish', img: 'https://images.pexels.com/photos/17509941/pexels-photo-17509941.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
                { icon: Shield, label: 'QA', desc: 'Flip-test', img: 'https://images.pexels.com/photos/19333543/pexels-photo-19333543.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
                { icon: Hammer, label: 'Ship', desc: 'To your door', img: 'https://images.pexels.com/photos/20688553/pexels-photo-20688553.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
              ].map((step, i) => (
                <ScrollReveal key={step.label} delay={i * 80}>
                  <div className="relative group">
                    <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-[#F9733E]/10 border border-[#F9733E]/30 flex items-center justify-center text-[#F9733E] text-[10px] font-bold z-10">
                      {i + 1}
                    </div>
                    <div className="rounded-lg overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#F9733E]/40 transition-all duration-500 h-full">
                      <div className="h-20 img-zoom">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={step.img} alt={step.label} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <step.icon className="w-5 h-5 text-[#F9733E] mb-2" />
                        <p className="font-heading font-semibold text-sm">{step.label}</p>
                        <p className="text-[10px] text-white/50 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-background">
          <div className="container-wide">
            <ScrollReveal>
              <div className="relative rounded-3xl bg-gradient-to-br from-[#F9733E] to-[#e85e28] text-white p-12 md:p-16 overflow-hidden">
                <Zap className="absolute top-6 right-6 w-24 h-24 text-white/10" fill="white" strokeWidth={0} />
                <div className="relative max-w-xl">
                  <h2 className="text-fluid-display font-display mb-4">
                    Build something that&apos;s yours.
                  </h2>
                  <p className="text-fluid-body text-white/90 mb-8 max-w-md">
                    Every product is made to order. Browse the shop and spec one
                    to your exact taste — color, weight, finish.
                  </p>
                  <Link href="/shop" className="inline-flex items-center gap-2 px-7 py-4 bg-white text-[#F9733E] font-semibold rounded-lg hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                    Browse the Shop <ArrowRight className="w-4 h-4" />
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

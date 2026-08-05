'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ScrollReveal } from '@/components/ScrollReveal';
import {
  Mail, MessageSquare, Building2, Send, Check, MapPin, Clock,
  Sparkles, Phone, ArrowRight,
} from 'lucide-react';

const INQUIRY_TYPES = [
  { id: 'general', label: 'General question', icon: MessageSquare },
  { id: 'custom', label: 'Custom project', icon: Sparkles },
  { id: 'b2b', label: 'B2B / wholesale', icon: Building2 },
];

const BUDGET_RANGES = [
  { id: 'under-50', label: 'Under 50 OMR' },
  { id: '50-100', label: '50 – 100 OMR' },
  { id: '100-200', label: '100 – 200 OMR' },
  { id: '200+', label: '200+ OMR' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', inquiryType: 'general', message: '', budget: '', productIdea: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.message.trim()) e.message = 'Tell us what you need';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => { ev.preventDefault(); if (!validate()) return; setSubmitted(true); };
  const update = (key: string, value: string) => { setForm(prev => ({ ...prev, [key]: value })); if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' })); };

  return (
    <>
      <Navigation />
      <main className="pt-16 min-h-screen bg-background pb-16 md:pb-0">

        <section className="section-padding bg-muted/30 text-foreground relative overflow-hidden">
          <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-[#F9733E]/8 blur-3xl" />
          <div className="grid-backdrop absolute inset-0 opacity-30" />
          <div className="container-wide relative">
            <ScrollReveal className="max-w-2xl">
              <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-4">Contact</p>
              <h1 className="text-fluid-hero font-display">Let&apos;s build{' '}<span className="text-gradient">something together.</span></h1>
              <p className="text-fluid-body text-muted-foreground mt-6 max-w-lg">Questions, custom projects, or wholesale inquiries — we read every message. The brothers answer personally.</p>
            </ScrollReveal>
          </div>
        </section>

        <section className="section-padding" id="custom">
          <div className="container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-6 md:p-10">
                  {submitted ? (
                    <div className="py-20 text-center animate-fade-in">
                      <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mx-auto mb-5"><Check className="w-8 h-8 text-green-600" /></div>
                      <h2 className="text-fluid-heading font-heading font-bold text-foreground mb-3">Message sent</h2>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">Thanks, {form.name.split(' ')[0]}. We&apos;ll get back to you at <span className="font-semibold text-foreground">{form.email}</span> within 1–2 business days.</p>
                      <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', inquiryType: 'general', message: '', budget: '', productIdea: '' }); }} className="mt-6 text-sm font-semibold text-[#F9733E] hover:underline">Send another message</button>
                    </div>
                  ) : (
                    <form onSubmit={submit} className="space-y-6">
                      <h2 className="text-fluid-heading font-heading font-bold text-foreground">Send us a message</h2>
                      <div>
                        <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3 block">What&apos;s this about?</label>
                        <div className="grid grid-cols-3 gap-2">
                          {INQUIRY_TYPES.map(type => (
                            <button key={type.id} type="button" onClick={() => update('inquiryType', type.id)} className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${form.inquiryType === type.id ? 'border-[#F9733E] bg-[#F9733E]/5' : 'border-border hover:border-foreground/30'}`}>
                              <type.icon className={`w-5 h-5 ${form.inquiryType === type.id ? 'text-[#F9733E]' : 'text-muted-foreground'}`} />
                              <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Name</label>
                          <input id="name" type="text" value={form.name} onChange={e => update('name', e.target.value)} className="forge-input" placeholder="Your name" aria-invalid={!!errors.name} />
                          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label htmlFor="email" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Email</label>
                          <input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} className="forge-input" placeholder="you@email.com" aria-invalid={!!errors.email} />
                          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="productIdea" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Product idea <span className="text-muted-foreground/50 normal-case font-normal">(optional)</span></label>
                        <input id="productIdea" type="text" value={form.productIdea} onChange={e => update('productIdea', e.target.value)} className="forge-input" placeholder="e.g. Butterfly trainer, custom shell, display piece…" />
                      </div>
                      {(form.inquiryType === 'custom' || form.inquiryType === 'b2b') && (
                        <div className="animate-fade-in">
                          <label htmlFor="budget" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3 block">Estimated budget</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {BUDGET_RANGES.map(range => (
                              <button key={range.id} type="button" onClick={() => update('budget', range.id)} className={`px-3 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all duration-200 ${form.budget === range.id ? 'border-[#F9733E] bg-[#F9733E]/5 text-[#F9733E]' : 'border-border text-muted-foreground hover:border-foreground/30'}`}>{range.label}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <label htmlFor="message" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Message</label>
                        <textarea id="message" value={form.message} onChange={e => update('message', e.target.value)} className="forge-input min-h-[140px] resize-y" placeholder="Tell us what you're dreaming up…" aria-invalid={!!errors.message} />
                        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                      </div>
                      <button type="submit" className="btn-primary w-full sm:w-auto justify-center py-3.5 text-base">Send message<Send className="w-4 h-4" /></button>
                    </form>
                  )}
                </div>
              </ScrollReveal>
              <ScrollReveal delay={150}>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="text-heading-sm font-heading font-bold text-foreground mb-4">Direct contact</h3>
                    <div className="space-y-3">
                      <a href="mailto:twinforge.om@gmail.com" className="flex items-center gap-3 group">
                        <div className="p-2.5 rounded-lg bg-[#F9733E]/10 group-hover:bg-[#F9733E] transition-colors"><Mail className="w-4 h-4 text-[#F9733E] group-hover:text-white transition-colors" /></div>
                        <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-semibold text-foreground">twinforge.om@gmail.com</p></div>
                      </a>
                      <a href="tel:+96891232926" className="flex items-center gap-3 group">
                        <div className="p-2.5 rounded-lg bg-[#F9733E]/10 group-hover:bg-[#F9733E] transition-colors"><Phone className="w-4 h-4 text-[#F9733E] group-hover:text-white transition-colors" /></div>
                        <div><p className="text-xs text-muted-foreground">Phone / WhatsApp</p><p className="text-sm font-semibold text-foreground">+968 91232926</p></div>
                      </a>
                      <div className="flex items-center gap-3"><div className="p-2.5 rounded-lg bg-[#F9733E]/10"><MapPin className="w-4 h-4 text-[#F9733E]" /></div><div><p className="text-xs text-muted-foreground">Workshop</p><p className="text-sm font-semibold text-foreground">Made in Oman</p></div></div>
                      <div className="flex items-center gap-3"><div className="p-2.5 rounded-lg bg-[#F9733E]/10"><Clock className="w-4 h-4 text-[#F9733E]" /></div><div><p className="text-xs text-muted-foreground">Response time</p><p className="text-sm font-semibold text-foreground">1–2 business days</p></div></div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#F9733E]/30 bg-[#F9733E]/5 p-6">
                    <Sparkles className="w-6 h-6 text-[#F9733E] mb-3" />
                    <h3 className="text-heading-sm font-heading font-bold text-foreground mb-2">Full custom project?</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">We take on a limited number of full custom builds each quarter — from one-off display pieces to small production runs.</p>
                    <button onClick={() => update('inquiryType', 'custom')} className="text-sm font-semibold text-[#F9733E] hover:underline inline-flex items-center gap-1">Request a quote<ArrowRight className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/30 p-6">
                    <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">Shipping & returns</h3>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li>· Built-to-order: 1–5 day delivery</li>
                      <li>· Ships worldwide from Oman</li>
                      <li>· 14-day returns on unused trainers</li>
                      <li>· Custom builds are final sale</li>
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

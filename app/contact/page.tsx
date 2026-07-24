'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ScrollReveal } from '@/components/ScrollReveal';
import {
  Mail, MessageSquare, Building2, Send, Check, MapPin, Clock,
  Hammer, Sparkles, Phone,
} from 'lucide-react';

const INQUIRY_TYPES = [
  { id: 'general', label: 'General question', icon: MessageSquare },
  { id: 'custom', label: 'Full custom project', icon: Sparkles },
  { id: 'b2b', label: 'B2B / wholesale', icon: Building2 },
  { id: 'support', label: 'Order support', icon: Hammer },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', inquiryType: 'general', message: '', budget: '',
  });
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

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    // In a production app this would POST to an edge function / API route.
    setSubmitted(true);
  };

  const update = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  return (
    <>
      <Navigation />
      <main className="pt-16 min-h-screen bg-background">
        {/* Hero */}
        <section className="section-padding border-b border-border">
          <div className="container-max">
            <ScrollReveal className="max-w-2xl">
              <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-3">Contact</p>
              <h1 className="text-display-md font-heading font-extrabold text-foreground">
                Let&apos;s build something together.
              </h1>
              <p className="text-lg text-muted-foreground mt-4">
                Questions, custom projects, or wholesale inquiries — we read every message.
                The brothers answer personally.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Form + info */}
        <section className="section-padding" id="custom">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
              {/* Form */}
              <ScrollReveal>
                <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                  {submitted ? (
                    <div className="py-16 text-center animate-fade-in">
                      <div className="w-14 h-14 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-7 h-7 text-green-600" />
                      </div>
                      <h2 className="text-heading-lg font-heading font-bold text-foreground mb-2">Message sent</h2>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Thanks, {form.name.split(' ')[0]}. We&apos;ll get back to you at{' '}
                        <span className="font-semibold text-foreground">{form.email}</span> within 1–2 business days.
                      </p>
                      <button
                        onClick={() => { setSubmitted(false); setForm({ name: '', email: '', inquiryType: 'general', message: '', budget: '' }); }}
                        className="mt-6 text-sm font-semibold text-[#F9733E] hover:underline"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={submit} className="space-y-5">
                      <h2 className="text-heading-lg font-heading font-bold text-foreground mb-2">Send us a message</h2>

                      {/* Inquiry type */}
                      <div>
                        <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3 block">
                          What&apos;s this about?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {INQUIRY_TYPES.map(type => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => update('inquiryType', type.id)}
                              className={`flex flex-col items-center gap-2 p-3 rounded-md border-2 transition-all duration-200 ${
                                form.inquiryType === type.id
                                  ? 'border-[#F9733E] bg-[#F9733E]/5'
                                  : 'border-border hover:border-foreground/30'
                              }`}
                            >
                              <type.icon className={`w-5 h-5 ${form.inquiryType === type.id ? 'text-[#F9733E]' : 'text-muted-foreground'}`} />
                              <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Name + Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                            Name
                          </label>
                          <input
                            id="name"
                            type="text"
                            value={form.name}
                            onChange={e => update('name', e.target.value)}
                            className="forge-input"
                            placeholder="Your name"
                            aria-invalid={!!errors.name}
                          />
                          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label htmlFor="email" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={e => update('email', e.target.value)}
                            className="forge-input"
                            placeholder="you@email.com"
                            aria-invalid={!!errors.email}
                          />
                          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                      </div>

                      {/* Budget (for custom / B2B) */}
                      {(form.inquiryType === 'custom' || form.inquiryType === 'b2b') && (
                        <div className="animate-fade-in">
                          <label htmlFor="budget" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                            Estimated budget
                          </label>
                          <select
                            id="budget"
                            value={form.budget}
                            onChange={e => update('budget', e.target.value)}
                            className="forge-input cursor-pointer"
                          >
                            <option value="">Select a range</option>
                            <option value="under-200">Under $200</option>
                            <option value="200-500">$200 – $500</option>
                            <option value="500-1000">$500 – $1,000</option>
                            <option value="1000+">$1,000+</option>
                          </select>
                        </div>
                      )}

                      {/* Message */}
                      <div>
                        <label htmlFor="message" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                          Message
                        </label>
                        <textarea
                          id="message"
                          value={form.message}
                          onChange={e => update('message', e.target.value)}
                          className="forge-input min-h-[140px] resize-y"
                          placeholder="Tell us what you're dreaming up…"
                          aria-invalid={!!errors.message}
                        />
                        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                      </div>

                      <button type="submit" className="btn-primary w-full sm:w-auto justify-center py-3.5 text-base">
                        Send message <Send className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              </ScrollReveal>

              {/* Info sidebar */}
              <ScrollReveal delay={150}>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="text-heading-sm font-heading font-bold text-foreground mb-4">Direct contact</h3>
                    <div className="space-y-3">
                      <a href="mailto:twinforge.om@gmail.com" className="flex items-center gap-3 group">
                        <div className="p-2 rounded-md bg-[#F9733E]/10 group-hover:bg-[#F9733E] transition-colors">
                          <Mail className="w-4 h-4 text-[#F9733E] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-semibold text-foreground">twinforge.om@gmail.com</p>
                        </div>
                      </a>
                      <a href="tel:+96891232926" className="flex items-center gap-3 group">
                        <div className="p-2 rounded-md bg-[#F9733E]/10 group-hover:bg-[#F9733E] transition-colors">
                          <Phone className="w-4 h-4 text-[#F9733E] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone / WhatsApp</p>
                          <p className="text-sm font-semibold text-foreground">+968 91232926</p>
                        </div>
                      </a>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-[#F9733E]/10">
                          <MapPin className="w-4 h-4 text-[#F9733E]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Workshop</p>
                          <p className="text-sm font-semibold text-foreground">Made in Oman</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-[#F9733E]/10">
                          <Clock className="w-4 h-4 text-[#F9733E]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Response time</p>
                          <p className="text-sm font-semibold text-foreground">1–2 business days</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#F9733E]/30 bg-[#F9733E]/5 p-6">
                    <Sparkles className="w-6 h-6 text-[#F9733E] mb-3" />
                    <h3 className="text-heading-sm font-heading font-bold text-foreground mb-2">Full custom project?</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      Have something completely different in mind? We take on a limited number
                      of full custom builds each quarter — from one-off display pieces to small
                      production runs.
                    </p>
                    <button
                      onClick={() => update('inquiryType', 'custom')}
                      className="text-sm font-semibold text-[#F9733E] hover:underline"
                    >
                      Request a quote →
                    </button>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-6">
                    <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">Shipping & returns</h3>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li>· Built-to-order: 5–8 day lead time</li>
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

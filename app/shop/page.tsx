'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ProductModelViewer } from '@/components/ProductModelViewer';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Check, ArrowRight, ShoppingBag, Wrench } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { useCart } from '@/components/cart-context';
import { formatPrice } from '@/lib/configurator';

interface Product {
  id: string;
  name: string;
  category: 'trainer' | 'shell';
  price: number;
  status: 'available' | 'coming-soon';
  model?: string;
  material: string;
  customLevel: 'full' | 'partial' | 'fixed';
  features: string[];
  desc: string;
  tag?: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'butterfly-trainer',
    name: 'Butterfly Trainer',
    category: 'trainer',
    price: 34,
    status: 'available',
    model: '/assets/models/1_Honeycomb_Pattern_Handles_+_Improved.glb',
    material: 'PLA plastic',
    customLevel: 'full',
    features: ['Fully customizable', 'Honeycomb or arrow grip', 'Safe PLA plastic', 'Tunable balance'],
    desc: 'Our flagship. A fully customizable 3D-printed PLA butterfly trainer. Pick your blade shape, handle pattern, colors, hardware, and weight.',
    tag: 'Bestseller',
  },
  {
    id: 'viper-mini-shell',
    name: 'Viper Mini Shell Mod',
    category: 'shell',
    price: 17,
    status: 'coming-soon',
    material: 'PLA plastic',
    customLevel: 'partial',
    features: ['Viper Mini compatible', 'Custom colors', 'Lighter shell', 'Easy snap-fit'],
    desc: 'A custom replacement shell for the Viper Mini mouse. Color it your way. Launching soon.',
    tag: 'Coming soon',
  },
];

export default function ShopPage() {
  const { currencyCode } = useCurrency();
  const fmt = (omr: number) => formatPrice(omr, currencyCode);

  return (
    <>
      <Navigation />
      <main className="pt-16 min-h-screen bg-background">
        {/* Hero */}
        <section className="section-padding border-b border-border">
          <div className="container-max">
            <ScrollReveal className="max-w-2xl">
              <p className="text-xs font-semibold tracking-widest text-[#F9733E] uppercase mb-3">The Shop</p>
              <h1 className="text-display-md font-heading font-extrabold text-foreground">
                Custom 3D-printed hardware.
              </h1>
              <p className="text-lg text-muted-foreground mt-4">
                Made-to-order products, built in Oman and shipped worldwide.
                More custom products coming soon.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Product grid */}
        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRODUCTS.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 100}>
                  <ProductCard product={product} fmt={fmt} />
                </ScrollReveal>
              ))}

              {/* More coming soon card */}
              <ScrollReveal delay={PRODUCTS.length * 100}>
                <div className="h-full rounded-lg border border-dashed border-border bg-card/50 flex flex-col items-center justify-center p-10 text-center min-h-[420px]">
                  <div className="w-14 h-14 rounded-full bg-[#F9733E]/10 flex items-center justify-center mb-4">
                    <Wrench className="w-6 h-6 text-[#F9733E]" />
                  </div>
                  <h3 className="text-heading-md font-heading font-semibold text-foreground mb-2">
                    More coming soon
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    We&apos;re expanding the lineup with new custom products.
                    Fidget toys, accessories, and more — all 3D-printed and made to order.
                  </p>
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

function ProductCard({ product, fmt }: { product: Product; fmt: (n: number) => string }) {
  const isConfigurable = product.customLevel === 'full' && product.status === 'available';
  const { addItem } = useCart();

  return (
    <div className="product-card h-full rounded-lg border border-border bg-card overflow-hidden flex flex-col">
      <div className="relative h-64 bg-gradient-to-br from-muted/30 to-muted/5 dark:from-white/5 dark:to-transparent">
        {product.model ? (
          <ProductModelViewer
            src={product.model}
            alt={`${product.name} 3D render`}
            autoRotate
            autoRotateDelay={2000}
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
        {product.tag && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase bg-[#F9733E] text-white">
            {product.tag}
          </div>
        )}
        {product.status === 'coming-soon' && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase bg-foreground/80 text-background">
            Coming soon
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-heading-md font-heading font-semibold text-foreground">{product.name}</h3>
          <span className="price-tag text-lg text-[#F9733E] flex-shrink-0">{fmt(product.price)}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{product.desc}</p>

        <ul className="space-y-1.5 mb-6 flex-1">
          {product.features.map(f => (
            <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="w-3 h-3 text-[#F9733E] flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>

        {isConfigurable ? (
          <Link href="/configurator" className="btn-primary w-full justify-center text-sm py-3">
            Customize <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            disabled={product.status === 'coming-soon'}
            onClick={() => {
              if (product.status === 'available') {
                addItem({ id: product.id, name: product.name, price: product.price });
              }
            }}
            className="btn-primary w-full justify-center text-sm py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {product.status === 'coming-soon' ? 'Notify me' : 'Add to cart'}
          </button>
        )}
      </div>
    </div>
  );
}

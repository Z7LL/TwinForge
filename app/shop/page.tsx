'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ProductModelViewer } from '@/components/ProductModelViewer';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Check, ArrowRight, Filter, Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';
import { useCart } from '@/components/cart-context';
import { formatPrice } from '@/lib/configurator';

interface Product {
  id: string;
  name: string;
  category: 'trainer' | 'shell' | 'fidget' | 'accessory';
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
    features: ['Honeycomb grip', 'Safe PLA plastic', 'Tunable balance'],
    desc: 'The flagship. Fully customizable 3D-printed PLA butterfly trainer. Safe for all ages.',
    tag: 'Bestseller',
  },
  {
    id: 'arrow-trainer',
    name: 'Arrow Handle Trainer',
    category: 'trainer',
    price: 37,
    status: 'available',
    model: '/assets/models/1_Arrow_Pattern_Handles_+_Improved.glb',
    material: 'PLA plastic',
    customLevel: 'full',
    features: ['Serrated grip', 'Lightweight', 'Arrow pattern'],
    desc: 'Directional serrations for a locked-in feel.',
    tag: 'New',
  },
  {
    id: 'arrow-pro',
    name: 'Arrow Pro Trainer',
    category: 'trainer',
    price: 46,
    status: 'available',
    model: '/assets/models/2_Arrow_Pattern_Handles_+_Improved.glb',
    material: 'PLA plastic',
    customLevel: 'full',
    features: ['Reinforced', 'Heavier flip', 'Pro balance'],
    desc: 'Beefier build for momentum-driven tricks.',
    tag: 'Premium',
  },
  {
    id: 'viper-mini-shell',
    name: 'Viper Mini Shell Mod',
    category: 'shell',
    price: 17,
    status: 'coming-soon',
    material: 'PLA plastic',
    customLevel: 'partial',
    features: ['Viper Mini compatible', 'Custom colors', 'Lighter shell'],
    desc: 'Replacement shell for the Viper Mini mouse. Color it your way.',
  },
  {
    id: 'screw-kit',
    name: 'Screw & Pin Kit',
    category: 'accessory',
    price: 5,
    status: 'available',
    material: 'PLA plastic',
    customLevel: 'fixed',
    features: ['Hex / Torx / Flat', '3 colors', 'Spare pins'],
    desc: 'Full hardware refresh. Mix heads and colors.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'trainer', label: 'Trainers' },
  { id: 'shell', label: 'Shell Mods' },
  { id: 'fidget', label: 'Fidget' },
  { id: 'accessory', label: 'Accessories' },
];

const MATERIALS = ['all', 'PLA plastic'];
const CUSTOM_LEVELS = [
  { id: 'all', label: 'Any' },
  { id: 'full', label: 'Fully custom' },
  { id: 'partial', label: 'Partial' },
  { id: 'fixed', label: 'Fixed' },
];

export default function ShopPage() {
  const [category, setCategory] = useState('all');
  const [material, setMaterial] = useState('all');
  const [customLevel, setCustomLevel] = useState('all');
  const [maxPrice, setMaxPrice] = useState(60);
  const [showFilters, setShowFilters] = useState(false);
  const { currencyCode } = useCurrency();
  const fmt = (omr: number) => formatPrice(omr, currencyCode);

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (category !== 'all' && p.category !== category) return false;
      if (material !== 'all' && p.material !== material) return false;
      if (customLevel !== 'all' && p.customLevel !== customLevel) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
  }, [category, material, customLevel, maxPrice]);

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
                The current lineup.
              </h1>
              <p className="text-lg text-muted-foreground mt-4">
                Trainers, shell mods, fidget toys, and hardware. Built to order,
                shipped from the forge. Filter by what matters to you.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Filters + grid */}
        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
              {/* Filters sidebar */}
              <aside className="lg:sticky lg:top-20 self-start">
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                      <Filter className="w-4 h-4" /> Filters
                    </h2>
                    <button
                      onClick={() => { setCategory('all'); setMaterial('all'); setCustomLevel('all'); setMaxPrice(60); }}
                      className="text-xs text-muted-foreground hover:text-[#F9733E] transition-colors"
                    >
                      Clear
                    </button>
                  </div>

                  <FilterGroup label="Category">
                    <div className="flex flex-col gap-1.5">
                      {CATEGORIES.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setCategory(c.id)}
                          className={`text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                            category === c.id ? 'bg-[#F9733E]/10 text-[#F9733E] font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </FilterGroup>

                  <FilterGroup label="Material">
                    <div className="flex flex-col gap-1.5">
                      {MATERIALS.map(m => (
                        <button
                          key={m}
                          onClick={() => setMaterial(m)}
                          className={`text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                            material === m ? 'bg-[#F9733E]/10 text-[#F9733E] font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {m === 'all' ? 'Any material' : m}
                        </button>
                      ))}
                    </div>
                  </FilterGroup>

                  <FilterGroup label="Customization">
                    <div className="flex flex-col gap-1.5">
                      {CUSTOM_LEVELS.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setCustomLevel(c.id)}
                          className={`text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                            customLevel === c.id ? 'bg-[#F9733E]/10 text-[#F9733E] font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </FilterGroup>

                  <FilterGroup label={`Max price: ${fmt(maxPrice)}`}>
                    <input
                      type="range"
                      min={5}
                      max={60}
                      step={5}
                      value={maxPrice}
                      onChange={e => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#F9733E]"
                    />
                  </FilterGroup>
                </div>
              </aside>

              {/* Grid */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">{filtered.length} product{filtered.length !== 1 && 's'}</p>
                </div>

                {filtered.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-16 text-center">
                    <p className="text-muted-foreground">No products match these filters.</p>
                    <button onClick={() => { setCategory('all'); setMaterial('all'); setCustomLevel('all'); setMaxPrice(150); }} className="mt-3 text-sm font-semibold text-[#F9733E] hover:underline">
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((product, i) => (
                      <ScrollReveal key={product.id} delay={(i % 3) * 80}>
                        <ProductCard product={product} />
                      </ScrollReveal>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 pb-5 border-b border-border last:border-0 last:pb-0 last:mb-0">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">{label}</p>
      {children}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const isConfigurable = product.customLevel === 'full';
  const href = isConfigurable ? '/configurator' : '#';
  const { currencyCode } = useCurrency();
  const { addItem, openCart } = useCart();
  const fmt = (omr: number) => formatPrice(omr, currencyCode);

  return (
    <div className="product-card h-full rounded-lg border border-border bg-card overflow-hidden flex flex-col">
      <div className="relative h-56 bg-gradient-to-br from-muted/30 to-muted/5 dark:from-white/5 dark:to-transparent">
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

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-heading-sm font-heading font-semibold text-foreground">{product.name}</h3>
          <span className="price-tag text-lg text-[#F9733E] flex-shrink-0">{fmt(product.price)}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{product.desc}</p>

        <ul className="space-y-1 mb-4 flex-1">
          {product.features.map(f => (
            <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="w-3 h-3 text-[#F9733E] flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {isConfigurable ? (
            <Link href={href} className="btn-primary flex-1 justify-center text-xs py-2.5">
              Customize <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <button
              disabled={product.status === 'coming-soon'}
              onClick={() => {
                if (product.status === 'available') {
                  addItem({ id: product.id, name: product.name, price: product.price });
                }
              }}
              className="btn-primary flex-1 justify-center text-xs py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {product.status === 'coming-soon' ? 'Notify me' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

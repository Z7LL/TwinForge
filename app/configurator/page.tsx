'use client';

import { useState, useEffect, useMemo, useRef, useCallback, ReactNode } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ButterflyViewer, type ButterflyViewerHandle } from '@/components/ButterflyViewer';
import {
  calculatePrice,
  calculateLeadDays,
  estimateShipDate,
  buildShareUrl,
  COLOR_SWATCHES,
  HANDLE_STYLES,
  BLADE_SHAPES,
  BLADE_FINISHES,
  SCREWS_COLORS,
  WEIGHTS,
  DEFAULT_CONFIG,
  BUTTERFLY_GLB_PATH,
  getColorHex,
  formatPrice,
  parseConfigFromUrl,
  handleUnitPrice,
  bladeUnitPrice,
  screwsUnitPrice,
  type ConfigState,
} from '@/lib/configurator';
import { useCurrency } from '@/hooks/use-currency';
import { useCart } from '@/components/cart-context';
import { RotateCcw, ZoomIn, ZoomOut, Share2, ShoppingCart, Check, Shield, Clock, Sparkles } from 'lucide-react';

export default function ConfiguratorPage() {
  const { currencyCode } = useCurrency();
  const { addItem } = useCart();
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
  const [shareCopied, setShareCopied] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const viewerRef = useRef<ButterflyViewerHandle>(null);

  useEffect(() => {
    const parsed = parseConfigFromUrl();
    if (parsed) setConfig(prev => ({ ...prev, ...parsed }));
  }, []);

  const { total, breakdown } = useMemo(() => calculatePrice(config), [config]);
  const leadDays = useMemo(() => calculateLeadDays(config), [config]);
  const shipDate = useMemo(() => estimateShipDate(leadDays), [leadDays]);

  const update = useCallback((key: keyof ConfigState, value: string) => {
    setConfig(prev => ({ ...prev, [key]: key === 'extraScrewKit' ? value === 'true' : value }));
    setAddedToCart(false);
  }, []);

  const reset = () => {
    setConfig(DEFAULT_CONFIG);
    setAddedToCart(false);
  };

  const share = async () => {
    const url = buildShareUrl(config);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
      if (typeof window !== 'undefined') window.history.replaceState(null, '', url);
    } catch {
      window.prompt('Copy this link to share:', url);
    }
  };

  const addToCart = () => {
    const handleStyleName = HANDLE_STYLES.find(h => h.id === config.handleStyle)?.name || config.handleStyle;
    const bladeShapeName = BLADE_SHAPES.find(b => b.id === config.bladeShape)?.displayName || config.bladeShape;
    const handleColorName = COLOR_SWATCHES.find(c => c.id === config.handleColor)?.name || config.handleColor;
    const handle2ColorName = COLOR_SWATCHES.find(c => c.id === config.biteHandleColor)?.name || config.biteHandleColor;
    const weightName = WEIGHTS.find(w => w.id === config.weight)?.name || config.weight;

    addItem({
      id: `trainer-${Date.now()}`,
      name: 'Custom Butterfly Trainer',
      price: total,
      url: buildShareUrl(config),
      config: {
        handleStyle: handleStyleName,
        bladeShape: bladeShapeName,
        handleColor: handleColorName,
        handle2Color: handle2ColorName,
        weight: weightName,
      },
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const zoom = (dir: 'in' | 'out') => {
    if (dir === 'in') viewerRef.current?.zoomIn();
    else viewerRef.current?.zoomOut();
  };

  const handle1Hex = getColorHex(config.handleColor);
  const handle2Hex = getColorHex(config.biteHandleColor);
  const bladeHex = getColorHex(config.bladeFinish);
  const screwsHex = getColorHex(config.screwsColor);
  const fmt = (omr: number) => formatPrice(omr, currencyCode);

  return (
    <>
      <Navigation />
      <main className="pt-16 min-h-screen bg-background">
        <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-16 z-30">
          <div className="container-max px-6 md:px-12 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-heading-md font-heading font-bold text-foreground">Butterfly Trainer Configurator</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Build your TwinForge balisong with live color updates, blade styling, and a warm product preview.
                </p>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>

        <div className="container-max px-6 md:px-12 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            <div className="lg:sticky lg:top-[140px] self-start">
              <div className="relative rounded-2xl overflow-hidden h-[380px] sm:h-[480px] lg:h-[640px] shadow-[0_24px_64px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.08]">
                <ButterflyViewer
                  ref={viewerRef}
                  glbSrc={BUTTERFLY_GLB_PATH}
                  handleStyle={config.handleStyle}
                  bladeShape={config.bladeShape}
                  handle1Hex={handle1Hex}
                  handle2Hex={handle2Hex}
                  bladeHex={bladeHex}
                  screwsHex={screwsHex}
                  className="absolute inset-0"
                />

                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <button onClick={() => zoom('in')} className="p-2 rounded-md bg-white/85 backdrop-blur border border-[#edd4b6] hover:border-[#F9733E] transition-colors" aria-label="Zoom in">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={() => zoom('out')} className="p-2 rounded-md bg-white/85 backdrop-blur border border-[#edd4b6] hover:border-[#F9733E] transition-colors" aria-label="Zoom out">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full bg-white/82 backdrop-blur border border-[#efd2ad] z-10">
                  <Sparkles className="w-3.5 h-3.5 text-[#F9733E]" />
                  <span className="text-xs font-semibold text-[#6d4b2f]">Live preview</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <Section title="Blade" desc="Choose from the real blade variants used in the 3D model.">
                <Label>Blade shape</Label>
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {BLADE_SHAPES.map(opt => (
                    <OptionCard
                      key={opt.id}
                      active={config.bladeShape === opt.id}
                      onClick={() => update('bladeShape', opt.id)}
                      title={opt.displayName || opt.name}
                      desc={opt.desc}
                      priceDelta={bladeUnitPrice(opt.id, config.bladeFinish)}
                      priceFormatter={fmt}
                    />
                  ))}
                </div>

                <Label>Blade color</Label>
                <div className="grid grid-cols-2 gap-3">
                  {BLADE_FINISHES.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => update('bladeFinish', opt.id)}
                      className={`p-3 rounded-md border-2 text-left transition-all duration-200 ${
                        config.bladeFinish === opt.id
                          ? 'border-[#F9733E] bg-[#F9733E]/5'
                          : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <div className="w-full h-8 rounded mb-2" style={{ backgroundColor: opt.hex || '#54565A' }} />
                      <p className="text-sm font-semibold text-foreground">{opt.name}</p>
                      <p className="text-xs text-[#F9733E] font-semibold mt-0.5">{fmt(bladeUnitPrice(config.bladeShape, opt.id))}</p>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Handles" desc="Pick your handle texture, then customize left and right colors separately. Same color for both handles costs more per handle; different colors cost less.">
                <Label>Handle pattern</Label>
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {HANDLE_STYLES.map(opt => (
                    <OptionCard
                      key={opt.id}
                      active={config.handleStyle === opt.id}
                      onClick={() => update('handleStyle', opt.id)}
                      title={opt.name}
                      desc={opt.desc}
                    />
                  ))}
                </div>

                <Label>Left handle color</Label>
                <ColorPicker
                  selectedId={config.handleColor}
                  onSelect={id => update('handleColor', id)}
                  priceForColor={(id) => handleUnitPrice(config.handleStyle, id, id === config.biteHandleColor)}
                  priceFormatter={fmt}
                />

                <div className="mt-6">
                  <Label>Right handle color</Label>
                  <ColorPicker
                    selectedId={config.biteHandleColor}
                    onSelect={id => update('biteHandleColor', id)}
                    priceForColor={(id) => handleUnitPrice(config.handleStyle, id, id === config.handleColor)}
                    priceFormatter={fmt}
                  />
                </div>
              </Section>

              <Section title="Hardware" desc="Screws, pins, and washers — included with every knife (2 screws + 4 washers).">
                <Label>Hardware color</Label>
                <div className="flex flex-wrap gap-2 mb-6">
                  {SCREWS_COLORS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => update('screwsColor', opt.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 transition-all duration-200 ${
                        config.screwsColor === opt.id ? 'border-[#F9733E] bg-[#F9733E]/5' : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: opt.hex }} />
                      <span className="text-sm font-semibold text-foreground">{opt.name}</span>
                      <span className="text-xs text-[#F9733E] font-semibold">{fmt(screwsUnitPrice(opt.id))}</span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Balance" desc="Choose the feel you want in hand, from light and agile to heavy and planted.">
                <Label>Weight & balance</Label>
                <div className="grid grid-cols-1 gap-3">
                  {WEIGHTS.map(opt => (
                    <OptionCard
                      key={opt.id}
                      active={config.weight === opt.id}
                      onClick={() => update('weight', opt.id)}
                      title={opt.name}
                      priceDelta={opt.price}
                      priceFormatter={fmt}
                      desc={opt.desc}
                    />
                  ))}
                </div>
              </Section>

              {/* Extra Screw & Pin Kit add-on */}
              <div className="rounded-xl border-2 border-border bg-card p-5 transition-all duration-200 hover:border-foreground/20">
                <button
                  onClick={() => update('extraScrewKit', config.extraScrewKit ? 'false' : 'true')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      config.extraScrewKit ? 'border-[#F9733E] bg-[#F9733E]' : 'border-border'
                    }`}>
                      {config.extraScrewKit && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Extra Screw &amp; Pin Kit</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        A spare set of screws, pins, and washers for quick swaps or replacements.
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#F9733E] flex-shrink-0 ml-3">+{fmt(5)}</span>
                </button>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Your build</span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {leadDays} day lead
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="price-tag text-3xl text-foreground">{fmt(total)}</span>
                    <span className="text-xs text-muted-foreground">est. ship {shipDate}</span>
                  </div>
                </div>

                <div className="p-6 space-y-2 max-h-[240px] overflow-y-auto">
                  {breakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.price === 0 ? 'incl.' : `+${fmt(item.price)}`}</span>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-border space-y-2">
                  <button onClick={addToCart} className={`btn-primary w-full justify-center ${addedToCart ? '!bg-green-600' : ''}`}>
                    {addedToCart ? (<><Check className="w-4 h-4" /> Added to cart</>) : (<><ShoppingCart className="w-4 h-4" /> Add to cart · {fmt(total)}</>)}
                  </button>
                  <button onClick={share} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold border border-border rounded-md hover:border-[#F9733E] transition-colors">
                    {shareCopied ? <><Check className="w-3.5 h-3.5 text-green-600" /> Copied</> : <><Share2 className="w-3.5 h-3.5" /> Share build link</>}
                  </button>
                </div>

                <div className="px-6 pb-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-[#F9733E]" />
                  3D-printed PLA trainer · Made to order
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-heading-md font-heading font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-6">{desc}</p>
      {children}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">{children}</p>;
}

function OptionCard({
  active, onClick, title, priceDelta, desc, compact, priceFormatter,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  priceDelta?: number;
  desc?: string;
  compact?: boolean;
  priceFormatter?: (n: number) => string;
}) {
  const fmt = priceFormatter || ((n: number) => `+$${n}`);
  return (
    <button
      onClick={onClick}
      className={`relative text-left p-4 rounded-md border-2 transition-all duration-200 ${
        active ? 'border-[#F9733E] bg-[#F9733E]/5' : 'border-border hover:border-foreground/30'
      }`}
    >
      {active && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-[#F9733E]" />}
      <p className={`font-semibold text-foreground ${compact ? 'text-sm' : 'text-base'}`}>{title}</p>
      {desc && !compact && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>}
      {desc && compact && <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>}
      {priceDelta !== undefined && priceDelta > 0 && <p className="text-xs text-[#F9733E] font-semibold mt-1.5">+{fmt(priceDelta)}</p>}
      {priceDelta !== undefined && priceDelta === 0 && <p className="text-xs text-muted-foreground font-semibold mt-1.5">included</p>}
    </button>
  );
}

function ColorPicker({
  selectedId,
  onSelect,
  priceForColor,
  priceFormatter,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  priceForColor?: (id: string) => number;
  priceFormatter?: (n: number) => string;
}) {
  const fmt = priceFormatter || ((n: number) => `${n}`);
  return (
    <div className="flex flex-wrap items-center gap-3">
      {COLOR_SWATCHES.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`flex flex-col items-center gap-1 group`}
          aria-label={c.name}
          title={c.name}
        >
          <div
            className={`color-swatch ${selectedId === c.id ? 'active' : ''}`}
            style={{ backgroundColor: c.hex }}
          />
          {priceForColor && (
            <span className={`text-[10px] font-semibold ${selectedId === c.id ? 'text-[#F9733E]' : 'text-muted-foreground'}`}>
              {fmt(priceForColor(c.id))}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

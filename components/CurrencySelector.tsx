'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { CURRENCIES } from '@/lib/configurator';
import { useCurrency } from '@/hooks/use-currency';

export function CurrencySelector({ variant = 'nav' }: { variant?: 'nav' | 'footer' }) {
  const { currency, currencyCode, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const textColor = variant === 'nav' ? '' : 'text-white/60 hover:text-white';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-sm font-semibold ${textColor} transition-colors px-2 py-1 rounded-md hover:bg-foreground/5`}
        aria-label="Select currency"
      >
        <span className="text-xs">{currency.symbol}</span>
        <span>{currency.code}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-lg border border-border bg-popover shadow-lg z-50 overflow-hidden">
          <div className="p-1.5">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase px-2 py-1.5">Gulf</p>
            {CURRENCIES.filter(c => ['OMR', 'AED', 'SAR', 'KWD', 'QAR', 'BHD'].includes(c.code)).map(c => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setOpen(false); }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                  currencyCode === c.code ? 'bg-[#F9733E]/10 text-[#F9733E] font-semibold' : 'hover:bg-muted text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs w-6">{c.symbol}</span>
                  {c.name}
                </span>
                <span className="text-xs text-muted-foreground">{c.code}</span>
              </button>
            ))}
            <div className="border-t border-border my-1" />
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase px-2 py-1.5">International</p>
            {CURRENCIES.filter(c => ['EUR', 'USD'].includes(c.code)).map(c => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setOpen(false); }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                  currencyCode === c.code ? 'bg-[#F9733E]/10 text-[#F9733E] font-semibold' : 'hover:bg-muted text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs w-6">{c.symbol}</span>
                  {c.name}
                </span>
                <span className="text-xs text-muted-foreground">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

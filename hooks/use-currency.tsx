'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { CURRENCIES, DEFAULT_CURRENCY, type Currency } from '@/lib/configurator';

const STORAGE_KEY = 'twinforge-currency';

interface CurrencyContextValue {
  currency: Currency;
  currencyCode: string;
  setCurrency: (code: string) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<string>(DEFAULT_CURRENCY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && CURRENCIES.some(c => c.code === stored)) {
        setCurrencyCode(stored);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyCode(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  }, []);

  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  return (
    <CurrencyContext.Provider value={{ currency, currencyCode, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

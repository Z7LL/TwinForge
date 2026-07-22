'use client';

import { useState, useEffect, useCallback } from 'react';
import { CURRENCIES, DEFAULT_CURRENCY, type Currency } from '@/lib/configurator';

const STORAGE_KEY = 'twinforge-currency';

export function useCurrency() {
  const [currencyCode, setCurrencyCode] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && CURRENCIES.some(c => c.code === stored)) {
        setCurrencyCode(stored);
      }
    } catch {}
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyCode(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  }, []);

  const currency: Currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  return { currency, currencyCode, setCurrency };
}

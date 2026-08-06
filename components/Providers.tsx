'use client';

import { ThemeProvider } from 'next-themes';
import { CartProvider } from '@/components/cart-context';
import { CartDrawer } from '@/components/CartDrawer';
import { CurrencyProvider } from '@/hooks/use-currency';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      <CurrencyProvider>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

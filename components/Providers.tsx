'use client';

import { ThemeProvider } from 'next-themes';
import { CartProvider } from '@/components/cart-context';
import { CartDrawer } from '@/components/CartDrawer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <CartProvider>
        {children}
        <CartDrawer />
      </CartProvider>
    </ThemeProvider>
  );
}

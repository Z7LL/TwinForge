'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag, Zap } from 'lucide-react';
import { CurrencySelector } from '@/components/CurrencySelector';
import { useCart } from '@/components/cart-context';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navigation() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isHome = pathname === '/';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container-wide px-6 md:px-12">
          <nav className="flex items-center justify-between h-16 md:h-18">
            <Link href="/" className="flex items-center gap-2 group" aria-label="Twin Forge Co.">
              <Image
                src="/assets/images/Twin_forge_logo.png"
                alt="Twin Forge Co."
                width={140}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link transition-colors duration-200 ${
                    pathname === link.href ? 'active text-foreground' : ''
                  } ${isHome && !scrolled ? '!text-foreground/80 hover:!text-foreground' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:block">
                <CurrencySelector />
              </div>

              <button
                onClick={openCart}
                className="relative p-2.5 rounded-lg transition-all duration-200 hover:bg-foreground/10 text-foreground"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#F9733E] text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <Link
                href="/shop"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 hover:-translate-y-0.5 bg-[#F9733E] text-white hover:bg-[#e85e28] hover:shadow-lg hover:shadow-[#F9733E]/30"
              >
                <Zap className="w-3.5 h-3.5" />
                Start Your Build
              </Link>

              <button
                className="md:hidden p-2.5 rounded-lg transition-colors text-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background animate-fade-in md:hidden">
          <div className="flex flex-col h-full pt-20 px-6 pb-8">
            <nav className="flex flex-col gap-1 flex-1">
              {navLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-4 text-2xl font-heading font-bold border-b border-border/50 transition-colors duration-200 hover:text-[#F9733E] ${
                    pathname === link.href ? 'text-[#F9733E]' : 'text-foreground'
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <CurrencySelector />
            </div>

            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full justify-center py-4 text-base"
            >
              <Zap className="w-4 h-4" />
              Start Your Build
            </Link>
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-light border-t border-border/50 px-4 py-3 flex items-center gap-3">
        <Link href="/shop" className="btn-primary flex-1 justify-center py-3 text-sm">
          <Zap className="w-4 h-4" />
          Start Your Build
        </Link>
        <button
          onClick={openCart}
          className="relative p-3 rounded-lg border border-border bg-card text-foreground"
          aria-label="Open cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#F9733E] text-white text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </>
  );
}

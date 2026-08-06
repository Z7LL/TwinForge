'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag, ArrowUpRight } from 'lucide-react';
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
            ? 'bg-background/70 backdrop-blur-xl border-b border-border/70'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        {/* Slim announcement strip — collapses on scroll */}
        <div
          className={`overflow-hidden border-b border-border/40 transition-all duration-500 ${
            scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
          }`}
        >
          <div className="container-wide px-6 md:px-12">
            <p className="label-mono text-center text-muted-foreground py-2.5 text-[0.625rem]">
              Design it. Tune it. Hold it. &nbsp;·&nbsp; 3D-crafted in Oman, shipped worldwide
            </p>
          </div>
        </div>

        <div className="container-wide px-6 md:px-12">
          <nav className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Twin Forge Co.">
              <Image
                src="/assets/images/Twin_forge_logo.png"
                alt="Twin Forge Co."
                width={140}
                height={48}
                className="h-9 md:h-10 w-auto object-contain"
                priority
              />
            </Link>

            <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? 'active !text-foreground' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
              <div className="hidden sm:block">
                <CurrencySelector />
              </div>

              <button
                onClick={openCart}
                className="relative p-2.5 rounded-full transition-all duration-200 hover:bg-foreground/5 text-foreground"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-[1.15rem] h-[1.15rem]" strokeWidth={1.6} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#F9733E] text-white text-[10px] font-semibold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <Link
                href="/shop"
                className="hidden md:inline-flex items-center gap-1.5 pl-5 pr-4 py-2.5 text-sm font-medium rounded-full transition-all duration-300 hover:-translate-y-0.5 bg-foreground text-background hover:shadow-forge-lg"
              >
                Start Your Build
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.8} />
              </Link>

              <button
                className="md:hidden p-2.5 rounded-full transition-colors text-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.6} /> : <Menu className="w-5 h-5" strokeWidth={1.6} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background animate-fade-in md:hidden">
          <div className="flex flex-col h-full pt-24 px-6 pb-8">
            <p className="eyebrow mb-6">Menu</p>
            <nav className="flex flex-col flex-1">
              {navLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-5 text-3xl font-heading font-semibold border-b border-border/60 transition-colors duration-200 ${
                    pathname === link.href ? 'text-[#F9733E]' : 'text-foreground'
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {link.label}
                  <ArrowUpRight className="w-6 h-6 opacity-30" strokeWidth={1.5} />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 mb-4 mt-6">
              <span className="label-mono text-muted-foreground">Currency</span>
              <CurrencySelector />
            </div>

            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="btn-accent w-full justify-center py-4 text-base"
            >
              Start Your Build
              <ArrowUpRight className="w-4 h-4" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-light border-t border-border/60 px-4 py-3 flex items-center gap-3">
        <Link href="/shop" className="btn-accent flex-1 justify-center py-3 text-sm">
          Start Your Build
          <ArrowUpRight className="w-4 h-4" strokeWidth={1.8} />
        </Link>
        <button
          onClick={openCart}
          className="relative p-3 rounded-full border border-border bg-card text-foreground"
          aria-label="Open cart"
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={1.6} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#F9733E] text-white text-[10px] font-semibold flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </>
  );
}

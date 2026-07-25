'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, X, ShoppingBag } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
  // Only force white text on home hero when in dark theme (hero bg is dark)
  // In light theme the hero bg is white, so text must stay dark
  const forceWhite = isHome && !scrolled && !mobileOpen && mounted && theme === 'dark';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHome
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container-max px-6 md:px-12">
          <nav className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group" aria-label="Twin Forge Co.">
              <div className={`flex items-center transition-opacity duration-200 ${forceWhite ? 'opacity-90 hover:opacity-100' : ''}`}>
                <Image
                  src="/assets/images/Twin_forge_logo.png"
                  alt="Twin Forge Co."
                  width={140}
                  height={48}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link transition-colors duration-200 ${
                    pathname === link.href ? 'active text-foreground' : ''
                  } ${forceWhite ? '!text-white/80 hover:!text-white' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Currency selector */}
              <div className={forceWhite ? '[&_*]:!text-white/80 [&_button:hover]:!text-white' : ''}>
                <CurrencySelector />
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                className={`relative p-2 rounded-md transition-all duration-200 hover:bg-foreground/10 ${forceWhite ? 'text-white' : 'text-foreground'}`}
                aria-label="Open cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#F9733E] text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`p-2 rounded-md transition-all duration-200 hover:bg-foreground/10 ${forceWhite ? 'text-white' : 'text-foreground'}`}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}

              {/* CTA */}
              <Link
                href="/shop"
                className={`hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 hover:-translate-y-0.5 ${
                  forceWhite
                    ? 'bg-[#F9733E] text-white hover:bg-[#e85e28]'
                    : 'bg-[#F9733E] text-white hover:bg-[#e85e28]'
                }`}
              >
                Shop
              </Link>

              {/* Mobile menu toggle */}
              <button
                className={`md:hidden p-2 rounded-md transition-colors ${forceWhite ? 'text-white' : 'text-foreground'}`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background animate-fade-in">
          <div className="flex flex-col h-full pt-20 px-6 pb-8">
            <nav className="flex flex-col gap-1 flex-1">
              {navLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-4 text-xl font-heading font-semibold border-b border-border transition-colors duration-200 hover:text-[#F9733E] ${
                    pathname === link.href ? 'text-[#F9733E]' : 'text-foreground'
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full justify-center mt-6 py-4 text-base"
            >
              Browse the Shop
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

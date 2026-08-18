/* Atelier Flipbook: the navigation is a light workbench rail—precise, paper-based, and built around the live configurator. */
'use client';

import { useState, useEffect } from 'react';
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
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header className={`tf-nav ${scrolled || pathname !== '/' ? 'tf-nav--solid' : ''}`}>
        <div className="tf-nav__inner"><nav className="tf-nav__row">
          <Link href="/" className="tf-brand" aria-label="TwinForge home"><img src="/assets/editorial/twinforge-mark.png" alt="" aria-hidden="true" /><span>TWIN<span>FORGE</span></span></Link>
          <div className="tf-nav__links">{navLinks.map((link) => <Link key={link.href} href={link.href} className={`tf-nav__link ${pathname === link.href ? 'is-active' : ''}`}>{link.label}</Link>)}</div>
          <div className="tf-nav__actions">
            <div className="tf-nav__currency"><CurrencySelector /></div>
            <button onClick={openCart} className="tf-cart-button" aria-label="Open cart"><ShoppingBag size={16} />{totalItems > 0 && <span className="tf-cart-button__count">{totalItems}</span>}</button>
            <Link href="/configurator" className="tf-nav__build">BUILD YOURS <ArrowUpRight size={15} /></Link>
            <button className="tf-menu-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
        </nav></div>
      </header>

      {mobileOpen && <div className="tf-mobile-menu"><div className="tf-mobile-menu__inner">
        <nav>{navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`tf-mobile-menu__link ${pathname === link.href ? 'is-active' : ''}`}>{link.label}</Link>)}</nav>
        <div className="tf-mobile-menu__currency"><CurrencySelector /></div>
        <Link href="/configurator" onClick={() => setMobileOpen(false)} className="tf-ink-button">OPEN THE BUILD SHEET <ArrowUpRight size={17} /></Link>
      </div></div>}
    </>
  );
}

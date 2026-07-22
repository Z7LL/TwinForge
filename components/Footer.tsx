'use client';

import Link from 'next/link';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { CurrencySelector } from '@/components/CurrencySelector';

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      {/* Top section */}
      <div className="section-padding border-b border-white/10">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img src="/assets/images/hammer_copy.png" alt="Twin Forge" className="w-7 h-7 object-contain" />
                <span className="font-display text-2xl font-bold tracking-wider">
                  TWIN <span className="text-[#F9733E]">FORGE</span>{' '}
                  <span className="text-sm text-white/40 font-medium align-middle">CO.</span>
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-6">
                Two brothers. A printer. A desire to make custom objects that feel personal.
                We design 3D-printed PLA trainers for flippers, gamers, and makers of all ages.
                Made in Oman. Shipped worldwide.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" aria-label="Instagram" className="p-2 rounded-md text-white/40 hover:text-[#F9733E] hover:bg-white/5 transition-all duration-200">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Twitter" className="p-2 rounded-md text-white/40 hover:text-[#F9733E] hover:bg-white/5 transition-all duration-200">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" aria-label="YouTube" className="p-2 rounded-md text-white/40 hover:text-[#F9733E] hover:bg-white/5 transition-all duration-200">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-heading font-semibold text-sm tracking-widest text-white/40 uppercase mb-4">Products</h3>
              <ul className="space-y-3">
                {['Butterfly Trainer', 'Arrow Handle', 'Honeycomb Handle', 'Viper Mini Shell', 'Fidget Collection', 'Accessories'].map(item => (
                  <li key={item}>
                    <Link href="/shop" className="text-sm text-white/60 hover:text-[#F9733E] transition-colors duration-200">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-heading font-semibold text-sm tracking-widest text-white/40 uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Configurator', href: '/configurator' },
                  { label: 'Shop', href: '/shop' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Custom Orders', href: '/contact#custom' },
                  { label: 'Shipping Policy', href: '#' },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-white/60 hover:text-[#F9733E] transition-colors duration-200">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className="px-6 py-4 bg-black/30">
        <div className="container-max flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Twin Forge Co. · Made in Oman · All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-white/30 text-xs">Currency:</span>
            <CurrencySelector variant="footer" />
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

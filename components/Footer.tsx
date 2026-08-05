'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Mail, Phone } from 'lucide-react';
import { CurrencySelector } from '@/components/CurrencySelector';

export function Footer() {
  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-[#F9733E]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-80 h-80 rounded-full bg-[#F9733E]/10 blur-3xl pointer-events-none" />

      <div className="section-padding border-b border-background/10 relative">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <Image
                  src="/assets/images/Twin_forge_logo.png"
                  alt="Twin Forge Co."
                  width={160}
                  height={48}
                  className="h-12 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-background/60 text-sm leading-relaxed max-w-sm mb-6">
                Two brothers. A printer. A desire to make custom objects that feel personal.
                We design and 3D-print custom PLA products for gamers, flippers, and makers of all ages.
                Made in Oman. Shipped worldwide.
              </p>
              <div className="flex items-center gap-3">
                <a href="https://instagram.com/twinforge.om" target="_blank" rel="noopener noreferrer" aria-label="Instagram @twinforge.om" className="p-2.5 rounded-lg text-background/40 hover:text-[#F9733E] hover:bg-background/5 transition-all duration-200">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="mailto:twinforge.om@gmail.com" aria-label="Email Twin Forge" className="p-2.5 rounded-lg text-background/40 hover:text-[#F9733E] hover:bg-background/5 transition-all duration-200">
                  <Mail className="w-4 h-4" />
                </a>
                <a href="tel:+96891232926" aria-label="Call Twin Forge" className="p-2.5 rounded-lg text-background/40 hover:text-[#F9733E] hover:bg-background/5 transition-all duration-200">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-sm tracking-widest text-background/40 uppercase mb-4">Products</h3>
              <ul className="space-y-3">
                {['Butterfly Trainer', 'Viper Mini Shell Mod', 'Screw & Pin Kit', 'More coming soon'].map(item => (
                  <li key={item}>
                    <Link href="/shop" className="text-sm text-background/60 hover:text-[#F9733E] transition-colors duration-200">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-sm tracking-widest text-background/40 uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Shop', href: '/shop' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Custom Orders', href: '/contact#custom' },
                  { label: 'Filament Inventory', href: '/admin/filaments' },
                ].map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-background/60 hover:text-[#F9733E] transition-colors duration-200">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-black/20 relative">
        <div className="container-wide flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <p className="text-background/30 text-xs">
            © {new Date().getFullYear()} Twin Forge Co. · Made in Oman · All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-background/30 text-xs">Currency:</span>
            <CurrencySelector variant="footer" />
          </div>
          <div className="flex items-center gap-4 text-xs text-background/30">
            <a href="#" className="hover:text-background/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-background/60 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

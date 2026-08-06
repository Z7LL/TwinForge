'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { CurrencySelector } from '@/components/CurrencySelector';

const productLinks = ['Butterfly Trainer', 'Viper Mini Shell Mod', 'Screw & Pin Kit', 'More coming soon'];
const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Shop', href: '/shop' },
  { label: 'Contact', href: '/contact' },
  { label: 'Custom Orders', href: '/contact#custom' },
  { label: 'Filament Inventory', href: '/admin/filaments' },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Oversized brand statement */}
      <div className="container-wide px-6 md:px-12 pt-20 md:pt-28 pb-12 md:pb-16">
        <p className="label-mono text-[#F9733E] mb-6">Twin Forge Co. — Est. Oman</p>
        <h2 className="font-display font-semibold leading-[0.95] tracking-tight text-[clamp(2.25rem,7vw,5.5rem)] max-w-5xl text-balance">
          Design it. Tune it. Hold it.
        </h2>
      </div>

      <div className="border-t border-background/10">
        <div className="container-wide px-6 md:px-12 py-14 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Image
              src="/assets/images/Twin_forge_logo.png"
              alt="Twin Forge Co."
              width={160}
              height={48}
              className="h-11 w-auto object-contain brightness-0 invert mb-6"
            />
            <p className="text-background/55 text-sm leading-relaxed max-w-sm mb-8">
              Two brothers. A printer. A desire to make custom objects that feel personal.
              We design and 3D-print custom PLA products for gamers, flippers, and makers of all ages.
            </p>
            <div className="flex items-center gap-2">
              <a href="https://instagram.com/twinforge.om" target="_blank" rel="noopener noreferrer" aria-label="Instagram @twinforge.om" className="p-3 rounded-full border border-background/15 text-background/60 hover:text-[#F9733E] hover:border-[#F9733E]/40 transition-all duration-200">
                <Instagram className="w-4 h-4" strokeWidth={1.6} />
              </a>
              <a href="mailto:twinforge.om@gmail.com" aria-label="Email Twin Forge" className="p-3 rounded-full border border-background/15 text-background/60 hover:text-[#F9733E] hover:border-[#F9733E]/40 transition-all duration-200">
                <Mail className="w-4 h-4" strokeWidth={1.6} />
              </a>
              <a href="tel:+96891232926" aria-label="Call Twin Forge" className="p-3 rounded-full border border-background/15 text-background/60 hover:text-[#F9733E] hover:border-[#F9733E]/40 transition-all duration-200">
                <Phone className="w-4 h-4" strokeWidth={1.6} />
              </a>
            </div>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <h3 className="label-mono text-background/40 mb-5">Products</h3>
            <ul className="space-y-3.5">
              {productLinks.map(item => (
                <li key={item}>
                  <Link href="/shop" className="group inline-flex items-center gap-1.5 text-sm text-background/70 hover:text-background transition-colors duration-200">
                    {item}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-200" strokeWidth={1.6} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="label-mono text-background/40 mb-5">Company</h3>
            <ul className="space-y-3.5">
              {companyLinks.map(item => (
                <li key={item.label}>
                  <Link href={item.href} className="group inline-flex items-center gap-1.5 text-sm text-background/70 hover:text-background transition-colors duration-200">
                    {item.label}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-200" strokeWidth={1.6} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-wide px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="label-mono text-background/35 text-[0.625rem]">
            © {new Date().getFullYear()} Twin Forge Co. · Made in Oman
          </p>
          <div className="flex items-center gap-3">
            <span className="label-mono text-background/35 text-[0.625rem]">Currency</span>
            <CurrencySelector variant="footer" />
          </div>
          <div className="flex items-center gap-6 label-mono text-[0.625rem] text-background/35">
            <a href="#" className="hover:text-background/70 transition-colors">Privacy</a>
            <a href="#" className="hover:text-background/70 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

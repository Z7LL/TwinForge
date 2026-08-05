import type { Metadata } from 'next';
import './globals.css';
import './logo.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://twinforge.co'),
  title: 'Twin Forge Co. — Custom 3D-Crafted Hardware, Made by Two Brothers',
  description: 'Design it. Tune it. Hold it. Premium customizable EDCs, butterfly trainers, and mods — engineered and 3D-printed by two brothers.',
  keywords: ['butterfly trainer', 'balisong trainer', '3D printed', 'EDC', 'custom hardware', 'Twin Forge'],
  icons: { icon: '/assets/images/Favicon.png' },
  openGraph: { title: 'Twin Forge Co. — Custom 3D-Crafted Hardware', description: 'Premium customizable EDCs and mods, made by two brothers. Design it. Tune it. Hold it.', type: 'website', images: [{ url: '/og-image.jpg' }] },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /></head><body className="font-body antialiased bg-background text-foreground"><Providers>{children}</Providers></body></html>;
}

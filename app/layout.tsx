import type { Metadata } from 'next';
import { Bricolage_Grotesque, Inter, Geist_Mono } from 'next/font/google';
import './globals.css';
import './logo.css';
import { Providers } from '@/components/Providers';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${inter.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-body antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

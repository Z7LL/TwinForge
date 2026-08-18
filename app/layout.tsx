/* Atelier Flipbook: metadata and browser chrome match the premium paper-and-sketch TwinForge storefront. */
import type { Metadata } from 'next';
import './globals.css';
import './logo.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://twinforge.co'),
  title: 'TwinForge — Your Idea, Tuned by Hand',
  description: 'A custom-object studio in Oman. Shape a made-to-order 3D-printed build with TwinForge.',
  keywords: ['custom 3D printed products', 'customization', 'made in Oman', 'TwinForge', '3D printed objects'],
  icons: { icon: '/assets/editorial/twinforge-mark.png' },
  openGraph: { title: 'TwinForge — Your Idea, Tuned by Hand', description: 'Custom 3D-printed objects made to be yours.', type: 'website', images: [{ url: '/assets/editorial/twinforge-hero-atelier.png' }] },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /></head><body className="font-body antialiased bg-background text-foreground"><Providers>{children}</Providers></body></html>;
}

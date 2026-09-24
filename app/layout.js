import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://etsy-tag-generator.vercel.app'),
  title: 'Free Etsy SEO Listing & 13 Tag Generator | Rank Higher on Etsy',
  description:
    'Instantly generate optimized 140-character titles, all 13 ranking tags strictly under 20 characters, and complete descriptions for your Etsy listings. 100% free, copy with commas.',
  keywords: [
    'Etsy SEO',
    'Etsy tag generator',
    'Etsy 13 tags tool',
    'Etsy tags 20 character limit',
    'copy etsy tags with commas',
    'Etsy keyword tool free',
    'Etsy listing description generator',
    'Etsy seller tools',
    'Etsy ranking generator',
  ],
  alternates: {
    canonical: 'https://etsy-tag-generator.vercel.app',
  },
  openGraph: {
    title: 'Free Etsy SEO Listing & 13 Tag Generator',
    description:
      'Boost Etsy search rankings with AI-crafted titles, 13 compliant tag slots, and full product descriptions in seconds. 100% free.',
    url: 'https://etsy-tag-generator.vercel.app',
    siteName: 'Etsy SEO Generator',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Etsy SEO Listing & Tag Generator',
    description:
      'Generate 13 compliant Etsy tags under 20 characters and optimized titles instantly. Copy with commas in one click.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

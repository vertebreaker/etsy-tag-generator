import './globals.css';

export const metadata = {
  metadataBase: new URL('https://etsy-tag-generator.vercel.app'),
  title: 'Free Etsy SEO Listing & 13 Tag Generator | Rank Higher on Etsy',
  description: 'Instantly generate optimized 140-character titles, all 13 ranking tags under 20 characters, and complete plain-text descriptions for your Etsy listings for free.',
  keywords: ['Etsy SEO', 'Etsy tag generator', 'Etsy keyword tool', 'Etsy listing description generator', 'Etsy seller tools'],
  openGraph: {
    title: 'Free Etsy SEO Listing & 13 Tag Generator',
    description: 'Boost Etsy search rankings with AI-crafted titles, 13 tag slots, and full product descriptions in seconds. 100% free.',
    url: 'https://etsy-tag-generator.vercel.app',
    siteName: 'Etsy SEO Generator',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Etsy SEO Listing & Tag Generator',
    description: 'Generate 13 compliant Etsy tags and optimized titles instantly.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">{children}</body>
    </html>
  );
}

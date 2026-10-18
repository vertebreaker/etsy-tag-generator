import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://etsy-tag-generator.vercel.app'),
  title: 'Free Etsy Tag Generator & SEO Listing Audit Tool (2026)',
  description:
    'Generate 13 compliant tags under 20 chars and run a free Etsy listing SEO audit. Spot rank-killing tag errors and optimize your shop in seconds.',
  keywords: [
    'Etsy SEO',
    'Etsy tag generator',
    'Etsy listing audit',
    'Etsy SEO audit tool',
    'Etsy 13 tags tool',
    'Etsy tags 20 character limit',
    'copy etsy tags with commas',
    'Etsy keyword tool free',
    'Etsy listing description generator',
    'Etsy seller tools',
    'Etsy ranking generator',
    'Etsy tag checker',
  ],
  alternates: {
    canonical: 'https://etsy-tag-generator.vercel.app',
  },
  verification: {
    google: 'ysYgfyeSwlINtiBGeler3QdRcrGoVEWXay7Wfw-ieOs',
  },
  openGraph: {
    title: 'Free Etsy Tag Generator & SEO Listing Audit Tool',
    description:
      'Audit your Etsy listing health score and generate 13 high-ranking tags strictly under 20 characters in seconds. 100% free.',
    url: 'https://etsy-tag-generator.vercel.app',
    siteName: 'Etsy SEO Suite',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Etsy Tag Generator & SEO Listing Audit Tool',
    description:
      'Audit your Etsy listing health score and generate 13 compliant tags under 20 characters instantly.',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Etsy Tag Generator & SEO Listing Audit Tool',
  url: 'https://etsy-tag-generator.vercel.app',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Free Etsy SEO tool to audit listing health, detect tag character overages, and generate 13 algorithm-compliant long-tail tags under 20 characters.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

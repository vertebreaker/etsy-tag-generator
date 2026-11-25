import Link from 'next/link';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://etsy-tag-generator.pages.dev';

export const metadata = {
  metadataBase: new URL(SITE_URL),
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
    canonical: SITE_URL,
  },
  verification: {
    google: 'ysYgfyeSwlINtiBGeler3QdRcrGoVEWXay7Wfw-ieOs',
  },
  openGraph: {
    title: 'Free Etsy Tag Generator & SEO Listing Audit Tool',
    description:
      'Audit your Etsy listing health score and generate 13 high-ranking tags strictly under 20 characters in seconds. 100% free.',
    url: SITE_URL,
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
  url: SITE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Etsy Tag Generator & Listing Audit',
      price: '0',
      priceCurrency: 'USD',
    },
    {
      '@type': 'Offer',
      name: 'Full Etsy Listing Audit & Rewrite Pass',
      price: '9.99',
      priceCurrency: 'USD',
    },
  ],
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
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased flex flex-col justify-between">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 bg-white py-8 px-4 mt-16">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">Etsy SEO Suite</span> — Independent seller utility tool. Not affiliated with Etsy, Inc.
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-5">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Home
              </Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/refund" className="hover:text-slate-900 transition-colors">
                Refund Policy
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}

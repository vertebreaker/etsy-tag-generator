import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import niches from '../../../data/niches.json';
import EtsySeoSuite from '../../../components/EtsySeoSuite';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://etsy-tag-generator.pages.dev';

export async function generateStaticParams() {
  return niches.map((niche) => ({
    slug: niche.slug,
  }));
}

export async function generateMetadata({ params }) {
  const niche = niches.find((item) => item.slug === params.slug);

  if (!niche) {
    return {
      title: 'Etsy Category Tag Bank Not Found',
    };
  }

  const pageUrl = `${SITE_URL}/tags/${niche.slug}`;

  return {
    title: `${niche.title} (2026) | Free Etsy SEO Suite`,
    description: niche.metaDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: niche.title,
      description: niche.metaDescription,
      url: pageUrl,
      siteName: 'Etsy SEO Suite',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: niche.title,
      description: niche.metaDescription,
    },
  };
}

export default function NicheTagsPage({ params }) {
  const niche = niches.find((item) => item.slug === params.slug);

  if (!niche) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Loading {niche.nicheName} SEO Suite...
        </div>
      }
    >
      <EtsySeoSuite nicheData={niche} />
    </Suspense>
  );
}

import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Etsy SEO Suite',
  description: 'Terms of Service for Etsy Tag Generator & SEO Listing Audit Tool.',
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
        ← Back to Etsy SEO Suite
      </Link>
      <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Terms of Service</h1>
      <p className="text-xs text-slate-500 mb-8">Effective Date: November 2026</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">1. Service Scope</h2>
          <p>
            Etsy SEO Suite provides automated listing formatting, tag character validation (up to 13 tags at 20 characters each), and copy generation utilities for independent e-commerce sellers. We are an independent software utility and are not affiliated with, endorsed by, or sponsored by Etsy, Inc.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">2. Free & One-Time Paid Passes</h2>
          <p>
            The baseline tag generator, category tag banks, and listing character diagnostic are provided free of charge. The <strong>Full Listing Rewrite Pass ($9.99 USD)</strong> is a single, one-time digital utility purchase processed via our Merchant of Record, Dodo Payments, with no recurring subscription fees.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">3. Permissible Use & Seller Responsibility</h2>
          <p>
            You agree to use generated titles, tags, and descriptions solely for lawful, permissible products that comply with Etsy&apos;s Seller Policy and intellectual property laws. You remain responsible for reviewing all generated text before publishing to your shop.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">4. No Search Ranking Guarantees</h2>
          <p>
            Search placement and buyer conversion on third-party marketplaces depend on numerous external factors including photography, pricing, shop history, and buyer demand. While our tool formats listings according to published character and keyword guidelines, specific search rankings or sales volume cannot be guaranteed.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">5. Support & Contact</h2>
          <p>
            For order assistance or technical inquiries, contact us at{' '}
            <a href="mailto:creatiwitty086@gmail.com" className="text-orange-600 font-semibold underline">
              creatiwitty086@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}

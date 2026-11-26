import Link from 'next/link';

export const metadata = {
  title: 'Refund Policy | Etsy SEO Suite',
  description: 'Clear, fair refund policy for the Etsy SEO Full Listing Rewrite Pass.',
};

export default function RefundPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
        ← Back to Etsy SEO Suite
      </Link>
      <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Refund Policy</h1>
      <p className="text-xs text-slate-500 mb-8">Effective Date: November 2026</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">1. Transparent Digital Delivery</h2>
          <p>
            We provide a free Tag Generator, 25 free category tag banks, and a free Listing Audit tool so you can evaluate output quality before purchasing. The <strong>Full Listing Rewrite Pass ($9.99 USD)</strong> delivers your custom 140-character title, 13 compliant tags, and plain-text description immediately upon payment verification.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">2. When Refunds Are Issued</h2>
          <p>
            If a technical error prevents your paid rewrite from generating, if you were accidentally charged twice for the same session, or if the delivered output fails to meet the stated character specifications (140-character title limit and 20-character tag limit) and we cannot resolve it promptly, we will issue a full refund within 7 days of purchase.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">3. How to Request a Refund</h2>
          <p>
            Email your Dodo Payments receipt or Payment ID (<code>pay_...</code>) within 7 days of purchase to{' '}
            <a href="mailto:creatiwitty086@gmail.com" className="text-orange-600 font-semibold underline">
              creatiwitty086@gmail.com
            </a>{' '}
            and we will process your request promptly.
          </p>
        </section>
      </div>
    </main>
  );
}

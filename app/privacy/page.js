import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Etsy SEO Suite',
  description: 'Privacy Policy detailing our stateless, zero-tracking architecture.',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
        ← Back to Etsy SEO Suite
      </Link>
      <h1 className="text-3xl font-extrabold text-slate-900 mt-4 mb-2">Privacy Policy</h1>
      <p className="text-xs text-slate-500 mb-8">Effective Date: November 2026</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">1. Stateless Architecture & Data Minimization</h2>
          <p>
            Etsy SEO Suite operates on a stateless architecture. We do not require user accounts, passwords, or Etsy shop OAuth logins, and we do not maintain a user database of your listing titles or tags.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">2. Local Browser Storage</h2>
          <p>
            When you run a listing audit, your browser temporarily stores your last audited title and tags in your own device&apos;s <code>localStorage</code> solely so your listing context is preserved if you choose to unlock a Full Listing Rewrite Pass. You can clear this data at any time in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">3. Payment Processing (Dodo Payments)</h2>
          <p>
            All paid transactions are processed securely by Dodo Payments acting as Merchant of Record. We never receive, view, or store your credit card, debit card, or banking credentials on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">4. Contact</h2>
          <p>
            For any privacy questions, email{' '}
            <a href="mailto:creatiwitty086@gmail.com" className="text-orange-600 font-semibold underline">
              creatiwitty086@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}

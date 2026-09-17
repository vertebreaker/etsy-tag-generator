'use client';
import { useState } from 'react';
import { Sparkles, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';

export default function Home() {
  const [productTitle, setProductTitle] = useState('');
  const [features, setFeatures] = useState('');
  const [tone, setTone] = useState('Warm & Aesthetic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productTitle, features, tone }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Generation failed.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          100% Free • No Sign-Up Needed
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-3 tracking-tight sm:text-5xl">
          Etsy SEO Listing & Tag Generator
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2">
          Generate SEO-optimized titles, all 13 ranking tags, and complete listing copy in seconds.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 mb-8">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name / Core Item *</label>
            <input
              type="text"
              required
              placeholder="e.g. Handmade Lavender Soy Candle in Amber Jar"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Key Features / Materials</label>
              <input
                type="text"
                placeholder="e.g. 100% soy wax, cotton wick, 40hr burn time"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Listing Vibe / Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
              >
                <option>Warm & Aesthetic</option>
                <option>Minimalist & Modern</option>
                <option>Luxury & Artisanal</option>
                <option>Gift & Holiday Focused</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Generating Optimization...
              </span>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Etsy Listing & 13 Tags
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output Display */}
      {result && (
        <div className="space-y-6 mb-12">
          {/* Title */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Optimized Title ({result.title?.length || 0} / 140 Chars)
              </span>
              <button
                onClick={() => copyToClipboard(result.title, 'title')}
                className="text-orange-600 hover:text-orange-700 text-xs font-semibold flex items-center gap-1"
              >
                {copiedKey === 'title' ? <Check size={14} /> : <Copy size={14} />}
                {copiedKey === 'title' ? 'Copied' : 'Copy Title'}
              </button>
            </div>
            <p className="text-slate-800 font-medium text-sm sm:text-base bg-slate-50 p-3 rounded-lg border border-slate-100">
              {result.title}
            </p>
          </div>

          {/* 13 Tags */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                13 Etsy SEO Tags ({result.tags?.length || 0} / 13)
              </span>
              <button
                onClick={() => copyToClipboard(result.tags?.join(', '), 'tags')}
                className="text-orange-600 hover:text-orange-700 text-xs font-semibold flex items-center gap-1"
              >
                {copiedKey === 'tags' ? <Check size={14} /> : <Copy size={14} />}
                {copiedKey === 'tags' ? 'Copied All' : 'Copy All 13 Tags'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-orange-50 text-orange-800 border border-orange-200 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  {tag}
                  <span className="text-[10px] text-orange-400">({tag.length}/20)</span>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Listing Description
              </span>
              <button
                onClick={() => copyToClipboard(result.description, 'desc')}
                className="text-orange-600 hover:text-orange-700 text-xs font-semibold flex items-center gap-1"
              >
                {copiedKey === 'desc' ? <Check size={14} /> : <Copy size={14} />}
                {copiedKey === 'desc' ? 'Copied' : 'Copy Description'}
              </button>
            </div>
            <pre className="text-slate-700 text-xs sm:text-sm font-sans whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed">
              {result.description}
            </pre>
          </div>

{/* Built-in Monetization Box (Affiliate Spot) */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-base sm:text-lg">Looking for Print-On-Demand Products?</h4>
              <p className="text-xs sm:text-sm text-orange-100">
                Create custom mugs, apparel, and candles with zero upfront inventory.
              </p>
            </div>
            <a
              href="https://www.printful.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-orange-700 hover:bg-orange-50 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              Try Printful Free <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      {/* SEO & Educational FAQ Section */}
      <section className="mt-16 pt-10 border-t border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <HelpCircle size={22} className="text-orange-600" />
            Frequently Asked Questions & Etsy SEO Guide
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Learn how Etsy's search algorithm indexes titles, tags, and listing copy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1.5">
              Why does this tool generate exactly 13 tags?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Etsy allows a maximum of 13 tags per item, and each tag has a strict 20-character limit. Using all 13 slots gives your listing the maximum number of chances to match buyer searches across high-intent long-tail keywords.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1.5">
              How does Etsy prioritize listing titles?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The first 30–40 characters of your listing title carry the highest weight for Etsy search indexing and mobile shopper click-through rates. This generator places your core product keywords right up front while staying under the 140-character maximum.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1.5">
              Can I paste this output directly into Etsy?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Yes. The descriptions are generated in clean, natural plain text without markdown symbols (like ** or #) so they paste into Etsy's listing description box without requiring any manual editing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1.5">
              Is this tool completely free to use?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Yes, 100% free with unlimited generations. No credit card, account registration, or monthly subscription is required.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

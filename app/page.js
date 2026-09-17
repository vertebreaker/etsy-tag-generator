'use client';
import { useState } from 'react';
import { Sparkles, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';

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
       <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
  Generate an SEO-optimized title (up to 140 chars), all 13 ranking tags, and full listing copy in seconds.
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
        <div className="space-y-6">
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
              href="https://printify.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-orange-700 hover:bg-orange-50 font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              Try Printify Free <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

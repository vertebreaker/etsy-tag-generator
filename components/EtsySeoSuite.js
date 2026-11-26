'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DodoPayments } from 'dodopayments-checkout';
import {
  Sparkles,
  Copy,
  Check,
  HelpCircle,
  Search,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Zap,
  ShieldAlert,
  RefreshCw,
  Tag,
  Layers,
  CheckCircle,
} from 'lucide-react';
import niches from '../data/niches.json';

export default function EtsySeoSuite({ nicheData = null }) {
  const searchParams = useSearchParams();

  // Tab State: 'generate' or 'audit'
  const [activeTab, setActiveTab] = useState('generate');

  // Generator State (pre-filled if viewing a niche page)
  const [productTitle, setProductTitle] = useState(nicheData?.sampleProduct || '');
  const [features, setFeatures] = useState(nicheData?.sampleFeatures || '');
  const [tone, setTone] = useState('Warm & Aesthetic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  // Audit State
  const [auditTitle, setAuditTitle] = useState('');
  const [auditTagsInput, setAuditTagsInput] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Dodo Payments Checkout & Paid Unlock State
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paidLoading, setPaidLoading] = useState(false);
  const [paidResult, setPaidResult] = useState(null);
  const [isPaidSession, setIsPaidSession] = useState(false);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState('');
  const [manualPaidTitle, setManualPaidTitle] = useState('');
  const [manualPaidTags, setManualPaidTags] = useState('');

  // Initialize Dodo Payments Overlay SDK
  useEffect(() => {
    const mode = process.env.NEXT_PUBLIC_DODO_MODE === 'live' ? 'live' : 'test';
    try {
      DodoPayments.Initialize({
        mode,
        displayType: 'overlay',
        onEvent: (event) => {
          if (event?.event_type === 'checkout.closed') {
            setCheckoutLoading(false);
          }
          if (event?.event_type === 'checkout.error') {
            setCheckoutLoading(false);
          }
        },
      });
    } catch (err) {
      console.error('DodoPayments SDK init error:', err);
    }
  }, []);

  // Trigger server-verified paid rewrite engine
  const runVerifiedPaidRewrite = async (paymentId, targetTitle, targetTags) => {
    if (!paymentId || !targetTitle || !targetTitle.trim()) return;

    setPaidLoading(true);
    try {
      const res = await fetch('/api/unlock-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          productTitle: targetTitle.trim(),
          existingTags: targetTags ? targetTags.trim() : '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaidResult(data);
      } else {
        alert(data.error || 'Could not verify payment session.');
      }
    } catch (err) {
      console.error('Verified rewrite failed:', err);
      alert('Network error while unlocking your rewrite. Please try again.');
    } finally {
      setPaidLoading(false);
    }
  };

  // Detect post-payment redirect (?payment_id=...&status=succeeded)
  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    if (paymentId && (!status || status === 'succeeded')) {
      setIsPaidSession(true);
      setVerifiedPaymentId(paymentId);

      const storedTitle =
        typeof window !== 'undefined' ? localStorage.getItem('last_audited_title') : null;
      const storedTags =
        typeof window !== 'undefined' ? localStorage.getItem('last_audited_tags') : null;

      if (storedTitle && storedTitle.trim()) {
        setManualPaidTitle(storedTitle.trim());
        setManualPaidTags(storedTags || '');
        runVerifiedPaidRewrite(paymentId, storedTitle, storedTags);
      }
    }
  }, [searchParams]);

  // Open Dodo Payments Overlay Modal ($9.99 One-Time Pass)
  const handleOpenDodoCheckout = async () => {
    const activeTitle = auditTitle.trim() || productTitle.trim() || nicheData?.sampleProduct || '';
    const activeTags = auditTagsInput.trim() || (nicheData?.tags ? nicheData.tags.join(', ') : '');

    if (typeof window !== 'undefined' && activeTitle) {
      localStorage.setItem('last_audited_title', activeTitle);
      localStorage.setItem('last_audited_tags', activeTags);
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: activeTitle,
          returnPath: typeof window !== 'undefined' ? window.location.pathname : '/',
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        alert(data.error || 'Unable to start checkout. Please try again.');
        setCheckoutLoading(false);
        return;
      }

      DodoPayments.Checkout.open({
        checkoutUrl: data.checkoutUrl,
      });
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Network error starting checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  // Handler: Free Tag Generator
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!productTitle.trim()) return;

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
        if (data.title && data.title.length > 140) {
          data.title = data.title.slice(0, 140).trim();
          if (data.title.endsWith('|') || data.title.endsWith('-') || data.title.endsWith(',')) {
            data.title = data.title.slice(0, -1).trim();
          }
        }
        if (Array.isArray(data.tags)) {
          data.tags = data.tags.map((t) => t.trim()).slice(0, 13);
        }
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

  // Handler: Free SEO Audit
  const handleAudit = async (e) => {
    if (e) e.preventDefault();
    if (!auditTitle.trim()) return;

    setAuditLoading(true);
    setAuditResult(null);

    if (typeof window !== 'undefined') {
      localStorage.setItem('last_audited_title', auditTitle.trim());
      localStorage.setItem('last_audited_tags', auditTagsInput.trim());
    }

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: auditTitle,
          tags: auditTagsInput,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuditResult(data);
      } else {
        alert(data.error || 'Audit analysis failed.');
      }
    } catch (err) {
      alert('Network error during audit. Please try again.');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 relative">
      {/* Breadcrumb on Niche Pages */}
      {nicheData && (
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-orange-600 font-medium transition-colors">
            Etsy SEO Suite
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{nicheData.nicheName} Tags</span>
        </nav>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          {nicheData ? `${nicheData.nicheName} SEO Bank • 100% Free` : '100% Free • No Sign-Up Needed'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3 tracking-tight">
          {nicheData ? nicheData.title : 'Etsy SEO Listing & Tag Suite'}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2.5">
          {nicheData
            ? nicheData.introText
            : 'Generate high-ranking tags or audit your existing listing to expose critical rank-killing mistakes.'}
        </p>
        <p className="text-xs text-slate-500 max-w-xl mx-auto mt-1.5 leading-relaxed">
          Etsy strictly limits tags to 20 characters across 13 slots. Run our free diagnostic to detect character overages and keyword repetition, or generate 13 compliant tags ready to copy with commas.
        </p>
      </div>

      {/* Pre-Verified Niche Tag Bank (Shown on /tags/[slug] pages) */}
      {nicheData && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-orange-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  13 Pre-Verified Etsy Tags for {nicheData.nicheName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every tag below is strictly ≤ 20 characters and ready to paste directly into your Etsy listing.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(nicheData.tags.join(', '), 'niche_bank')}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              {copiedKey === 'niche_bank' ? <Check size={15} /> : <Copy size={15} />}
              {copiedKey === 'niche_bank' ? 'Copied All 13 Tags!' : 'Copy All 13 Tags (,)'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {nicheData.tags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => copyToClipboard(tag, `niche_tag_${idx}`)}
                title="Click to copy single tag"
                className="bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <span>{tag}</span>
                <span className="text-[10px] text-orange-500 font-semibold">({tag.length}/20)</span>
                {copiedKey === `niche_tag_${idx}` && <Check size={12} className="text-emerald-600" />}
              </button>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm text-amber-950">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Common {nicheData.nicheName} SEO Mistake: </span>
              {nicheData.commonMistake}
            </div>
          </div>
        </section>
      )}

      {/* View Switcher Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner max-w-md w-full">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'generate'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={16} className={activeTab === 'generate' ? 'text-orange-600' : ''} />
            Tag Generator
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search size={16} className={activeTab === 'audit' ? 'text-orange-600' : ''} />
            Audit Listing
          </button>
        </div>
      </div>

      {/* Paid Auto-Delivery Screen (Displays when Dodo payment_id is verified) */}
      {isPaidSession && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2 bg-emerald-500 text-white rounded-xl">
              <Zap size={22} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-emerald-950">
                Full Listing Rewrite Pass Active
              </h2>
              <p className="text-xs sm:text-sm text-emerald-700">
                Payment verified ({verifiedPaymentId}). Generate your complete compliant rewrite below.
              </p>
            </div>
          </div>

          {paidLoading ? (
            <div className="py-8 text-center text-emerald-800 font-semibold flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent"></span>
              Generating your 140-character title, 13 compliant tags, and full description...
            </div>
          ) : paidResult ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Optimized Title ({paidResult.title?.length}/140)
                  </span>
                  <button
                    onClick={() => copyToClipboard(paidResult.title, 'paid_title')}
                    className="text-emerald-600 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'paid_title' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedKey === 'paid_title' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-slate-800 font-medium text-sm">{paidResult.title}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    13 High-Intent Tags (≤ 20 Chars)
                  </span>
                  <button
                    onClick={() => copyToClipboard(paidResult.tags?.join(', '), 'paid_tags')}
                    className="text-emerald-600 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'paid_tags' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedKey === 'paid_tags' ? 'Copied' : 'Copy All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {paidResult.tags?.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-emerald-50 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-md border border-emerald-200"
                    >
                      {t} ({t.length}/20)
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Listing Description</span>
                  <button
                    onClick={() => copyToClipboard(paidResult.description, 'paid_desc')}
                    className="text-emerald-600 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'paid_desc' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedKey === 'paid_desc' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-slate-700 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                  {paidResult.description}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-xl border border-emerald-200 mt-2 space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                Enter your item title (and optional existing tags) to generate your paid rewrite:
              </p>
              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="e.g. Handmade Sterling Silver Stacking Ring"
                  value={manualPaidTitle}
                  onChange={(e) => setManualPaidTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Optional: existing tags or key materials"
                  value={manualPaidTags}
                  onChange={(e) => setManualPaidTags(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => runVerifiedPaidRewrite(verifiedPaymentId, manualPaidTitle, manualPaidTags)}
                  disabled={!manualPaidTitle.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={15} />
                  Generate Full Rewrite
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: TAG GENERATOR VIEW */}
      {activeTab === 'generate' && (
        <>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 mb-8">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Product Name / Core Item *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handmade Lavender Soy Candle in Amber Jar"
                  value={productTitle}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Key Features / Materials
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% soy wax, cotton wick, 40hr burn time"
                    value={features}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setFeatures(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Listing Vibe / Tone
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full appearance-none border border-slate-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white cursor-pointer"
                    >
                      <option>Warm & Aesthetic</option>
                      <option>Minimalist & Modern</option>
                      <option>Luxury & Artisanal</option>
                      <option>Gift & Holiday Focused</option>
                    </select>
                    <div className="pointer-events-none absolute right-3.5 flex items-center text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
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

          {/* Generator Output Display */}
          {result && (
            <div className="space-y-6 mb-12">
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

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    13 Etsy SEO Tags ({result.tags?.length || 0} / 13)
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.tags?.join(', '), 'tags')}
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-orange-200 transition-colors"
                  >
                    {copiedKey === 'tags' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedKey === 'tags' ? 'Copied Commas (,)' : 'Copy with Commas (,)'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.tags?.map((tag, idx) => {
                    const isOverLimit = tag.length > 20;
                    return (
                      <span
                        key={idx}
                        className={`border text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                          isOverLimit
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-orange-50 text-orange-800 border-orange-200'
                        }`}
                      >
                        {tag}
                        <span className={`text-[10px] ${isOverLimit ? 'text-red-500 font-bold' : 'text-orange-400'}`}>
                          ({tag.length}/20)
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

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
            </div>
          )}
        </>
      )}

      {/* TAB 2: AUDIT MY LISTING VIEW */}
      {activeTab === 'audit' && (
        <>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 mb-8">
            <form onSubmit={handleAudit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Your Current Etsy Listing Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Paste your active listing title here (up to 140 chars)..."
                  value={auditTitle}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setAuditTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                />
                <div className="text-right text-[11px] text-slate-500 mt-1">
                  {auditTitle.length} / 140 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Your Listing Tags (Separated by commas)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. handmade candle, soy wax, lavender gift, cozy decor..."
                  value={auditTagsInput}
                  onChange={(e) => setAuditTagsInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                <div className="text-xs text-slate-500 mt-1">
                  Etsy allows 13 tags, max 20 characters per tag.
                </div>
              </div>

              <button
                type="submit"
                disabled={auditLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {auditLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Running SEO Diagnostic...
                  </span>
                ) : (
                  <>
                    <Search size={18} />
                    Run Free Etsy SEO Audit
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Audit Results Card */}
          {auditResult && (
            <div className="space-y-6 mb-12">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Etsy SEO Health Report</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Deterministic audit based on Etsy&apos;s character and slot guidelines
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Score</div>
                      <div className="text-xs font-medium text-slate-400">
                        {auditResult.healthScore >= 80
                          ? 'Good Standing'
                          : auditResult.healthScore >= 50
                          ? 'Needs Attention'
                          : 'Critical Issues'}
                      </div>
                    </div>
                    <div
                      className={`h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-extrabold border-2 shadow-sm ${
                        auditResult.healthScore >= 80
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-400'
                          : auditResult.healthScore >= 50
                          ? 'bg-amber-50 text-amber-700 border-amber-400'
                          : 'bg-red-50 text-red-700 border-red-400'
                      }`}
                    >
                      {auditResult.healthScore}
                    </div>
                  </div>
                </div>

                {/* Critical Red Flags */}
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <ShieldAlert size={16} className="text-red-600" />
                    Critical Issues Detected ({auditResult.criticalFlags?.length || 0})
                  </h3>

                  {auditResult.criticalFlags?.length === 0 ? (
                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs sm:text-sm border border-emerald-200">
                      No critical character or slot violations detected.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {auditResult.criticalFlags?.map((flag, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs sm:text-sm text-red-900"
                        >
                          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{flag.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Passed Checks */}
                {auditResult.passedChecks?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      Passed Health Checks
                    </h3>
                    <div className="space-y-1.5">
                      {auditResult.passedChecks.map((check, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MONETIZATION BLOCK 1: Dodo Payments $9.99 Full Listing Rewrite Pass */}
                {auditResult.healthScore < 95 && (
                  <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="bg-orange-500/20 text-orange-300 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
                          One-Time Pass • Instant Delivery
                        </span>
                        <h4 className="text-lg font-bold mt-1.5 text-white">
                          Full Listing Rewrite & Violation Fix
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
                          Receive a 140-character structured title, 13 compliant long-tail tags (≤20 chars), and a clean plain-text listing description tailored to your item.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenDodoCheckout}
                        disabled={checkoutLoading}
                        className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-sm transition shrink-0 disabled:opacity-50"
                      >
                        <Zap size={16} />
                        {checkoutLoading ? 'Opening Checkout...' : 'Unlock Full Rewrite ($9.99)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* MONETIZATION BLOCK 2: eRank Informational Utility Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                      <Search size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          External Keyword Data
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        Looking for Historical Search Volume & Competitor Click Data?
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                        Our audit verifies character limits and tag structure. For third-party monthly Etsy search volume estimates and competitor tracking, inspect your tags on eRank.
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://erank.com?fpr=etsyseo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition shrink-0"
                  >
                    <span>Inspect on eRank</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Transparent Pricing Overview (Required for Dodo Compliance & Clear Terms) */}
      <section id="pricing" className="mt-14 pt-10 border-t border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Use the free generator and listing diagnostic as often as you need, or unlock a complete listing rewrite with a single one-time payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Free Utility</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">$0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Core Etsy SEO tag generation and character compliance checking with no sign-up required.
              </p>
              <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                  <span>13 tag suggestions strictly ≤ 20 characters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                  <span>Deterministic Etsy listing character & slot audit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                  <span>1-click comma-separated tag copying</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
              Included automatically above
            </div>
          </div>

          {/* Paid Pass */}
          <div className="bg-white p-6 rounded-2xl border-2 border-orange-500 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Full Listing Rewrite Pass
                </span>
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  One-Time Payment
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">$9.99</span>
                <span className="text-xs text-slate-500">USD • no recurring subscription</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Complete listing overhaul fixing title front-loading, tag character compliance, and keyword-rich plain-text description copy.
              </p>
              <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-orange-600 shrink-0" />
                  <span>Front-loaded 140-character optimized listing title</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-orange-600 shrink-0" />
                  <span>13 non-repetitive long-tail tags (≤ 20 chars each)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-orange-600 shrink-0" />
                  <span>Ready-to-paste plain-text Etsy product description</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={handleOpenDodoCheckout}
              disabled={checkoutLoading}
              className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-5 rounded-xl text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Zap size={16} />
              {checkoutLoading ? 'Opening Checkout...' : 'Get Full Listing Rewrite ($9.99)'}
            </button>
          </div>
        </div>
      </section>

      {/* SEO & Educational FAQ Section */}
      <section className="mt-14 pt-10 border-t border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <HelpCircle size={22} className="text-orange-600" />
            Frequently Asked Questions & Etsy SEO Guide
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Learn how Etsy&apos;s search system indexes titles, tags, and listing copy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1.5">
              Why does this tool enforce 13 tags under 20 characters?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Etsy allows a maximum of 13 tags per item, and each tag has a strict 20-character limit. Using all 13 slots gives your listing the maximum number of opportunities to match buyer searches across high-intent long-tail phrases.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1.5">
              What does the free Etsy SEO Audit evaluate?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The audit scans for deterministic formatting issues: tags exceeding 20 characters, unfilled tag slots, repeated root words across tags, and titles that are either too brief or exceeding Etsy&apos;s 140-character limit.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1.5">
              Why does Etsy reject tags over 20 characters?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When a tag exceeds 20 characters, Etsy&apos;s listing form prevents saving or clips the phrase, leaving your listing unindexed for those target keywords.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1.5">
              How do I rewrite an Etsy listing to improve search visibility?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Focus on multi-word long-tail phrases that match specific buyer intent, place your primary product keywords in the first 40 characters of your title, and avoid repeating the exact same root word across every tag.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1.5">
              How does Etsy prioritize listing titles?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The opening 30–40 characters of your listing title carry the highest visibility for mobile shoppers and search matching. This generator places your core item descriptors up front while staying under the 140-character limit.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base mb-1.5">
              Can I paste this output directly into Etsy?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Yes. Descriptions are generated in clean plain text without markdown symbols so they paste directly into Etsy&apos;s listing editor without manual reformatting.
            </p>
          </div>
        </div>
      </section>

      {/* Programmatic SEO Internal Linking Grid (All 25 Etsy Categories) */}
      <section className="mt-14 pt-10 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Layers size={18} className="text-orange-600" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Browse Free Etsy Tag Banks by Seller Category
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mb-5">
          Explore pre-verified 13-tag lists (all ≤ 20 characters) tailored to top Etsy product categories:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {niches.map((item) => {
            const isCurrent = nicheData?.slug === item.slug;
            return (
              <Link
                key={item.slug}
                href={`/tags/${item.slug}`}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors truncate ${
                  isCurrent
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 border-slate-200 hover:border-orange-200'
                }`}
              >
                {item.nicheName}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

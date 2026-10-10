'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
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
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();

  // Tab State: 'generate' or 'audit'
  const [activeTab, setActiveTab] = useState('generate');

  // Generator State
  const [productTitle, setProductTitle] = useState('');
  const [features, setFeatures] = useState('');
  const [tone, setTone] = useState('Warm & Aesthetic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  // Audit State
  const [auditTitle, setAuditTitle] = useState('');
  const [auditTagsInput, setAuditTagsInput] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Paid Session (Gumroad Auto-Delivery) State
  const [paidLoading, setPaidLoading] = useState(false);
  const [paidResult, setPaidResult] = useState(null);

  // Detect ?session=paid on redirect from Gumroad
  useEffect(() => {
    const session = searchParams.get('session');
    if (session === 'paid') {
      const savedTitle = typeof window !== 'undefined' ? localStorage.getItem('last_audited_title') : null;
      const savedTags = typeof window !== 'undefined' ? localStorage.getItem('last_audited_tags') : null;

      const triggerAutoRewrite = async () => {
        setPaidLoading(true);
        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productTitle: savedTitle || 'Optimized Etsy Listing',
              features: savedTags ? `Keywords: ${savedTags}` : 'High quality, handmade',
              tone: 'Warm & Aesthetic'
            }),
          });
          const data = await res.json();
          if (res.ok) {
            setPaidResult(data);
          }
        } catch (err) {
          console.error('Paid rewrite auto-trigger failed:', err);
        } finally {
          setPaidLoading(false);
        }
      };

      triggerAutoRewrite();
    }
  }, [searchParams]);

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
          data.tags = data.tags.map(t => t.trim()).slice(0, 13);
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

    // Save inputs so the auto-delivery flow has listing context after checkout
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_audited_title', auditTitle);
      localStorage.setItem('last_audited_tags', auditTagsInput);
    }

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: auditTitle, 
          tags: auditTagsInput 
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
    <main className="max-w-4xl mx-auto px-4 py-12 relative pb-24">
      {/* Gumroad Overlay Script */}
      <Script src="https://gumroad.com/js/gumroad.js" strategy="lazyOnload" />

      {/* Header */}
      <div className="text-center mb-8">
        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          100% Free • No Sign-Up Needed
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-3 tracking-tight sm:text-5xl">
          Etsy SEO Listing & Tag Suite
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2">
          Generate high-ranking tags or audit your existing listing to expose critical rank-killing mistakes.
        </p>
      </div>

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

      {/* Paid Auto-Delivery Screen (Only displays if ?session=paid) */}
      {(paidLoading || paidResult) && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2 bg-emerald-500 text-white rounded-xl">
              <Zap size={22} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-emerald-950">
                1-Click SEO Rewrite Delivered!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-700">
                Here is your fully optimized, Etsy algorithm-compliant rewrite ready to paste.
              </p>
            </div>
          </div>

          {paidLoading ? (
            <div className="py-8 text-center text-emerald-800 font-semibold flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent"></span>
              Generating your 100/100 algorithm-optimized listing...
            </div>
          ) : paidResult ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Compliant Title ({paidResult.title?.length}/140)
                  </span>
                  <button
                    onClick={() => copyToClipboard(paidResult.title, 'paid_title')}
                    className="text-emerald-600 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'paid_title' ? <Check size={14} /> : <Copy size={14} />}
                    Copy
                  </button>
                </div>
                <p className="text-slate-800 font-medium text-sm">{paidResult.title}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    13 High-Rank Tags
                  </span>
                  <button
                    onClick={() => copyToClipboard(paidResult.tags?.join(', '), 'paid_tags')}
                    className="text-emerald-600 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'paid_tags' ? <Check size={14} /> : <Copy size={14} />}
                    Copy All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {paidResult.tags?.map((t, idx) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-md border border-emerald-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Description</span>
                  <button
                    onClick={() => copyToClipboard(paidResult.description, 'paid_desc')}
                    className="text-emerald-600 text-xs font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'paid_desc' ? <Check size={14} /> : <Copy size={14} />}
                    Copy
                  </button>
                </div>
                <pre className="text-slate-700 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                  {paidResult.description}
                </pre>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 1: TAG GENERATOR VIEW */}
      {activeTab === 'generate' && (
        <>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 mb-8">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name / Core Item *</label>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Key Features / Materials</label>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Listing Vibe / Tone</label>
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
                {/* Score & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Etsy SEO Health Report</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Deterministic audit based on Etsy's ranking guidelines
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Score</div>
                      <div className="text-xs font-medium text-slate-400">
                        {auditResult.healthScore >= 80 ? 'Good Standing' : auditResult.healthScore >= 50 ? 'Needs Attention' : 'Critical Issues'}
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
                      🎉 No critical algorithm violations detected.
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

                {/* MONETIZATION BLOCK 1: Gumroad 1-Click Fix CTA */}
                {auditResult.healthScore < 95 && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="bg-white/20 text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
                          Instant Fix Available
                        </span>
                        <h4 className="text-lg font-bold mt-1 text-white">
                          Auto-Fix All Violations & Rewrite Listing
                        </h4>
                        <p className="text-xs sm:text-sm text-orange-100 mt-1 max-w-lg">
                          Generate 13 compliant long-tail tags (≤20 chars), a 140-char high-converting title, and full description rewrite instantly.
                        </p>
                      </div>
                      <a
                        href="https://creatiwitty7.gumroad.com/l/etsy-fix?wanted=true"
                        data-gumroad-single-product="true"
                        className="gumroad-button inline-flex items-center justify-center gap-2 bg-white text-orange-700 hover:bg-orange-50 px-6 py-3.5 rounded-xl font-bold text-sm shadow-sm transition transform hover:scale-105 active:scale-95 shrink-0"
                      >
                        <Zap size={16} />
                        Get 1-Click Fix (\$2.99)
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* MONETIZATION BLOCK 2: eRank Affiliate Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                      <Search size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          Keyword Volume Tool
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        Looking for Real Search Volume & Competitor Click Data?
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                        Audit scores verify algorithm compliance. For live monthly Etsy search volume, keyword click-through rates, and competition tracking, use eRank.
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
              Why does this tool enforce 13 tags under 20 characters?
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
              What does the Etsy SEO Audit score evaluate?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The audit scans for deterministic indexing penalties: tags exceeding 20 characters, unfilled tag slots, keyword cannibalization across tags, and titles that are either too brief or exceeding Etsy's 140-character limit.
            </p>
          </div>
        </div>
      </section>

      {/* Floating Buy Me a Coffee Pill */}
      <a
        href="https://buymeacoffee.com/etsytaggen"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#FFDD00] hover:bg-[#ffea40] text-slate-900 font-bold text-xs sm:text-sm rounded-full shadow-lg border border-amber-300 transition-transform hover:scale-105 active:scale-95"
      >
        <span className="text-base">☕</span>
        <span>Buy me a coffee</span>
      </a>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading suite...</div>}>
      <HomeContent />
    </Suspense>
  );
}

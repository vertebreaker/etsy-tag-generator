import { NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';

export const runtime = 'edge';

const FALLBACK_MODIFIERS = [
  'custom', 'personalized', 'handmade', 'unique', 'gift',
  'keepsake', 'artisan', 'minimalist', 'aesthetic', 'modern',
  'daily use', 'gift idea', 'handcrafted',
];

function sanitizeTitle(rawTitle, fallbackProduct) {
  const base = (rawTitle || `${fallbackProduct} | Handmade Gift`).trim();
  if (base.length <= 140) return base;
  const sliced = base.slice(0, 140);
  const lastPipe = sliced.lastIndexOf(' | ');
  if (lastPipe > 40) return sliced.slice(0, lastPipe).trim();
  const lastSpace = sliced.lastIndexOf(' ');
  return lastSpace > 0 ? sliced.slice(0, lastSpace).trim() : sliced.trim();
}

function enforceCompliantTags(productTitle, existingTagsRaw, incomingTags = []) {
  const tags = new Set();

  const tryAdd = (raw) => {
    if (typeof raw !== 'string') return;
    const cleaned = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');
    if (cleaned.length > 0 && cleaned.length <= 20 && !tags.has(cleaned)) {
      tags.add(cleaned);
    }
  };

  incomingTags.forEach(tryAdd);

  if (typeof existingTagsRaw === 'string') {
    existingTagsRaw.split(',').forEach(tryAdd);
  }

  const words = productTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const coreWord = words[0] || 'gift';
  for (const mod of FALLBACK_MODIFIERS) {
    if (tags.size >= 13) break;
    tryAdd(`${mod} ${coreWord}`);
    tryAdd(`${coreWord} ${mod}`);
  }

  return Array.from(tags).slice(0, 13);
}

function buildFallbackRewrite(productTitle, existingTagsRaw) {
  const cleanTitle = productTitle.trim();
  const title = sanitizeTitle(
    `${cleanTitle} | Custom Handmade Gift | Thoughtful Everyday Keepsake`,
    cleanTitle
  );
  const tags = enforceCompliantTags(cleanTitle, existingTagsRaw, []);
  const description = `OVERVIEW
Crafted with care and attention to detail, our ${cleanTitle} is designed for everyday practicality and memorable gifting.

FEATURES
- Thoughtfully crafted with durable, quality materials
- Clean finish designed to complement any home or personal style
- Carefully packaged and ready for gifting

CARE INSTRUCTIONS
- Handle gently to preserve the finish
- Wipe clean with a soft, dry cloth
- Store in a cool, dry place when not in use`;

  return { title, tags, description };
}

export async function POST(req) {
  try {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const expectedProductId = process.env.DODO_PRODUCT_ID;
    const environment =
      process.env.NEXT_PUBLIC_DODO_MODE === 'live' ? 'live_mode' : 'test_mode';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Payment verification service unavailable.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const paymentId = typeof body.paymentId === 'string' ? body.paymentId.trim() : '';
    const productTitle = typeof body.productTitle === 'string' ? body.productTitle.trim() : '';
    const existingTags = typeof body.existingTags === 'string' ? body.existingTags.trim() : '';

    if (!paymentId || !/^pay_[A-Za-z0-9_-]+$/.test(paymentId)) {
      return NextResponse.json(
        { error: 'A valid Dodo Payment ID is required.' },
        { status: 400 }
      );
    }

    if (!productTitle) {
      return NextResponse.json(
        { error: 'Product title is required to generate rewrite.' },
        { status: 400 }
      );
    }

    // Server-side verification directly against Dodo Payments API
    const client = new DodoPayments({
      bearerToken: apiKey,
      environment,
    });

    const payment = await client.payments.retrieve(paymentId);

    if (!payment || payment.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment has not succeeded or could not be verified.' },
        { status: 402 }
      );
    }

    // Verify product cart matches our $9.99 product if product_cart is present
    if (expectedProductId && Array.isArray(payment.product_cart) && payment.product_cart.length > 0) {
      const matchesProduct = payment.product_cart.some(
        (item) => item.product_id === expectedProductId
      );
      if (!matchesProduct) {
        return NextResponse.json(
          { error: 'Payment does not match the Full Listing Rewrite Pass product.' },
          { status: 403 }
        );
      }
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(buildFallbackRewrite(productTitle, existingTags));
    }

    const systemPrompt = `You are a senior Etsy SEO copywriter. Return a strictly valid JSON object with exact keys: "title", "tags", and "description".
Rules:
1. "title": Strictly under 140 characters. Front-load the highest-intent buyer keywords in the first 40 characters, separated by " | ". Never truncate mid-word.
2. "tags": Array of EXACTLY 13 unique multi-word long-tail strings. Every single string MUST be 20 characters or fewer (including spaces), lowercase, no punctuation, and avoid repeating the exact same root word in every slot.
3. "description": Clean plain-text description with sections "OVERVIEW", "FEATURES", and "CARE INSTRUCTIONS". Do NOT use markdown symbols (no **, no #, no *). Use plain capital headings and simple dashes (-).
4. Output ONLY pure JSON.`;

    const userPrompt = `Product Title: ${productTitle}\nExisting Tags/Keywords to Improve: ${existingTags || 'None provided'}`;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

    const aiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!aiRes.ok) {
      return NextResponse.json(buildFallbackRewrite(productTitle, existingTags));
    }

    const aiData = await aiRes.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    return NextResponse.json({
      title: sanitizeTitle(parsed.title, productTitle),
      tags: enforceCompliantTags(productTitle, existingTags, Array.isArray(parsed.tags) ? parsed.tags : []),
      description: parsed.description || buildFallbackRewrite(productTitle, existingTags).description,
    });
  } catch (error) {
    console.error('Unlock rewrite error:', error);
    return NextResponse.json(
      { error: 'Unable to verify payment or generate rewrite.' },
      { status: 500 }
    );
  }
}

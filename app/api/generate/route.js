import { NextResponse } from 'next/server';

// Fallback dictionary for tone-based phrases and modifiers
const VIBE_KEYWORDS = {
  'Gift & Holiday Focused': [
    'gift for him', 'gift for her', 'stocking stuffer', 'holiday gift',
    'christmas gift', 'gift idea', 'custom present', 'secret santa',
    'keepsake gift', 'unique present', 'holiday decor', 'anniversary gift'
  ],
  'Warm & Aesthetic': [
    'aesthetic decor', 'cozy vibes', 'boho style', 'earthy neutral',
    'cottagecore home', 'warm aesthetic', 'minimalist style', 'handcrafted vibe',
    'cute aesthetic', 'retro vintage', 'artisan made', 'rustic charm'
  ],
  'Minimalist & Modern': [
    'modern minimalist', 'clean design', 'minimalist decor', 'sleek style',
    'simple elegant', 'contemporary home', 'modern living', 'scandi decor',
    'minimal aesthetic', 'functional art', 'nordic style', 'subtle luxury'
  ],
  'Luxury & Artisanal': [
    'luxury gift', 'artisan made', 'premium quality', 'handcrafted item',
    'bespoke design', 'fine craftsmanship', 'elegant keepsake', 'custom luxury',
    'heritage craft', 'collector piece', 'couture style', 'high end decor'
  ]
};

const GENERIC_INTENT_MODIFIERS = [
  'custom', 'personalized', 'handmade', 'unique', 'gift', 
  'accessory', 'keepsake', 'trendy', 'popular find', 'best seller'
];

// Sanitize title to strictly <= 140 chars without clipping words or pipe segments
function sanitizeEtsyTitle(rawTitle, fallbackProduct = 'Custom Gift') {
  if (!rawTitle || typeof rawTitle !== 'string') {
    return `${fallbackProduct} | Handmade Gift`.slice(0, 140);
  }

  let title = rawTitle.trim();
  if (title.length <= 140) return title;

  // 1. Hard cap slice at 140
  let truncated = title.slice(0, 140);

  // 2. If it severed inside a pipe block, remove the incomplete trailing segment
  const lastPipeIndex = truncated.lastIndexOf(' | ');
  if (lastPipeIndex > 40) {
    return truncated.slice(0, lastPipeIndex).trim();
  }

  // 3. Fallback: Trim back to the nearest complete word
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  return lastSpaceIndex > 0 ? truncated.slice(0, lastSpaceIndex).trim() : truncated.trim();
}

// Pure function to generate strictly <= 20 character tags
function buildDeterministicTags(productTitle, features, tone, existingTags = []) {
  const resultTags = new Set(
    existingTags
      .map(t => t.trim().replace(/[.,]/g, ''))
      .filter(t => t.length > 0 && t.length <= 20)
  );

  const cleanTitle = (productTitle || '').trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const titleWords = cleanTitle.split(/\s+/).filter(w => w.length > 1);

  const featureList = (features || '')
    .split(',')
    .map(f => f.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ''))
    .filter(f => f.length > 0 && f.length <= 20);

  const vibePool = VIBE_KEYWORDS[tone] || VIBE_KEYWORDS['Warm & Aesthetic'];

  const tryAdd = (str) => {
    const clean = str.trim().toLowerCase();
    if (clean.length > 0 && clean.length <= 20 && !resultTags.has(clean)) {
      resultTags.add(clean);
    }
  };

  // 1. Direct inputs if under 20 chars
  if (cleanTitle.length <= 20) tryAdd(cleanTitle);
  featureList.forEach(f => tryAdd(f));

  // 2. Pair primary title word with modifiers
  const mainWord = titleWords[0] || 'gift';
  for (const mod of GENERIC_INTENT_MODIFIERS) {
    if (resultTags.size >= 13) break;
    tryAdd(`${mod} ${mainWord}`);
    tryAdd(`${mainWord} ${mod}`);
  }

  // 3. Add tone/vibe search phrases
  for (const phrase of vibePool) {
    if (resultTags.size >= 13) break;
    tryAdd(phrase);
  }

  // 4. Combine features with secondary modifiers if still short
  for (const feat of featureList) {
    if (resultTags.size >= 13) break;
    const shortFeat = feat.split(' ')[0];
    tryAdd(`custom ${shortFeat}`);
    tryAdd(`handmade ${shortFeat}`);
  }

  // Slice to guarantee exactly 13
  return Array.from(resultTags).slice(0, 13);
}

// Fallback generator for title and description if API is completely offline or exhausted
function buildFallbackListing(productTitle, features, tone) {
  const cleanTitle = productTitle.trim();
  const validTags = buildDeterministicTags(productTitle, features, tone, []);

  const fallbackTitle = sanitizeEtsyTitle(
    `${cleanTitle} | Custom Handmade Gift | Aesthetic High Quality Unique Present`,
    cleanTitle
  );

  const fallbackDescription = `OVERVIEW
Elevate your space and routine with our premium ${cleanTitle}. Thoughtfully designed with quality and craftsmanship in mind, this piece makes a remarkable addition to your collection or a memorable gift.

FEATURES
- Premium materials and durable handcrafted finish
- Highlights: ${features || 'Handmade, high quality, unique design'}
- Designed with a ${tone || 'Warm & Aesthetic'} style

CARE INSTRUCTIONS
- Handle with care
- Clean gently with a soft cloth
- Keep away from extreme temperatures or harsh chemicals`;

  return {
    title: fallbackTitle,
    tags: validTags,
    description: fallbackDescription
  };
}

export async function POST(req) {
  let productTitle = '';
  let features = '';
  let tone = 'Warm & Aesthetic';

  try {
    const body = await req.json();
    productTitle = body.productTitle;
    features = body.features || '';
    tone = body.tone || 'Warm & Aesthetic';

    if (!productTitle) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback if no key is defined
      return NextResponse.json(buildFallbackListing(productTitle, features, tone));
    }

    const systemPrompt = `You are an expert Etsy SEO specialist. Return a strictly valid JSON object with the exact keys: "title", "tags", and "description".
Rules:
1. "title": Strictly under 140 characters. High-ranking search phrases separated by " | ". NEVER leave an incomplete phrase or truncated word at the end.
2. "tags": An array of EXACTLY 13 strings. Each string MUST be 20 characters or fewer (including spaces). Multi-word long-tail phrases, no punctuation.
3. "description": Clean, benefit-driven product description with sections for "OVERVIEW", "FEATURES", and "CARE INSTRUCTIONS". 
CRITICAL FORMATTING FOR DESCRIPTION: Do NOT use markdown syntax (no asterisks **, no hashes #, no markdown bullets *). Use plain capital letters for headings and simple dashes (-) or line breaks for lists so it is 100% ready to paste into Etsy.
4. Output ONLY pure valid JSON without markdown wrapping or comments.`;

    const userPrompt = `Product: ${productTitle}\nKey Details: ${features || 'Handmade, high quality'}\nTone: ${tone}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn('Gemini API Error, switching to deterministic fallback:', data.error?.message);
      return NextResponse.json(buildFallbackListing(productTitle, features, tone));
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedContent = JSON.parse(rawText);

    // Hard Sanitize & Post-Process Title
    const guaranteedTitle = sanitizeEtsyTitle(
      parsedContent.title || `${productTitle} | Custom Gift`,
      productTitle
    );

    // Hard Sanitize & Post-Process Tags
    const incomingTags = Array.isArray(parsedContent.tags) ? parsedContent.tags : [];
    const guaranteedTags = buildDeterministicTags(productTitle, features, tone, incomingTags);

    return NextResponse.json({
      title: guaranteedTitle,
      tags: guaranteedTags,
      description: parsedContent.description || ''
    });

  } catch (error) {
    console.warn('Failed during processing, utilizing zero-fail fallback:', error.message);
    return NextResponse.json(buildFallbackListing(productTitle, features, tone));
  }
}

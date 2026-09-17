import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { productTitle, features, tone } = await req.json();

    if (!productTitle) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are an expert Etsy SEO specialist. Return a strictly valid JSON object with the exact keys: "title", "tags", and "description".
Rules:
1. "title": Maximum 140 characters. High-ranking search phrases separated by " | ".
2. "tags": An array of EXACTLY 13 strings. Each string MUST be 20 characters or fewer. Multi-word phrases, no commas or periods.
3. "description": Clean, benefit-driven product description with sections for "Overview", "Features", and "Usage/Care".
4. Output ONLY pure valid JSON without markdown wrapping or comments.`;

    const userPrompt = `Product: ${productTitle}\nKey Details: ${features || 'Handmade, high quality'}\nTone: ${tone || 'Warm & Aesthetic'}`;

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
      throw new Error(data.error?.message || 'Failed to fetch from Gemini');
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedContent = JSON.parse(rawText);
    return NextResponse.json(parsedContent);

  } catch (error) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

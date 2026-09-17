import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { productTitle, features, tone } = await req.json();

    if (!productTitle) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are an expert Etsy SEO specialist. Return a strictly valid JSON object with the exact keys: "title", "tags", and "description".
Rules:
1. "title": Maximum 140 characters. High-ranking search phrases separated by " | ".
2. "tags": An array of EXACTLY 13 strings. Each string MUST be 20 characters or fewer. Multi-word phrases, no commas or periods.
3. "description": Clean, benefit-driven product description with sections for "Overview", "Features", and "Usage/Care".
4. Output ONLY clean JSON. Do NOT wrap output in markdown blocks like \`\`\`json.`;

    const userPrompt = `Product: ${productTitle}\nKey Details: ${features || 'Handmade, high quality'}\nTone: ${tone || 'Warm & Aesthetic'}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch from Groq');
    }

    const parsedContent = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(parsedContent);

  } catch (error) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

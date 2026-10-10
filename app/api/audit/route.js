import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { title = '', tags = [] } = body;

    // Normalization
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    const cleanTags = Array.isArray(tags)
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    let score = 100;
    const criticalFlags = [];
    const passedChecks = [];

    // --- 1. Tag Limit Checks (Max 20 chars per tag) ---
    const longTags = cleanTags.filter(t => t.length > 20);
    if (longTags.length > 0) {
      score -= (longTags.length * 15);
      criticalFlags.push({
        type: 'TAG_TOO_LONG',
        severity: 'high',
        message: `${longTags.length} tag(s) exceed Etsy's strict 20-character limit: ${longTags.map(t => `"${t}" (${t.length} chars)`).join(', ')}. Etsy will reject these tags.`,
      });
    } else if (cleanTags.length > 0) {
      passedChecks.push('All tags are within the strict 20-character limit.');
    }

    // --- 2. Missing Slots Count (Target: exactly 13 tags) ---
    if (cleanTags.length < 13) {
      const missingCount = 13 - cleanTags.length;
      score -= (missingCount * 10);
      criticalFlags.push({
        type: 'MISSING_TAG_SLOTS',
        severity: 'high',
        message: `Using only ${cleanTags.length}/13 available tag slots. You are leaving ${missingCount} ranking opportunity slot(s) empty.`,
      });
    } else {
      passedChecks.push('Utilized all 13 Etsy ranking tag slots.');
    }

    // --- 3. Duplicate Root Keyword Check (Cannibalization) ---
    const STOP_WORDS = new Set(['and', 'or', 'for', 'the', 'in', 'with', 'a', 'an', 'to', 'of', '&']);
    const wordFrequency = {};
    
    cleanTags.forEach(tag => {
      const words = tag.toLowerCase().split(/\s+/);
      const uniqueWordsInTag = new Set(words);
      uniqueWordsInTag.forEach(w => {
        const cleanedWord = w.replace(/[^a-z0-9]/g, '');
        if (cleanedWord.length > 2 && !STOP_WORDS.has(cleanedWord)) {
          wordFrequency[cleanedWord] = (wordFrequency[cleanedWord] || 0) + 1;
        }
      });
    });

    const repeatedWords = Object.entries(wordFrequency).filter(([_, count]) => count > 3);
    if (repeatedWords.length > 0) {
      repeatedWords.forEach(([word, count]) => {
        score -= 5;
        criticalFlags.push({
          type: 'KEYWORD_STUFFING',
          severity: 'medium',
          message: `The root word "${word}" appears in ${count} separate tags. Repeating the same keyword wastes tag slots that could capture long-tail search traffic.`,
        });
      });
    } else if (cleanTags.length > 0) {
      passedChecks.push('Good keyword diversity: no wasteful root keyword repetition.');
    }

    // --- 4. Title Optimization Check (Target: 120 - 140 chars) ---
    const titleLen = cleanTitle.length;
    if (titleLen === 0) {
      score -= 30;
      criticalFlags.push({
        type: 'EMPTY_TITLE',
        severity: 'high',
        message: 'Listing title is missing or empty.',
      });
    } else if (titleLen < 80) {
      score -= 20;
      criticalFlags.push({
        type: 'TITLE_TOO_SHORT',
        severity: 'high',
        message: `Listing title is only ${titleLen} characters. Etsy allows up to 140 characters; short titles leave crucial search terms unindexed.`,
      });
    } else if (titleLen < 120) {
      score -= 10;
      criticalFlags.push({
        type: 'TITLE_SUBOPTIMAL',
        severity: 'medium',
        message: `Title length is ${titleLen}/140 characters. Consider adding 2-3 high-intent descriptive keywords to maximize search visibility.`,
      });
    } else if (titleLen > 140) {
      score -= 15;
      criticalFlags.push({
        type: 'TITLE_TOO_LONG',
        severity: 'high',
        message: `Title length is ${titleLen} characters, exceeding Etsy's 140-character maximum limit.`,
      });
    } else {
      passedChecks.push(`Title length is optimal (${titleLen}/140 characters).`);
    }

    // Ensure score stays within 0 to 100
    const finalScore = Math.max(0, Math.min(100, score));

    return NextResponse.json({
      success: true,
      healthScore: finalScore,
      criticalFlags,
      passedChecks,
      summary: {
        totalTagsSubmitted: cleanTags.length,
        titleLength: titleLen,
      }
    });

  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: 'Failed to process listing audit' },
      { status: 500 }
    );
  }
}

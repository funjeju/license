import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { generateObject } from 'ai';
import { anthropic } from '@/lib/ai/providers';
import { z } from 'zod';
import { LOCARNO_CLASSES, LOCARNO_MAP } from '@/lib/data/locarno-classes';

const RecommendationSchema = z.object({
  recommendations: z.array(z.object({
    classCode: z.string(),
    subclassCode: z.string().optional(),
    reason: z.string(),
    confidence: z.enum(['high', 'medium', 'low']),
  })),
  articleName: z.string(),
  summary: z.string(),
});

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await adminAuth.verifyIdToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { designTitle, designConcept, articleName } = await req.json();
  if (!designTitle && !designConcept) {
    return NextResponse.json({ error: 'designTitle or designConcept required' }, { status: 400 });
  }

  const classList = LOCARNO_CLASSES.map((c) =>
    `${c.code}류: ${c.nameKo} (예: ${c.subclasses.slice(0, 2).map((s) => s.nameKo).join(', ')})`,
  ).join('\n');

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: RecommendationSchema,
    prompt: `You are a Korean design patent classification expert.

Recommend Locarno Classification classes for the following design:
- Design title: ${designTitle ?? '(not provided)'}
- Article name: ${articleName ?? '(not provided)'}
- Design concept: ${designConcept ?? '(not provided)'}

Available Locarno classes:
${classList}

Recommend 1-3 most applicable classes. For each:
- Provide the 2-digit class code (e.g., "14", "06")
- Optionally provide a subclass code (e.g., "14-04")
- Explain why it applies (in Korean)
- Rate confidence as high/medium/low

Also:
- Suggest the standard Korean article name (물품명칭) used in KR patent office
- Provide a brief Korean summary

Only use class codes from the provided list.`,
  });

  const enriched = object.recommendations.map((r) => {
    const cls = LOCARNO_MAP[r.classCode];
    const sub = cls?.subclasses.find((s) => s.code === r.subclassCode);
    return {
      ...r,
      className: cls?.nameKo ?? '',
      subclassName: sub?.nameKo ?? '',
    };
  });

  return NextResponse.json({
    recommendations: enriched,
    articleName: object.articleName,
    summary: object.summary,
  });
}

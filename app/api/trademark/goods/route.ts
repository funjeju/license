import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { generateObject } from 'ai';
import { anthropic } from '@/lib/ai/providers';
import { z } from 'zod';

const GoodsDraftSchema = z.object({
  designatedGoods: z.array(z.object({
    niceClass: z.string(),
    goodsList: z.array(z.string()),
  })),
  notes: z.string().optional(),
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

  const { markName, markDescription, niceClasses, businessArea } = await req.json();
  if (!markName || !Array.isArray(niceClasses) || niceClasses.length === 0) {
    return NextResponse.json({ error: 'markName and niceClasses required' }, { status: 400 });
  }

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: GoodsDraftSchema,
    prompt: `You are a Korean trademark specialist. Generate a list of designated goods/services for a trademark application.

Trademark: ${markName}
Description: ${markDescription ?? '(not provided)'}
Business area: ${businessArea ?? '(not provided)'}
Nice Classes to cover: ${niceClasses.join(', ')}

For each Nice class, provide 5–10 specific goods/services in Korean. Use standard Korean Patent Office terminology (특허청 상품목록). Be specific — list individual product names, not broad categories.

Examples of good items:
- 스마트폰 케이스 (good — specific)
- 캐릭터 인형 (good — specific)
- 전자제품 (bad — too broad)

Also add brief notes about any potential conflicts or considerations if relevant.`,
  });

  return NextResponse.json(object);
}

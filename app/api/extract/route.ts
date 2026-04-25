import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { anthropic } from '@/lib/ai/providers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IP_SCHEMAS } from '@/lib/schemas';
import type { IPType } from '@/lib/agents/classifier';

const extractorPromptTemplate = readFileSync(
  join(process.cwd(), 'lib/agents/prompts/extractor.md'),
  'utf-8'
);

const REQUIRED_COUNTS: Record<IPType, number> = {
  copyright: 6, trademark: 5, design: 4, patent: 6,
};

function calcProgress(ipType: IPType, fields: Record<string, unknown>): number {
  const required = REQUIRED_COUNTS[ipType] ?? 6;
  const filled = Object.values(fields).filter(
    (v) => v !== null && v !== undefined && v !== ''
  ).length;
  return Math.min(100, Math.round((filled / required) * 100));
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { registrationId } = await req.json();
  if (!registrationId) return NextResponse.json({ error: 'registrationId required' }, { status: 400 });

  const regRef = adminDb.collection('registrations').doc(registrationId);
  const regSnap = await regRef.get();

  if (!regSnap.exists || regSnap.data()?.userId !== uid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const reg = regSnap.data()!;
  const ipType = reg.type as IPType;

  const messagesSnap = await regRef
    .collection('messages')
    .orderBy('timestamp', 'desc')
    .limit(3)
    .get();

  const recentDialog = messagesSnap.docs
    .reverse()
    .map((d) => {
      const data = d.data();
      return `${data.role === 'user' ? '유저' : 'AI'}: ${data.content}`;
    })
    .join('\n');

  if (!recentDialog) return NextResponse.json({ updated: [], progress: 0 });

  // IP 유형별 스키마에서 키 목록 추출
  const ipSchema = IP_SCHEMAS[ipType];
  const schemaKeys = Object.keys(ipSchema.shape);
  const schemaDescription = `IP type: ${ipType}\nFields: ${schemaKeys.join(', ')}`;

  const systemPrompt = extractorPromptTemplate
    .replace('{ipType}', ipType)
    .replace('{currentFields}', JSON.stringify(reg.extractedFields ?? {}, null, 2))
    .replace('{schemaDescription}', schemaDescription)
    .replace('{recentDialog}', recentDialog);

  let delta: Record<string, unknown> = {};
  try {
    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema: z.object({
        delta: z.record(z.string(), z.unknown()),
        confidence: z.record(z.string(), z.number()),
      }),
      system: systemPrompt,
      prompt: 'Extract fields from the dialog above.',
    });
    // confidence < 0.5 필드 제거, 스키마에 없는 키 제거
    for (const [key, conf] of Object.entries(object.confidence)) {
      if ((conf as number) >= 0.5 && object.delta[key] !== undefined && schemaKeys.includes(key)) {
        delta[key] = object.delta[key];
      }
    }
  } catch {
    return NextResponse.json({ updated: [], progress: 0 });
  }

  if (Object.keys(delta).length === 0) {
    return NextResponse.json({ updated: [], progress: calcProgress(ipType, reg.extractedFields ?? {}) });
  }

  const mergedFields = { ...(reg.extractedFields ?? {}), ...delta };
  const progress = calcProgress(ipType, mergedFields);

  await regRef.update({
    extractedFields: mergedFields,
    progress,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ updated: Object.keys(delta), progress });
}

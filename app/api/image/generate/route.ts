import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { composeImagePrompt } from '@/lib/agents/promptComposer';
import { generateVariants } from '@/lib/integrations/gemini-image';
import type { StyleOption, CompositionOption } from '@/lib/agents/promptComposer';

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

  const { registrationId, prompt: userPrompt, style, composition, userAddition } = await req.json();
  if (!registrationId) return NextResponse.json({ error: 'registrationId required' }, { status: 400 });

  const regRef = adminDb.collection('registrations').doc(registrationId);
  const regSnap = await regRef.get();
  if (!regSnap.exists || regSnap.data()?.userId !== uid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const reg = regSnap.data()!;
  const extractedFields = reg.extractedFields ?? {};

  // 1. Prompt Composer — 최종 영어 프롬프트 생성
  let finalPrompt: string;
  try {
    finalPrompt = userPrompt?.trim()
      ? userPrompt
      : await composeImagePrompt({
          extractedFields,
          style: (style ?? 'line_art') as StyleOption,
          composition: (composition ?? 'single') as CompositionOption,
          userAddition: userAddition ?? '',
          ipType: reg.type,
        });
  } catch {
    return NextResponse.json({ error: 'Prompt composition failed' }, { status: 500 });
  }

  // 2. Nano Banana — 4 variants 생성
  let images: { base64: string; mimeType: string }[];
  try {
    images = await generateVariants(finalPrompt, 4);
  } catch (err) {
    console.error('Image generation failed:', err);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }

  // 3. Firestore에 asset 레코드 저장 (base64 inline 저장 — Storage는 Week 6에서)
  const now = FieldValue.serverTimestamp();
  const sessionRef = adminDb.collection('studio_sessions').doc();
  const assetIds: string[] = [];

  const batch = adminDb.batch();
  for (const img of images) {
    const assetRef = adminDb.collection('assets').doc();
    assetIds.push(assetRef.id);
    batch.set(assetRef, {
      registrationId,
      userId: uid,
      kind: 'ai_generated',
      mimeType: img.mimeType,
      base64: img.base64,
      prompt: finalPrompt,
      style: style ?? 'line_art',
      composition: composition ?? 'single',
      sessionId: sessionRef.id,
      createdAt: now,
    });
  }

  batch.set(sessionRef, {
    registrationId,
    userId: uid,
    mode: 'generate',
    prompt: finalPrompt,
    style: style ?? 'line_art',
    composition: composition ?? 'single',
    assetIds,
    selectedAssetId: null,
    createdAt: now,
  });

  batch.update(regRef, { updatedAt: now });

  await batch.commit();

  return NextResponse.json({ assetIds, sessionId: sessionRef.id, prompt: finalPrompt });
}

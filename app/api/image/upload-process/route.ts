import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { editImage } from '@/lib/integrations/gemini-image';

// 이미지 URL을 base64로 변환 (Firebase Storage 다운로드 URL)
async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = res.headers.get('content-type') ?? 'image/png';
  return { base64: buffer.toString('base64'), mimeType };
}

// 각 변환 종류별 Gemini 지시사항
const PROCESS_INSTRUCTIONS: Record<string, string> = {
  normalized: 'Normalize this image for IP registration: ensure clean white background, proper contrast, remove artifacts, standardize to technical drawing style.',
  nobg:       'Remove the background completely. Make the background pure white or transparent. Keep only the main subject/product.',
  grayscale:  'Convert to grayscale/black-and-white. Use only black lines and white background, suitable for patent drawing submission.',
  sheet:      'Format this as an official IP registration drawing sheet: add a thin border frame, leave space at top for title, maintain the original drawing in the center.',
};

const KIND_LABELS: Record<string, string> = {
  normalized: '규격 변환',
  nobg:       '배경 제거',
  grayscale:  '흑백 변환',
  sheet:      '도안 시트',
};

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

  const { registrationId, storagePath, downloadURL, filename, mimeType, targetKinds } = await req.json();
  if (!registrationId || !storagePath || !downloadURL) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const regRef = adminDb.collection('registrations').doc(registrationId);
  const regSnap = await regRef.get();
  if (!regSnap.exists || regSnap.data()?.userId !== uid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 원본 에셋 Firestore 저장
  const now = FieldValue.serverTimestamp();
  const originalRef = adminDb.collection('assets').doc();
  await originalRef.set({
    registrationId,
    userId: uid,
    kind: 'original',
    storagePath,
    downloadURL,
    filename: filename ?? '',
    mimeType: mimeType ?? 'image/png',
    createdAt: now,
  });

  // 원본 이미지를 base64로 로드 (처리용)
  let sourceBase64: string;
  let sourceMimeType: string;
  try {
    const loaded = await urlToBase64(downloadURL);
    sourceBase64 = loaded.base64;
    sourceMimeType = loaded.mimeType;
  } catch {
    return NextResponse.json({ error: 'Failed to load uploaded image' }, { status: 500 });
  }

  const kinds: string[] = Array.isArray(targetKinds) ? targetKinds : ['normalized'];
  const assets: { assetId: string; kind: string; label: string; base64: string; mimeType: string }[] = [];

  // 각 변환을 병렬로 처리
  const results = await Promise.allSettled(
    kinds.map(async (kind) => {
      const instruction = PROCESS_INSTRUCTIONS[kind];
      if (!instruction) return null;

      const result = await editImage(sourceBase64, sourceMimeType, instruction);
      const assetRef = adminDb.collection('assets').doc();
      await assetRef.set({
        registrationId,
        userId: uid,
        kind,
        base64: result.base64,
        mimeType: result.mimeType,
        sourceAssetId: originalRef.id,
        storagePath: `processed/${registrationId}/${kind}_${Date.now()}.png`,
        createdAt: now,
      });

      return {
        assetId: assetRef.id,
        kind,
        label: KIND_LABELS[kind] ?? kind,
        base64: result.base64,
        mimeType: result.mimeType,
      };
    })
  );

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      assets.push(r.value);
    }
  }

  await regRef.update({ updatedAt: now });

  return NextResponse.json({
    originalAssetId: originalRef.id,
    assets,
  });
}

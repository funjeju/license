import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { editImage } from '@/lib/integrations/gemini-image';

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

  const { assetId, instruction } = await req.json();
  if (!assetId || !instruction) {
    return NextResponse.json({ error: 'assetId and instruction required' }, { status: 400 });
  }

  // 원본 에셋 로드
  const assetRef = adminDb.collection('assets').doc(assetId);
  const assetSnap = await assetRef.get();
  if (!assetSnap.exists || assetSnap.data()?.userId !== uid) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  const asset = assetSnap.data()!;

  // Nano Banana 편집 호출
  let result: { base64: string; mimeType: string };
  try {
    result = await editImage(asset.base64, asset.mimeType ?? 'image/png', instruction);
  } catch (err) {
    console.error('Image edit failed:', err);
    return NextResponse.json({ error: 'Image edit failed' }, { status: 500 });
  }

  // 새 에셋 레코드 저장 (sourceAssetId 체인 연결)
  const newAssetRef = adminDb.collection('assets').doc();
  await newAssetRef.set({
    registrationId: asset.registrationId,
    userId: uid,
    kind: 'ai_generated',
    mimeType: result.mimeType,
    base64: result.base64,
    sourceAssetId: assetId,
    editInstruction: instruction,
    sessionId: asset.sessionId ?? null,
    promptHistory: FieldValue.arrayUnion({ instruction, timestamp: new Date().toISOString() }),
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ newAssetId: newAssetRef.id });
}

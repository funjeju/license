import { NextRequest, NextResponse } from 'next/server';
import { classifyIP } from '@/lib/agents/classifier';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('[classify] missing/invalid Authorization header. header value:', authHeader);
    return NextResponse.json({ error: 'Unauthorized', detail: 'no bearer token' }, { status: 401 });
  }

  let uid: string;
  try {
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[classify] token verify failed:', msg);
    return NextResponse.json({ error: 'Invalid token', detail: msg }, { status: 401 });
  }

  const { userMessage } = await req.json();
  if (!userMessage) {
    return NextResponse.json({ error: 'userMessage required' }, { status: 400 });
  }

  const result = await classifyIP(userMessage);

  // Firestore에 새 registration 문서 생성
  const regRef = adminDb.collection('registrations').doc();
  const title = `${result.primaryType} 등록 - ${new Date().toLocaleDateString('ko-KR')}`;

  await regRef.set({
    userId: uid,
    type: result.primaryType,
    subType: result.subType,
    status: 'interviewing',
    progress: 0,
    title,
    extractedFields: {},
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // 첫 시스템 메시지 저장
  await regRef.collection('messages').add({
    role: 'system',
    content: `IP 유형이 ${result.primaryType}(${result.subType})으로 분류됐습니다.`,
    timestamp: FieldValue.serverTimestamp(),
    meta: { agentUsed: 'classifier', classifierResult: result },
  });

  return NextResponse.json({
    registrationId: regRef.id,
    result,
  });
}

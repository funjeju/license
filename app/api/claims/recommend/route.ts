import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { extractClaimHints, generateClaims } from '@/lib/agents/claimHints';

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
  if (!registrationId) {
    return NextResponse.json({ error: 'registrationId required' }, { status: 400 });
  }

  const regRef = adminDb.collection('registrations').doc(registrationId);
  const regSnap = await regRef.get();

  if (!regSnap.exists || regSnap.data()?.userId !== uid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const reg = regSnap.data()!;
  if (reg.type !== 'patent') {
    return NextResponse.json({ error: 'Only patent registrations supported' }, { status: 400 });
  }

  const extractedFields = (reg.extractedFields ?? {}) as Record<string, unknown>;
  const inventionTitle = String(extractedFields.inventionTitle ?? '발명');

  // Load conversation messages
  const msgsSnap = await adminDb
    .collection('registrations')
    .doc(registrationId)
    .collection('messages')
    .orderBy('timestamp', 'asc')
    .get();

  const messages = msgsSnap.docs.map((d) => ({
    role: d.data().role as string,
    content: d.data().content as string,
  }));

  // Extract claim hints
  const hints = await extractClaimHints(extractedFields, messages);

  // Generate 3 claim variants
  const claims = await generateClaims(hints, inventionTitle);

  // Store in Firestore
  const now = FieldValue.serverTimestamp();
  await regRef.update({
    suggestedClaims: claims,
    claimHints: hints,
    updatedAt: now,
  });

  return NextResponse.json({ claims, hints });
}

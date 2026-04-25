import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

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

  const { registrationId, attorneyEmail, note } = await req.json();
  if (!registrationId || !attorneyEmail) {
    return NextResponse.json({ error: 'registrationId and attorneyEmail required' }, { status: 400 });
  }

  const regSnap = await adminDb.collection('registrations').doc(registrationId).get();
  if (!regSnap.exists || regSnap.data()?.userId !== uid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await adminDb.collection('referrals').add({
    registrationId,
    userId: uid,
    attorneyEmail,
    note: note ?? '',
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}

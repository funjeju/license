import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getImageEmbedding } from '@/lib/integrations/replicate';

export interface SimilarTrademark {
  id: string;
  registrationNumber: string;
  applicationNumber: string;
  imageURL: string;
  niceClasses: string[];
  similarity: number;
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

  const { assetId, niceClass } = await req.json();
  if (!assetId) {
    return NextResponse.json({ error: 'assetId required' }, { status: 400 });
  }

  // Load asset
  const assetSnap = await adminDb.collection('assets').doc(assetId).get();
  if (!assetSnap.exists || assetSnap.data()?.userId !== uid) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  const asset = assetSnap.data()!;
  if (!asset.base64) {
    return NextResponse.json({ error: 'Asset has no image data' }, { status: 400 });
  }

  // Get CLIP embedding for the query image
  let queryEmbedding: number[];
  try {
    queryEmbedding = await getImageEmbedding(asset.base64, asset.mimeType ?? 'image/png');
  } catch (err) {
    return NextResponse.json(
      { error: `Embedding failed: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 500 },
    );
  }

  // Firestore Vector Search (KNN)
  const collection = adminDb.collection('trademark_embeddings');
  let query = collection.findNearest({
    vectorField: 'embedding',
    queryVector: FieldValue.vector(queryEmbedding),
    limit: 10,
    distanceMeasure: 'COSINE',
  });

  if (niceClass) {
    // Unfortunately, Firestore doesn't support mixing array-contains with findNearest
    // in a single query — filter post-fetch instead
  }

  const snapshot = await query.get();

  let matches = snapshot.docs.map((doc) => {
    const data = doc.data();
    // distanceMeasure COSINE: distance stored in doc._ref or computed
    const distance: number = (doc as unknown as { distance?: number }).distance ?? 0;
    return {
      id: doc.id,
      registrationNumber: String(data.registrationNumber ?? ''),
      applicationNumber: String(data.applicationNumber ?? ''),
      imageURL: String(data.imageURL ?? ''),
      niceClasses: Array.isArray(data.niceClasses) ? data.niceClasses as string[] : [],
      similarity: Math.round((1 - distance) * 100) / 100,
    } satisfies SimilarTrademark;
  });

  // Post-filter by nice class if provided
  if (niceClass) {
    matches = matches.filter((m) => m.niceClasses.includes(niceClass));
  }

  return NextResponse.json({ matches, total: matches.length });
}

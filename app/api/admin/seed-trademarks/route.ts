/**
 * Admin-only route: 특정 니스류 KIPRIS 상표 이미지를 크롤링해 벡터 DB에 저장.
 *
 * 호출: POST /api/admin/seed-trademarks
 *   Authorization: Bearer <ADMIN_SECRET>
 *   Body: { niceClass: string; limit?: number }
 *
 * 환경변수 ADMIN_SECRET 으로 보호됨. 프로덕션 빌드에 노출되지 않도록 API key 회전 관리 필요.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { searchTrademarks } from '@/lib/integrations/kipris';
import { getImageEmbeddingFromUrl } from '@/lib/integrations/replicate';

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? '';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!ADMIN_SECRET || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { niceClass, limit = 20 } = await req.json();
  if (!niceClass) {
    return NextResponse.json({ error: 'niceClass required' }, { status: 400 });
  }

  // KIPRIS에서 해당 류의 등록된 상표 목록 가져오기
  // 여러 공통 검색어로 더 많은 결과 수집
  const queries = ['', '가', '나', '다', '라'];
  const seen = new Set<string>();
  const trademarks: { applicationNumber: string; imageUrl?: string; niceClasses: string[] }[] = [];

  for (const q of queries) {
    if (trademarks.length >= limit) break;
    const results = await searchTrademarks(q || '상표', niceClass).catch(() => []);
    for (const tm of results) {
      if (!seen.has(tm.applicationNumber) && tm.imageUrl) {
        seen.add(tm.applicationNumber);
        trademarks.push({
          applicationNumber: tm.applicationNumber,
          imageUrl: tm.imageUrl,
          niceClasses: tm.niceClasses,
        });
      }
    }
  }

  const now = FieldValue.serverTimestamp();
  let saved = 0;
  let failed = 0;

  for (const tm of trademarks.slice(0, limit)) {
    if (!tm.imageUrl) continue;

    try {
      const embedding = await getImageEmbeddingFromUrl(tm.imageUrl);

      // Check if already exists
      const existing = await adminDb
        .collection('trademark_embeddings')
        .where('applicationNumber', '==', tm.applicationNumber)
        .limit(1)
        .get();

      if (!existing.empty) {
        // Update embedding
        await existing.docs[0].ref.update({
          embedding: FieldValue.vector(embedding),
          fetchedAt: now,
        });
      } else {
        await adminDb.collection('trademark_embeddings').add({
          applicationNumber: tm.applicationNumber,
          registrationNumber: '',
          imageURL: tm.imageUrl,
          niceClasses: tm.niceClasses,
          embedding: FieldValue.vector(embedding),
          fetchedAt: now,
        });
      }

      saved++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({
    niceClass,
    processed: trademarks.length,
    saved,
    failed,
  });
}

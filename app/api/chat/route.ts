import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { anthropic } from '@/lib/ai/providers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { buildInterviewerSystem } from '@/lib/agents/interviewer';
import type { IPType } from '@/lib/agents/classifier';

// IP 유형별 필수 필드 목록
const REQUIRED_FIELDS: Record<IPType, string[]> = {
  copyright: ['title', 'typeCode', 'description', 'creationDate', 'authorName', 'publicationStatus'],
  trademark:  ['markName', 'markType', 'markDescription', 'niceClasses', 'applicantName'],
  design:     ['designTitle', 'locarnoClass', 'articleName', 'designConcept'],
  patent:     ['inventionTitle', 'technicalField', 'backgroundArt', 'problemToSolve', 'solution', 'effects'],
};

export async function POST(req: NextRequest) {
  // 인증
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return new Response('Invalid token', { status: 401 });
  }

  const { registrationId, messages } = await req.json();
  if (!registrationId) return new Response('registrationId required', { status: 400 });

  // Firestore에서 registration 조회
  const regRef = adminDb.collection('registrations').doc(registrationId);
  const regSnap = await regRef.get();

  if (!regSnap.exists || regSnap.data()?.userId !== uid) {
    return new Response('Not found', { status: 404 });
  }

  const reg = regSnap.data()!;
  const ipType = reg.type as IPType;
  const extractedFields = reg.extractedFields ?? {};

  // 최근 메시지 → 인터뷰어 시스템 프롬프트 조립
  const recentMessages = (messages ?? []).slice(-6).map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const systemPrompt = buildInterviewerSystem(
    ipType,
    extractedFields,
    recentMessages,
    REQUIRED_FIELDS[ipType] ?? []
  );

  // AI SDK v6 streamText
  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: systemPrompt,
    messages: messages ?? [],
    maxOutputTokens: 512,
    onFinish: async ({ text }) => {
      // 응답 완료 후 메시지 Firestore 저장 (마지막 유저 메시지 + AI 응답)
      const batch = adminDb.batch();

      const lastUserMsg = [...(messages ?? [])].reverse().find((m: { role: string }) => m.role === 'user');
      if (lastUserMsg) {
        batch.set(regRef.collection('messages').doc(), {
          role: 'user',
          content: lastUserMsg.content,
          timestamp: FieldValue.serverTimestamp(),
        });
      }

      batch.set(regRef.collection('messages').doc(), {
        role: 'assistant',
        content: text,
        timestamp: FieldValue.serverTimestamp(),
        meta: { agentUsed: 'interviewer' },
      });

      batch.update(regRef, { updatedAt: FieldValue.serverTimestamp() });

      await batch.commit().catch(console.error);

      // Extractor 비동기 호출 (fire-and-forget)
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authHeader.slice(7)}`,
        },
        body: JSON.stringify({ registrationId }),
      }).catch(console.error);
    },
  });

  return result.toUIMessageStreamResponse();
}

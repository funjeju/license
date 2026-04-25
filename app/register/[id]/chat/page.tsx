'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { getClientAuth, getClientDb } from '@/lib/firebase/client';
import Sidebar from '@/components/layout/Sidebar';
import ChatPanel from '@/components/chat/ChatPanel';
import FormPreview from '@/components/preview/FormPreview';
import FieldList from '@/components/preview/FieldList';
import TrademarkPanel from '@/components/trademark/TrademarkPanel';
import DesignPanel from '@/components/design/DesignPanel';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Wand2, ScrollText } from 'lucide-react';
import type { IPType } from '@/lib/agents/classifier';

interface Registration {
  type: IPType;
  title: string;
  status: string;
  progress: number;
  extractedFields: Record<string, unknown>;
}

export default function ChatWorkspacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const registrationId = params.id;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState('');
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth.currentUser) { router.push('/login'); return; }

    auth.currentUser.getIdToken().then(setAuthToken).catch(() => {});

    const db = getClientDb();
    const unsub = onSnapshot(
      doc(db, 'registrations', registrationId),
      (snap) => {
        if (!snap.exists()) { router.push('/dashboard'); return; }
        setRegistration(snap.data() as Registration);
        setLoading(false);
      },
      () => { router.push('/dashboard'); }
    );

    return () => unsub();
  }, [registrationId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-royal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!registration) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar (데스크톱만) */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar currentPath={pathname} />
      </div>

      {/* ChatPanel */}
      <div className="w-full md:w-[400px] md:min-w-[360px] md:max-w-[480px] flex-shrink-0 h-full border-r border-neutral-200">
        <ChatPanel
          registrationId={registrationId}
          projectTitle={registration.title}
          ipType={registration.type}
        />
      </div>

      {/* FormPreview */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden border-r border-neutral-200">
        <FormPreview
          registrationId={registrationId}
          ipType={registration.type}
          fieldRefs={fieldRefs}
        />
        {/* 진행 배너 */}
        {registration.progress >= 70 && (
          <div className="flex-shrink-0 border-t border-jade-100 bg-jade-50 px-4 py-2.5 flex items-center justify-between">
            <p className="text-caption text-jade-700 font-medium">
              필수 정보 {registration.progress}% 작성 완료
            </p>
            {registration.type === 'patent' ? (
              <Link
                href={`/register/${registrationId}/claims`}
                className="flex items-center gap-1.5 bg-jade text-white text-caption font-medium px-3 py-1.5 rounded-md hover:bg-jade-600 transition-colors"
              >
                <ScrollText className="w-3.5 h-3.5" />
                청구범위 추천 보기
              </Link>
            ) : (
              <Link
                href={`/register/${registrationId}/studio`}
                className="flex items-center gap-1.5 bg-jade text-white text-caption font-medium px-3 py-1.5 rounded-md hover:bg-jade-600 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                도안 스튜디오로 이동
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Right panel — ≥1440px에서만 표시 */}
      <div className="hidden 2xl:flex w-[280px] flex-shrink-0 flex-col overflow-hidden border-l border-neutral-200">
        {registration.type === 'trademark' ? (
          <div className="flex-1 overflow-y-auto p-3">
            <TrademarkPanel
              registrationId={registrationId}
              markName={String(registration.extractedFields.markName ?? '')}
              markDescription={String(registration.extractedFields.markDescription ?? '')}
              extractedNiceClasses={
                Array.isArray(registration.extractedFields.niceClasses)
                  ? (registration.extractedFields.niceClasses as string[])
                  : []
              }
              authToken={authToken}
            />
          </div>
        ) : registration.type === 'design' ? (
          <div className="flex-1 overflow-y-auto p-3">
            <DesignPanel
              registrationId={registrationId}
              designTitle={String(registration.extractedFields.designTitle ?? '')}
              designConcept={String(registration.extractedFields.designConcept ?? '')}
              articleName={String(registration.extractedFields.articleName ?? '')}
              authToken={authToken}
            />
          </div>
        ) : (
          <FieldList
            ipType={registration.type}
            fields={registration.extractedFields}
            progress={registration.progress}
            fieldRefs={fieldRefs}
          />
        )}
      </div>
    </div>
  );
}

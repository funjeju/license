'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { getClientAuth, getClientDb } from '@/lib/firebase/client';
import Sidebar from '@/components/layout/Sidebar';
import ChatPanel from '@/components/chat/ChatPanel';
import { usePathname } from 'next/navigation';

interface Registration {
  type: string;
  title: string;
  status: string;
  progress: number;
  extractedFields: Record<string, unknown>;
}

const IP_TYPE_LABELS: Record<string, string> = {
  copyright: '저작권',
  trademark: '상표',
  design: '디자인권',
  patent: '특허',
};

export default function ChatWorkspacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const registrationId = params.id;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth.currentUser) { router.push('/login'); return; }

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
      <div className="flex-1 min-w-0 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-[400px] md:min-w-[360px] md:max-w-[480px] flex-shrink-0 h-full border-r border-neutral-200">
          <ChatPanel
            registrationId={registrationId}
            projectTitle={registration.title}
            ipType={registration.type}
          />
        </div>

        {/* FormPreview 영역 — Week 3에서 구현 */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-neutral-50 border-r border-neutral-200 p-6">
          <div className="text-center text-neutral-400">
            <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-h3">📄</span>
            </div>
            <p className="text-body font-medium text-neutral-600 mb-1">실시간 양식 미리보기</p>
            <p className="text-caption text-neutral-400">Week 3에서 구현됩니다</p>
          </div>
        </div>

        {/* FieldList 영역 — Week 3에서 구현 */}
        <div className="hidden 2xl:flex w-[220px] flex-shrink-0 flex-col bg-white border-l border-neutral-200 p-4">
          <p className="text-h4 text-neutral-900 mb-4">필드 목록</p>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-caption text-neutral-400 text-center">Week 3에서<br />구현됩니다</p>
          </div>
          <div className="border-t border-neutral-200 pt-3 mt-3">
            <p className="text-caption text-neutral-500 mb-2">작성 진행률</p>
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${registration.progress}%`,
                  backgroundColor: registration.progress >= 80 ? '#22C55E' : '#1E3A8A',
                }}
              />
            </div>
            <p className="text-h4 text-neutral-900 mt-1">{registration.progress}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { getClientAuth, getClientDb } from '@/lib/firebase/client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import GenerateMode from '@/components/studio/GenerateMode';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Registration {
  type: string;
  title: string;
  extractedFields: Record<string, unknown>;
  progress: number;
}

const IP_TYPE_LABELS: Record<string, string> = {
  copyright: '저작권',
  trademark: '상표',
  design:    '디자인권',
  patent:    '특허',
};

type StudioTab = 'generate' | 'upload' | 'hybrid';

const TABS: { value: StudioTab; label: string }[] = [
  { value: 'generate', label: 'AI 생성' },
  { value: 'upload',   label: '원본 업로드' },
  { value: 'hybrid',   label: '하이브리드' },
];

export default function StudioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const registrationId = params.id;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StudioTab>('generate');

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
      {/* Sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar currentPath={pathname} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-neutral-200 flex-shrink-0">
          <Link
            href={`/register/${registrationId}/chat`}
            className="flex items-center gap-1 text-caption text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            대화로 돌아가기
          </Link>
          <div className="w-px h-4 bg-neutral-200" />
          <span className="text-body font-medium text-neutral-900 truncate">{registration.title}</span>
          <span className="text-caption bg-royal text-white px-2 py-0.5 rounded-sm flex-shrink-0">
            {IP_TYPE_LABELS[registration.type] ?? registration.type}
          </span>
          <span className="ml-auto text-caption text-neutral-500">도안 스튜디오</span>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-neutral-200 px-4 flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'px-4 py-3 text-body border-b-2 transition-colors',
                tab === t.value
                  ? 'border-royal text-royal font-medium'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {tab === 'generate' && (
            <GenerateMode
              registrationId={registrationId}
              extractedFields={registration.extractedFields}
            />
          )}

          {tab === 'upload' && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-h3">📁</span>
              </div>
              <p className="text-body font-medium text-neutral-600 mb-1">원본 업로드</p>
              <p className="text-caption text-neutral-400">Week 6에서 구현됩니다</p>
            </div>
          )}

          {tab === 'hybrid' && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-h3">🔀</span>
              </div>
              <p className="text-body font-medium text-neutral-600 mb-1">하이브리드 모드</p>
              <p className="text-caption text-neutral-400">Week 6에서 구현됩니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

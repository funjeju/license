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
import { usePathname } from 'next/navigation';
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
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
      </div>

      {/* FieldList — ≥1440px에서만 표시 */}
      <div className="hidden 2xl:flex w-[220px] flex-shrink-0 flex-col overflow-hidden">
        <FieldList
          ipType={registration.type}
          fields={registration.extractedFields}
          progress={registration.progress}
          fieldRefs={fieldRefs}
        />
      </div>
    </div>
  );
}

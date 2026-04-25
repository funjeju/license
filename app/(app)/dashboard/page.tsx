'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getClientAuth, getClientDb } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FilePlus } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/dashboard/EmptyState';
import ProjectCard, { type ProjectCardData } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { IPType } from '@/lib/agents/classifier';

type FilterType = 'all' | IPType;
type FilterStatus = 'all' | 'in_progress' | 'completed';

const TYPE_FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'copyright', label: '저작권' },
  { value: 'trademark', label: '상표' },
  { value: 'design', label: '디자인권' },
  { value: 'patent', label: '특허' },
];

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: '전체 상태' },
  { value: 'in_progress', label: '진행 중' },
  { value: 'completed', label: '완료' },
];

const IN_PROGRESS_STATUSES = new Set(['collecting', 'in_progress', 'package_ready']);
const COMPLETED_STATUSES = new Set(['completed']);

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    const auth = getClientAuth();
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    setUserName(user.displayName?.split(' ')[0] ?? '');

    const db = getClientDb();
    const q = query(
      collection(db, 'registrations'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ProjectCardData, 'id'>),
      }));
      setProjects(docs);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  const filtered = projects.filter((p) => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (statusFilter === 'in_progress' && !IN_PROGRESS_STATUSES.has(p.status)) return false;
    if (statusFilter === 'completed' && !COMPLETED_STATUSES.has(p.status)) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-h2 md:text-h1 text-neutral-900">
              {userName ? `안녕하세요, ${userName}님` : '안녕하세요'}
            </h1>
            <p className="text-caption md:text-body text-neutral-500 mt-1">
              진행 중인 프로젝트를 확인하거나 새 프로젝트를 시작해보세요.
            </p>
          </div>
          <Button asChild className="bg-royal text-white hover:bg-royal-600 flex-shrink-0">
            <Link href="/register/new">
              <FilePlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">새 프로젝트</span>
              <span className="sm:hidden">새로</span>
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-royal border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Type filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTypeFilter(f.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-caption font-medium transition-colors',
                      typeFilter === f.value
                        ? 'bg-royal text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="sm:ml-auto flex items-center gap-1.5">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-caption font-medium transition-colors',
                      statusFilter === f.value
                        ? 'bg-neutral-800 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-body text-neutral-500">
                  해당 조건에 맞는 프로젝트가 없습니다.
                </p>
                <button
                  onClick={() => { setTypeFilter('all'); setStatusFilter('all'); }}
                  className="mt-3 text-caption text-royal hover:underline"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

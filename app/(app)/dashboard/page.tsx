import Link from 'next/link';
import { FilePlus } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import EmptyState from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  // 실제 구현에서는 서버 컴포넌트에서 Firestore 데이터를 가져옴
  // Week 3에서 실시간 구독과 연동 예정
  const projects: unknown[] = [];

  return (
    <AppShell>
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-h1 text-neutral-900">안녕하세요</h1>
            <p className="text-body text-neutral-500 mt-1">진행 중인 프로젝트를 확인하거나 새 프로젝트를 시작해보세요.</p>
          </div>
          <Button asChild className="bg-royal text-white hover:bg-royal-600">
            <Link href="/register/new">
              <FilePlus className="w-4 h-4 mr-2" />
              새 프로젝트
            </Link>
          </Button>
        </div>

        {/* Project Grid or Empty State */}
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {/* ProjectCard components rendered here in Week 3 */}
          </div>
        )}
      </div>
    </AppShell>
  );
}

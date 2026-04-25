'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Copyright, Tag, Layers, Lightbulb, ChevronRight } from 'lucide-react';
import type { IPType } from '@/lib/agents/classifier';

const IP_ICONS: Record<IPType, React.ComponentType<{ className?: string }>> = {
  copyright: Copyright,
  trademark: Tag,
  design: Layers,
  patent: Lightbulb,
};

const IP_LABELS: Record<IPType, string> = {
  copyright: '저작권',
  trademark: '상표',
  design: '디자인권',
  patent: '특허',
};

const IP_COLORS: Record<IPType, string> = {
  copyright: 'bg-violet-50 text-violet-700',
  trademark: 'bg-amber-50 text-amber-700',
  design: 'bg-cyan-50 text-cyan-700',
  patent: 'bg-jade-50 text-jade-700',
};

const STATUS_LABELS: Record<string, string> = {
  collecting: '정보 수집 중',
  in_progress: '진행 중',
  package_ready: '패키지 완료',
  completed: '완료',
};

export interface ProjectCardData {
  id: string;
  type: IPType;
  title: string;
  status: string;
  progress: number;
  updatedAt: { seconds: number } | null;
}

export default function ProjectCard({ project }: { project: ProjectCardData }) {
  const Icon = IP_ICONS[project.type] ?? Lightbulb;
  const typeColor = IP_COLORS[project.type] ?? 'bg-neutral-50 text-neutral-700';
  const statusLabel = STATUS_LABELS[project.status] ?? project.status;

  const updatedDate = project.updatedAt
    ? new Date(project.updatedAt.seconds * 1000).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Link
      href={`/register/${project.id}/chat`}
      className="group flex flex-col gap-3 p-4 bg-white border border-neutral-200 rounded-2xl hover:border-royal hover:shadow-sm transition-all duration-150"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-lg text-caption font-medium', typeColor)}>
          <Icon className="w-3.5 h-3.5" />
          {IP_LABELS[project.type] ?? project.type}
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-royal transition-colors mt-0.5 flex-shrink-0" />
      </div>

      {/* Title */}
      <p className="text-body font-semibold text-neutral-900 line-clamp-2 leading-snug">
        {project.title || '제목 없음'}
      </p>

      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-caption text-neutral-500">{statusLabel}</span>
          <span className="text-caption text-neutral-500 font-medium">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              project.progress >= 100 ? 'bg-jade' : 'bg-royal',
            )}
            style={{ width: `${Math.min(project.progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Updated date */}
      {updatedDate && (
        <p className="text-caption text-neutral-400">
          {updatedDate} 수정
        </p>
      )}
    </Link>
  );
}

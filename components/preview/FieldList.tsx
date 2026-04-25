'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTIONS_BY_TYPE } from '@/lib/schemas/fieldDefs';
import type { IPType } from '@/lib/agents/classifier';

interface FieldListProps {
  ipType: IPType;
  fields: Record<string, unknown>;
  progress: number;
  fieldRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

type FieldStatus = 'done' | 'partial' | 'empty';

function getStatus(value: unknown): FieldStatus {
  if (value === null || value === undefined || value === '') return 'empty';
  if (typeof value === 'string' && value.length < 3) return 'partial';
  return 'done';
}

function StatusIcon({ status }: { status: FieldStatus }) {
  if (status === 'done') {
    return <CheckCircle2 className="w-4 h-4 text-jade flex-shrink-0 animate-check-pop" />;
  }
  if (status === 'partial') {
    return <Circle className="w-4 h-4 text-royal flex-shrink-0 fill-royal" />;
  }
  return <Circle className="w-4 h-4 text-neutral-400 flex-shrink-0" />;
}

export default function FieldList({ ipType, fields, progress, fieldRefs }: FieldListProps) {
  const sections = SECTIONS_BY_TYPE[ipType] ?? [];

  function scrollTo(key: string) {
    const el = fieldRefs.current.get(key);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('animate-field-flash');
    setTimeout(() => el.classList.remove('animate-field-flash'), 800);
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-neutral-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 flex-shrink-0">
        <p className="text-h4 text-neutral-900">필드 목록</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {sections.map((section, si) => (
          <div key={section.id} className="mb-3">
            <p className="text-caption text-neutral-500 font-medium px-2 py-1">
              {si + 1}. {section.title}
            </p>
            {section.fields.map((field) => {
              const status = getStatus(fields[field.key]);
              return (
                <button
                  key={field.key}
                  onClick={() => scrollTo(field.key)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-50 text-left transition-colors"
                >
                  <StatusIcon status={status} />
                  <span className={cn(
                    'text-caption truncate flex-1',
                    status === 'done' ? 'text-neutral-700' : 'text-neutral-400'
                  )}>
                    {field.label}
                  </span>
                  {field.required && status === 'empty' && (
                    <span className="text-[10px] text-danger font-medium flex-shrink-0">필수</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="border-t border-neutral-200 px-4 py-3 flex-shrink-0">
        <p className="text-caption text-neutral-500 mb-1.5">작성 진행률</p>
        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: progress >= 80 ? '#22C55E' : '#1E3A8A',
            }}
          />
        </div>
        <p className="text-h4 text-neutral-900">{progress}%</p>
      </div>
    </div>
  );
}

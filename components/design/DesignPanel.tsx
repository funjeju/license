'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import LocarnoPanel from './LocarnoPanel';
import SixViewsPanel from './SixViewsPanel';

type DesignTab = 'locarno' | 'sixviews';

interface DesignPanelProps {
  registrationId: string;
  designTitle: string;
  designConcept?: string;
  articleName?: string;
  authToken: string;
}

const TABS: { value: DesignTab; label: string }[] = [
  { value: 'locarno', label: '로카르노 분류' },
  { value: 'sixviews', label: '6면도' },
];

export default function DesignPanel({
  registrationId,
  designTitle,
  designConcept,
  articleName,
  authToken,
}: DesignPanelProps) {
  const [tab, setTab] = useState<DesignTab>('locarno');
  const [selectedCode, setSelectedCode] = useState('');

  return (
    <div className="flex flex-col border border-neutral-200 rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 bg-neutral-50">
        <span className="text-body font-semibold text-neutral-900">디자인 도구</span>
        {designTitle && (
          <span className="text-caption text-neutral-500 truncate max-w-[160px]">— {designTitle}</span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-neutral-200 px-3">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-3 py-2 text-caption border-b-2 transition-colors',
              tab === t.value
                ? 'border-royal text-royal font-medium'
                : 'border-transparent text-neutral-500 hover:text-neutral-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto max-h-[480px]">
        {tab === 'locarno' && (
          <LocarnoPanel
            designTitle={designTitle}
            designConcept={designConcept}
            articleName={articleName}
            selectedCode={selectedCode}
            onSelect={(code) => setSelectedCode(code)}
            authToken={authToken}
          />
        )}

        {tab === 'sixviews' && (
          <SixViewsPanel
            registrationId={registrationId}
            authToken={authToken}
          />
        )}
      </div>
    </div>
  );
}

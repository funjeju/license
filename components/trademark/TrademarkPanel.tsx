'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import NiceClassPanel from './NiceClassPanel';
import KiprisResults from './KiprisResults';
import GoodsDraft from './GoodsDraft';
import ImageSimilarity from './ImageSimilarity';

type TrademarkTab = 'nice' | 'search' | 'image' | 'goods';

interface TrademarkPanelProps {
  registrationId: string;
  markName: string;
  markDescription?: string;
  extractedNiceClasses?: string[];
  authToken: string;
  onNiceClassesChange?: (classes: string[]) => void;
}

const TABS: { value: TrademarkTab; label: string }[] = [
  { value: 'nice', label: '니스 분류' },
  { value: 'search', label: '텍스트 조회' },
  { value: 'image', label: '도형 유사도' },
  { value: 'goods', label: '지정상품' },
];

export default function TrademarkPanel({
  registrationId,
  markName,
  markDescription,
  extractedNiceClasses = [],
  authToken,
  onNiceClassesChange,
}: TrademarkPanelProps) {
  const [tab, setTab] = useState<TrademarkTab>('nice');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(extractedNiceClasses);

  function handleClassesChange(classes: string[]) {
    setSelectedClasses(classes);
    onNiceClassesChange?.(classes);
  }

  return (
    <div className="flex flex-col border border-neutral-200 rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 bg-neutral-50">
        <span className="text-body font-semibold text-neutral-900">상표 도구</span>
        {markName && (
          <span className="text-caption text-neutral-500 truncate max-w-[160px]">— {markName}</span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-neutral-200 px-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-2.5 py-2 text-caption border-b-2 transition-colors whitespace-nowrap',
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
        {tab === 'nice' && (
          <NiceClassPanel
            markName={markName}
            markDescription={markDescription}
            selectedClasses={selectedClasses}
            onClassesChange={handleClassesChange}
            authToken={authToken}
          />
        )}

        {tab === 'search' && (
          <KiprisResults
            markName={markName}
            niceClasses={selectedClasses}
            authToken={authToken}
          />
        )}

        {tab === 'image' && (
          <ImageSimilarity
            registrationId={registrationId}
            niceClasses={selectedClasses}
            authToken={authToken}
          />
        )}

        {tab === 'goods' && (
          <GoodsDraft
            markName={markName}
            markDescription={markDescription}
            niceClasses={selectedClasses}
            authToken={authToken}
          />
        )}
      </div>
    </div>
  );
}

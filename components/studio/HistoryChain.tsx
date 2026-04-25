'use client';

import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HistoryNode {
  assetId: string;
  base64: string;
  mimeType: string;
  label: string; // '원본' | '편집 1' | '편집 2' ...
}

interface HistoryChainProps {
  nodes: HistoryNode[];
  currentId: string;
  onSelect: (assetId: string) => void;
}

export default function HistoryChain({ nodes, currentId, onSelect }: HistoryChainProps) {
  if (nodes.length <= 1) return null;

  return (
    <div className="border border-neutral-200 rounded-xl p-4 bg-white">
      <p className="text-label text-neutral-700 mb-3">수정 히스토리</p>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {nodes.map((node, idx) => {
          const isCurrent = node.assetId === currentId;
          return (
            <div key={node.assetId} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onSelect(node.assetId)}
                className={cn(
                  'relative rounded-lg overflow-hidden border-2 transition-all flex-shrink-0',
                  isCurrent ? 'border-royal shadow-sm' : 'border-neutral-200 hover:border-neutral-300'
                )}
                style={{ width: 64, height: 64 }}
              >
                <img
                  src={`data:${node.mimeType};base64,${node.base64}`}
                  alt={node.label}
                  className="w-full h-full object-cover"
                />
                {isCurrent && (
                  <div className="absolute top-0.5 right-0.5 bg-royal rounded-full p-0.5">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">
                  {node.label}
                </div>
              </button>
              {idx < nodes.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

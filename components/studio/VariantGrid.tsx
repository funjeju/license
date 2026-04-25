'use client';

import { Check, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VariantGridProps {
  assetIds: string[];
  images: Record<string, { base64: string; mimeType: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function VariantGrid({ assetIds, images, selectedId, onSelect }: VariantGridProps) {
  function handleDownload(id: string) {
    const img = images[id];
    if (!img) return;
    const a = document.createElement('a');
    a.href = `data:${img.mimeType};base64,${img.base64}`;
    a.download = `variant-${id.slice(-6)}.png`;
    a.click();
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {assetIds.map((id, idx) => {
        const img = images[id];
        const isSelected = selectedId === id;
        return (
          <div
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              'relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all group',
              isSelected ? 'border-royal shadow-md' : 'border-neutral-200 hover:border-neutral-300'
            )}
          >
            {img ? (
              <img
                src={`data:${img.mimeType};base64,${img.base64}`}
                alt={`Variant ${idx + 1}`}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square bg-neutral-100 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-royal rounded-full animate-spin" />
              </div>
            )}

            {/* Variant label */}
            <div className="absolute top-2 left-2 bg-black/50 text-white text-caption px-1.5 py-0.5 rounded">
              {idx + 1}
            </div>

            {/* Selected badge */}
            {isSelected && (
              <div className="absolute top-2 right-2 bg-royal rounded-full p-0.5">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}

            {/* Download on hover */}
            {img && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(id); }}
                className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="다운로드"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

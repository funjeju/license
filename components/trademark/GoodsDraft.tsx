'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';

interface DesignatedGoodsGroup {
  niceClass: string;
  goodsList: string[];
}

interface GoodsDraftProps {
  markName: string;
  markDescription?: string;
  niceClasses: string[];
  authToken: string;
}

export default function GoodsDraft({
  markName,
  markDescription,
  niceClasses,
  authToken,
}: GoodsDraftProps) {
  const [groups, setGroups] = useState<DesignatedGoodsGroup[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedClass, setCopiedClass] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!markName || niceClasses.length === 0 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/trademark/goods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ markName, markDescription, niceClasses }),
      });

      if (!res.ok) throw new Error('생성 실패');
      const data = await res.json();
      setGroups(data.designatedGoods ?? []);
      setNotes(data.notes ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, [markName, markDescription, niceClasses, authToken, loading]);

  async function copyClass(group: DesignatedGoodsGroup) {
    const text = group.goodsList.join(', ');
    await navigator.clipboard.writeText(text);
    setCopiedClass(group.niceClass);
    setTimeout(() => setCopiedClass(null), 2000);
  }

  if (niceClasses.length === 0) {
    return (
      <div className="text-caption text-neutral-400 text-center py-4">
        니스 분류를 먼저 선택하세요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-label font-semibold text-neutral-700">지정상품 초안 생성</p>
        <button
          onClick={generate}
          disabled={loading}
          className={cn(
            'flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-lg transition-colors',
            loading
              ? 'bg-neutral-100 text-neutral-400 cursor-wait'
              : 'bg-royal text-white hover:bg-royal-700',
          )}
        >
          {loading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Sparkles className="w-3.5 h-3.5" />
          }
          AI 초안 생성
        </button>
      </div>

      {error && <p className="text-caption text-danger">{error}</p>}

      {notes && (
        <p className="text-caption text-neutral-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {notes}
        </p>
      )}

      {groups.length > 0 && (
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <div key={group.niceClass} className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 border-b border-neutral-200">
                <span className="text-body font-medium text-neutral-900">{group.niceClass}류</span>
                <button
                  onClick={() => copyClass(group)}
                  className="flex items-center gap-1 text-caption text-neutral-500 hover:text-royal transition-colors"
                >
                  {copiedClass === group.niceClass
                    ? <><Check className="w-3 h-3" /> 복사됨</>
                    : <><Copy className="w-3 h-3" /> 복사</>
                  }
                </button>
              </div>
              <div className="px-3 py-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {group.goodsList.map((g) => (
                    <span
                      key={g}
                      className="text-caption bg-royal-50 text-royal-800 border border-royal-100 px-2 py-0.5 rounded"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';

interface NiceRecommendation {
  classNumber: string;
  label: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  sampleGoods: string[];
}

interface NiceClassPanelProps {
  markName: string;
  markDescription?: string;
  selectedClasses: string[];
  onClassesChange: (classes: string[]) => void;
  authToken: string;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-jade-50 text-jade-700 border-jade-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-neutral-50 text-neutral-600 border-neutral-200',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

export default function NiceClassPanel({
  markName,
  markDescription,
  selectedClasses,
  onClassesChange,
  authToken,
}: NiceClassPanelProps) {
  const [recommendations, setRecommendations] = useState<NiceRecommendation[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!markName || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/trademark/nice-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ markName, markDescription }),
      });

      if (!res.ok) throw new Error('추천 요청 실패');
      const data = await res.json();
      setRecommendations(data.recommendations ?? []);
      setSummary(data.summary ?? '');

      // 신뢰도 높음인 클래스 자동 선택
      const highConf = (data.recommendations ?? [])
        .filter((r: NiceRecommendation) => r.confidence === 'high')
        .map((r: NiceRecommendation) => r.classNumber);
      const merged = [...new Set([...selectedClasses, ...highConf])];
      onClassesChange(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, [markName, markDescription, authToken, loading, selectedClasses, onClassesChange]);

  function toggleClass(classNum: string) {
    const next = selectedClasses.includes(classNum)
      ? selectedClasses.filter((c) => c !== classNum)
      : [...selectedClasses, classNum];
    onClassesChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-label font-semibold text-neutral-700">니스 분류 추천</p>
        <button
          onClick={fetchRecommendations}
          disabled={loading || !markName}
          className={cn(
            'flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-lg transition-colors',
            loading || !markName
              ? 'bg-neutral-100 text-neutral-400 cursor-default'
              : 'bg-royal text-white hover:bg-royal-700',
          )}
        >
          {loading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Sparkles className="w-3.5 h-3.5" />
          }
          AI 추천
        </button>
      </div>

      {error && <p className="text-caption text-danger">{error}</p>}

      {summary && (
        <p className="text-caption text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2">{summary}</p>
      )}

      {recommendations.length > 0 && (
        <div className="flex flex-col gap-2">
          {recommendations.map((rec) => {
            const selected = selectedClasses.includes(rec.classNumber);
            const expanded = expandedClass === rec.classNumber;

            return (
              <div
                key={rec.classNumber}
                className={cn(
                  'border rounded-xl overflow-hidden transition-colors',
                  selected ? 'border-royal' : 'border-neutral-200',
                )}
              >
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <button
                    onClick={() => toggleClass(rec.classNumber)}
                    className={cn(
                      'w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors',
                      selected ? 'bg-royal border-royal' : 'border-neutral-300',
                    )}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span className="text-body font-medium text-neutral-900">
                      {rec.classNumber}류 — {rec.label}
                    </span>
                  </div>

                  <span className={cn('text-caption px-2 py-0.5 rounded-full border', CONFIDENCE_COLORS[rec.confidence])}>
                    {CONFIDENCE_LABELS[rec.confidence]}
                  </span>

                  <button
                    onClick={() => setExpandedClass(expanded ? null : rec.classNumber)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {expanded && (
                  <div className="px-3 pb-3 pt-0 border-t border-neutral-100">
                    <p className="text-caption text-neutral-600 mb-2">{rec.reason}</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.sampleGoods.map((g) => (
                        <span key={g} className="text-caption bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedClasses.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-caption text-neutral-500">선택됨:</span>
          {selectedClasses.map((c) => (
            <span
              key={c}
              className="text-caption bg-royal-50 text-royal border border-royal-100 px-2 py-0.5 rounded-full"
            >
              {c}류
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

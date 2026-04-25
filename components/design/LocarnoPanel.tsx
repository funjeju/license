'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
import { LOCARNO_CLASSES } from '@/lib/data/locarno-classes';

interface LocarnoRecommendation {
  classCode: string;
  subclassCode?: string;
  className: string;
  subclassName?: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

interface LocarnoPanelProps {
  designTitle: string;
  designConcept?: string;
  articleName?: string;
  selectedCode: string;
  onSelect: (code: string, articleName?: string) => void;
  authToken: string;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-jade-50 text-jade-700 border-jade-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-neutral-50 text-neutral-600 border-neutral-200',
};

export default function LocarnoPanel({
  designTitle,
  designConcept,
  articleName,
  selectedCode,
  onSelect,
  authToken,
}: LocarnoPanelProps) {
  const [recommendations, setRecommendations] = useState<LocarnoRecommendation[]>([]);
  const [suggestedArticleName, setSuggestedArticleName] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [manualSearch, setManualSearch] = useState('');

  const fetchRecommendations = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/design/locarno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ designTitle, designConcept, articleName }),
      });
      if (!res.ok) throw new Error('추천 요청 실패');
      const data = await res.json();
      setRecommendations(data.recommendations ?? []);
      setSuggestedArticleName(data.articleName ?? '');
      setSummary(data.summary ?? '');

      // 신뢰도 높음 자동 선택
      const highConf = (data.recommendations as LocarnoRecommendation[]).find(
        (r) => r.confidence === 'high',
      );
      if (highConf && !selectedCode) {
        onSelect(highConf.subclassCode ?? highConf.classCode, data.articleName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, [designTitle, designConcept, articleName, authToken, loading, selectedCode, onSelect]);

  const filteredClasses = manualSearch
    ? LOCARNO_CLASSES.filter(
        (c) =>
          c.nameKo.includes(manualSearch) ||
          c.subclasses.some((s) => s.nameKo.includes(manualSearch)),
      )
    : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-label font-semibold text-neutral-700">로카르노 분류</p>
        <button
          onClick={fetchRecommendations}
          disabled={loading || !designTitle}
          className={cn(
            'flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-lg transition-colors',
            loading || !designTitle
              ? 'bg-neutral-100 text-neutral-400'
              : 'bg-royal text-white hover:bg-royal-700',
          )}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          AI 추천
        </button>
      </div>

      {error && <p className="text-caption text-danger">{error}</p>}

      {summary && (
        <p className="text-caption text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2">{summary}</p>
      )}

      {suggestedArticleName && (
        <div className="flex items-center gap-2 px-3 py-2 bg-jade-50 border border-jade-100 rounded-lg">
          <span className="text-caption text-jade-700">
            권장 물품명칭: <strong>{suggestedArticleName}</strong>
          </span>
        </div>
      )}

      {/* AI recommendations */}
      {recommendations.length > 0 && (
        <div className="flex flex-col gap-2">
          {recommendations.map((rec) => {
            const code = rec.subclassCode ?? rec.classCode;
            const isSelected = selectedCode === code;
            const isExpanded = expanded === code;

            return (
              <div
                key={code}
                className={cn(
                  'border rounded-xl overflow-hidden transition-colors',
                  isSelected ? 'border-royal' : 'border-neutral-200',
                )}
              >
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <button
                    onClick={() => onSelect(code, suggestedArticleName || undefined)}
                    className={cn(
                      'w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors',
                      isSelected ? 'bg-royal border-royal' : 'border-neutral-300',
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-body font-medium text-neutral-900">
                      {code}류{rec.subclassName ? ` — ${rec.subclassName}` : ` — ${rec.className}`}
                    </span>
                  </div>
                  <span className={cn('text-caption px-2 py-0.5 rounded-full border', CONFIDENCE_COLORS[rec.confidence])}>
                    {rec.confidence === 'high' ? '높음' : rec.confidence === 'medium' ? '보통' : '낮음'}
                  </span>
                  <button onClick={() => setExpanded(isExpanded ? null : code)} className="text-neutral-400 hover:text-neutral-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 border-t border-neutral-100">
                    <p className="text-caption text-neutral-600">{rec.reason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Manual search */}
      <div>
        <p className="text-caption text-neutral-500 mb-1.5">직접 검색</p>
        <input
          type="text"
          value={manualSearch}
          onChange={(e) => setManualSearch(e.target.value)}
          placeholder="예: 스마트폰, 가방, 조명"
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-royal"
        />
        {filteredClasses.length > 0 && (
          <div className="mt-2 flex flex-col gap-1 max-h-48 overflow-y-auto">
            {filteredClasses.flatMap((cls) => [
              ...cls.subclasses
                .filter((s) => s.nameKo.includes(manualSearch))
                .map((sub) => (
                  <button
                    key={sub.code}
                    onClick={() => { onSelect(sub.code); setManualSearch(''); }}
                    className={cn(
                      'text-left px-3 py-2 rounded-lg text-body transition-colors',
                      selectedCode === sub.code
                        ? 'bg-royal-50 text-royal'
                        : 'hover:bg-neutral-50 text-neutral-700',
                    )}
                  >
                    <span className="font-medium">{sub.code}</span> — {sub.nameKo}
                  </button>
                )),
            ])}
          </div>
        )}
      </div>

      {selectedCode && (
        <p className="text-caption text-royal font-medium">선택된 분류: {selectedCode}류</p>
      )}
    </div>
  );
}

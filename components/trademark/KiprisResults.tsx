'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, AlertTriangle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

interface TrademarkResult {
  applicationNumber: string;
  applicantName: string;
  markName: string;
  markType: string;
  niceClasses: string[];
  applicationDate: string;
  registrationStatus: string;
  imageUrl?: string;
}

interface KiprisResultsProps {
  markName: string;
  niceClasses: string[];
  authToken: string;
  autoSearch?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  '등록': '등록',
  '출원': '출원중',
  '거절': '거절',
  '포기': '포기',
  '취소': '취소',
};

export default function KiprisResults({
  markName,
  niceClasses,
  authToken,
  autoSearch = false,
}: KiprisResultsProps) {
  const [results, setResults] = useState<TrademarkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch() {
    if (!markName || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/search/kipris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          type: 'trademark',
          query: markName,
          filters: niceClasses.length > 0 ? { niceClass: niceClasses[0] } : undefined,
        }),
      });

      if (!res.ok) throw new Error('검색 실패');
      const data = await res.json();
      setResults(data.results ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoSearch && markName && niceClasses.length > 0 && !searched) {
      runSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSearch, markName, niceClasses.length]);

  const conflictCount = results.filter((r) =>
    r.registrationStatus.includes('등록') || r.registrationStatus.includes('출원'),
  ).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-label font-semibold text-neutral-700">KIPRIS 선행 상표 조회</p>
        <button
          onClick={runSearch}
          disabled={loading || !markName}
          className={cn(
            'flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-lg transition-colors',
            loading || !markName
              ? 'bg-neutral-100 text-neutral-400 cursor-default'
              : 'bg-neutral-800 text-white hover:bg-neutral-700',
          )}
        >
          {loading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Search className="w-3.5 h-3.5" />
          }
          조회
        </button>
      </div>

      {error && <p className="text-caption text-danger">{error}</p>}

      {searched && !loading && (
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          conflictCount > 0
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-jade-50 border border-jade-200',
        )}>
          {conflictCount > 0 ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-caption text-amber-700">
                유사 상표 <strong>{conflictCount}건</strong> 발견됨 — 전문가 검토를 권장합니다.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-jade-600 flex-shrink-0" />
              <p className="text-caption text-jade-700">
                동일·유사 상표가 조회되지 않았습니다. (최종 확인은 KIPRIS 직접 조회 권장)
              </p>
            </>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {results.map((item) => (
            <div
              key={item.applicationNumber}
              className="flex items-start gap-3 px-3 py-2.5 border border-neutral-200 rounded-xl"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.markName}
                  className="w-10 h-10 object-contain rounded flex-shrink-0 bg-neutral-50 border border-neutral-100"
                />
              ) : (
                <div className="w-10 h-10 bg-neutral-100 rounded flex-shrink-0 flex items-center justify-center">
                  <span className="text-caption text-neutral-400">상표</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-body font-medium text-neutral-900 truncate">{item.markName}</p>
                  <span className={cn(
                    'text-caption px-1.5 py-0.5 rounded flex-shrink-0',
                    item.registrationStatus.includes('등록')
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-neutral-100 text-neutral-600',
                  )}>
                    {STATUS_LABELS[item.registrationStatus] ?? item.registrationStatus}
                  </span>
                </div>
                <p className="text-caption text-neutral-500 truncate">{item.applicantName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-caption text-neutral-400">{item.applicationDate}</span>
                  {item.niceClasses.length > 0 && (
                    <span className="text-caption text-royal">{item.niceClasses.join('·')}류</span>
                  )}
                </div>
              </div>

              <a
                href={`https://www.kipris.or.kr/khome/searchPad/trademarkSearch.do?srchType=3&text=${encodeURIComponent(item.applicationNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-royal flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-caption text-neutral-400 text-center py-2">검색 결과가 없습니다.</p>
      )}
    </div>
  );
}

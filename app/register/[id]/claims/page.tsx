'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getClientAuth, getClientDb } from '@/lib/firebase/client';
import WorkspaceShell from '@/components/layout/WorkspaceShell';
import { cn } from '@/lib/utils';
import {
  Loader2, AlertTriangle, ChevronDown, ChevronUp,
  Check, ArrowLeft, Package, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import type { SuggestedClaim } from '@/lib/agents/claimHints';

interface Registration {
  type: string;
  title: string;
  extractedFields: Record<string, unknown>;
  suggestedClaims?: SuggestedClaim[];
}

const SCOPE_LABELS: Record<string, string> = {
  broad: '넓은 범위 (A)',
  medium: '중간 범위 (B)',
  narrow: '좁은 범위 (C)',
};

const SCOPE_COLORS: Record<string, string> = {
  broad: 'bg-amber-50 text-amber-700 border-amber-200',
  medium: 'bg-jade-50 text-jade-700 border-jade-200',
  narrow: 'bg-neutral-50 text-neutral-600 border-neutral-200',
};

export default function ClaimsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const registrationId = params.id;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>('medium');
  const [selectedScope, setSelectedScope] = useState<string | null>(null);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth.currentUser) { router.push('/login'); return; }

    const db = getClientDb();
    const unsub = onSnapshot(
      doc(db, 'registrations', registrationId),
      (snap) => {
        if (!snap.exists()) { router.push('/dashboard'); return; }
        const data = snap.data() as Registration;
        setRegistration(data);
        setLoading(false);
      },
      () => { router.push('/dashboard'); },
    );
    return () => unsub();
  }, [registrationId, router]);

  async function handleGenerate() {
    if (generating) return;
    setGenerating(true);
    setError(null);

    try {
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken() ?? '';
      const res = await fetch('/api/claims/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ registrationId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? '생성 실패');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSelectClaim(scope: string) {
    setSelectedScope(scope);
    try {
      const db = getClientDb();
      await updateDoc(doc(db, 'registrations', registrationId), {
        selectedClaimScope: scope,
      });
    } catch { /* fire-and-forget */ }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-royal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!registration) return null;

  const claims = registration.suggestedClaims ?? [];

  return (
    <WorkspaceShell>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-neutral-200 flex-shrink-0">
          <Link
            href={`/register/${registrationId}/chat`}
            className="flex items-center gap-1 text-caption text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            대화로 돌아가기
          </Link>
          <div className="w-px h-4 bg-neutral-200" />
          <span className="text-body font-medium text-neutral-900 truncate">{registration.title}</span>
          <span className="text-caption bg-royal text-white px-2 py-0.5 rounded-sm flex-shrink-0">특허</span>
          <span className="ml-auto text-caption text-neutral-500">청구범위 추천</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">

          {/* Disclaimer (spec 13.3) */}
          <div className="mb-6 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-body text-amber-800 font-medium mb-1">변리사 검토 권장</p>
                <p className="text-caption text-amber-700 leading-relaxed">
                  저희가 대화 내용을 바탕으로 3가지 방향의 추천안을 준비했어요.
                  청구범위는 특허의 권리 경계를 결정하는 가장 핵심적인 부분이라,
                  이 부분은 반드시 변리사와 충분히 검토하실 것을 권장드립니다.
                  아래 추천안은 그 검토를 위한 출발점으로 활용해 주세요.
                </p>
              </div>
            </div>
          </div>

          {/* Generate / Regenerate button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-neutral-900">청구범위 추천안</h1>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-body font-medium transition-colors',
                generating
                  ? 'bg-neutral-100 text-neutral-400 cursor-wait'
                  : claims.length > 0
                    ? 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    : 'bg-royal text-white hover:bg-royal-700',
              )}
            >
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</>
                : claims.length > 0
                  ? <><RefreshCw className="w-4 h-4" /> 재생성</>
                  : '추천안 생성하기'
              }
            </button>
          </div>

          {error && (
            <p className="mb-4 text-caption text-danger flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          {/* Claim cards */}
          {claims.length > 0 ? (
            <div className="flex flex-col gap-4">
              {claims.map((claim) => {
                const isExpanded = expandedId === claim.id;
                const isSelected = selectedScope === claim.scope;

                return (
                  <div
                    key={claim.id}
                    className={cn(
                      'border rounded-2xl overflow-hidden transition-all',
                      isSelected ? 'border-royal shadow-sm' : 'border-neutral-200',
                    )}
                  >
                    {/* Card header */}
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className={cn(
                          'text-caption px-2 py-0.5 rounded-full border font-medium flex-shrink-0',
                          SCOPE_COLORS[claim.scope],
                        )}>
                          {SCOPE_LABELS[claim.scope]}
                        </span>
                        {claim.recommended && (
                          <span className="text-caption bg-royal-50 text-royal border border-royal-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            추천
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleSelectClaim(claim.scope)}
                        className={cn(
                          'flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0',
                          isSelected
                            ? 'bg-royal border-royal text-white'
                            : 'border-neutral-300 text-neutral-700 hover:border-royal hover:text-royal',
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {isSelected ? '선택됨' : '이 방향 선택'}
                      </button>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : claim.id)}
                        className="text-neutral-400 hover:text-neutral-600 flex-shrink-0"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Claim text (always visible) */}
                    <div className="px-4 pb-3 border-t border-neutral-100 pt-3 bg-neutral-50/50">
                      <p className="text-body text-neutral-800 leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
                        {claim.text}
                      </p>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-neutral-100 flex flex-col gap-4 pt-4">
                        {/* Rationale */}
                        <div>
                          <p className="text-caption font-semibold text-neutral-700 mb-1">이 범위를 선택한 이유</p>
                          <p className="text-body text-neutral-600">{claim.rationale}</p>
                        </div>

                        {/* Risks */}
                        {claim.risks.length > 0 && (
                          <div>
                            <p className="text-caption font-semibold text-neutral-700 mb-1">주요 위험 요소</p>
                            <ul className="flex flex-col gap-1">
                              {claim.risks.map((risk, i) => (
                                <li key={i} className="flex items-start gap-2 text-body text-neutral-600">
                                  <span className="text-amber-500 flex-shrink-0">•</span>
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Attorney questions */}
                        {claim.attorneyQuestions.length > 0 && (
                          <div className="bg-royal-50 border border-royal-100 rounded-xl px-4 py-3">
                            <p className="text-caption font-semibold text-royal mb-2">
                              이 방향으로 가실 경우 변리사에게 특히 여쭤볼 점
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {claim.attorneyQuestions.map((q, i) => (
                                <li key={i} className="flex items-start gap-2 text-caption text-royal-800">
                                  <span className="flex-shrink-0">·</span>
                                  {q}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : !generating ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-body text-neutral-500">
                대화에서 수집된 정보를 바탕으로 청구범위를 생성합니다.
              </p>
              <button
                onClick={handleGenerate}
                className="px-6 py-3 bg-royal text-white rounded-xl text-body font-medium hover:bg-royal-700 transition-colors"
              >
                추천안 생성하기
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="w-6 h-6 text-royal animate-spin" />
              <p className="text-body text-neutral-500">청구범위를 생성하는 중입니다...</p>
            </div>
          )}

          {/* Package link */}
          {claims.length > 0 && (
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <p className="text-body text-neutral-600 mb-4">
                저희가 정리해드린 명세서 초안·도면·선행조사·청구범위 추천안을 한 묶음으로 준비했습니다.
                이 패키지를 들고 변리사에게 가시면 처음부터 설명하실 필요가 없어서 검토 시간과 비용이 크게 줄어들어요.
              </p>
              <Link
                href={`/register/${registrationId}/package`}
                className="flex items-center gap-2 px-5 py-3 bg-royal text-white rounded-xl text-body font-medium hover:bg-royal-700 transition-colors w-fit"
              >
                <Package className="w-4 h-4" />
                자료 패키지 생성하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}

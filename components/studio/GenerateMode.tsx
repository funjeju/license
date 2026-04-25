'use client';

import { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import VariantGrid from './VariantGrid';
import { getClientAuth } from '@/lib/firebase/client';
import type { StyleOption, CompositionOption } from '@/lib/agents/promptComposer';

interface GenerateModeProps {
  registrationId: string;
  extractedFields: Record<string, unknown>;
}

const STYLES: { value: StyleOption; label: string }[] = [
  { value: 'line_art',   label: '선화' },
  { value: '3d_render',  label: '3D 렌더' },
  { value: 'circuit',    label: '회로' },
  { value: 'isometric',  label: '아이소메트릭' },
  { value: 'blueprint',  label: '청사진' },
  { value: 'sketch',     label: '스케치' },
];

const COMPOSITIONS: { value: CompositionOption; label: string }[] = [
  { value: 'single',      label: '단일' },
  { value: 'multiview_6', label: '6면도' },
  { value: 'exploded',    label: '분해도' },
  { value: 'sequence',    label: '순서도' },
];

export default function GenerateMode({ registrationId, extractedFields }: GenerateModeProps) {
  const [style, setStyle] = useState<StyleOption>('line_art');
  const [composition, setComposition] = useState<CompositionOption>('single');
  const [userPrompt, setUserPrompt] = useState('');
  const [userAddition, setUserAddition] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [images, setImages] = useState<Record<string, { base64: string; mimeType: string }>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState('');

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setAssetIds([]);
    setImages({});
    setSelectedId(null);

    try {
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken() ?? '';

      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationId,
          prompt: userPrompt,
          style,
          composition,
          userAddition,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? '생성 실패');
      }

      const data = await res.json();
      setAssetIds(data.assetIds);
      setSessionId(data.sessionId);
      setFinalPrompt(data.prompt);

      // asset 레코드에서 base64 이미지 로드 (Firestore 직접 읽기)
      const { getClientDb } = await import('@/lib/firebase/client');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const db = getClientDb();
      const q = query(collection(db, 'assets'), where('sessionId', '==', data.sessionId));
      const snap = await getDocs(q);
      const imgMap: Record<string, { base64: string; mimeType: string }> = {};
      snap.forEach((d) => {
        const asset = d.data();
        imgMap[d.id] = { base64: asset.base64, mimeType: asset.mimeType };
      });
      setImages(imgMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto px-6 py-6">
      {/* Style chips */}
      <div>
        <p className="text-label text-neutral-700 mb-2">스타일</p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStyle(s.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-caption border transition-colors',
                style === s.value
                  ? 'bg-royal text-white border-royal'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composition chips */}
      <div>
        <p className="text-label text-neutral-700 mb-2">구성</p>
        <div className="flex flex-wrap gap-2">
          {COMPOSITIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => setComposition(c.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-caption border transition-colors',
                composition === c.value
                  ? 'bg-royal text-white border-royal'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-label text-neutral-700">프롬프트</p>
          <span className="text-caption text-neutral-400">비워두면 AI가 자동 생성</span>
        </div>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="직접 프롬프트를 입력하거나 비워두세요..."
          rows={3}
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-royal resize-none"
        />
      </div>

      {/* Additional instructions */}
      <div>
        <p className="text-label text-neutral-700 mb-2">추가 지시사항</p>
        <input
          type="text"
          value={userAddition}
          onChange={(e) => setUserAddition(e.target.value)}
          placeholder="예: 힌지 부분 강조, 빨간색 사용 금지"
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-royal"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="flex items-center justify-center gap-2 bg-royal text-white rounded-lg py-2.5 font-medium text-body hover:bg-royal-700 transition-colors disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            생성 중...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            도안 생성
          </>
        )}
      </button>

      {error && (
        <p className="text-caption text-danger text-center">{error}</p>
      )}

      {/* Results */}
      {assetIds.length > 0 && (
        <div>
          {finalPrompt && (
            <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <p className="text-caption text-neutral-500 mb-1">사용된 프롬프트</p>
              <p className="text-caption text-neutral-700">{finalPrompt}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <p className="text-label text-neutral-700">생성 결과 (4 variants)</p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1 text-caption text-neutral-500 hover:text-neutral-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              재생성
            </button>
          </div>

          <VariantGrid
            assetIds={assetIds}
            images={images}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {selectedId && (
            <div className="mt-4 p-3 bg-jade-50 border border-jade-100 rounded-lg">
              <p className="text-caption text-jade-700 font-medium">
                Variant {assetIds.indexOf(selectedId) + 1} 선택됨
              </p>
              <p className="text-caption text-neutral-500 mt-0.5">
                이미지 편집은 Week 5에서 구현됩니다
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

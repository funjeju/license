'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ScanSearch, AlertTriangle, CheckCircle2, Loader2, ExternalLink, Upload } from 'lucide-react';
import { getClientAuth, getClientStorage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import type { SimilarTrademark } from '@/app/api/similarity/image/route';

interface ImageSimilarityProps {
  registrationId: string;
  niceClasses: string[];
  existingAssetId?: string;
  authToken: string;
}

const RISK_THRESHOLD = 0.75;

export default function ImageSimilarity({
  registrationId,
  niceClasses,
  existingAssetId,
  authToken,
}: ImageSimilarityProps) {
  const [assetId, setAssetId] = useState<string | null>(existingAssetId ?? null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [matches, setMatches] = useState<SimilarTrademark[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadImageAndGetAsset(file: File): Promise<string> {
    const auth = getClientAuth();
    const storage = getClientStorage();
    const storagePath = `uploads/${registrationId}/similarity_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);
    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snap) => setUploadProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
        reject,
        resolve,
      );
    });
    setUploading(false);

    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    const token = await auth.currentUser?.getIdToken() ?? '';

    const res = await fetch('/api/image/upload-process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        registrationId,
        storagePath,
        downloadURL,
        filename: file.name,
        mimeType: file.type,
        targetKinds: [],
      }),
    });

    const data = await res.json();
    return data.originalAssetId as string;
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 가능합니다');
      return;
    }
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const id = await uploadImageAndGetAsset(file);
      setAssetId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationId]);

  const runSearch = useCallback(async () => {
    if (!assetId || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/similarity/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          assetId,
          niceClass: niceClasses[0],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? '검색 실패');
      }

      const data = await res.json();
      setMatches(data.matches ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 오류');
    } finally {
      setLoading(false);
    }
  }, [assetId, niceClasses, authToken, loading]);

  const highRiskCount = matches.filter((m) => m.similarity >= RISK_THRESHOLD).length;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-label font-semibold text-neutral-700">도형 상표 유사도 검색</p>
      <p className="text-caption text-neutral-500">
        도안 이미지를 업로드하면 KIPRIS 등록 상표와 유사도를 비교합니다.
      </p>

      {/* Image upload */}
      {!assetId && (
        <label className="flex flex-col items-center gap-2 border-2 border-dashed border-neutral-200 rounded-xl p-4 cursor-pointer hover:border-neutral-300 transition-colors">
          <Upload className="w-5 h-5 text-neutral-400" />
          <span className="text-body text-neutral-600">상표 도안 이미지 업로드</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {uploading && (
            <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-1">
              <div
                className="bg-royal h-1.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </label>
      )}

      {previewUrl && (
        <div className="flex items-center gap-3">
          <img
            src={previewUrl}
            alt="도안 미리보기"
            className="w-14 h-14 object-contain rounded-lg border border-neutral-200 bg-neutral-50"
          />
          <div className="flex-1 min-w-0">
            <p className="text-body text-neutral-700 font-medium">도안 준비됨</p>
            <button
              onClick={() => { setAssetId(null); setPreviewUrl(null); setMatches([]); setSearched(false); }}
              className="text-caption text-neutral-400 hover:text-neutral-600"
            >
              다시 선택
            </button>
          </div>
          <button
            onClick={runSearch}
            disabled={loading || !assetId}
            className={cn(
              'flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-lg transition-colors',
              loading || !assetId
                ? 'bg-neutral-100 text-neutral-400'
                : 'bg-neutral-800 text-white hover:bg-neutral-700',
            )}
          >
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ScanSearch className="w-3.5 h-3.5" />
            }
            비교 검색
          </button>
        </div>
      )}

      {error && <p className="text-caption text-danger">{error}</p>}

      {/* Result summary */}
      {searched && !loading && (
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          highRiskCount > 0
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-jade-50 border border-jade-200',
        )}>
          {highRiskCount > 0 ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-caption text-amber-700">
                유사 도형 상표 <strong>{highRiskCount}건</strong> 발견 (유사도 {Math.round(RISK_THRESHOLD * 100)}% 이상)
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-jade-600 flex-shrink-0" />
              <p className="text-caption text-jade-700">
                {matches.length > 0 ? `${matches.length}건 조회됨 — 고위험 유사 상표 없음` : '유사 상표가 없습니다'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Results list */}
      {matches.length > 0 && (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {matches.map((item) => {
            const pct = Math.round(item.similarity * 100);
            const isHighRisk = item.similarity >= RISK_THRESHOLD;

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 border rounded-xl',
                  isHighRisk ? 'border-amber-200 bg-amber-50/50' : 'border-neutral-200',
                )}
              >
                {item.imageURL ? (
                  <img
                    src={item.imageURL}
                    alt="상표 이미지"
                    className="w-10 h-10 object-contain rounded flex-shrink-0 bg-white border border-neutral-100"
                  />
                ) : (
                  <div className="w-10 h-10 bg-neutral-100 rounded flex-shrink-0 flex items-center justify-center">
                    <span className="text-caption text-neutral-400">상표</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-body font-medium text-neutral-900 truncate">
                      {item.applicationNumber}
                    </p>
                    {isHighRisk && (
                      <span className="text-caption bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex-shrink-0">
                        주의
                      </span>
                    )}
                  </div>
                  {item.niceClasses.length > 0 && (
                    <p className="text-caption text-royal">{item.niceClasses.join('·')}류</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={cn(
                    'text-body font-bold',
                    isHighRisk ? 'text-amber-600' : 'text-neutral-700',
                  )}>
                    {pct}%
                  </span>
                  <a
                    href={`https://www.kipris.or.kr/khome/searchPad/trademarkSearch.do?srchType=3&text=${encodeURIComponent(item.applicationNumber)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-royal"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {searched && matches.length === 0 && !loading && (
        <p className="text-caption text-neutral-400 text-center py-2">
          벡터 DB에 데이터가 없습니다. 관리자가 시드 데이터를 먼저 등록해야 합니다.
        </p>
      )}
    </div>
  );
}

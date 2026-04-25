'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, Sparkles, X, Loader2, CheckCircle2 } from 'lucide-react';
import { getClientAuth, getClientStorage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

type ViewKey = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

interface ViewSlot {
  key: ViewKey;
  label: string;
  labelKo: string;
}

const VIEW_SLOTS: ViewSlot[] = [
  { key: 'front',  label: 'Front',  labelKo: '정면도' },
  { key: 'back',   label: 'Back',   labelKo: '배면도' },
  { key: 'left',   label: 'Left',   labelKo: '좌측면도' },
  { key: 'right',  label: 'Right',  labelKo: '우측면도' },
  { key: 'top',    label: 'Top',    labelKo: '평면도' },
  { key: 'bottom', label: 'Bottom', labelKo: '저면도' },
];

const ORTHOGRAPHIC_PROMPT =
  'Generate the remaining 5 orthographic views (side, back, top, bottom, isometric) based on this front view, arranged as a 6-view technical drawing. Black lines on white background, clean technical style.';

interface SixViewsPanelProps {
  registrationId: string;
  authToken: string;
  onComplete?: (views: Partial<Record<ViewKey, string>>) => void;
}

export default function SixViewsPanel({ registrationId, authToken, onComplete }: SixViewsPanelProps) {
  const [views, setViews] = useState<Partial<Record<ViewKey, { assetId: string; previewUrl: string }>>>({});
  const [generatingFrom, setGeneratingFrom] = useState<ViewKey | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<ViewKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadView(key: ViewKey, file: File): Promise<void> {
    if (!file.type.startsWith('image/')) { setError('이미지만 가능합니다'); return; }
    setUploadingSlot(key);
    setError(null);

    try {
      const storage = getClientStorage();
      const auth = getClientAuth();
      const storagePath = `uploads/${registrationId}/view_${key}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file);
      await new Promise<void>((resolve, reject) => task.on('state_changed', null, reject, resolve));
      const downloadURL = await getDownloadURL(task.snapshot.ref);

      const token = await auth.currentUser?.getIdToken() ?? '';
      const res = await fetch('/api/image/upload-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ registrationId, storagePath, downloadURL, filename: file.name, mimeType: file.type, targetKinds: [] }),
      });
      const data = await res.json();

      setViews((prev) => ({
        ...prev,
        [key]: { assetId: data.originalAssetId, previewUrl: URL.createObjectURL(file) },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패');
    } finally {
      setUploadingSlot(null);
    }
  }

  async function generateFromFront(): Promise<void> {
    const frontView = views.front;
    if (!frontView) { setError('정면도를 먼저 업로드하세요'); return; }
    setGeneratingFrom('front');
    setError(null);

    try {
      const res = await fetch('/api/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ assetId: frontView.assetId, instruction: ORTHOGRAPHIC_PROMPT }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? '생성 실패');

      const { newAssetId } = await res.json();

      // Load generated image to preview
      const { getClientDb } = await import('@/lib/firebase/client');
      const { doc, getDoc } = await import('firebase/firestore');
      const db = getClientDb();
      const snap = await getDoc(doc(db, 'assets', newAssetId));
      const assetData = snap.data();
      if (!assetData?.base64) throw new Error('에셋 로드 실패');

      const blob = new Blob(
        [Uint8Array.from(atob(assetData.base64), (c) => c.charCodeAt(0))],
        { type: assetData.mimeType ?? 'image/png' },
      );
      const previewUrl = URL.createObjectURL(blob);

      // Place generated 6-view sheet in the 'back' slot as combined sheet
      setViews((prev) => ({
        ...prev,
        back: { assetId: newAssetId, previewUrl },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 실패');
    } finally {
      setGeneratingFrom(null);
    }
  }

  const completeCount = Object.keys(views).length;
  const allComplete = completeCount >= 6;

  const handleComplete = useCallback(() => {
    const result = Object.fromEntries(
      Object.entries(views).map(([k, v]) => [k, v.assetId]),
    ) as Partial<Record<ViewKey, string>>;
    onComplete?.(result);
  }, [views, onComplete]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-label font-semibold text-neutral-700">6면도 준비 ({completeCount}/6)</p>
        <button
          onClick={generateFromFront}
          disabled={!views.front || generatingFrom !== null}
          className={cn(
            'flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-lg transition-colors',
            !views.front || generatingFrom !== null
              ? 'bg-neutral-100 text-neutral-400'
              : 'bg-royal text-white hover:bg-royal-700',
          )}
        >
          {generatingFrom
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Sparkles className="w-3.5 h-3.5" />
          }
          정면도→6면 AI 생성
        </button>
      </div>

      <p className="text-caption text-neutral-500">
        정면도를 먼저 업로드한 뒤 AI 생성을 실행하거나, 각 면도를 개별 업로드하세요.
      </p>

      {error && <p className="text-caption text-danger">{error}</p>}

      {/* 2×3 grid */}
      <div className="grid grid-cols-3 gap-2">
        {VIEW_SLOTS.map((slot) => {
          const view = views[slot.key];
          const isUploading = uploadingSlot === slot.key;

          return (
            <div key={slot.key} className="flex flex-col gap-1">
              <p className="text-caption text-neutral-600 font-medium text-center">{slot.labelKo}</p>
              <label className={cn(
                'relative aspect-square border-2 border-dashed rounded-xl cursor-pointer flex items-center justify-center overflow-hidden transition-colors',
                view ? 'border-royal' : 'border-neutral-200 hover:border-neutral-300',
              )}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadView(slot.key, f); }}
                />

                {view ? (
                  <>
                    <img src={view.previewUrl} alt={slot.labelKo} className="w-full h-full object-contain" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setViews((prev) => { const n = { ...prev }; delete n[slot.key]; return n; });
                      }}
                      className="absolute top-1 right-1 bg-neutral-700 text-white rounded-full p-0.5 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : isUploading ? (
                  <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-neutral-300" />
                )}
              </label>
            </div>
          );
        })}
      </div>

      {allComplete && (
        <button
          onClick={handleComplete}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-jade text-white rounded-xl text-body font-medium hover:bg-jade-600 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          6면도 완성 — 저장하기
        </button>
      )}
    </div>
  );
}

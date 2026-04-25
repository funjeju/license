'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getClientAuth, getClientStorage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import VariantGrid from './VariantGrid';
import EditPanel from './EditPanel';
import HistoryChain, { type HistoryNode } from './HistoryChain';

interface HybridModeProps {
  registrationId: string;
}

const HYBRID_PROMPTS = [
  { label: '측면·배면·상·하·사시도 생성', value: 'Generate the remaining 5 orthographic views (side, back, top, bottom, isometric) based on this front view, arranged as a 6-view technical drawing.' },
  { label: '도면 스타일로 변환',          value: 'Convert this image into a clean technical patent drawing style: black lines on white background, remove colors and shadows.' },
  { label: '분해도 생성',                 value: 'Create an exploded diagram showing all components separated with numbered labels and connection lines.' },
  { label: '3D 렌더로 변환',              value: 'Convert this drawing into a photorealistic 3D render with studio lighting and white background.' },
];

export default function HybridMode({ registrationId }: HybridModeProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceBase64, setSourceBase64] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string>('image/png');
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [images, setImages] = useState<Record<string, { base64: string; mimeType: string }>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryNode[]>([]);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function readFileAsBase64(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  const handleFile = useCallback(async (f: File) => {
    if (!f.type.startsWith('image/')) { setError('이미지 파일만 가능합니다'); return; }
    setFile(f);
    setError(null);
    setPreviewUrl(URL.createObjectURL(f));
    setSourceBase64(await readFileAsBase64(f));
    setSourceMimeType(f.type);
    setAssetIds([]);
    setImages({});
    setSelectedId(null);
    setHistory([]);
    setActiveEditId(null);
    setUploadedAssetId(null);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  async function uploadToStorage(): Promise<{ assetId: string; downloadURL: string }> {
    if (!file) throw new Error('No file');
    const storage = getClientStorage();
    const storagePath = `uploads/${registrationId}/hybrid_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    await new Promise<void>((resolve, reject) => {
      uploadTask.on('state_changed',
        (snap) => setUploadProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
        reject, resolve
      );
    });
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    // 원본 에셋 Firestore 등록
    const auth = getClientAuth();
    const token = await auth.currentUser?.getIdToken() ?? '';
    const res = await fetch('/api/image/upload-process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ registrationId, storagePath, downloadURL, filename: file.name, mimeType: file.type, targetKinds: [] }),
    });
    const data = await res.json();
    return { assetId: data.originalAssetId, downloadURL };
  }

  async function handleGenerate(instruction: string) {
    if (!file || !sourceBase64 || !instruction.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      // 아직 업로드 안 했으면 먼저 업로드
      let assetId = uploadedAssetId;
      if (!assetId) {
        const { assetId: newId } = await uploadToStorage();
        assetId = newId;
        setUploadedAssetId(newId);
      }

      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken() ?? '';

      // editImage API 직접 호출 (원본 base64로)
      const res = await fetch('/api/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assetId, instruction }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? '생성 실패');

      const { newAssetId } = await res.json();

      // 새 이미지 로드
      const { getClientDb } = await import('@/lib/firebase/client');
      const { doc, getDoc } = await import('firebase/firestore');
      const db = getClientDb();
      const snap = await getDoc(doc(db, 'assets', newAssetId));
      const assetData = snap.data();
      if (!assetData) throw new Error('에셋 로드 실패');

      const imgEntry = { base64: assetData.base64, mimeType: assetData.mimeType };
      const nodeLabel = `변형 ${assetIds.length + 1}`;

      setAssetIds((prev) => [...prev, newAssetId]);
      setImages((prev) => ({ ...prev, [newAssetId]: imgEntry }));
      setSelectedId(newAssetId);
      setHistory((prev) => [...prev, { assetId: newAssetId, ...imgEntry, label: nodeLabel }]);
      setActiveEditId(newAssetId);
      setCustomPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleEditComplete(newAssetId: string, base64: string, mimeType: string) {
    setImages((prev) => ({ ...prev, [newAssetId]: { base64, mimeType } }));
    setHistory((prev) => [...prev, { assetId: newAssetId, base64, mimeType, label: `추가 편집 ${prev.length}` }]);
    setActiveEditId(newAssetId);
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto px-6 py-6">
      {/* Upload zone */}
      <div>
        <p className="text-label text-neutral-700 mb-2">기준 이미지 업로드</p>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors',
            isDragging ? 'border-royal bg-royal-50' : 'border-neutral-200 hover:border-neutral-300'
          )}
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="기준 이미지" className="max-h-32 rounded-lg object-contain" />
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                className="absolute -top-2 -right-2 bg-neutral-700 text-white rounded-full p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-neutral-400 mb-2" />
              <p className="text-body text-neutral-600">정면도 또는 기준 이미지 업로드</p>
            </>
          )}
        </div>
      </div>

      {file && (
        <>
          {/* Quick variation presets */}
          <div>
            <p className="text-label text-neutral-700 mb-2">AI 변형 프리셋</p>
            <div className="flex flex-col gap-2">
              {HYBRID_PROMPTS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handleGenerate(p.value)}
                  disabled={isGenerating}
                  className="text-left px-3 py-2.5 border border-neutral-200 rounded-lg hover:border-royal hover:bg-royal-50 text-body text-neutral-700 transition-colors disabled:opacity-40"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom prompt */}
          <div>
            <p className="text-label text-neutral-700 mb-2">직접 입력</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(customPrompt); }}
                placeholder="예: 측면도 생성, 3D 사시도 추가"
                className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-body focus:outline-none focus:border-royal"
                disabled={isGenerating}
              />
              <button
                onClick={() => handleGenerate(customPrompt)}
                disabled={!customPrompt.trim() || isGenerating}
                className="flex items-center gap-1.5 px-3 py-2 bg-royal text-white rounded-lg text-body disabled:opacity-40 hover:bg-royal-700 transition-colors"
              >
                {isGenerating
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Sparkles className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
        </>
      )}

      {error && <p className="text-caption text-danger text-center">{error}</p>}

      {/* Results */}
      {assetIds.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-label text-neutral-700">AI 변형 결과</p>
          <VariantGrid
            assetIds={assetIds}
            images={images}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {selectedId && activeEditId && (
            <div className="flex flex-col gap-3">
              <HistoryChain
                nodes={history}
                currentId={activeEditId}
                onSelect={setActiveEditId}
              />
              <EditPanel
                assetId={activeEditId}
                onEditComplete={handleEditComplete}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileImage, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getClientAuth, getClientStorage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface ProcessedAsset {
  assetId: string;
  kind: string;
  label: string;
  base64?: string;
  mimeType?: string;
  downloadURL?: string;
}

interface UploadModeProps {
  registrationId: string;
}

const PROCESS_OPTIONS = [
  { id: 'normalized', label: '규격 변환',    description: 'IP 유형별 스펙 자동 적용 (DPI, 포맷)' },
  { id: 'nobg',       label: '배경 제거',    description: '배경을 투명/흰색으로 처리' },
  { id: 'grayscale',  label: '흑백 변환',    description: '특허 도면 규격 (흑백 선화)' },
  { id: 'sheet',      label: '도안 시트 조립', description: '제목·저작자·창작일 자동 기재' },
];

export default function UploadMode({ registrationId }: UploadModeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['normalized']);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAssets, setProcessedAssets] = useState<ProcessedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다');
      return;
    }
    setFile(f);
    setError(null);
    setProcessedAssets([]);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  function toggleOption(id: string) {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  }

  async function handleUploadAndProcess() {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setUploadProgress(0);

    try {
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken() ?? '';
      const storage = getClientStorage();

      // 1. Firebase Storage 업로드
      const storagePath = `uploads/${registrationId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snap) => setUploadProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
          reject,
          resolve
        );
      });

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      // 2. 서버에 처리 요청
      const res = await fetch('/api/image/upload-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationId,
          storagePath,
          downloadURL,
          filename: file.name,
          mimeType: file.type,
          targetKinds: selectedOptions,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? '처리 실패');
      }

      const { assets } = await res.json();
      setProcessedAssets(assets);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto px-6 py-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors',
          isDragging ? 'border-royal bg-royal-50' : 'border-neutral-200 hover:border-neutral-300'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="미리보기" className="max-h-40 rounded-lg object-contain" />
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
              className="absolute -top-2 -right-2 bg-neutral-700 text-white rounded-full p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-neutral-400 mb-3" />
            <p className="text-body text-neutral-600 font-medium mb-1">이미지를 드래그하거나 클릭하여 업로드</p>
            <p className="text-caption text-neutral-400">PNG, JPG, WEBP, SVG (최대 20MB)</p>
          </>
        )}
      </div>

      {file && (
        <div className="flex items-center gap-2 text-caption text-neutral-600">
          <FileImage className="w-4 h-4" />
          {file.name} ({(file.size / 1024).toFixed(0)}KB)
        </div>
      )}

      {/* Process options */}
      <div>
        <p className="text-label text-neutral-700 mb-3">자동 변환 옵션</p>
        <div className="flex flex-col gap-2">
          {PROCESS_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:border-neutral-300 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(opt.id)}
                onChange={() => toggleOption(opt.id)}
                className="mt-0.5 accent-royal"
              />
              <div>
                <p className="text-body font-medium text-neutral-900">{opt.label}</p>
                <p className="text-caption text-neutral-500">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Upload button */}
      <button
        onClick={handleUploadAndProcess}
        disabled={!file || isProcessing}
        className="flex items-center justify-center gap-2 bg-royal text-white rounded-lg py-2.5 font-medium text-body hover:bg-royal-700 transition-colors disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {uploadProgress < 100 ? `업로드 중... ${uploadProgress}%` : '처리 중...'}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            업로드 및 변환
          </>
        )}
      </button>

      {error && <p className="text-caption text-danger text-center">{error}</p>}

      {/* Results */}
      {processedAssets.length > 0 && (
        <div>
          <p className="text-label text-neutral-700 mb-3">변환 결과</p>
          <div className="grid grid-cols-2 gap-3">
            {processedAssets.map((asset) => (
              <div key={asset.assetId} className="border border-neutral-200 rounded-xl overflow-hidden">
                {asset.base64 ? (
                  <img
                    src={`data:${asset.mimeType};base64,${asset.base64}`}
                    alt={asset.label}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square bg-neutral-100 flex items-center justify-center">
                    <Check className="w-6 h-6 text-jade" />
                  </div>
                )}
                <div className="px-3 py-2 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-jade flex-shrink-0" />
                  <span className="text-caption text-neutral-700">{asset.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

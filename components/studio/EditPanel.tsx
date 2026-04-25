'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getClientAuth } from '@/lib/firebase/client';

interface EditPanelProps {
  assetId: string;
  onEditComplete: (newAssetId: string, base64: string, mimeType: string) => void;
}

const QUICK_COMMANDS = [
  { label: '화살표 추가',    value: 'Add directional arrows pointing to key components' },
  { label: '번호 삽입',      value: 'Add numbered labels (①②③) to each component' },
  { label: '3D로 변환',      value: 'Convert to photorealistic 3D render with studio lighting' },
  { label: '6면도로 분할',   value: 'Split into six orthographic views: front, back, left, right, top, bottom' },
  { label: '배경 제거',      value: 'Remove the background, make it transparent/white' },
];

export default function EditPanel({ assetId, onEditComplete }: EditPanelProps) {
  const [instruction, setInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runEdit(cmd: string) {
    if (!cmd.trim() || isEditing) return;
    setIsEditing(true);
    setError(null);

    try {
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken() ?? '';

      const res = await fetch('/api/image/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assetId, instruction: cmd }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? '편집 실패');
      }

      const { newAssetId } = await res.json();

      // 새 에셋 이미지 로드
      const { getClientDb } = await import('@/lib/firebase/client');
      const { doc, getDoc } = await import('firebase/firestore');
      const db = getClientDb();
      const snap = await getDoc(doc(db, 'assets', newAssetId));
      const data = snap.data();
      if (data) {
        onEditComplete(newAssetId, data.base64, data.mimeType);
      }
      setInstruction('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsEditing(false);
    }
  }

  return (
    <div className="border border-neutral-200 rounded-xl p-4 bg-white">
      <p className="text-label text-neutral-700 mb-3">이미지 수정</p>

      {/* Quick commands */}
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd.value}
            onClick={() => runEdit(cmd.value)}
            disabled={isEditing}
            className="px-2.5 py-1 text-caption border border-neutral-200 rounded-full hover:border-royal hover:text-royal transition-colors disabled:opacity-40"
          >
            {cmd.label}
          </button>
        ))}
      </div>

      {/* Natural language input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') runEdit(instruction); }}
          placeholder="수정 지시사항 입력 (예: 힌지 부분 클로즈업 추가)"
          className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-royal"
          disabled={isEditing}
        />
        <button
          onClick={() => runEdit(instruction)}
          disabled={!instruction.trim() || isEditing}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-body font-medium transition-colors',
            'bg-royal text-white hover:bg-royal-700 disabled:opacity-40'
          )}
        >
          {isEditing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {error && <p className="text-caption text-danger mt-2">{error}</p>}
    </div>
  );
}

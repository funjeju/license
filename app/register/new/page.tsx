'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copyright, Tag, Layers, Lightbulb } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { getClientAuth } from '@/lib/firebase/client';

const EXAMPLES = [
  { label: '캐릭터·일러스트 저작권', hint: '제가 그린 캐릭터 "카밀리"를 저작권으로 등록하고 싶어요.' },
  { label: '브랜드 상표 등록', hint: '제 카페 브랜드 이름과 로고를 상표 등록하고 싶어요.' },
  { label: '제품 디자인권', hint: '새로 만든 텀블러 디자인을 디자인권으로 보호받고 싶어요.' },
  { label: '기술 특허 출원', hint: '이중 밸브 구조를 가진 커피 추출 장치를 발명했어요.' },
];

const IP_ICONS = {
  copyright: Copyright,
  trademark: Tag,
  design: Layers,
  patent: Lightbulb,
};

export default function RegisterNewPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(message: string) {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const auth = getClientAuth();
      const user = auth.currentUser;
      if (!user) { router.push('/login'); return; }

      const token = await user.getIdToken();
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userMessage: message }),
      });

      if (!res.ok) throw new Error('분류 중 오류가 발생했습니다.');

      const data = await res.json();

      if (data.result.confidence < 0.7) {
        // TODO: 낮은 신뢰도 시 선택 카드 노출 (Week 3)
      }

      router.push(`/register/${data.registrationId}/chat`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-0px)] px-4 py-16">
        <div className="w-full max-w-xl">
          <h1 className="text-h1 text-neutral-900 text-center mb-3">무엇을 보호하고 싶으세요?</h1>
          <p className="text-body text-neutral-500 text-center mb-10">
            자유롭게 설명해주세요. AI가 적합한 IP 유형을 찾아드립니다.
          </p>

          {/* Input */}
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(input);
                }
              }}
              placeholder="예: 제가 만든 캐릭터를 등록하고 싶어요..."
              rows={3}
              className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-royal resize-none"
              disabled={loading}
            />
            <button
              onClick={() => handleSubmit(input)}
              disabled={!input.trim() || loading}
              className="absolute bottom-3 right-3 bg-royal text-white rounded-md w-8 h-8 flex items-center justify-center disabled:opacity-40 hover:bg-royal-600 transition-colors"
              aria-label="전송"
            >
              {loading ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7l6-6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {error && <p className="text-caption text-danger mt-2">{error}</p>}

          {/* Example chips */}
          <div className="flex flex-wrap gap-2 mt-5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => { setInput(ex.hint); handleSubmit(ex.hint); }}
                disabled={loading}
                className="text-label text-neutral-700 border border-neutral-200 rounded-full px-3 py-1 hover:bg-neutral-100 transition-colors"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

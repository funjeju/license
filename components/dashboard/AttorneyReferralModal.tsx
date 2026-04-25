'use client';

import { useState } from 'react';
import { X, Mail, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getClientAuth } from '@/lib/firebase/client';
import type { IPType } from '@/lib/agents/classifier';

const IP_LABELS: Record<IPType, string> = {
  copyright: '저작권',
  trademark: '상표',
  design: '디자인권',
  patent: '특허',
};

interface Props {
  registrationId: string;
  projectTitle: string;
  ipType: IPType;
  packageUrl: string | null;
  onClose: () => void;
}

export default function AttorneyReferralModal({
  registrationId,
  projectTitle,
  ipType,
  packageUrl,
  onClose,
}: Props) {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [mailtoHref, setMailtoHref] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);

    try {
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken() ?? '';
      await fetch('/api/attorney/refer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ registrationId, attorneyEmail: email, note }),
      });
    } catch { /* fire-and-forget — mailto still opens */ }

    const subject = encodeURIComponent(`[IP-Assist] ${IP_LABELS[ipType]} 검토 의뢰: ${projectTitle}`);
    const body = encodeURIComponent(
      [
        `안녕하세요,`,
        ``,
        `IP-Assist를 통해 준비한 ${IP_LABELS[ipType]} 등록 자료를 검토해주실 수 있으실지 여쭤보고자 연락드립니다.`,
        ``,
        `• 프로젝트: ${projectTitle}`,
        `• IP 유형: ${IP_LABELS[ipType]}`,
        ...(packageUrl ? [`• 자료 패키지 다운로드: ${packageUrl}`] : []),
        ...(note ? [``, `추가 메모:`, note] : []),
        ``,
        `감사합니다.`,
      ].join('\n')
    );

    const href = `mailto:${email}?subject=${subject}&body=${body}`;
    setMailtoHref(href);
    setSubmitting(false);
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-royal-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-royal" />
          </div>
          <div>
            <p className="text-body font-semibold text-neutral-900">변리사 검토 의뢰</p>
            <p className="text-caption text-neutral-500">{projectTitle}</p>
          </div>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-medium text-neutral-700">
                변리사 이메일 <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="attorney@example.com"
                required
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-royal"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-medium text-neutral-700">
                추가 메모 <span className="text-neutral-400">(선택)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="변리사에게 전달할 특이사항을 적어주세요..."
                rows={3}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-royal resize-none"
              />
            </div>

            {packageUrl && (
              <div className="px-3 py-2.5 bg-jade-50 border border-jade-200 rounded-xl">
                <p className="text-caption text-jade-700">
                  패키지 다운로드 링크가 이메일 본문에 자동으로 포함됩니다.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!email.trim() || submitting}
              className={cn(
                'flex items-center justify-center gap-2 py-3 rounded-xl text-body font-medium transition-colors',
                !email.trim() || submitting
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-royal text-white hover:bg-royal-700',
              )}
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> 준비 중...</>
                : <><Mail className="w-4 h-4" /> 이메일 앱으로 전송하기</>
              }
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-jade" />
            <div className="text-center">
              <p className="text-body font-semibold text-neutral-900 mb-1">이메일 준비 완료</p>
              <p className="text-caption text-neutral-500">
                아래 버튼을 클릭하면 기본 이메일 앱이 열립니다.
              </p>
            </div>
            <a
              href={mailtoHref}
              className="flex items-center gap-2 px-5 py-3 bg-royal text-white rounded-xl text-body font-medium hover:bg-royal-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              이메일 앱에서 열기
            </a>
            <button
              onClick={onClose}
              className="text-caption text-neutral-500 hover:text-neutral-700"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { getClientAuth, getClientDb } from '@/lib/firebase/client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import {
  FileText, Download, Package, ArrowLeft,
  CheckCircle2, ExternalLink, Loader2, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { IPType } from '@/lib/agents/classifier';

interface Registration {
  type: IPType;
  title: string;
  progress: number;
}

const IP_TYPE_LABELS: Record<string, string> = {
  copyright: '저작권',
  trademark: '상표',
  design: '디자인권',
  patent: '특허',
};

const FILE_DESCRIPTIONS: Record<string, string> = {
  '01_저작물설명.docx': '수집된 정보로 구성한 등록 신청서 초안',
  '02_도면.docx': '도안 스튜디오에서 생성/업로드한 도면 모음',
  '03_대화록.docx': 'AI와 나눈 인터뷰 전체 대화 기록',
  '04_제출가이드.docx': '제출 시스템 단계별 이용 가이드',
};

const CROSS_STEPS = [
  {
    step: 1,
    title: 'CROSS 접속 및 로그인',
    desc: 'copyright.or.kr 에 접속 후 로그인합니다.',
    url: 'https://www.copyright.or.kr',
  },
  {
    step: 2,
    title: '저작권 등록 신청 진입',
    desc: '상단 메뉴 [저작권 등록] → [저작물 등록 신청]을 클릭합니다.',
  },
  {
    step: 3,
    title: '저작물 유형 선택',
    desc: '해당 저작물 유형(어문·미술·음악·영상 등)을 선택합니다.',
  },
  {
    step: 4,
    title: '저작자 정보 입력',
    desc: '01_저작물설명.docx 의 저작자 항목을 참고하여 입력합니다.',
  },
  {
    step: 5,
    title: '저작물 기본 정보 입력',
    desc: '저작물 제목·창작 완성일·공표 여부를 01_저작물설명.docx 에서 복사합니다.',
  },
  {
    step: 6,
    title: '도면 파일 첨부',
    desc: '02_도면.docx 내 이미지를 PNG/JPG로 저장 후 첨부합니다.',
  },
  {
    step: 7,
    title: '수수료 납부',
    desc: '전자 결제로 등록 수수료를 납부합니다.',
  },
  {
    step: 8,
    title: '접수 완료 확인',
    desc: '접수증 번호를 저장하고 심사 결과를 이메일로 안내받습니다.',
  },
];

const KIPRIS_STEPS = [
  {
    step: 1,
    title: '특허청 전자출원 접속',
    desc: 'patent.go.kr 에 접속 후 전자출원 소프트웨어를 설치합니다.',
    url: 'https://www.patent.go.kr',
  },
  {
    step: 2,
    title: '출원서 작성',
    desc: '01_저작물설명.docx 의 항목을 출원서 양식에 입력합니다.',
  },
  {
    step: 3,
    title: '도면 첨부',
    desc: '02_도면.docx 의 이미지를 출원서에 첨부합니다.',
  },
  {
    step: 4,
    title: '수수료 납부 및 제출',
    desc: '출원료를 납부 후 접수증을 저장합니다.',
  },
];

export default function PackagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const registrationId = params.id;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [packageUrl, setPackageUrl] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth.currentUser) { router.push('/login'); return; }

    const db = getClientDb();
    const unsub = onSnapshot(
      doc(db, 'registrations', registrationId),
      (snap) => {
        if (!snap.exists()) { router.push('/dashboard'); return; }
        setRegistration(snap.data() as Registration);
        setLoading(false);
      },
      () => { router.push('/dashboard'); },
    );

    return () => unsub();
  }, [registrationId, router]);

  async function handleBuild() {
    if (building) return;
    setBuilding(true);
    setError(null);

    try {
      const auth = getClientAuth();
      const token = await auth.currentUser?.getIdToken() ?? '';
      const res = await fetch('/api/package/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ registrationId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? '패키지 생성 실패');
      }

      const data = await res.json();
      setPackageUrl(data.packageUrl);
      setFileNames(data.fileNames ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setBuilding(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-royal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!registration) return null;

  const guide = registration.type === 'copyright' ? CROSS_STEPS : KIPRIS_STEPS;
  const guideName = registration.type === 'copyright' ? 'CROSS (저작권 등록 시스템)' : 'e-특허넷 (특허청)';

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="hidden md:block flex-shrink-0">
        <Sidebar currentPath={pathname} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-neutral-200 flex-shrink-0">
          <Link
            href={`/register/${registrationId}/studio`}
            className="flex items-center gap-1 text-caption text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            스튜디오로 돌아가기
          </Link>
          <div className="w-px h-4 bg-neutral-200" />
          <span className="text-body font-medium text-neutral-900 truncate">{registration.title}</span>
          <span className="text-caption bg-royal text-white px-2 py-0.5 rounded-sm flex-shrink-0">
            {IP_TYPE_LABELS[registration.type] ?? registration.type}
          </span>
          <span className="ml-auto text-caption text-neutral-500">자료 패키지</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">

          {/* Build section */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-neutral-900 mb-1">자료 패키지 생성</h1>
            <p className="text-body text-neutral-500 mb-6">
              수집된 정보와 도면을 하나의 패키지로 묶어 제출용 문서를 생성합니다.
            </p>

            {!packageUrl ? (
              <button
                onClick={handleBuild}
                disabled={building}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 rounded-xl text-body font-medium transition-colors',
                  building
                    ? 'bg-neutral-100 text-neutral-400 cursor-wait'
                    : 'bg-royal text-white hover:bg-royal-700',
                )}
              >
                {building ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    패키지 생성 중... (30~60초 소요)
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    패키지 생성하기
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-jade-50 border border-jade-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-jade-600 flex-shrink-0" />
                <span className="text-body text-jade-700 font-medium">패키지 생성 완료</span>
                <a
                  href={packageUrl}
                  download="package.zip"
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-jade text-white text-caption font-medium rounded-lg hover:bg-jade-600 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  ZIP 전체 다운로드
                </a>
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-center gap-2 text-caption text-danger">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* File list */}
          {packageUrl && fileNames.length > 0 && (
            <div className="mb-10">
              <h2 className="text-label font-semibold text-neutral-700 mb-3">포함된 파일</h2>
              <div className="flex flex-col gap-2">
                {fileNames.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 px-4 py-3 border border-neutral-200 rounded-xl"
                  >
                    <FileText className="w-5 h-5 text-royal flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-medium text-neutral-900 truncate">{name}</p>
                      <p className="text-caption text-neutral-500">{FILE_DESCRIPTIONS[name] ?? ''}</p>
                    </div>
                    <a
                      href={packageUrl}
                      download="package.zip"
                      className="flex items-center gap-1 text-caption text-royal hover:text-royal-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      ZIP
                    </a>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-caption text-neutral-400">
                * 개별 파일 다운로드는 ZIP 압축 해제 후 이용하세요.
              </p>
            </div>
          )}

          {/* CROSS / KIPRIS Guide */}
          <div>
            <h2 className="text-label font-semibold text-neutral-700 mb-1">
              {guideName} 제출 가이드
            </h2>
            <p className="text-caption text-neutral-500 mb-4">
              아래 단계에 따라 공식 시스템에 직접 제출하세요.
            </p>

            <div className="flex flex-col gap-3">
              {guide.map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 px-4 py-3.5 border border-neutral-200 rounded-xl"
                >
                  <div className="w-7 h-7 rounded-full bg-royal text-white text-caption font-bold flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-medium text-neutral-900">{item.title}</p>
                    <p className="text-caption text-neutral-600 mt-0.5">{item.desc}</p>
                    {'url' in item && item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-caption text-royal hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {item.url}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

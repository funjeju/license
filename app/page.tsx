import Link from 'next/link';
import { ArrowRight, Copyright, Tag, Layers, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ipTypes = [
  { icon: Copyright, label: '저작권', desc: '창작물·캐릭터·콘텐츠 보호' },
  { icon: Tag,       label: '상표',   desc: '브랜드명·로고 권리 확보' },
  { icon: Layers,    label: '디자인권', desc: '제품 외관·형상 독점권' },
  { icon: Lightbulb, label: '특허',   desc: '기술 발명 명세서 초안' },
];

const steps = [
  { step: '01', title: 'AI와 대화', desc: '보호하고 싶은 것을 자유롭게 말씀해주세요. AI가 필요한 정보를 하나씩 정리합니다.' },
  { step: '02', title: '양식 자동 완성', desc: '대화 내용이 실시간으로 정부 서식에 채워집니다. 모든 AI 초안은 직접 수정할 수 있습니다.' },
  { step: '03', title: '자료 패키지 다운로드', desc: '완성된 서류를 ZIP으로 받아 특허로 또는 CROSS에 직접 제출하세요.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-neutral-200 px-6 h-16 flex items-center justify-between max-w-[1280px] mx-auto">
        <span className="text-h4 font-bold text-ink">IP-Assist</span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="text-neutral-700">
            <Link href="/login">로그인</Link>
          </Button>
          <Button asChild className="bg-royal text-white hover:bg-royal-600">
            <Link href="/signup">무료로 시작하기</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 py-20 text-center">
        <h1 className="text-display text-ink mb-5 max-w-2xl mx-auto leading-tight">
          AI가 서류를 만들고,<br />사용자는 권리를 지킵니다.
        </h1>
        <p className="text-body-lg text-neutral-700 mb-10 max-w-lg mx-auto">
          저작권·상표·디자인·특허 등록에 필요한 모든 서류를 AI와의 대화로 완성하세요. 전문 지식 없이도 직접 제출까지.
        </p>
        <Button asChild size="lg" className="bg-royal text-white hover:bg-royal-600 h-12 px-8 text-body-lg">
          <Link href="/signup">
            지금 시작하기
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
      </section>

      {/* How it works */}
      <section className="bg-neutral-50 py-20 border-y border-neutral-200">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-h2 text-neutral-900 text-center mb-12">3단계로 완성되는 IP 등록 준비</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="bg-white border border-neutral-200 rounded-lg p-6">
                <span className="text-caption text-royal font-bold tracking-widest">{s.step}</span>
                <h3 className="text-h3 text-neutral-900 mt-2 mb-3">{s.title}</h3>
                <p className="text-body text-neutral-700">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IP Types */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <h2 className="text-h2 text-neutral-900 text-center mb-12">지원하는 IP 유형</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ipTypes.map(({ icon: Icon, label, desc }) => (
            <Link
              key={label}
              href={`/register/new?type=${label}`}
              className="border border-neutral-200 rounded-lg p-6 hover:border-neutral-300 transition-colors group"
            >
              <div className="w-10 h-10 rounded-md bg-royal-50 flex items-center justify-center mb-4 group-hover:bg-royal-100 transition-colors">
                <Icon className="w-5 h-5 text-royal" />
              </div>
              <h3 className="text-h4 text-neutral-900 mb-1">{label}</h3>
              <p className="text-body text-neutral-500">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-6 text-caption text-neutral-500">
            <span>정확성</span><span>신뢰성</span><span>효율성</span><span>자율성</span>
          </div>
          <p className="text-caption text-neutral-400">
            본 서비스는 법적 자문을 제공하지 않습니다. 최종 서류는 직접 확인 후 제출해주세요.
          </p>
        </div>
      </footer>
    </div>
  );
}

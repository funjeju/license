import AppShell from '@/components/layout/AppShell';

export default function GuidePage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-h1 text-neutral-900 mb-2">가이드 & FAQ</h1>
        <p className="text-body text-neutral-500 mb-8">IP-Assist 사용법과 자주 묻는 질문을 안내합니다.</p>

        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-h3 text-neutral-800 mb-3">시작하기</h2>
            <ol className="list-decimal list-inside flex flex-col gap-2 text-body text-neutral-700">
              <li>새 프로젝트를 눌러 보호하고 싶은 IP를 자유롭게 설명하세요.</li>
              <li>AI가 저작권·상표·디자인·특허 중 적합한 유형을 분류합니다.</li>
              <li>인터뷰 형식으로 필요한 정보를 입력하면 AI가 서류를 작성합니다.</li>
              <li>완성된 서류 패키지를 다운로드하거나 변리사에게 의뢰하세요.</li>
            </ol>
          </section>

          <hr className="border-neutral-200" />

          <section>
            <h2 className="text-h3 text-neutral-800 mb-3">자주 묻는 질문</h2>
            <div className="flex flex-col gap-4">
              {[
                { q: 'AI가 작성한 서류는 법적 효력이 있나요?', a: 'AI 서류는 초안 작성을 보조합니다. 최종 제출 전 변리사 검토를 권장합니다.' },
                { q: '여러 종류의 IP를 동시에 등록할 수 있나요?', a: '각 IP 유형별로 별도 프로젝트를 생성하여 진행하세요.' },
                { q: '작성 중인 서류를 저장할 수 있나요?', a: '모든 진행 상황은 자동으로 저장됩니다.' },
              ].map(({ q, a }) => (
                <div key={q} className="border border-neutral-200 rounded-lg p-4">
                  <p className="text-label font-semibold text-neutral-800 mb-1">{q}</p>
                  <p className="text-body text-neutral-600">{a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

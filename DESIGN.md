# IP-Assist Design System (DESIGN.md)

> **문서 역할**: SPEC.md의 동반 문서. UI 구현 시 Claude Code가 참조해야 할 디자인 소스 오브 트루스.
>
> **사용 원칙**: SPEC.md와 이 문서가 충돌하면 **이 문서가 우선**합니다 (디자인 관련 항목에 한해). 컴포넌트 구현 시 이 문서의 토큰·레이아웃·컴포넌트 스펙을 그대로 따르고, 임의 해석하지 말 것.

---

## 목차

1. [디자인 철학 — B Style](#1-디자인-철학--b-style)
2. [브랜드 요약](#2-브랜드-요약)
3. [컬러 시스템](#3-컬러-시스템)
4. [타이포그래피](#4-타이포그래피)
5. [스페이싱 & 그리드](#5-스페이싱--그리드)
6. [레이아웃 시스템](#6-레이아웃-시스템)
7. [핵심 컴포넌트](#7-핵심-컴포넌트)
8. [인터랙션 & 모션](#8-인터랙션--모션)
9. [반응형 전략](#9-반응형-전략)
10. [접근성](#10-접근성)
11. [Tailwind 설정](#11-tailwind-설정)
12. [shadcn 테마 오버라이드](#12-shadcn-테마-오버라이드)
13. [구현 체크리스트](#13-구현-체크리스트)

---

## 1. 디자인 철학 — B Style

네 가지 원칙을 모든 화면·컴포넌트·카피 결정의 기준으로 삼는다.

| 원칙 | 정의 | 실전 판단 기준 |
|---|---|---|
| **Professional** | 법률·행정 도구의 톤앤매너 | 장식보다 정보. 친근함보다 정확함. 이모지 금지. |
| **Structured** | 정보의 체계적 정리와 명확한 시각 계층 | 모든 정보 덩어리는 제목·본문·상태가 구분됨. 필드는 순서와 진행도를 가짐. |
| **Minimal** | 불필요한 요소 제거, 사용자 집중 유지 | 한 화면에 등장하는 색상 4개 이하. 장식용 그림자/그라디언트 금지. |
| **Trust & Safety** | 정확성·보안·개인정보 보호 우선 | 민감 데이터는 별도 구획. 모든 AI 산출물에 "편집 가능" 표시. 중요 결정 전 확인 팝업. |

### 피해야 할 디자인 패턴

- 이모지 기반 장식 아이콘 (→ Lucide Icons 또는 자체 SVG)
- 채도 높은 보조 컬러를 여러 개 동시 사용
- 그림자·그라디언트·블러 효과 (→ 테두리와 색 대비로 위계 표현)
- 일러스트레이션 중심 히어로 (→ 구조적 다이어그램·스크린샷 우선)
- 과도한 애니메이션 (→ 0.15~0.2s 이내 트랜지션만)

---

## 2. 브랜드 요약

```
이름        IP-Assist
설명        AI 기반 지식재산권 등록 보조 플랫폼
태그라인    AI가 서류를 만들고, 사용자는 권리를 지킵니다.
카테고리    Legal Tech · AI Agent · Document Automation · Gov Submission UX
```

### 4가지 핵심 가치 (랜딩 및 대시보드 푸터에 노출)

| 가치 | 설명 |
|---|---|
| 정확성 | 정부 서식 기반 정확한 자동 완성 |
| 신뢰성 | 전문 데이터와 AI로 신뢰도 높은 결과 |
| 효율성 | 시간과 비용을 획기적으로 절약 |
| 자율성 | 본인이 직접 검토하고 제출까지 주도 |

---

## 3. 컬러 시스템

### 3.1 Primary Palette (브랜드 코어)

| 이름 | HEX | 용도 |
|---|---|---|
| Ink (Primary) | `#0D163D` | 로고, 최상위 텍스트, 주요 헤더, 사이드바 배경(다크 모드), 강조 버튼 배경 |
| Royal (Secondary) | `#1E3A8A` | 1차 CTA, 활성 상태, 링크, 포커스 링 |
| Jade (Accent) | `#22C55E` | 완료·성공·체크 상태만. 일반 UI 요소에 사용 금지 |

### 3.2 Neutrals

| 이름 | HEX | 용도 |
|---|---|---|
| Neutral 900 | `#111827` | 본문 텍스트 (라이트 모드) |
| Neutral 700 | `#374151` | 서브 텍스트, 보조 헤딩 |
| Neutral 500 | `#6B7280` | 메타 정보, 힌트 |
| Neutral 400 | `#9CA3AF` | 비활성 텍스트, placeholder |
| Neutral 200 | `#E5E7EB` | 구분선, 약한 테두리 |
| Neutral 100 | `#F3F4F6` | 배경 서브 (카드 뒤), 입력 필드 배경 |
| Neutral 50 | `#F9FAFB` | 사이드바 배경(라이트), 패널 배경 |
| White | `#FFFFFF` | 메인 콘텐츠 배경, 카드 |

### 3.3 Semantic Colors

| 이름 | HEX | 용도 |
|---|---|---|
| Success | `#22C55E` (Jade) | 필드 확정, 검증 통과, 업로드 성공 |
| Warning | `#F59E0B` | 확인 필요 상태, 경고 |
| Danger | `#DC2626` | 오류, 삭제, 경고 팝업 |
| Info | `#1E3A8A` (Royal) | 정보 배지, 힌트 박스 |

### 3.4 사용 규칙 (중요)

- **Jade(#22C55E)는 오직 "완료·성공·확정" 상태를 표현할 때만 사용**. 링크·버튼·장식에 절대 쓰지 않음.
- **본문 배경은 항상 White 또는 Neutral 50**. 컬러 배경 위에 본문 텍스트 배치 금지.
- **CTA 버튼 1순위**: Royal(#1E3A8A) 배경 + White 텍스트.
- **CTA 버튼 2순위(보조)**: White 배경 + Ink(#0D163D) 테두리 + Ink 텍스트.
- **텍스트 색 계층**: 제목 = Neutral 900 / Ink, 본문 = Neutral 700, 보조 = Neutral 500, placeholder = Neutral 400.

### 3.5 다크 모드

Phase 2에서 지원 예정. 현 MVP는 라이트 모드만. 단, CSS 변수 구조는 다크 전환을 염두에 두고 설계.

---

## 4. 타이포그래피

### 4.1 폰트

```
Primary    Pretendard Variable (웹폰트)
Fallback   -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
Mono       "SF Mono", "Monaco", "JetBrains Mono", monospace (코드 블록 전용)
```

**로드 방식**: `<link>` CDN (cdn.jsdelivr.net/gh/orioncactus/pretendard) 또는 `@fontsource-variable/pretendard` 패키지.

### 4.2 스케일

| 토큰 | Size | Line Height | Weight | 용도 |
|---|---|---|---|---|
| display | 48px / 3rem | 1.15 | 700 | 랜딩 히어로 타이틀 |
| h1 | 32px / 2rem | 1.25 | 700 | 페이지 메인 타이틀 |
| h2 | 24px / 1.5rem | 1.3 | 600 | 섹션 헤더 |
| h3 | 20px / 1.25rem | 1.35 | 600 | 서브 섹션, 카드 타이틀 |
| h4 | 16px / 1rem | 1.4 | 600 | 필드 라벨, 작은 헤더 |
| body-lg | 16px | 1.6 | 400 | 본문 (기본) |
| body | 14px | 1.55 | 400 | 밀도 높은 UI 텍스트 |
| caption | 12px | 1.4 | 400 | 메타 정보, 툴팁, 배지 |
| label | 13px | 1.4 | 500 | 폼 라벨, 버튼 텍스트 |

### 4.3 사용 규칙

- **줄바꿈은 `line-height`로, 간격은 `margin`으로** 분리.
- 한국어는 Weight 400/500/600/700만 사용. 300 이하는 Pretendard 한글에서 획이 얇아져 가독성 저하.
- **숫자·영어 혼합 텍스트**는 `font-feature-settings: "tnum"` 적용하여 숫자 너비 고정 (진행률, 통계 등).
- **본문 최소 크기는 14px**. 12px는 보조·메타 정보 전용.

---

## 5. 스페이싱 & 그리드

### 5.1 Base Unit

`4px` 단위로 모든 값 정렬. Tailwind 기본 스케일 그대로 사용 (1=4px, 2=8px, 4=16px, ...).

```
0.5  = 2px
1    = 4px
2    = 8px
3    = 12px
4    = 16px
5    = 20px
6    = 24px
8    = 32px
10   = 40px
12   = 48px
16   = 64px
```

### 5.2 섹션 간격 가이드

| 컨텍스트 | 내부 padding | 요소 간 gap |
|---|---|---|
| 카드 | 20px (p-5) | 12px |
| 패널 (사이드바·프리뷰) | 16px (p-4) | 8px |
| 폼 | 24px (p-6) | 16px |
| 섹션(랜딩) | 80px 상하 | 48px |

### 5.3 Border Radius

| 토큰 | 값 | 용도 |
|---|---|---|
| `rounded-sm` | 4px | 배지, 작은 요소 |
| `rounded-md` | 8px | 버튼, 입력창, 카드(기본) |
| `rounded-lg` | 12px | 큰 카드, 모달 |
| `rounded-xl` | 16px | 히어로 카드, 일러스트 컨테이너 |
| `rounded-full` | 9999px | 아바타, pill 배지 |

### 5.4 Border Width

- 구분선: `1px` (Neutral 200)
- 카드 테두리: `1px` (Neutral 200)
- 활성/포커스: `2px` (Royal)
- 보조 CTA 테두리: `1px` (Ink)

---

## 6. 레이아웃 시스템

### 6.1 전역 구조 (인증 후 앱 전체)

```
┌─────────────────────────────────────────────────────────┐
│  AppShell                                                │
│  ┌──────────┬──────────────────────────────────────────┐ │
│  │ Sidebar  │ Main Content                             │ │
│  │ 240px    │  (화면별 구성)                             │ │
│  │ fixed    │                                          │ │
│  └──────────┴──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 6.2 주요 화면별 Main Content 구성

#### `/dashboard` — 2열 그리드

```
┌──────────────────────────────────────────────┐
│ 상단 헤더: 사용자명 + 새 프로젝트 CTA          │
├──────────────────────────────────────────────┤
│ ┌──────────┬──────────┬──────────┐           │
│ │ 프로젝트 │ 프로젝트 │ 프로젝트 │  ... grid  │
│ │ 카드     │ 카드     │ 카드     │           │
│ └──────────┴──────────┴──────────┘           │
└──────────────────────────────────────────────┘
```

#### `/register/[id]/chat` — **4패널 워크스페이스** (메인)

```
┌──────────┬──────────────┬────────────────────────┬──────────┐
│ Sidebar  │ ChatPanel    │ FormPreview            │ FieldList│
│ 240px    │ ~400px       │ flex (min 480px)       │ 220px    │
│ (전역)    │              │                        │ (접이식)  │
└──────────┴──────────────┴────────────────────────┴──────────┘
```

- ChatPanel: 최소 360px, 유연 너비 (flex-shrink)
- FormPreview: 화면에서 가장 넓은 영역. 실제 서류 레이아웃을 보여주는 것이 핵심.
- FieldList: 220px 고정, 접이식. 화면폭 < 1440px일 때 자동 접힘.

#### `/register/[id]/studio` — **2열 + 하단 결과 그리드**

```
┌──────────┬──────────────────────────────────────────────┐
│ Sidebar  │ ┌──────────────┬─────────────────────────┐   │
│          │ │ 프롬프트 제어 │ 생성 결과 (4 variants)  │   │
│          │ │ 스타일 선택   │                         │   │
│          │ │ 구성 선택     │                         │   │
│          │ └──────────────┴─────────────────────────┘   │
│          │ ┌──────────────────────────────────────────┐ │
│          │ │ 선택 이미지 + 수정 명령 UI               │ │
│          │ └──────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────┘
```

#### `/register/[id]/claims` (특허 전용), `/register/[id]/package`

단일 세로 흐름. Sidebar만 유지하고 Main Content는 1열.

### 6.3 최대 너비 규칙

| 컨텍스트 | max-width |
|---|---|
| 랜딩 히어로 | 1280px |
| 대시보드 그리드 | 1440px |
| 워크스페이스 (/chat) | 제한 없음 (전체 뷰포트 활용) |
| 설정·폼 페이지 | 720px |
| FormPreview 내부 서류 | 840px (A4 비율 유지) |

---

## 7. 핵심 컴포넌트

### 7.1 `<AppShell>` — 인증 후 전역 래퍼

```
파일          components/layout/AppShell.tsx
구성          Sidebar + <main>{children}</main>
역할          모든 인증 필요 라우트의 공통 프레임
```

**Props**: `{ children: ReactNode }`

**주요 특성**:
- 상단에는 전역 헤더 없음 (Sidebar가 모든 네비게이션 담당)
- `min-h-screen bg-white` 베이스
- 모바일(<768px)에서는 Sidebar가 Sheet 드로어로 대체되고, 상단에 햄버거+로고 헤더가 나타남

### 7.2 `<Sidebar>` — 전역 네비게이션

```
파일          components/layout/Sidebar.tsx
너비          240px (데스크톱) / 64px (아이콘만, 접힘 모드)
배경          #F9FAFB (Neutral 50)
테두리        우측 1px #E5E7EB
```

**구성 순서**:

1. **로고 영역** (상단 고정, 높이 64px, padding 20px)
   - IP-Assist 로고 + 워드마크

2. **상단 섹션: 네비게이션**
   - 홈 (`/dashboard`)
   - 내 프로젝트 (`/projects` — 추후 /dashboard로 합쳐질 수 있음)
   - 새 프로젝트 (`/register/new`)

3. **구분선**

4. **중간 섹션: IP 유형 선택**
   - 헤더 라벨: "IP 유형"
   - 저작권
   - 상표
   - 디자인권
   - 특허
   - (클릭 시 해당 유형의 새 등록 시작 또는 해당 유형 프로젝트 목록)

5. **구분선**

6. **하단 섹션: 도구**
   - 도안 스튜디오 (현재 프로젝트 컨텍스트 있을 때만 활성)
   - 서류 패키지 (동일)
   - 가이드 & FAQ

7. **최하단: 사용자**
   - 설정
   - 로그아웃

**네비게이션 아이템 스펙**:

- 기본: 높이 40px, padding 10px 16px, radius 6px, 텍스트 label(13px/500), 아이콘 16px
- 호버: 배경 Neutral 100
- 활성: 배경 Royal 10% 투명도, 텍스트 Royal, 왼쪽 2px Royal 인디케이터
- 비활성(disabled): 텍스트 Neutral 400, 커서 기본

**아이콘**: Lucide Icons 고정. `Home`, `FolderOpen`, `FilePlus`, `Copyright`, `Tag`, `Layers`, `Lightbulb`, `Image`, `Package`, `BookOpen`, `Settings`, `LogOut`

### 7.3 `<ChatPanel>` — AI 인터뷰 영역

```
파일          components/chat/ChatPanel.tsx
배경          #FFFFFF
경계          좌 1px #E5E7EB
```

**상단 헤더** (높이 56px):
- 좌측: 프로젝트 제목 + IP 유형 배지 (Royal 배경 White 텍스트, radius-sm)
- 우측: "저장됨" 인디케이터 (Jade dot + "저장됨" 라벨, caption 크기)

**메시지 리스트**:
- 스크롤 영역
- 유저 메시지: 우측 정렬, Royal 배경, White 텍스트, radius 12px, 최대 너비 75%
- AI 메시지: 좌측 정렬, Neutral 100 배경, Neutral 900 텍스트, 22px 원형 아바타 (Royal 10% 배경, "AI" 11px/500 Royal 텍스트)
- 시간 스탬프: 메시지 그룹 상단, Neutral 500, caption 크기, 중앙 정렬

**입력 영역** (하단 고정, 높이 80px):
- textarea (자동 높이 조절, 최소 44px, 최대 120px)
- 우측 전송 버튼 (Royal 배경, 화살표 아이콘)
- 하단 헬퍼 텍스트: "AI는 참고 자료를 제공하며, 법적 자문이 아닙니다." (caption, Neutral 500)

**구현 기본**: Vercel AI SDK `useChat` 훅. 스트리밍 응답 중에는 타이핑 커서 표시.

### 7.4 `<FormPreview>` — 실시간 양식 미리보기

```
파일          components/preview/FormPreview.tsx
배경          #F9FAFB (Neutral 50) — 문서가 올려진 "책상" 느낌
문서 영역     White 배경, radius 12px, 1px Neutral 200 테두리, max-width 840px
```

**상단 헤더** (높이 56px):
- 좌측: 문서 타입 + "(미리보기)" 표시 (예: "특허 명세서 (미리보기)")
- 우측 버튼 2개:
  - "PDF 미리보기" (보조 버튼)
  - "필드 편집" (보조 버튼, 아이콘 + 텍스트)

**문서 본문**:
- 실제 정부 서식 레이아웃을 최대한 모사
- 상단 문서 제목: "특 허 출 원 서" (글자 간 공백으로 공식 서식 느낌)
- 번호가 매겨진 필드 섹션:
  ```
  1. 발명의 명칭
  ┌──────────────────────────────────────┐
  │ 이중 밸브 구조를 가진 휴대용 커피 추출 장치│
  └──────────────────────────────────────┘
  ```
- 섹션 사이 간격 24px
- 필드 값이 비어있으면 placeholder Neutral 400, 확정값은 Neutral 900
- AI가 생성한 값은 우측 상단에 작은 "AI 초안" 배지 (Royal 10% 배경, Royal 텍스트, caption)
- 각 섹션 우측 상단: 복사 아이콘 버튼 (호버 시 노출)

### 7.5 `<FieldList>` — 필드 아웃라인 (Notion 스타일 TOC)

```
파일          components/preview/FieldList.tsx
너비          220px (화면 < 1440px에서 자동 접힘)
배경          #FFFFFF
경계          좌 1px #E5E7EB
```

**상단 헤더**:
- "필드 목록" label (14px/600)

**필드 리스트**:
- 계층 구조 (섹션 → 서브섹션)
- 각 아이템: 번호 + 라벨 + 상태 아이콘
- 상태 아이콘:
  - 완료: Jade 체크 (CheckCircle2, 16px)
  - 작성 중: Royal 점 (Circle, fill)
  - 미작성: Neutral 400 빈 원
- 클릭 시 해당 필드로 FormPreview 스크롤 + 하이라이트 (0.8s fade)
- 들여쓰기: 서브섹션은 16px 좌측 패딩

**하단 고정 영역**:
- "작성 진행률" 라벨
- 프로그레스 바 (높이 6px, 배경 Neutral 200, 채움 Royal → 80% 이상 시 Jade로 전환)
- 퍼센트 숫자 (h4 크기, Neutral 900)

### 7.6 `<ProjectCard>` — 대시보드 프로젝트 카드

```
파일          components/dashboard/ProjectCard.tsx
크기          그리드 셀 (minmax 280px, 1fr)
```

**구성**:
- 상단: IP 유형 배지
- 중단: 프로젝트 제목 (h3)
- 본문: 최근 대화 요약 1줄 (body 크기, Neutral 700, 말줄임 처리)
- 하단: 진행률 바 + 퍼센트 + 최종 수정일 (caption)
- 호버: 약한 그림자 없음 대신 테두리 색이 Neutral 300으로 진해지고 커서 pointer

**상태 배지 색상**:
- 저작권: Indigo 계열 (임시, Royal의 옅은 버전 Indigo-100 배경 + Indigo-700 텍스트)
- 상표: Royal-100 배경 + Royal-700 텍스트
- 디자인권: Teal (커스텀)
- 특허: Ink (Ink-10% 배경 + Ink 텍스트)

> 색상 변주는 Phase 2에서 정교화. MVP는 모두 Royal 계열 + 라벨로 구분해도 됨.

### 7.7 `<StudioShell>` — 도안 스튜디오

섹션 6.2 참조. 3개 탭 (AI 생성 / 원본 업로드 / 하이브리드)은 최상단 radix Tabs로 구현.

상세 컴포넌트 스펙은 SPEC.md §7.6 참조하되, 다음 디자인 토큰을 준수:

- 프롬프트 textarea: 최소 높이 80px, Neutral 50 배경, 포커스 시 Royal 2px 링
- 스타일 칩: 기본 White 배경 + Neutral 200 테두리, 선택 시 Royal 배경 + White 텍스트
- Variant 그리드: `grid-cols-2 md:grid-cols-4`, aspect-square, 선택 시 Royal 2px 테두리 + 우상단 체크 배지

### 7.8 `<ClaimsPanel>` — 청구범위 추천 (특허 전용)

섹션 7.7은 SPEC.md와 동일. 디자인 토큰만 보강:

- 추천 배너: Royal-10% 배경 + Royal-900 텍스트 + 좌측 2px Royal 보더
- 각 추천항 카드: White 배경 + Neutral 200 테두리 + padding 24px
- "추천" 뱃지가 붙은 카드(중간 범위): 2px Royal 테두리로 강조
- 청구항 텍스트: Neutral 50 배경의 block 컨테이너 내부에 배치 (mono 폰트 아님, Pretendard)

### 7.9 UI Primitives

shadcn/ui 기반으로 아래 프리미티브를 확장. `/components/ui/*`에 위치.

**Button**

```
variants:
  primary    Royal bg, White text                  (기본 CTA)
  secondary  White bg, Ink border 1px, Ink text    (보조)
  ghost      transparent, hover Neutral 100        (사이드바 아이템)
  danger     Danger bg, White text                 (삭제·취소)

sizes:
  sm   32px height, 12px padding, label 13px
  md   36px height, 16px padding, label 14px (기본)
  lg   44px height, 20px padding, body 16px
```

**Input / Textarea**

- 기본: White 배경, Neutral 200 1px 테두리, radius 6px, 높이 36px(input)
- 포커스: Royal 2px 링 (outline이 아니라 box-shadow)
- 오류: Danger 1px 테두리 + 하단 Danger 12px 메시지

**Card**

- 기본: White 배경, Neutral 200 1px 테두리, radius 8px, padding 20px
- 호버형: hover 시 테두리 Neutral 300 (elevation 변화는 주지 않음 — B Style)

**Badge**

- 기본: Neutral 100 배경 + Neutral 700 텍스트, caption, radius 4px, padding 2px 8px
- Solid 변형: Royal/Jade/Danger 배경 + White 텍스트

**Progress**

- 트랙: 높이 6px, Neutral 200 배경, radius 9999px
- 채움: Royal (0~79%), Jade (80%+), 트랜지션 300ms ease-out

**Toast / Alert**

- 성공: Jade-50 배경 + Jade-700 텍스트 + Jade 아이콘
- 경고: Warning-50 배경 + Warning-700 텍스트
- 오류: Danger-50 배경 + Danger-700 텍스트

---

## 8. 인터랙션 & 모션

### 8.1 트랜지션 원칙

- **기본 duration**: 150ms (UI 상태 변화), 200ms (요소 등장/사라짐)
- **easing**: `ease-out` 우선. 등장에는 `ease-out`, 사라짐에는 `ease-in`
- **기본 property**: `transition-colors`, `transition-opacity` 위주. `transition-all` 남용 금지
- **페이지 전환**: 없음 (Next.js 기본 네비게이션)

### 8.2 필수 마이크로 인터랙션

| 위치 | 인터랙션 |
|---|---|
| 필드 확정 순간 | FieldList 체크 아이콘이 Neutral 400 → Jade로 150ms 컬러 전환 + 미세 스케일 업(1.0 → 1.08 → 1.0) 200ms |
| 새 메시지 도착 | 하단으로 부드럽게 자동 스크롤 (behavior: 'smooth') |
| 프리뷰 필드 업데이트 | 업데이트된 필드 컨테이너에 Royal 200 배경 250ms 플래시 → Neutral 50 복원 |
| 프로그레스 바 증가 | width 트랜지션 300ms ease-out |
| 프롬프트 제출 → 생성 대기 | Variant 슬롯 4개에 shimmer 스켈레톤 (Neutral 100 → Neutral 200 gradient loop) |
| 버튼 press | active:scale-[0.98] 100ms |

### 8.3 로딩 상태

- **스트리밍 응답 대기**: AI 메시지 버블에 3개 점 애니메이션 (각 점 300ms 딜레이로 순차 깜빡임)
- **이미지 생성 대기**: 스켈레톤 + 중앙 하단에 "생성 중... 약 12초 소요" 텍스트
- **KIPRIS 검색**: 인라인 스피너 + "검색 중..."
- **페이지 초기 로드**: Suspense 경계. 구체 스피너 없이 스켈레톤으로 처리

### 8.4 포커스 표시

키보드 사용자를 위해 **모든 포커스 가능 요소에 2px Royal 링**. `focus-visible` 활용 (마우스 클릭 시엔 안 보임).

---

## 9. 반응형 전략

### 9.1 브레이크포인트

```
sm   640px    모바일 가로
md   768px    태블릿 세로
lg   1024px   태블릿 가로
xl   1280px   데스크톱 기본
2xl  1440px   데스크톱 넓은
```

### 9.2 워크스페이스(/chat) 반응형 규칙

| 뷰포트 | 레이아웃 |
|---|---|
| ≥ 1440px | 4패널 모두 (Sidebar 240 + Chat + FormPreview + FieldList 220) |
| 1280~1439 | FieldList 접힘(아이콘만 48px). 클릭 시 오버레이 형태로 일시 확장 |
| 1024~1279 | Sidebar 아이콘 모드(64px) + Chat + FormPreview. FieldList는 FormPreview 상단에 Accordion |
| 768~1023 | Sidebar는 햄버거 드로어(Sheet). Chat + FormPreview 좌우 스플릿 유지(각 50%) |
| < 768 | 단일 컬럼. 상단 탭으로 Chat ↔ FormPreview ↔ FieldList 전환. Sidebar는 햄버거 드로어 |

### 9.3 모바일 특수 처리

- 입력창 포커스 시 viewport가 키보드로 올라가므로, 채팅 컨테이너는 `dvh` 단위 사용
- 사이드바 드로어는 좌측에서 슬라이드 인, 80% 너비, 배경 dim 40%
- 대시보드 그리드: 모바일에서 1열 고정

---

## 10. 접근성

- **대비**: 본문 텍스트는 WCAG AA (4.5:1) 이상. Neutral 700 on White = 9.6:1 ✓
- **포커스**: 모든 인터랙티브 요소에 `focus-visible` 스타일 필수
- **aria-label**: 아이콘 전용 버튼에 필수 (예: 전송, 복사, 메뉴 열기)
- **키보드 네비게이션**:
  - `Tab` 순서는 시각적 흐름과 일치
  - `Escape`는 모달·드로어·수정 모드 해제
  - `Enter`는 폼 제출, `Shift+Enter`는 채팅 textarea 줄바꿈
- **스크린 리더**: 라이브 리전으로 AI 스트리밍 응답 발표 (`aria-live="polite"`)
- **색으로만 의미 전달 금지**: 상태 아이콘은 항상 색 + 형태(체크·원·빈 원) 병용

---

## 11. Tailwind 설정

`tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        // Brand primary
        ink: {
          DEFAULT: '#0D163D',
          50:  '#F2F3F8',
          100: '#D9DCE8',
          200: '#B3B9D1',
          300: '#8D96BA',
          400: '#6773A3',
          500: '#41508C',
          600: '#344070',
          700: '#263054',
          800: '#192038',
          900: '#0D163D',
        },
        royal: {
          DEFAULT: '#1E3A8A',
          50:  '#EEF2FB',
          100: '#D6DEF4',
          200: '#ADBCE9',
          300: '#8499DE',
          400: '#5B77D3',
          500: '#3256B6',
          600: '#2847A0',
          700: '#1E3A8A',
          800: '#172D6C',
          900: '#10204D',
        },
        jade: {
          DEFAULT: '#22C55E',
          50:  '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        // Neutrals (Tailwind 기본 gray와 동일, 참조용 alias)
        neutral: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Semantic
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#DC2626',
        info:    '#1E3A8A',
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.15', fontWeight: '700' }],
        h1:      ['32px', { lineHeight: '1.25', fontWeight: '700' }],
        h2:      ['24px', { lineHeight: '1.3',  fontWeight: '600' }],
        h3:      ['20px', { lineHeight: '1.35', fontWeight: '600' }],
        h4:      ['16px', { lineHeight: '1.4',  fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6',  fontWeight: '400' }],
        body:    ['14px', { lineHeight: '1.55', fontWeight: '400' }],
        label:   ['13px', { lineHeight: '1.4',  fontWeight: '500' }],
        caption: ['12px', { lineHeight: '1.4',  fontWeight: '400' }],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      keyframes: {
        'field-flash': {
          '0%':   { backgroundColor: 'rgba(30, 58, 138, 0.12)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'check-pop': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'field-flash': 'field-flash 250ms ease-out forwards',
        'check-pop':   'check-pop 200ms ease-out',
        shimmer:       'shimmer 1.5s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

---

## 12. shadcn 테마 오버라이드

`app/globals.css`의 CSS 변수를 다음처럼 설정:

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;            /* White */
    --foreground: 222 40% 11%;          /* Neutral 900 */

    --card: 0 0% 100%;
    --card-foreground: 222 40% 11%;

    --popover: 0 0% 100%;
    --popover-foreground: 222 40% 11%;

    /* Brand */
    --primary: 222 64% 33%;             /* Royal #1E3A8A */
    --primary-foreground: 0 0% 100%;

    --secondary: 220 14% 96%;           /* Neutral 100 */
    --secondary-foreground: 222 40% 11%;

    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;     /* Neutral 500 */

    --accent: 220 14% 96%;
    --accent-foreground: 222 40% 11%;

    --destructive: 0 72% 51%;           /* Danger */
    --destructive-foreground: 0 0% 100%;

    --success: 142 71% 45%;             /* Jade */
    --success-foreground: 0 0% 100%;

    --border: 220 13% 91%;              /* Neutral 200 */
    --input: 220 13% 91%;
    --ring: 222 64% 33%;                /* Royal */

    --radius: 0.5rem;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground font-sans;
    font-feature-settings: "ss01", "ss02", "tnum";
  }
  h1, h2, h3, h4 {
    @apply text-foreground;
    letter-spacing: -0.01em;
  }
}
```

### shadcn 컴포넌트 커스텀

프로젝트에서 사용할 shadcn 컴포넌트 설치 목록:

```
pnpm dlx shadcn-ui@latest add button input textarea card badge dialog
pnpm dlx shadcn-ui@latest add sheet tabs progress separator skeleton
pnpm dlx shadcn-ui@latest add scroll-area dropdown-menu tooltip toast
pnpm dlx shadcn-ui@latest add accordion command alert
```

설치 후 각 컴포넌트의 variant를 위 토큰에 맞게 조정. 특히 `Button`은 `primary` variant를 Royal 기준으로 추가.

---

## 13. 구현 체크리스트

Claude Code가 디자인 구현 시 이 순서로 진행.

### Phase A: 디자인 시스템 기반 (Week 1 후반)

- [ ] Pretendard 폰트 로드 (CDN 또는 패키지)
- [ ] `tailwind.config.ts`에 §11 설정 그대로 적용
- [ ] `app/globals.css`에 §12 CSS 변수 그대로 적용
- [ ] shadcn 컴포넌트 일괄 설치
- [ ] Lucide Icons 설치 (`lucide-react`)
- [ ] `components/ui/Button.tsx` variant primary/secondary/ghost/danger 확인 및 보정

### Phase B: 레이아웃 셸 (Week 1 후반 ~ Week 2)

- [ ] `components/layout/AppShell.tsx` 구현
- [ ] `components/layout/Sidebar.tsx` 구현 (§7.2 사양 그대로)
- [ ] 모바일 Sheet 드로어 분기 처리
- [ ] 인증 후 모든 라우트가 AppShell로 감싸지도록 구조

### Phase C: 워크스페이스 (Week 2 ~ Week 3)

- [ ] `components/chat/ChatPanel.tsx` (§7.3)
- [ ] `components/preview/FormPreview.tsx` (§7.4)
- [ ] `components/preview/FieldList.tsx` (§7.5)
- [ ] 4패널 그리드 레이아웃 + 반응형 분기

### Phase D: 피처 화면 (Week 4 ~ )

- [ ] `components/dashboard/ProjectCard.tsx`
- [ ] `components/studio/*` (§7.7, SPEC §7.6 함께 참조)
- [ ] `components/claims/*` (§7.8)
- [ ] `components/package/*`

### Phase E: 폴리싱 (Week 12)

- [ ] 모든 마이크로 인터랙션 동작 확인 (§8.2)
- [ ] 반응형 모든 브레이크포인트 검증
- [ ] 접근성 검증 (Lighthouse, axe DevTools)
- [ ] 다크모드 토큰 준비 (실 적용은 Phase 2)

---

## 부록 A: 디자인 토큰 빠른 참조

```
Brand            Ink #0D163D  ·  Royal #1E3A8A  ·  Jade #22C55E
Neutrals         50 #F9FAFB   100 #F3F4F6   200 #E5E7EB
                 400 #9CA3AF  500 #6B7280   700 #374151   900 #111827

Type scale       display 48 / h1 32 / h2 24 / h3 20 / h4 16
                 body-lg 16 / body 14 / label 13 / caption 12

Spacing          4 → 8 → 12 → 16 → 24 → 32 → 48 → 64

Radius           sm 4 / md 8 / lg 12 / xl 16

Layout           Sidebar 240 / FieldList 220 / Doc max 840
                 Workspace breakpoints 1024 / 1280 / 1440

Motion           150ms ease-out (default) / 200ms (enter-exit)
Focus            2px Royal ring (focus-visible)
```

## 부록 B: 핵심 화면 ASCII 레퍼런스

### 워크스페이스 (≥1440px)

```
┌────────┬─────────────┬──────────────────────────┬──────────┐
│ ◐ IP   │ AI 인터뷰   │ 실시간 양식 프리뷰       │ 필드 목록 │
│ Assist │ ─────────── │ ──────────────────────── │ ──────── │
│        │ [Project ▾] │  특 허 출 원 서          │ 1. 명칭 ✓│
│ 홈     │             │                          │ 2. 분야 ✓│
│ 프로젝트│  AI: 안녕..│ 1. 발명의 명칭           │ 3. 배경 ✓│
│ + 새   │  나: 휴대용..│  ┌──────────────────┐  │ 4. 내용 ▾│
│        │             │  │이중 밸브 구조...  │  │  4-1 ✓  │
│ ─ IP ─ │  AI: 좋아요│  └──────────────────┘  │  4-2 ✓  │
│ 저작권 │  나: ...    │ 2. 기술분야              │  4-3 ○  │
│ 상표   │             │  ┌──────────────────┐  │ 5. 도면 ○│
│ 디자인 │             │  │본 발명은...       │  │ 6. 실시 ○│
│ 특허   │             │  └──────────────────┘  │ 7. 청구 ○│
│        │             │                          │ 8. 요약 ○│
│ 스튜디오│ ┌─────────┐│                          │          │
│ 패키지 │ │입력...  >│                          │ ──────── │
│ FAQ    │ └─────────┘│                          │ 진행률   │
│        │             │                          │ ▓▓▓▓░ 68%│
│ 설정   │             │                          │          │
└────────┴─────────────┴──────────────────────────┴──────────┘
  240         flex             flex (max 840 docs)    220
```

---

## 문서 버전

- v1.0 — 2026-04-25 — 초기 디자인 시스템 (디자인 컨셉 제안서 v1 반영)

이 문서는 SPEC.md와 함께 프로젝트 루트에 두고, Claude Code가 모든 UI 작업 시 참조합니다.

# IP-Assist — 대화형 지식재산권 등록 보조 웹앱

> **문서 목적**: 이 단일 문서는 Claude Code가 프로젝트를 제로에서 MVP까지 구현하기 위한 모든 제품·기술 스펙을 담고 있습니다. 이 문서를 프로젝트 루트에 두고 Claude Code 세션에서 참조하세요.
>
> **동반 문서**: `DESIGN.md` — 디자인 시스템(색상·타이포·레이아웃·컴포넌트 토큰). UI 구현 시 디자인 관련 결정은 DESIGN.md를 우선합니다.
>
> **작업 시작 방법**: 이 파일을 `SPEC.md`로, 디자인 문서를 `DESIGN.md`로 프로젝트 루트에 저장한 뒤, Claude Code 첫 세션에 `"SPEC.md와 DESIGN.md를 모두 읽고 섹션 17의 부트스트랩 프롬프트부터 순서대로 실행해"` 라고 지시합니다.

---

## 목차

0. [이 문서 사용법](#0-이-문서-사용법)
1. [제품 정의](#1-제품-정의)
2. [핵심 사용자 여정](#2-핵심-사용자-여정)
3. [기술 스택](#3-기술-스택)
4. [아키텍처](#4-아키텍처)
5. [데이터 모델](#5-데이터-모델)
6. [AI 에이전트 시스템](#6-ai-에이전트-시스템)
7. [화면/라우트 명세](#7-화면라우트-명세)
8. [API 라우트 명세](#8-api-라우트-명세)
9. [IP 유형별 필드 스키마](#9-ip-유형별-필드-스키마)
10. [외부 API 통합](#10-외부-api-통합)
11. [이미지 파이프라인](#11-이미지-파이프라인)
12. [청구범위 힌트 시스템](#12-청구범위-힌트-시스템)
13. [UX 원칙 & 카피 톤](#13-ux-원칙--카피-톤)
14. [보안 & 프라이버시](#14-보안--프라이버시)
15. [법적 컴플라이언스](#15-법적-컴플라이언스)
16. [개발 로드맵 (12주)](#16-개발-로드맵-12주)
17. [초기 Claude Code 부트스트랩 프롬프트](#17-초기-claude-code-부트스트랩-프롬프트)
18. [환경 변수 목록](#18-환경-변수-목록)
19. [파일 구조](#19-파일-구조)
20. [용어 사전](#20-용어-사전)

---

## 0. 이 문서 사용법

### Claude Code에게 주는 지시 원칙

- **이 문서의 설계를 당연 전제로 수용**할 것. 스택 선택, 데이터 모델, 에이전트 구조를 재논의하지 말고 구현에 집중.
- **섹션 16의 주차별 로드맵 순서를 따를 것**. Week N을 건너뛰고 N+2를 먼저 건드리지 않음.
- **Week별 산출물을 명확히 커밋**으로 분리. PR 단위는 Week 하위의 기능 단위.
- **섹션 17의 부트스트랩 프롬프트가 출발점**. 이후 Week별 작업 시 해당 Week 섹션을 다시 참조.
- **불확실하면 중단하고 질문**. 이 문서에 명시되지 않은 결정은 추측하지 말 것.

### 유저(제품 오너)에게 주는 사용 가이드

- 이 문서는 MVP 완성까지의 스펙. 이후 확장(해외 IP, 변리사 마켓플레이스 등)은 별도 문서로.
- 프로젝트 코드네임은 **IP-Assist**로 통일했습니다. 정식 브랜드명이 정해지면 환경변수 `NEXT_PUBLIC_APP_NAME`만 바꾸면 UI 전반에 반영되도록 구현.

---

## 1. 제품 정의

### 1.1 한 줄 설명

> **IT에 익숙하지 않은 개인·소상공인이 자기 아이디어와 창작물을 대화만으로 지식재산권 등록 양식·도안·부속 서류로 변환받고, 본인이 직접 특허청/저작권위원회에 제출할 수 있게 돕는 웹앱.**

### 1.2 해결하는 문제

현재 한국에서 IT 비전공 개인이 상표·저작권·특허를 등록하려면 아래 중 택일해야 함:

- (A) 특허청/KIPRIS/CROSS 사이트를 직접 해독하며 수 시간~수십 시간의 자기학습 → 대부분 중도 포기
- (B) 변리사 위임 (특허 150~300만원, 상표 30~80만원) → 비용 장벽
- (C) 등록 포기 → 권리 유실 위험

이 앱은 **(A)와 (B) 사이의 새로운 층위**를 만든다. AI가 대화로 필요한 정보를 구조화하고, 양식·도안·부속서류를 완성 직전 상태까지 조립하여 유저가 "복사 붙여넣기 + 본인 로그인 제출"만 하면 되게 함. 특허의 경우 변리사 검토 단계로 자연스럽게 연결.

### 1.3 타겟 유저

- **P1 (Primary)**: 1인 창작자·소상공인·스타트업 초기 대표. 자기 브랜드/캐릭터/아이디어를 갖고 있지만 행정 절차에 약함. 연령 25~55.
- **P2 (Secondary)**: 디자인 전공 학생, 크리에이터. 포트폴리오를 저작권으로 등록하려 함.
- **P3 (Tertiary)**: 변리사 사무소. 유저가 1차 정리한 자료 패키지를 받아 효율 향상.

### 1.4 범위 — 이 MVP에서 지원하는 IP 유형

| 유형 | 지원 | 완결 수준 |
|---|---|---|
| 저작권 (어문·미술·음악·영상 등) | ✅ | 양식·도안·제출 가이드 완전 자동. 유저가 CROSS에서 본인 제출 |
| 상표 | ✅ | 선행조사 + 양식 + 도안 규격 변환 + 지정상품 초안. 유저가 특허로에서 본인 제출 |
| 디자인권 | ✅ | 6면도 생성·변환 + 물품 분류. 유저 본인 제출 |
| 특허 | ✅ | 명세서 초안 + 도면 + 선행기술조사 + 청구범위 추천안. **변리사 검토 의뢰 경로 필수 제공** |
| 실용신안 | Phase 2 | 특허 플로우 완성 후 추가 |
| 해외 IP (PCT, 마드리드) | Phase 3 | MVP 이후 |

### 1.5 비범위 — 이 앱이 하지 않는 것

- 유저 계정으로 특허로/CROSS에 **자동 제출하지 않음**. (공동인증서 위임 금지)
- **법적 자문 제공하지 않음**. 모든 추천은 "자료 준비"로 포지셔닝.
- 변리사법 제2조의 **대리 업무는 일절 수행하지 않음**. 유저는 본인 명의로 제출하거나 본인이 선정한 변리사를 통해 제출.
- **성공보수·결과연동 수수료 없음**. 구독 또는 IP 유형별 정액제만.

---

## 2. 핵심 사용자 여정

### 시나리오: 저작권 등록 (캐릭터)

```
1. 랜딩 진입 → "무엇을 보호하고 싶으세요?" 프롬프트
2. 유저: "제가 그린 캐릭터를 등록하고 싶어요. 이름은 '카밀리'고 제주 동백이 모티브예요"
3. AI 분류 에이전트: copyright/미술저작물/응용미술-캐릭터로 라우팅
4. 인터뷰어가 대화 시작 (평균 10~14턴)
   - 저작자 정보, 창작 연월일, 공표 여부
   - 저작물 설명 (독창성·창작 의도 자동 초안)
   - 특이사항 (AI 도구 활용 여부 등)
5. 대화 동시에 오른쪽 프리뷰 양식이 실시간으로 채워짐
6. "도안 스튜디오" 탭 진입 → 원본 업로드 or AI 생성
7. CROSS 규격으로 자동 변환 + 표지 시트 조립
8. 최종 양식 PDF 다운로드 + CROSS 제출 단계별 가이드 화면
9. 유저가 CROSS 로그인 후 자료를 업로드 (앱 밖)
```

### 시나리오: 특허 등록

위 1~5와 동일 구조이나, 인터뷰가 청구항 힌트 슬롯까지 확장됨. 6단계에서 도면 AI 생성이 핵심이 되고, 7단계에 **청구범위 추천 화면**이 추가됨. 9단계에서 유저는 "변리사 검토 의뢰" 또는 "본인 제출(경고 팝업 후)" 중 선택.

---

## 3. 기술 스택

### 3.1 프론트엔드

```
Next.js              14.2+ (App Router, Server Components)
React                18.3+
TypeScript           5.3+
Tailwind CSS         3.4+
shadcn/ui            최신 (Radix 기반)
Pretendard           웹폰트 (CDN 또는 로컬)
Vercel AI SDK        4.x (@ai-sdk/anthropic, @ai-sdk/google)
Zod                  3.22+ (스키마 검증)
Framer Motion        11.x (마이크로 인터랙션, 선택적)
react-dropzone       이미지 업로드
```

### 3.2 백엔드 / 서버리스

```
Vercel Route Handlers     Next.js /app/api/*
Firebase Admin SDK        서버사이드 Firestore 접근
Firebase Client SDK v10   클라이언트 실시간 구독
```

### 3.3 데이터/스토리지

```
Firebase Auth                  이메일 + Google + Kakao(카카오 OAuth Provider)
Firestore                      메인 데이터스토어
Firestore Vector Search        이미지 유사도 검색 (Preview → GA 시 전환)
Firebase Storage               이미지 원본/가공본
Firebase Cloud Functions       이미지 처리 (Gen 2, Node.js 20)
```

### 3.4 AI / 외부 API

```
Anthropic Claude Sonnet 4.7   Interviewer, Extractor, 프롬프트 복잡도 높은 영역
Google Gemini 2.5 Flash-Lite  Classifier, 경량 분류
Google Gemini 2.5 Flash Image
  (Nano Banana)                이미지 생성 및 편집 (주력)
Replicate Flux.1 Pro           고품질 제품 렌더링 (선택)
Tripo3D or Meshy               Text-to-3D (Phase 2)
remove.bg or rembg self-host   배경 제거
KIPRIS Plus Open API           상표·특허·디자인 검색
```

### 3.5 인프라

```
Vercel                         Next.js 배포, Edge Functions
Firebase (GCP)                 Auth/DB/Storage/Functions
Cloudflare (선택)              이미지 CDN
```

### 3.6 개발 도구

```
pnpm                    패키지 매니저
ESLint + Prettier       코드 스타일
Husky + lint-staged     pre-commit
Playwright              E2E 테스트
Vitest                  유닛 테스트
```

---

## 4. 아키텍처

### 4.1 시스템 구성도 (논리)

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│  Next.js App Router · React · Firebase Client SDK    │
└────────┬────────────────────────────────┬────────────┘
         │                                │
         │ HTTP (streaming)               │ onSnapshot
         ▼                                ▼
┌─────────────────────┐         ┌──────────────────────┐
│  Vercel Functions   │         │   Firebase Firestore │
│  /app/api/*         │────────▶│   /users             │
│  - chat (stream)    │         │   /registrations     │
│  - extract          │         │   /messages          │
│  - search           │         │   /assets            │
│  - image/generate   │         └──────────┬───────────┘
│  - image/edit       │                    │
│  - claims/recommend │         ┌──────────▼───────────┐
│  - package/build    │         │ Firebase Storage     │
└──┬──┬──┬──┬─────────┘         │ /uploads /processed  │
   │  │  │  │                   └──────────┬───────────┘
   │  │  │  │                              │
   │  │  │  │                   ┌──────────▼───────────┐
   │  │  │  │                   │ Cloud Functions Gen2 │
   │  │  │  │                   │  이미지 처리 트리거   │
   │  │  │  │                   └──────────────────────┘
   ▼  ▼  ▼  ▼
┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐
│Claude│ │Gemini│ │ KIPRIS   │ │ Replicate│
│ API  │ │  API │ │ Plus API │ │   API    │
└──────┘ └──────┘ └──────────┘ └──────────┘
```

### 4.2 실시간 동기화 원리

모든 UI 상태는 Firestore를 단일 진실 공급원으로 삼는다.

```
유저 발화
  → POST /api/chat (스트리밍)
  → Claude 응답 스트림 수신, UI에 즉시 표시
  → 응답 완료 후 /api/extract 호출
  → 추출된 필드를 Firestore /registrations/{id}.extractedFields 에 merge
  → 클라이언트의 onSnapshot 리스너가 프리뷰 패널 자동 리렌더
```

이 구조의 핵심은 **프리뷰 패널이 API 응답을 직접 기다리지 않는다**는 점. Firestore 구독으로 느슨하게 결합되어 UI 블로킹이 없음.

---

## 5. 데이터 모델

### 5.1 Firestore 컬렉션

```typescript
/users/{uid}
  displayName: string
  email: string
  photoURL?: string
  createdAt: Timestamp
  preferences: {
    defaultLanguage: 'ko' | 'en'
    notificationsEnabled: boolean
  }

/registrations/{regId}
  userId: string (참조)
  type: 'copyright' | 'trademark' | 'design' | 'patent'
  subType?: string  // 예: copyright일 경우 'art-character', 'literary' 등
  status: 'discovery' | 'interviewing' | 'ready_for_studio' |
          'studio_in_progress' | 'ready_for_claims' |
          'ready_for_package' | 'submitted'
  progress: number  // 0~100
  title: string  // 작업 중 변경 가능한 레지스트레이션 제목
  extractedFields: Record<string, any>  // IP 유형별 스키마 (섹션 9 참조)
  claimHints?: ClaimHints  // 특허 전용 (섹션 12)
  suggestedClaims?: SuggestedClaim[]  // 특허 전용
  conversationSummary?: string  // LLM이 주기적으로 생성하는 요약
  createdAt: Timestamp
  updatedAt: Timestamp

  /registrations/{regId}/messages/{messageId}
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Timestamp
    meta?: {
      extractedFieldsDelta?: Record<string, any>
      agentUsed?: 'classifier' | 'interviewer' | 'extractor'
    }

  /registrations/{regId}/assets/{assetId}
    kind: 'original' | 'normalized' | 'nobg' | 'grayscale' |
          'sheet' | 'ai_generated' | 'annotated'
    generationMode?: 'generate' | 'upload' | 'hybrid'
    sourceAssetId?: string  // 가공본의 경우 원본 참조
    storagePath: string  // Firebase Storage 경로
    downloadURL: string
    mimeType: string
    width: number
    height: number
    dpi?: number
    sizeBytes: number
    promptHistory?: Array<{ prompt: string; timestamp: Timestamp }>
    linkedFieldId?: string  // 양식 필드 연결
    createdAt: Timestamp

  /registrations/{regId}/studio_sessions/{sessionId}
    mode: 'generate' | 'upload' | 'hybrid'
    basePrompt: string  // extractedFields로부터 자동 생성된 프롬프트
    userPromptAddition: string
    style: string
    composition: string
    assetIds: string[]
    selectedAssetId?: string
    createdAt: Timestamp

/reference/nice_classes/{classId}  // 상표 니스 분류 45개
  code: string  // 예: "09", "35"
  nameKo: string
  nameEn: string
  description: string
  commonGoods: string[]  // 자주 지정되는 상품/서비스 예시

/reference/ipc_codes/{code}  // 특허 IPC 분류
  code: string  // 예: "A47G"
  nameKo: string
  description: string

/reference/copyright_types/{id}  // 저작물 종류 코드
  code: string
  nameKo: string
  subTypes: Array<{ code: string; nameKo: string }>

/reference/design_classes/{id}  // 디자인권 로카르노 분류

/trademark_embeddings/{id}  // KIPRIS 크롤링 상표 이미지 임베딩
  registrationNumber: string
  applicationNumber: string
  imageURL: string
  niceClasses: string[]
  embedding: Vector<512>  // Firestore Vector Search
  fetchedAt: Timestamp
```

### 5.2 Firebase Storage 디렉토리 구조

```
/uploads/{uid}/{regId}/original/{filename}
/processed/{uid}/{regId}/{kind}/{filename}
/ai_generated/{uid}/{regId}/{sessionId}/{variantIndex}.png
/packages/{uid}/{regId}/package.zip
```

### 5.3 필요 Firestore 인덱스

```
Collection: registrations
  Composite: (userId ASC, updatedAt DESC)
  Composite: (userId ASC, status ASC, updatedAt DESC)

Collection group: messages
  Single: timestamp ASC

Collection: trademark_embeddings
  Vector: embedding (dimension 512, distance COSINE)
  Composite: (niceClasses ARRAY_CONTAINS, fetchedAt DESC)
```

### 5.4 보안 규칙 요약 (firestore.rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /registrations/{regId} {
      allow read, write: if resource.data.userId == request.auth.uid;
      allow create: if request.resource.data.userId == request.auth.uid;
      match /{sub=**} {
        allow read, write: if get(/databases/$(db)/documents/registrations/$(regId))
                              .data.userId == request.auth.uid;
      }
    }
    match /reference/{doc=**} {
      allow read: if request.auth != null;
    }
    match /trademark_embeddings/{id} {
      allow read: if request.auth != null;
      allow write: if false;  // 백엔드 Admin SDK만
    }
  }
}
```

---

## 6. AI 에이전트 시스템

세 개의 독립 에이전트가 협업. 각 에이전트는 명확한 입력/출력을 가진 순수 함수로 구현.

### 6.1 Classifier

- **역할**: 유저 첫 발화를 받아 IP 유형 분류
- **모델**: Gemini 2.5 Flash-Lite
- **입력**: `{ userMessage: string }`
- **출력**:
  ```json
  {
    "primaryType": "copyright" | "trademark" | "design" | "patent",
    "subType": "art-character" | "logo" | "product-design" | ...,
    "alternativeTypes": ["trademark", "design"],
    "confidence": 0.87,
    "rationale": "캐릭터 언급 + 사업적 사용 언급 없음"
  }
  ```
- **시스템 프롬프트 (섹션 6.6)**

### 6.2 Interviewer

- **역할**: 현재까지 수집된 필드 상태를 보고 다음 질문 생성
- **모델**: Claude Sonnet 4.7
- **입력**:
  ```typescript
  {
    ipType: string;
    subType: string;
    extractedFields: Record<string, any>;
    lastMessages: Message[];  // 최근 6턴
    requiredSchema: ZodSchema;  // IP 유형별 필수 필드 목록
  }
  ```
- **출력**: 유저에게 보낼 다음 발화 (자연어, 스트리밍)
- **핵심 규칙**:
  - 한 번에 하나의 질문만
  - 유저가 말한 맥락을 이어가는 꼬리질문 우선
  - 필수 필드 중 빈 것이 여러 개여도 가장 자연스러운 것부터
  - 유저가 불편해하거나 모른다고 하면 "괜찮습니다, 나중에 채우셔도 돼요" 처리

### 6.3 Extractor

- **역할**: 대화 메시지 스트림에서 구조화된 필드 추출
- **모델**: Claude Sonnet 4.7 (JSON 출력 강제)
- **입력**:
  ```typescript
  {
    ipType: string;
    currentExtractedFields: Record<string, any>;
    recentDialog: Message[];  // 직전 3턴
    fieldSchema: ZodSchema;
  }
  ```
- **출력**: 업데이트할 필드만 포함한 부분 객체 (merge용)
  ```json
  {
    "delta": {
      "title": "카밀리",
      "authorName": "펀제주",
      "creationDate": "2024-03-15"
    },
    "confidence": {
      "title": 0.99,
      "authorName": 0.99,
      "creationDate": 0.78
    }
  }
  ```
- **호출 시점**: Interviewer 응답이 유저에게 전달된 후, 유저가 다시 답변하면 그 답변 + 직전 AI 질문을 대상으로 호출

### 6.4 Claim Hints Extractor (특허 전용)

- **역할**: 특허 대화에서 청구항 구성요소를 슬롯에 매핑
- **모델**: Claude Sonnet 4.7
- **입력**: 전체 대화 + 양식 필드
- **출력**:
  ```typescript
  {
    problem: string;
    coreInventiveConcept: string;
    components: Array<{
      name: string;
      role: string;
      essential: boolean;
      sourceMessageIds: string[];
    }>;
    relationships: Array<{
      from: string;
      to: string;
      type: string;
    }>;
    alternatives: string[];
    priorArtCheckpoints: string[];
  }
  ```

### 6.5 Prompt Composer (이미지 생성용)

- **역할**: extractedFields를 이미지 생성 프롬프트로 변환
- **모델**: Gemini 2.5 Flash (중간 정도의 맥락 이해가 필요해서 Flash-Lite 아님)
- **입력**:
  ```typescript
  {
    extractedFields: Record<string, any>;
    style: 'line_art' | '3d_render' | 'circuit' | 'isometric' | 'blueprint' | 'sketch';
    composition: 'single' | 'multiview_6' | 'exploded' | 'sequence';
    userAddition: string;  // 유저가 추가한 지시어
  }
  ```
- **출력**: 최종 이미지 모델에 전달할 영어 프롬프트

### 6.6 에이전트별 시스템 프롬프트 (프로덕션 기본형)

아래 프롬프트들은 `/lib/agents/prompts/` 디렉토리에 각각 `.md` 파일로 저장. 런타임에 import해서 사용.

#### 6.6.1 Classifier 프롬프트

```
You are an IP type classifier for a Korean intellectual property
registration assistant.

Given a user's first message describing what they want to protect,
classify into one of four primary types and a subtype.

Primary types:
- copyright: 저작권 (창작물 자체 보호)
- trademark: 상표 (상업적 사용되는 브랜드 식별자)
- design: 디자인권 (공업적 물품의 형상/모양/색채)
- patent: 특허 (기술적 발명)

Output ONLY valid JSON matching this schema:
{
  "primaryType": string,
  "subType": string,
  "alternativeTypes": string[],
  "confidence": number,
  "rationale": string
}

Guidance:
- If user mentions a character, artwork, or literary work → copyright
- If user mentions logo, brand name, or merchandising → trademark
  (also consider copyright if the design is artistic)
- If user mentions a product's look/shape → design
- If user mentions a method, device, or technical problem solved → patent

If ambiguous, put secondary possibilities in alternativeTypes.
Respond in valid JSON only, no prose.
```

#### 6.6.2 Interviewer 프롬프트 (저작권)

```
당신은 한국저작권위원회(CROSS) 저작권 등록을 도와주는
친절한 인터뷰어입니다.

지금까지 수집된 필드 상태:
{extractedFields}

최근 대화:
{recentMessages}

필수 필드 목록과 현재 채워진 상태:
{requiredFieldsChecklist}

다음 지침을 따라 유저에게 보낼 다음 메시지 하나를 작성하세요.

규칙:
1. 한 번에 하나의 질문만 할 것.
2. 유저의 직전 발화에 자연스럽게 이어지는 꼬리질문 우선.
3. 공식 용어 사용 최소화. 일상적 표현으로 물을 것.
4. 유저가 "모르겠어요"라고 답하면 "괜찮습니다, 이건 나중에
   확정해도 돼요"라고 안내하고 다음 필드로.
5. 이미 답이 있는 필드는 재질문하지 않음.
6. 유저의 답변에서 부수적으로 얻어갈 정보가 있으면 한 번에
   물어봐도 됨 (예: 창작 시기 + 공표 여부).
7. 어느 시점에 모든 필수 필드가 채워지면 "저작물 설명 초안을
   오른쪽에 준비했어요. 읽어보시고 톤이 맞는지 확인해주세요"
   라고 다음 단계로 안내.

존대말을 사용하되 과하게 격식적이지 않게.
유저가 편안하게 느낄 수 있도록 따뜻한 어조 유지.
```

#### 6.6.3 Extractor 프롬프트

```
You are a field extractor for Korean IP registration forms.
Your job is to read the recent dialog and extract structured
fields into JSON.

IP type: {ipType}
Current extracted fields: {currentFields}
Field schema (Zod-derived): {schemaDescription}

Recent dialog (user and assistant):
{recentDialog}

Output ONLY valid JSON with this shape:
{
  "delta": { /* fields to merge, only new or changed */ },
  "confidence": { /* same keys, 0~1 values */ }
}

Rules:
- Only output fields that have ACTUAL new information in the
  recent dialog. Do not re-output previously known values.
- If user says "I don't know" or "not sure", do not include that
  field in delta.
- Dates should be YYYY-MM-DD or null.
- For enum fields, use exact schema enum values.
- Confidence below 0.5 means do not include in delta either.
- No prose, no markdown. JSON only.
```

#### 6.6.4 Interviewer 프롬프트 (특허, 청구항 힌트 추출 모드)

```
당신은 특허 출원을 준비하는 발명자와 대화하는 인터뷰어입니다.
대화는 친절하게 하되, 내부적으로는 청구범위 작성에 필요한
정보를 체계적으로 수집하는 것이 목적입니다.

수집해야 할 청구항 힌트 슬롯:
1. problem: 해결하려는 기술적 과제
2. coreInventiveConcept: 핵심 발명 포인트 (가장 중요)
3. components: 발명을 구성하는 부품/요소들
4. relationships: 부품 간 결합·연결 관계
5. functions: 각 부품 또는 전체의 동작·기능
6. alternatives: 대체 실시 가능한 방식
7. priorArtCheckpoints: 유저가 알고 있는 기존 유사 기술

다음 지침을 따르세요:

- 평범한 대화처럼 물으세요. "구성요소가 뭐죠?" (X) /
  "어떤 부품들로 이뤄져 있나요?" (O)
- "이 부품이 없으면 작동하나요?" 질문으로 필수/선택 구분.
- "다른 방식으로도 만들 수 있을까요?" 질문으로 대체 실시예 확장.
- "비슷한 기존 제품이 있으셨나요?" 로 선행기술 회피 포인트.
- 기술적 디테일이 너무 빨리 나오면 "좀 더 간단히 설명해 주시면
  나머지는 제가 정리해볼게요"로 유저 부담 완화.
- 모든 슬롯이 차면 "청구범위 추천안을 준비했습니다. 다음 화면에서
  확인해 주세요"로 안내.
```

---

## 7. 화면/라우트 명세

### 7.1 `/` — 랜딩

- 히어로: 한 줄 카피 + 단일 CTA "지금 시작하기"
- 작동 원리 3단계 (대화 → 양식 자동 완성 → 다운로드)
- IP 유형 4종 설명 카드
- 하단 FAQ (변리사 필요 여부, 데이터 보관, 비용)

### 7.2 `/auth/*` — 인증

- `/auth/login` Firebase Auth UI (이메일·Google·Kakao)
- `/auth/signup` 동일
- 인증 후 `/dashboard`로 리다이렉트

### 7.3 `/dashboard` — 프로젝트 목록

- AppShell로 감싸짐 (좌측 Sidebar 항상 표시, DESIGN.md §7.2 참조)
- 본인의 진행 중/완료 프로젝트 그리드 (DESIGN.md §7.6 ProjectCard)
- 각 카드: IP 유형 배지, 프로젝트 제목, 최근 대화 1줄 요약, 진행률 바, 최종 수정일
- 상단 헤더: 사용자명 인사 + "+ 새 프로젝트" CTA (Royal primary 버튼)
- 빈 상태(첫 방문): 일러스트 + "첫 프로젝트를 시작해보세요" + CTA

### 7.4 `/register/new` — 등록 유형 선택 (대화 기반)

- AppShell 내부, Sidebar는 유지하지만 Main 영역은 단일 컬럼
- 중앙 정렬된 단일 입력창: "무엇을 보호하고 싶으세요?"
- 입력창 아래 예시 chip 4개 (각 IP 유형별 대표 케이스)
- 유저 첫 발화 → Classifier → 자동으로 `/register/[id]/chat`으로 라우팅
- Classifier 신뢰도 < 0.7이면 "이 중 어떤 걸까요?" 카드 4개 노출

### 7.5 `/register/[id]/chat` — **메인 워크스페이스 (4패널)**

> **디자인 원본**: 사용자 디자인 컨셉 제안서 v1 + DESIGN.md §6.2 / §7.2~§7.5

**전체 레이아웃 (≥1440px)**

```
┌─────────┬──────────────┬─────────────────────────┬──────────┐
│ Sidebar │ ChatPanel    │ FormPreview             │ FieldList│
│ 240px   │ 360~480px    │ flex (max 840 doc)      │ 220px    │
└─────────┴──────────────┴─────────────────────────┴──────────┘
```

각 패널의 상세 스펙은 DESIGN.md §7.2~§7.5 참조. 본 섹션은 **데이터·동작 명세**만 담당.

**ChatPanel 동작**

- Vercel AI SDK `useChat` 훅으로 `/api/chat` 스트리밍 호출
- 메시지가 Firestore `/registrations/{id}/messages`에 저장됨 (서버 측 처리)
- AI 응답 완료 후 `/api/extract`가 자동 호출되어 필드 업데이트
- 입력창에 음성 입력 버튼 (Web Speech API, Phase 2 가능)
- 헬퍼 텍스트: "AI는 참고 자료를 제공하며, 법적 자문이 아닙니다." (DESIGN.md §7.3)

**FormPreview 동작**

- Firestore `onSnapshot`으로 `extractedFields` 실시간 구독
- 필드 업데이트 발생 시 해당 컨테이너에 250ms field-flash 애니메이션 (DESIGN.md §8.2)
- 모든 필드 우상단에 복사 버튼 (호버 시 노출)
- AI 생성 값에는 "AI 초안" 배지 (Royal-100 배경)
- "PDF 미리보기" 버튼: 현재 상태로 PDF 임시 렌더 후 새 탭
- "필드 편집" 버튼: 인라인 편집 모드 토글
- 문서 스타일은 정부 서식을 모사: 제목 글자 간 공백("특 허 출 원 서"), 번호 매겨진 섹션

**FieldList 동작**

- 우측 220px, DESIGN.md §7.5 사양
- 각 필드 항목 클릭 시 FormPreview 내부에서 해당 섹션으로 부드럽게 스크롤 + 0.8s 하이라이트
- 상태 아이콘: Jade 체크(완료), Royal dot(작성 중), Neutral 빈 원(미작성)
- 하단 진행률 바 + 퍼센트
- 화면폭 < 1440px 시 자동 접힘 (아이콘만 48px)

**반응형 분기 (DESIGN.md §9.2 참조)**

| 뷰포트 | 동작 |
|---|---|
| ≥ 1440px | 4패널 모두 |
| 1280~1439 | FieldList 접힘, 클릭 시 오버레이 확장 |
| 1024~1279 | Sidebar 아이콘 모드, FieldList는 FormPreview 상단 Accordion |
| 768~1023 | Sidebar 드로어, Chat+Preview 50/50 |
| < 768 | 단일 컬럼, 상단 탭 전환 |

**필수 기능**

- 대화 중간 도움말 배지: "이건 왜 묻는 거예요?" 클릭 시 툴팁
- 임의 필드 클릭하여 수동 편집 가능 (AI 추출 오류 대비)
- 하단 진행 가이드 배너: 필수 필드 70% 이상 시 "도안 스튜디오로 이동" 활성화

### 7.6 `/register/[id]/studio` — **도안 스튜디오**

**상단 탭**: AI 생성 | 원본 업로드 | 하이브리드

**AI 생성 탭**
- 프롬프트 textarea: `extractedFields` 기반 자동 생성 + 유저 편집 가능
- 스타일 칩: line_art / 3d_render / circuit / isometric / blueprint / sketch
- 출력 구성 칩: single / multiview_6 / exploded / sequence
- 참조 이미지 업로드 (선택)
- "생성" 버튼 → 4 variants 표시
- 결과 그리드: 각 variant 클릭 선택
- 선택된 이미지 아래에 **변형 명령 UI**:
  - 빠른 버튼: 화살표 추가 · 부호 삽입 · 3D로 변환 · 6면도로 분할 · 일부 영역 수정
  - 자연어 입력창: "힌지 부분 클로즈업 추가, ③번 위치 왼쪽으로"
  - 수정 결과는 히스토리 체인으로 관리

**원본 업로드 탭**
- 드래그앤드롭 업로드
- 업로드 완료 후 자동 변환 옵션:
  - 규격 변환 (IP 유형별 스펙 자동 적용)
  - 배경 제거
  - 흑백 변환
  - 도안 시트 조립 (제목·저작자·창작일 자동 기재)

**하이브리드 탭**
- 원본 업로드 + 프롬프트로 추가 생성
- 예: 정면도 업로드 → "측면·배면·상·하·사시도 생성" → 6면도 시트

**하단 공통**
- 선택된 파일들이 어느 양식 슬롯에 연결되는지 표시
- "양식에 적용" 버튼 → `linkedFieldId` 업데이트 → 프리뷰 반영

### 7.7 `/register/[id]/claims` — **청구범위 추천** (특허 전용)

- 상단 안내 배너 (섹션 13.3 카피 사용)
- 3가지 추천안 카드: 넓은 범위 / 중간 범위 / 좁은 범위
- 각 카드: 청구항 텍스트, 추출 근거 chip, 변리사에게 물어볼 질문
- 유저가 "이 방향으로 결정" 선택 가능
- 하단 CTA: "자료 패키지 준비" | "변리사 검토 의뢰"

### 7.8 `/register/[id]/package` — **자료 패키지 출력**

- 구성 파일 리스트 프리뷰
  - 01_발명의설명.docx (또는 저작물설명.docx 등)
  - 02_도면.pdf
  - 03_선행기술조사.pdf (특허·상표)
  - 04_청구범위_추천안.pdf (특허)
  - 05_대화록.pdf
  - 06_검토요청서.pdf (특허)
- 각 파일 개별 다운로드 + ZIP 전체 다운로드
- 제출 안내 가이드:
  - 저작권 → CROSS 제출 단계별 스크린샷 가이드
  - 상표/디자인/특허 → 특허로 제출 단계별 가이드
- 특허인 경우 "변리사 검토 의뢰" 섹션 상시 표시

### 7.9 `/settings` — 설정

- 프로필
- 알림 설정
- 데이터 내보내기 / 계정 삭제
- 결제 (Phase 2)

---

## 8. API 라우트 명세

모든 라우트는 `/app/api/*/route.ts` 형식. 인증은 Firebase ID 토큰을 `Authorization: Bearer <token>` 헤더로 전달받아 Admin SDK로 검증.

### 8.1 `POST /api/chat`

- **용도**: 대화 스트리밍 응답
- **입력**: `{ registrationId: string; messages: Message[] }`
- **처리**:
  1. Firestore에서 registration 로드
  2. IP 유형에 맞는 Interviewer 시스템 프롬프트 조립
  3. Claude API 스트리밍 호출
  4. 응답 완료 후 유저 마지막 발화 + AI 응답을 Firestore `/messages`에 저장
  5. Extractor 비동기 호출 트리거 (`/api/extract`)
- **출력**: AI SDK 스트리밍 포맷

### 8.2 `POST /api/extract`

- **용도**: 대화에서 필드 추출 → Firestore 업데이트
- **입력**: `{ registrationId: string }`
- **처리**:
  1. Firestore에서 최근 메시지 3개 + 현재 `extractedFields` 로드
  2. Extractor 에이전트 호출
  3. `delta`를 Firestore에 merge
  4. `status`와 `progress` 자동 계산해서 업데이트
- **출력**: `{ updated: string[]; progress: number }`

### 8.3 `POST /api/search/kipris`

- **용도**: KIPRIS Plus 검색 프록시
- **입력**: `{ type: 'trademark' | 'patent' | 'design'; query: string; filters?: Record<string, any> }`
- **처리**: KIPRIS Plus API 호출 → 결과 정규화 → 반환
- **출력**: `{ results: SearchResult[]; total: number }`

### 8.4 `POST /api/similarity/image`

- **용도**: 유저 업로드 도안과 KIPRIS 도형상표 벡터 비교
- **입력**: `{ assetId: string; niceClass?: string }`
- **처리**:
  1. 유저 이미지를 CLIP 임베딩 (Replicate 또는 자체 호스팅)
  2. Firestore Vector Search KNN 쿼리
  3. 상위 N개 반환
- **출력**: `{ matches: Array<{ trademark: ..., similarity: number }> }`

### 8.5 `POST /api/image/generate`

- **용도**: AI로 도안 생성 (4 variants)
- **입력**:
  ```typescript
  {
    registrationId: string;
    prompt: string;
    style: string;
    composition: string;
    refImageUrl?: string;
  }
  ```
- **처리**:
  1. Prompt Composer 에이전트로 최종 영어 프롬프트 생성
  2. Gemini Nano Banana (`gemini-2.5-flash-image-preview`) 호출
  3. 4개 variant 생성, Firebase Storage 저장
  4. Firestore `/assets` 및 `/studio_sessions` 기록
- **출력**: `{ assetIds: string[]; sessionId: string }`

### 8.6 `POST /api/image/edit`

- **용도**: 선택된 이미지에 수정 명령 적용
- **입력**: `{ assetId: string; instruction: string }`
- **처리**: Nano Banana image editing 호출 → 새 버전 생성 → `sourceAssetId`로 체인 연결
- **출력**: `{ newAssetId: string }`

### 8.7 `POST /api/image/upload-process`

- **용도**: 원본 업로드 후 자동 가공
- **입력**: `{ registrationId: string; uploadPath: string; targetKinds: string[] }`
- **처리**: Cloud Functions 트리거. Sharp로 리사이즈·DPI·포맷. 배경 제거는 rembg. 그레이스케일. 도안 시트.
- **출력**: `{ processedAssetIds: string[] }`

### 8.8 `POST /api/claims/recommend`

- **용도**: 특허 청구범위 3가지 추천안 생성
- **입력**: `{ registrationId: string }`
- **처리**:
  1. Claim Hints Extractor로 대화 전체 분석
  2. 힌트를 Firestore `claimHints`에 저장
  3. 3가지 범위별로 청구항 조립 (LLM 호출 3번 또는 한 번에 3개 요청)
  4. `suggestedClaims`에 저장
- **출력**: `{ suggestedClaims: SuggestedClaim[] }`

### 8.9 `POST /api/package/build`

- **용도**: 자료 패키지 ZIP 생성
- **입력**: `{ registrationId: string }`
- **처리**:
  1. 모든 `extractedFields`, `assets`, `suggestedClaims`, 대화록 로드
  2. docx/pdf 생성 (각 문서별 템플릿)
  3. ZIP으로 묶어서 Firebase Storage `/packages/` 저장
  4. Signed URL 반환
- **출력**: `{ packageUrl: string; expiresAt: Timestamp }`

---

## 9. IP 유형별 필드 스키마

Zod 스키마로 정의. `/lib/schemas/` 디렉토리.

### 9.1 저작권 (copyright)

```typescript
export const CopyrightSchema = z.object({
  // 저작물 정보
  title: z.string().min(1),
  titleEn: z.string().optional(),
  typeCode: z.enum([
    'literary', 'musical', 'dramatic', 'art',
    'architectural', 'photographic', 'film',
    'graphic', 'applied_art', 'computer_program',
    'compilation', 'derivative'
  ]),
  subTypeCode: z.string().optional(),  // 예: 'character', 'illustration'
  description: z.string().min(20),
  creationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

  // 저작자 정보
  authorName: z.string(),
  authorNameEn: z.string().optional(),
  authorBirthYear: z.number().int().optional(),
  authorNationality: z.string().default('KR'),
  authorType: z.enum(['individual', 'corporate', 'joint']),
  jointAuthors: z.array(z.object({
    name: z.string(),
    contributionRatio: z.number().min(0).max(100),
  })).optional(),

  // 공표 정보
  publicationStatus: z.enum(['published', 'unpublished']),
  publicationDate: z.string().optional(),
  publicationCountry: z.string().optional(),
  firstPublicationMedium: z.string().optional(),

  // 특이사항
  usesAIAssistance: z.boolean().optional(),
  aiAssistanceDescription: z.string().optional(),
  isDerivativeWork: z.boolean().optional(),
  originalWorkInfo: z.string().optional(),

  // 등록인 정보 (저작자와 다를 경우)
  registrantSameAsAuthor: z.boolean().default(true),
  registrantInfo: z.object({
    name: z.string(),
    address: z.string(),
    phone: z.string(),
    email: z.string().email(),
  }).optional(),
});
```

### 9.2 상표 (trademark)

```typescript
export const TrademarkSchema = z.object({
  markName: z.string(),
  markType: z.enum([
    'text', 'figurative', 'combined',
    'color', 'sound', 'motion', '3d'
  ]),
  markDescription: z.string(),

  niceClasses: z.array(z.string()).min(1),  // 45류 중 선택
  designatedGoods: z.array(z.object({
    niceClass: z.string(),
    goodsList: z.array(z.string()),
  })),

  applicantType: z.enum(['individual', 'corporate']),
  applicantName: z.string(),
  applicantAddress: z.string(),
  applicantBusinessNumber: z.string().optional(),

  priorityClaim: z.object({
    claimed: z.boolean(),
    country: z.string().optional(),
    applicationNumber: z.string().optional(),
    applicationDate: z.string().optional(),
  }).optional(),

  firstUseDate: z.string().optional(),
  intentToUse: z.boolean().optional(),
});
```

### 9.3 디자인권 (design)

```typescript
export const DesignSchema = z.object({
  designTitle: z.string(),
  locarnoClass: z.string(),  // 로카르노 분류
  articleName: z.string(),   // 물품 명칭
  articleDescription: z.string(),

  designConcept: z.string(),
  featureDescription: z.string(),

  views: z.object({
    front: z.string().optional(),     // assetId
    back: z.string().optional(),
    left: z.string().optional(),
    right: z.string().optional(),
    top: z.string().optional(),
    bottom: z.string().optional(),
    perspective: z.string().optional(),
  }),

  partialDesign: z.boolean().optional(),
  partialDescription: z.string().optional(),

  priorityClaim: z.object({ /* ... */ }).optional(),
  designerInfo: z.object({ /* ... */ }),
});
```

### 9.4 특허 (patent)

```typescript
export const PatentSchema = z.object({
  // 발명의 명칭
  inventionTitle: z.string(),
  inventionTitleEn: z.string().optional(),

  // 기술분야
  technicalField: z.string(),
  ipcCode: z.string().optional(),  // 자동 추천

  // 배경기술
  backgroundArt: z.string(),
  priorArtReferences: z.array(z.object({
    title: z.string(),
    source: z.string(),
    registrationNumber: z.string().optional(),
    differences: z.string(),
  })),

  // 해결하려는 과제
  problemToSolve: z.string(),

  // 과제 해결 수단
  solution: z.string(),

  // 발명의 효과
  effects: z.string(),

  // 발명을 실시하기 위한 구체적인 내용 (실시예)
  detailedDescription: z.string(),
  embodiments: z.array(z.object({
    title: z.string(),
    description: z.string(),
    figureReferences: z.array(z.string()),
  })),

  // 도면의 간단한 설명
  figureDescriptions: z.array(z.object({
    figureNumber: z.string(),
    description: z.string(),
    assetId: z.string(),
  })),

  // 청구범위 (AI 추천 + 유저 확정)
  claims: z.array(z.object({
    claimNumber: z.number(),
    type: z.enum(['independent', 'dependent']),
    dependsOn: z.array(z.number()).optional(),
    text: z.string(),
    source: z.enum(['ai_suggested', 'user_edited', 'finalized']),
  })),

  // 출원인 정보
  applicantInfo: z.object({
    name: z.string(),
    address: z.string(),
    nationality: z.string(),
    applicantType: z.enum(['individual', 'corporate']),
  }),

  // 발명자 정보
  inventorInfo: z.array(z.object({
    name: z.string(),
    address: z.string(),
    nationality: z.string(),
    contributionRatio: z.number().optional(),
  })),
});
```

---

## 10. 외부 API 통합

### 10.1 KIPRIS Plus

- **엔드포인트 베이스**: `http://plus.kipris.or.kr/kipo-api/kipi/`
- **주요 서비스**:
  - `trademarkInfoSearchService`: 상표 검색
  - `patUtilityModelInfoSearchSevice`: 특허/실용신안 검색
  - `designInfoSearchService`: 디자인 검색
- **인증**: `ServiceKey` 파라미터에 API 키
- **응답 포맷**: XML (Node에서 `fast-xml-parser`로 파싱)
- **Rate Limit**: 월 1,000회 무료 (공공데이터포털 경유), 유료 상품은 호출 수 확장
- **래퍼 위치**: `/lib/integrations/kipris.ts`
- **핵심 함수**:
  ```typescript
  searchTrademarks(query: string, niceClass?: string): Promise<TrademarkResult[]>
  searchPatents(query: string, ipcCode?: string): Promise<PatentResult[]>
  searchDesigns(query: string, locarnoClass?: string): Promise<DesignResult[]>
  fetchTrademarkImage(applicationNumber: string): Promise<string>  // URL
  ```

### 10.2 Google Gemini (Nano Banana 이미지 생성)

- **SDK**: `@google/genai` (최신 SDK)
- **모델명**: `gemini-2.5-flash-image-preview` (업데이트되면 `gemini-2.5-flash-image`)
- **API 기본 패턴**:
  ```typescript
  import { GoogleGenerativeAI } from '@google/genai';
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image-preview'
  });
  const result = await model.generateContent([prompt]);
  ```
- **이미지 편집**: 기존 이미지를 `inlineData`로 전달하며 새 프롬프트와 함께 호출.
- **래퍼 위치**: `/lib/integrations/gemini-image.ts`

### 10.3 Anthropic Claude

- **SDK**: `@ai-sdk/anthropic` (Vercel AI SDK 어댑터) + `@anthropic-ai/sdk` (직접 호출용)
- **모델명**: `claude-opus-4-7` 또는 `claude-sonnet-4-6` (비용/품질 트레이드오프)
- **Interviewer/Extractor**: 스트리밍 + JSON 강제 모드 혼용
- **래퍼 위치**: `/lib/integrations/claude.ts`

### 10.4 Replicate (Flux, CLIP embedding)

- **SDK**: `replicate`
- **주요 모델**:
  - Flux.1 Pro: `black-forest-labs/flux-1.1-pro`
  - CLIP 임베딩: `daanelson/imagebind`
- **래퍼 위치**: `/lib/integrations/replicate.ts`

---

## 11. 이미지 파이프라인

### 11.1 생성 모드 (`mode: 'generate'`)

```
1. 유저가 프롬프트 확인/편집 (자동 프리필됨)
2. 스타일·구성 선택
3. POST /api/image/generate
   - Prompt Composer 에이전트로 최종 영어 프롬프트 생성
   - Nano Banana 호출 (4 variants 요청)
   - 생성된 PNG를 Firebase Storage `/ai_generated/` 경로에 저장
   - Firestore `/assets` 4개 레코드 + `/studio_sessions` 1개 레코드
4. 유저가 variant 선택 → 수정 명령 반복 가능
5. 확정 시 linkedFieldId 연결
```

### 11.2 업로드 모드 (`mode: 'upload'`)

```
1. 유저 드래그앤드롭 업로드
2. Firebase Storage `/uploads/` 저장 → Firestore `/assets` 레코드 (kind='original')
3. Cloud Functions 트리거 자동 실행:
   - Sharp: 리사이즈, DPI 조정, 포맷 변환 → kind='normalized'
   - rembg: 배경 제거 → kind='nobg'
   - Sharp: 그레이스케일 → kind='grayscale'
   - reportlab/pdfkit: 도안 시트 조립 → kind='sheet'
4. 유저가 결과물 중 양식에 연결할 것 선택
```

### 11.3 하이브리드 모드 (`mode: 'hybrid'`)

```
1. 원본 업로드 (정면도 등)
2. Nano Banana에 "이 이미지를 기반으로 [지시어]" 프롬프트
   (image-to-image)
3. 생성 결과를 업로드 모드와 동일하게 후처리
```

### 11.4 Cloud Functions 구조

`/functions/src/index.ts`

```typescript
export const onImageUpload = onObjectFinalized({
  region: 'asia-northeast3',
  bucket: DEFAULT_BUCKET,
  memory: '1GiB',
  timeoutSeconds: 540,
}, async (event) => {
  const filePath = event.data.name;
  if (!filePath.startsWith('uploads/')) return;
  // Sharp, rembg, grayscale, sheet assembly
  // 결과물 /processed/에 저장
  // Firestore assets 업데이트
});
```

---

## 12. 청구범위 힌트 시스템

### 12.1 대화 슬롯 매핑

인터뷰어는 내부적으로 아래 슬롯을 채워가며 대화.

| 대화 질문 예시 | 채우는 슬롯 |
|---|---|
| "어떤 문제를 해결하고 싶으세요?" | `problem` |
| "기존 방식은 뭐가 불편한가요?" | `priorArtCheckpoints` |
| "어떤 부품으로 이뤄져 있나요?" | `components[]` |
| "이 부품이 없으면 작동하나요?" | `components[].essential` |
| "부품들은 서로 어떻게 연결되나요?" | `relationships[]` |
| "핵심 동작 원리를 설명해 주세요" | `functions[]` |
| "어떤 게 이 발명의 가장 핵심인가요?" | `coreInventiveConcept` |
| "다른 방식으로도 만들 수 있나요?" | `alternatives[]` |

### 12.2 청구범위 조립 규칙

세 가지 범위별로 다음 규칙에 따라 청구항 문장 조립:

- **넓은 범위 (A)**:
  - `components` 중 `essential: true` 항목들만 나열
  - `functions`은 상위 개념으로 추상화 ("회전 입력" / "토크 전환")
  - 결합 관계는 가장 약한 언어 ("포함하는")
  - 위험: 선행기술과 충돌 가능

- **중간 범위 (B, 추천)**:
  - 필수 components + 주요 relationships 1~2개
  - functions를 구체적으로 명시
  - 등록 안정성과 권리 범위의 균형

- **좁은 범위 (C)**:
  - 필수 + 선택적 components 일부
  - 구체적 실시예 기반 한정
  - 거의 확실히 등록되나 회피 쉬움

### 12.3 추천안 출력 포맷

각 추천항은 `SuggestedClaim` 타입:

```typescript
interface SuggestedClaim {
  id: string;
  scope: 'broad' | 'medium' | 'narrow';
  recommended: boolean;
  text: string;  // 실제 청구항 문장
  rationale: string;  // 이 범위를 왜 잡았는지
  sources: Array<{
    type: 'message' | 'field' | 'figure';
    id: string;
    snippet: string;
  }>;
  risks: string[];
  attorneyQuestions: string[];  // 변리사에게 물어볼 추천 질문
}
```

---

## 13. UX 원칙 & 카피 톤

### 13.1 디자인 원칙 — B Style 4원칙

본 앱의 모든 디자인·카피·인터랙션 결정은 다음 4원칙을 기준으로 한다 (DESIGN.md §1 동기화).

| 원칙 | 의미 | 실전 판단 |
|---|---|---|
| **Professional** | 법률·행정 도구의 톤 | 장식보다 정보. 친근함보다 정확함. 이모지 금지. |
| **Structured** | 정보의 체계적 정리 | 모든 정보 덩어리는 제목·본문·상태가 구분됨. 진행도가 항상 보임. |
| **Minimal** | 사용자 집중 유지 | 한 화면 색상 4개 이하. 그림자·그라디언트·블러 효과 금지. |
| **Trust & Safety** | 정확성·보안 우선 | 민감 데이터 별도 구획. AI 산출물에 "편집 가능" 표시. 중요 결정 전 확인. |

### 13.1.1 UX 운영 규칙 (B Style 적용)

1. **대화가 중심, 양식은 결과**: 유저가 보는 주 인터페이스는 대화. 양식은 옆에서 실시간으로 자라는 결과물 (DESIGN.md §6.2).
2. **모든 AI 산출물은 편집 가능**: "AI 초안" 배지 + 클릭 시 인라인 편집.
3. **절대 빈 양식을 보여주지 않는다**: 최소한 placeholder가 있어야 함. 공백 화면은 유저 포기 원인.
4. **진행도가 항상 보여야 한다**: FieldList 하단 고정 + Sidebar 프로젝트 카드에도 표시.
5. **이탈했다 돌아와도 자연스럽게 이어진다**: Firestore 영구 동기화로 자동 보장.
6. **모바일에서 엄지로 끝까지 갈 수 있다**: 단일 컬럼 + 탭 전환 (DESIGN.md §9.3).

### 13.2 톤 & 매너

- 존댓말 기본. 친근하되 가벼워 보이지 않게.
- 전문용어는 첫 등장 시 괄호에 쉬운 표현 병기: "니스 분류(상품 업종 코드)".
- 유저 실수에 절대 "틀렸어요" 표현 금지. "다시 한 번 확인해볼까요?" 로.
- 확신 강조 피하기: "무조건", "절대", "반드시" → "권장드립니다", "일반적으로".
- AI 주체 표현: "제가 준비했어요", "저희가 정리해드렸어요" (1인칭 or 1인칭 복수 혼용).

### 13.3 변리사 관련 안내 문구 — 필수 카피

**특허 청구범위 화면 상단 (고정)**
```
저희가 대화 내용을 바탕으로 3가지 방향의 추천안을 준비했어요.
청구범위는 특허의 권리 경계를 결정하는 가장 핵심적인 부분이라,
이 부분은 반드시 변리사와 충분히 검토하실 것을 권장드립니다.
아래 추천안은 그 검토를 위한 출발점으로 활용해 주세요.
```

**각 추천항 카드 하단**
```
이 방향으로 가실 경우 변리사에게 특히 여쭤볼 점:
• {attorneyQuestions[0]}
• {attorneyQuestions[1]}
```

**자료 패키지 출력 화면**
```
저희가 정리해드린 명세서 초안·도면·선행조사·청구범위 추천안을
한 묶음으로 준비했습니다. 이 패키지를 들고 변리사에게 가시면
처음부터 설명하실 필요가 없어서 검토 시간과 비용이 크게 줄어들어요.
```

**"본인 제출" 선택 시 확인 팝업 (특허만)**
```
청구범위를 변리사 검토 없이 직접 작성해 제출하시는 경우,
등록이 되더라도 권리 범위가 실효성 없게 확정될 위험이 있습니다.
그래도 본인 제출로 진행하시겠어요?

  [다시 생각해볼게요]   [이해했고 그래도 진행할게요]
```

### 13.4 피해야 할 표현

- "이건 법적 조언이 아닙니다" (방어적 → 약관으로 빠짐)
- "저희는 책임지지 않습니다" (신뢰 파괴)
- "AI가 틀릴 수 있으니" (같은 앱이 추천하고 같은 앱이 부정하는 구조)

---

## 14. 보안 & 프라이버시

### 14.1 인증

- Firebase Auth 사용. 이메일·Google·Kakao.
- ID 토큰은 httpOnly 쿠키 또는 sessionStorage (Next.js App Router 기본 패턴).
- 서버 사이드에서 모든 API 라우트 진입 시 `verifyIdToken` 필수.

### 14.2 Firestore 보안 규칙

(섹션 5.4 참조)

### 14.3 API 키 관리

- 클라이언트 노출 절대 금지: ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, KIPRIS_API_KEY
- Firebase config만 클라이언트 노출 (원래 공개값)
- Vercel 환경변수로 관리. Preview/Production 분리.

### 14.4 유저 데이터

- 대화 내용은 Firestore에 저장. 유저가 언제든 삭제 요청 가능 (`/settings` 내).
- 업로드 이미지는 Storage에 저장. 등록 삭제 시 Storage도 함께 삭제 (Cloud Function 트리거).
- 90일 이상 수정 없는 미완성 레지스트레이션은 유저에게 알림 후 180일째 자동 삭제.
- 개인정보처리방침은 별도 법무 검토 후 확정 (이 문서 범위 밖).

---

## 15. 법적 컴플라이언스

### 15.1 변리사법

- **제21조 준수**: 본 앱은 변리사 업무(대리)를 수행하지 않음. 유저의 "출원 준비 자료 작성"만 지원.
- 유저는 본인 명의로 직접 출원하거나, 본인이 선정한 변리사에게 위임.
- 변리사 연결 기능은 제공하되, 유저 선택을 강제하지 않으며 수수료 중개 구조 아님 (Phase 2 설계 시 재검토).

### 15.2 저작권 이슈 (AI 생성물)

- AI 생성 이미지의 저작권 보호는 현재 한국에서 "인간의 창작적 관여"가 실질적이어야 인정됨.
- 앱은 모든 생성 세션의 프롬프트·수정 히스토리를 저장. 필요 시 유저가 저작권 등록 시 부속 서류로 활용 가능.
- 유저가 저작권 등록 플로우에서 AI 보조 사용 여부를 명시적으로 체크하도록 유도.

### 15.3 면책 조항 (약관 반영)

- 본 앱은 법률 서비스가 아님
- 본 앱 사용으로 인한 등록 거절·무효·권리 분쟁에 대한 책임은 사용자에게 있음
- 변리사 상담 권장 문구는 주요 화면에 표시

---

## 16. 개발 로드맵 (12주)

### Week 1: 프로젝트 부트스트랩 + 인증

- Next.js 14 App Router 프로젝트 생성
- Tailwind, shadcn/ui 설정
- Firebase 프로젝트 생성, Auth 연동
- Pretendard 폰트 적용
- 랜딩 + 로그인 + 대시보드 최소 페이지

**산출물**: 로그인해서 빈 대시보드까지 접근 가능

### Week 2: 대화 엔진 기본

- Vercel AI SDK + Claude 연동
- `/api/chat` 스트리밍 라우트
- Firestore 메시지 저장
- `/register/[id]/chat` 좌측 대화 패널

**산출물**: 대화가 스트리밍되고 저장됨

### Week 3: 저작권 스키마 + Extractor + 프리뷰

- 저작권 Zod 스키마 완성
- Extractor 에이전트 구현
- `/api/extract` 라우트
- 오른쪽 프리뷰 패널 `onSnapshot` 연동
- 필드별 복사 버튼, 편집 가능

**산출물**: 저작권 대화가 자동으로 양식을 채움

### Week 4: 도안 스튜디오 — AI 생성 모드

- `/register/[id]/studio` 화면 골격
- Nano Banana 연동 (`/api/image/generate`)
- Prompt Composer 에이전트
- 4 variants 표시, 선택 UI

**산출물**: 대화 내용 기반으로 AI가 도안 생성

### Week 5: 이미지 편집 + 도안 스튜디오 고도화

- `/api/image/edit` (Nano Banana 편집)
- 빠른 명령 버튼 + 자연어 수정 입력
- 히스토리 체인 UI

**산출물**: 생성된 이미지를 계속 수정 가능

### Week 6: 원본 업로드 + 하이브리드 모드

- Firebase Storage 업로드
- Cloud Functions 이미지 가공 (Sharp, rembg, grayscale)
- 도안 시트 PDF 조립
- 하이브리드 모드 (업로드 + AI 변형)

**산출물**: 유저 원본을 규격 파일로 자동 변환

### Week 7: 자료 패키지 + 저작권 완결

- `/api/package/build` 구현
- docx/pdf 템플릿 (저작물 설명, 대화록, 제출 가이드)
- ZIP 번들, Signed URL
- `/register/[id]/package` 화면
- CROSS 제출 단계별 가이드 (이미지 + 설명)

**산출물**: 저작권 등록이 앱 내에서 완결. CROSS 제출까지 연결.

### Week 8: 상표 플로우

- 상표 Zod 스키마
- Interviewer 프롬프트 (상표 버전)
- KIPRIS Plus 텍스트 검색 연동
- 니스 분류 자동 추천 에이전트
- 지정상품 초안 생성
- 상표 양식 docx 템플릿

**산출물**: 상표 등록 전 플로우 + KIPRIS 선행조사

### Week 9: 이미지 유사도 검색 (상표 확장)

- KIPRIS 도형상표 벡터 DB 구축 (선택된 니스류)
- Firestore Vector Search 설정
- CLIP 임베딩 파이프라인
- `/api/similarity/image` 라우트
- 상표 대화 중 "비슷한 상표 N건 발견" 인서트 UI

**산출물**: 도형상표 유사도 검증 자동화

### Week 10: 디자인권 플로우

- 디자인 Zod 스키마
- 로카르노 분류 자동 추천
- 6면도 생성/업로드/재조립 (하이브리드 모드 재활용)
- 디자인 양식 docx 템플릿

**산출물**: 디자인권 등록 전 플로우

### Week 11: 특허 플로우 + 청구범위 추천

- 특허 Zod 스키마
- Claim Hints Extractor 구현
- Interviewer 프롬프트 (특허 버전)
- `/api/claims/recommend` 구현
- `/register/[id]/claims` 화면 (3가지 추천안)
- 명세서 초안 생성 (docx)

**산출물**: 특허 대화 → 청구범위 추천 → 자료 패키지

### Week 12: 변리사 연결 UI + 폴리싱 + 배포

- "변리사 검토 의뢰" UI (이메일 기반 초기 버전)
- 진행 중 등록 리스트 + 필터링
- 모바일 반응형 점검 및 보정
- E2E 테스트 (Playwright)
- Vercel 프로덕션 배포

**산출물**: 4가지 IP 유형 모두 지원하는 MVP 배포 완료

---

## 17. 초기 Claude Code 부트스트랩 프롬프트

### 17.1 Week 1 시작 프롬프트

Claude Code 첫 세션에서 이 내용을 복붙하세요:

```
SPEC.md와 DESIGN.md를 모두 읽었다는 전제 하에, Week 1 작업을 시작한다.

프로젝트 코드네임: IP-Assist
디렉토리: 현재 디렉토리

작업 순서:
1. pnpm으로 Next.js 14 App Router + TypeScript + Tailwind 프로젝트 생성
2. DESIGN.md §11의 tailwind.config.ts 그대로 적용 (브랜드 컬러, 
   타이포 스케일, 애니메이션 키프레임 포함)
3. DESIGN.md §12의 globals.css CSS 변수 + Pretendard CDN 임포트 적용
4. shadcn/ui 초기화, DESIGN.md §12 끝의 컴포넌트 일괄 설치
5. lucide-react 설치
6. /components/layout/AppShell.tsx 구현 (DESIGN.md §7.1)
7. /components/layout/Sidebar.tsx 구현 (DESIGN.md §7.2 — 로고/홈/
   프로젝트/IP유형/스튜디오/패키지/FAQ/설정/로그아웃 구조)
8. Firebase 프로젝트 생성 가이드를 README.md에 작성
9. /lib/firebase/client.ts, /lib/firebase/admin.ts 생성
10. /app/(auth)/login/page.tsx, /app/(auth)/signup/page.tsx 
    — Firebase Auth UI (이메일, Google)
11. /app/(app)/dashboard/page.tsx 최소 페이지 (AppShell로 감싸짐, 
    빈 상태 + "+ 새 프로젝트" CTA)
12. middleware.ts로 인증 가드
13. .env.local.example 파일 생성 (섹션 18 참조)
14. 첫 커밋: "chore: bootstrap Next.js + design system + Firebase Auth"

제약:
- AI API 연동은 Week 2에서 시작. 이번 주는 셸과 디자인 시스템만.
- Kakao OAuth는 Week 12에서 추가.
- DESIGN.md의 컬러 토큰을 임의로 수정하지 말 것.
- DESIGN.md §13의 Phase A·B 체크리스트를 진행 기준으로 사용.
- 모든 클라이언트 컴포넌트는 'use client' 명시.
- 서버 컴포넌트 기본, 필요한 경우만 클라이언트로.

완료 후 "Week 1 완료. Week 2 시작 준비" 로 보고.
```

### 17.2 Week N 이후 진행 시

각 Week는 섹션 16의 해당 Week 항목을 그대로 프롬프트로 활용:

```
Week {N} 작업 시작.
SPEC.md 섹션 16의 Week {N} 범위를 구현한다.
UI 작업이 포함된 경우 DESIGN.md의 해당 컴포넌트 스펙을 우선 참조한다.
관련 섹션: {해당 Week에서 참조해야 할 섹션 번호들}
```

---

## 18. 환경 변수 목록

`.env.local.example` 내용:

```bash
# Next.js 공개
NEXT_PUBLIC_APP_NAME="IP-Assist"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Firebase Client (공개 OK)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (서버 전용)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# AI APIs (서버 전용)
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
REPLICATE_API_TOKEN=

# External Data APIs (서버 전용)
KIPRIS_API_KEY=
KIPRIS_API_BASE_URL=http://plus.kipris.or.kr/kipo-api/kipi

# 선택 기능
REMOVE_BG_API_KEY=

# Kakao OAuth (Week 12)
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
```

---

## 19. 파일 구조

```
ip-assist/
├── SPEC.md                    # 이 문서 (제품·기술 스펙)
├── DESIGN.md                  # 디자인 시스템 (컬러·타이포·컴포넌트)
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts         # DESIGN.md §11 그대로 적용
├── next.config.js
├── middleware.ts
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── .env.local.example
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx               # 랜딩
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── register/
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── chat/page.tsx
│   │       ├── studio/page.tsx
│   │       ├── claims/page.tsx
│   │       └── package/page.tsx
│   ├── settings/page.tsx
│   └── api/
│       ├── chat/route.ts
│       ├── extract/route.ts
│       ├── search/kipris/route.ts
│       ├── similarity/image/route.ts
│       ├── image/generate/route.ts
│       ├── image/edit/route.ts
│       ├── image/upload-process/route.ts
│       ├── claims/recommend/route.ts
│       └── package/build/route.ts
│
├── components/
│   ├── ui/                    # shadcn 컴포넌트 (Button, Input, Card, ...)
│   ├── layout/                # AppShell, Sidebar (DESIGN.md §7.1, §7.2)
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileTopBar.tsx
│   ├── dashboard/
│   │   ├── ProjectCard.tsx    # DESIGN.md §7.6
│   │   └── EmptyState.tsx
│   ├── chat/
│   │   ├── ChatPanel.tsx      # DESIGN.md §7.3
│   │   ├── MessageBubble.tsx
│   │   └── ChatInput.tsx
│   ├── preview/
│   │   ├── FormPreview.tsx    # DESIGN.md §7.4
│   │   ├── FieldList.tsx      # DESIGN.md §7.5 (Notion 스타일 TOC)
│   │   ├── FieldCard.tsx
│   │   └── DocumentRenderer.tsx
│   ├── studio/
│   │   ├── StudioShell.tsx
│   │   ├── GenerateMode.tsx
│   │   ├── UploadMode.tsx
│   │   ├── HybridMode.tsx
│   │   └── VariantGrid.tsx
│   ├── claims/
│   │   ├── ClaimCard.tsx
│   │   └── ClaimsPanel.tsx
│   └── package/
│       └── PackageFileList.tsx
│
├── lib/
│   ├── firebase/
│   │   ├── client.ts
│   │   └── admin.ts
│   ├── agents/
│   │   ├── classifier.ts
│   │   ├── interviewer.ts
│   │   ├── extractor.ts
│   │   ├── claimHintsExtractor.ts
│   │   ├── promptComposer.ts
│   │   └── prompts/
│   │       ├── classifier.md
│   │       ├── interviewer-copyright.md
│   │       ├── interviewer-trademark.md
│   │       ├── interviewer-design.md
│   │       ├── interviewer-patent.md
│   │       ├── extractor.md
│   │       └── claimHints.md
│   ├── integrations/
│   │   ├── claude.ts
│   │   ├── gemini-image.ts
│   │   ├── kipris.ts
│   │   └── replicate.ts
│   ├── schemas/
│   │   ├── copyright.ts
│   │   ├── trademark.ts
│   │   ├── design.ts
│   │   └── patent.ts
│   ├── pdf/
│   │   ├── descriptionDoc.ts
│   │   ├── figuresDoc.ts
│   │   ├── priorArtReport.ts
│   │   ├── claimsSheet.ts
│   │   ├── conversationTranscript.ts
│   │   └── packageBuilder.ts
│   └── utils/
│       ├── fieldProgress.ts
│       ├── promptBuilder.ts
│       └── validation.ts
│
├── functions/                 # Firebase Cloud Functions
│   ├── package.json
│   └── src/
│       └── index.ts
│
└── tests/
    ├── e2e/
    └── unit/
```

---

## 20. 용어 사전

| 용어 | 설명 |
|---|---|
| **KIPRIS** | 한국특허정보원이 운영하는 지식재산정보 검색서비스 |
| **KIPRIS Plus** | KIPRIS의 Open API 유료 플랫폼 |
| **특허로** | 특허청 전자출원 시스템 (patent.go.kr) |
| **CROSS** | 한국저작권위원회 등록시스템 (cros.or.kr) |
| **니스 분류** | 상표 등록 시 지정상품의 45개 국제 분류 |
| **로카르노 분류** | 디자인권 등록 시 물품의 국제 분류 |
| **IPC 코드** | 국제특허분류 코드 |
| **KEAPS** | 특허청 전자서식 작성기 |
| **K-EDITOR** | 특허청 전자문서 작성기 |
| **명세서** | 특허 출원서의 본문 (기술분야, 배경, 해결과제, 수단, 효과, 실시예, 청구범위 등) |
| **청구범위** | 특허의 권리 경계를 정의하는 청구항들의 집합 |
| **독립항 / 종속항** | 청구항이 독립적인지, 다른 항을 인용하는지 |
| **선행기술** | 출원 시점 이전에 공지된 기술 |
| **6면도** | 디자인권 도면의 정면/배면/좌/우/상/하 6방향 도면 |
| **공표** | 저작물을 공중에 공개하는 행위 |
| **응용미술** | 실용품에 쓰이는 미술 (캐릭터 상품 등) |
| **실시예** | 발명을 구체적으로 실현하는 방식 |
| **Nano Banana** | Google Gemini 2.5 Flash Image의 별칭 |

---

## 문서 버전

- v1.0 — 2026-04-25 — 초기 버전, MVP 범위 확정

## 연락

- 제품 오너: 펀제주 (㈜펀제주)
- 이 문서에 대한 수정 제안은 GitHub Issues 또는 직접 편집 후 PR

---

**개발자에게**: 이 문서의 설계를 신뢰하고 구현에 집중하세요. 각 Week의 산출물을 기준으로 PR을 나누고, 섹션 16의 순서대로 진행하면 12주 안에 MVP가 완성됩니다. 막히는 지점이 있으면 추측하지 말고 제품 오너에게 확인하세요.

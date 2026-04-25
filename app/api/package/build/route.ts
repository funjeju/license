import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import JSZip from 'jszip';
import PDFDocument from 'pdfkit';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, ImageRun, ShadingType, TableRow, TableCell,
  Table, WidthType, BorderStyle,
} from 'docx';
import { SECTIONS_BY_TYPE, DOC_TITLES } from '@/lib/schemas/fieldDefs';
import type { IPType } from '@/lib/agents/classifier';

// ── 문서 빌더 ─────────────────────────────────────────────────────────────

async function buildExplainDocx(
  ipType: IPType,
  extractedFields: Record<string, unknown>,
  title: string,
): Promise<Buffer> {
  const sections = SECTIONS_BY_TYPE[ipType];
  const docTitle = DOC_TITLES[ipType];

  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: docTitle, bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: title, size: 24 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }),
  ];

  for (const sec of sections) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: sec.title, bold: true, size: 26 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
      }),
    );

    const hasData = sec.fields.some((f) => extractedFields[f.key] != null && extractedFields[f.key] !== '');
    if (!hasData) {
      children.push(new Paragraph({ children: [new TextRun({ text: '(미입력)', color: '999999' })] }));
    } else {
      for (const field of sec.fields) {
        const value = extractedFields[field.key];
        if (value == null || value === '') continue;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${field.label}:  `, bold: true }),
              new TextRun({ text: String(value) }),
            ],
            spacing: { after: 80 },
          }),
        );
      }
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });
  return Packer.toBuffer(doc);
}

async function buildDrawingDocx(
  assets: { base64: string; mimeType: string; kind: string }[],
): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      children: [new TextRun({ text: '도면', bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  const drawing = assets.find((a) => a.kind === 'sheet') ?? assets.find((a) => a.kind === 'normalized') ?? assets[0];

  if (drawing) {
    try {
      const imgData = Buffer.from(drawing.base64, 'base64');
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imgData,
              transformation: { width: 450, height: 360 },
              type: drawing.mimeType.includes('png') ? 'png' : 'jpg',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
      );
    } catch {
      children.push(new Paragraph({ children: [new TextRun({ text: '(도면 파일 없음)' })] }));
    }
  }

  // 나머지 에셋 목록
  for (const asset of assets) {
    if (asset === drawing) continue;
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `[${asset.kind}]`, bold: true })],
        spacing: { before: 200 },
      }),
    );
    try {
      const imgData = Buffer.from(asset.base64, 'base64');
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imgData,
              transformation: { width: 350, height: 280 },
              type: asset.mimeType.includes('png') ? 'png' : 'jpg',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        }),
      );
    } catch { /* skip */ }
  }

  if (assets.length === 0) {
    children.push(new Paragraph({ children: [new TextRun({ text: '(등록된 도면이 없습니다)', color: '999999' })] }));
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

async function buildChatDocx(
  messages: { role: string; content: string }[],
): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: '대화록', bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  for (const msg of messages) {
    const label = msg.role === 'user' ? '사용자' : 'AI 어시스턴트';
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `[${label}]`, bold: true, color: msg.role === 'user' ? '2563eb' : '059669' })],
        spacing: { before: 240 },
      }),
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: msg.content })],
        indent: { left: 360 },
        spacing: { after: 120 },
      }),
    );
  }

  if (messages.length === 0) {
    children.push(new Paragraph({ children: [new TextRun({ text: '(대화 기록 없음)', color: '999999' })] }));
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

const CROSS_STEPS = [
  { step: 1, title: 'CROSS 접속 및 회원가입', desc: 'https://www.copyright.or.kr 에 접속하여 회원가입 후 로그인합니다.' },
  { step: 2, title: '저작권 등록 메뉴 진입', desc: '상단 메뉴 [저작권 등록] → [저작물 등록 신청]을 클릭합니다.' },
  { step: 3, title: '저작물 유형 선택', desc: '해당 저작물 유형(어문·미술·음악·영상 등)을 선택합니다.' },
  { step: 4, title: '저작자 정보 입력', desc: '저작자 성명, 국적, 생년월일(또는 법인 설립일)을 입력합니다.' },
  { step: 5, title: '저작물 기본 정보 입력', desc: '저작물 제목, 창작 완성일, 공표 여부, 언어 등을 입력합니다. 동봉된 01_저작물설명.docx 를 참고하세요.' },
  { step: 6, title: '도면(창작물 파일) 첨부', desc: '02_도면.docx 또는 별도 이미지 파일을 첨부합니다. (PDF·JPG·PNG 허용)' },
  { step: 7, title: '수수료 확인 및 납부', desc: '전자 결제 페이지에서 저작권 등록 수수료를 납부합니다.' },
  { step: 8, title: '신청 완료 확인', desc: '접수증 번호를 저장하고, 심사 결과를 이메일·문자로 안내받습니다.' },
];

const KIPRIS_STEPS: Record<string, typeof CROSS_STEPS> = {
  trademark: [
    { step: 1, title: 'KIPRIS 접속', desc: 'https://www.kipris.or.kr 에서 사전 조사 후 https://www.kipo.go.kr 에서 온라인 출원합니다.' },
    { step: 2, title: '전자출원 프로그램 설치', desc: 'e-특허넷 전자출원 소프트웨어를 설치합니다.' },
    { step: 3, title: '상표 유형·지정 상품 입력', desc: '01_저작물설명.docx 내 상표 정보 및 니스 분류 번호를 참고하여 입력합니다.' },
    { step: 4, title: '상표 이미지 첨부', desc: '02_도면.docx 또는 PNG 파일을 첨부합니다.' },
    { step: 5, title: '출원료 납부 및 접수', desc: '온라인 결제 후 접수증을 저장합니다.' },
  ],
  design: [
    { step: 1, title: '특허청 e-특허넷 접속', desc: 'https://www.patent.go.kr 에 접속하여 디자인 등록 출원을 신청합니다.' },
    { step: 2, title: '디자인 정보 입력', desc: '01_저작물설명.docx 내 물품 명칭, 로카르노 분류, 디자인 개념을 참고합니다.' },
    { step: 3, title: '도면 파일 첨부', desc: '정면도·측면도·배면도 등 6면도 이미지를 02_도면.docx 에서 꺼내 첨부합니다.' },
    { step: 4, title: '수수료 납부 및 접수', desc: '출원료를 납부하고 접수증을 저장합니다.' },
  ],
  patent: [
    { step: 1, title: '특허청 전자출원 접속', desc: 'https://www.patent.go.kr 에 접속합니다.' },
    { step: 2, title: '명세서 작성', desc: '01_저작물설명.docx 의 기술 분야·배경기술·청구범위를 명세서 양식에 복사합니다.' },
    { step: 3, title: '도면 첨부', desc: '02_도면.docx 의 도면을 첨부합니다.' },
    { step: 4, title: '출원료 납부', desc: '전자 결제 후 접수증을 저장합니다.' },
  ],
};

async function buildGuideDocx(ipType: IPType): Promise<Buffer> {
  const steps = ipType === 'copyright' ? CROSS_STEPS : (KIPRIS_STEPS[ipType] ?? CROSS_STEPS);
  const systemName = ipType === 'copyright' ? 'CROSS (저작권 등록 시스템)' : 'e-특허넷 (특허청 전자출원)';

  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: '제출 가이드', bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: systemName, color: '6366f1', size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  for (const item of steps) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Step ${item.step}.  ${item.title}`, bold: true, size: 24 })],
        spacing: { before: 300 },
      }),
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: item.desc })],
        indent: { left: 480 },
        spacing: { after: 80 },
      }),
    );
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

interface SuggestedClaimDoc {
  scope: string;
  recommended?: boolean;
  text: string;
  rationale?: string;
  risks?: string[];
  attorneyQuestions?: string[];
}

const SCOPE_LABEL: Record<string, string> = {
  broad: '넓은 범위 (A)',
  medium: '중간 범위 (B) — 추천',
  narrow: '좁은 범위 (C)',
};

async function buildClaimsDocx(claims: SuggestedClaimDoc[]): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: '청구범위 추천안', bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: '※ 이 문서는 AI가 작성한 초안입니다. 반드시 변리사 검토 후 활용하세요.', color: 'B45309', size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  for (const claim of claims) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: SCOPE_LABEL[claim.scope] ?? claim.scope, bold: true, size: 26 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 120 },
      }),
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: claim.text, size: 22 })],
        spacing: { after: 200 },
      }),
    );
    if (claim.rationale) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: `[선택 이유] ${claim.rationale}`, color: '374151' })] }),
      );
    }
    if (claim.risks?.length) {
      children.push(new Paragraph({ children: [new TextRun({ text: '[위험 요소]', bold: true })], spacing: { before: 160 } }));
      for (const risk of claim.risks) {
        children.push(new Paragraph({ children: [new TextRun({ text: `• ${risk}` })], indent: { left: 360 } }));
      }
    }
    if (claim.attorneyQuestions?.length) {
      children.push(new Paragraph({ children: [new TextRun({ text: '[변리사에게 물어볼 점]', bold: true })], spacing: { before: 160 } }));
      for (const q of claim.attorneyQuestions) {
        children.push(new Paragraph({ children: [new TextRun({ text: `• ${q}` })], indent: { left: 360 } }));
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

// ── 메인 라우트 ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { registrationId } = await req.json();
  if (!registrationId) {
    return NextResponse.json({ error: 'registrationId required' }, { status: 400 });
  }

  // 등록 정보 조회
  const regRef = adminDb.collection('registrations').doc(registrationId);
  const regSnap = await regRef.get();
  if (!regSnap.exists || regSnap.data()?.userId !== uid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const reg = regSnap.data()!;
  const ipType = reg.type as IPType;
  const extractedFields = (reg.extractedFields ?? {}) as Record<string, unknown>;
  const title = reg.title ?? '미제목';
  const suggestedClaims = Array.isArray(reg.suggestedClaims) ? reg.suggestedClaims : [];

  // 에셋 조회
  const assetsSnap = await adminDb
    .collection('assets')
    .where('registrationId', '==', registrationId)
    .where('userId', '==', uid)
    .get();

  const assets = assetsSnap.docs
    .map((d) => ({ ...(d.data() as { base64?: string; mimeType?: string; kind?: string }) }))
    .filter((a) => a.base64 && a.mimeType) as { base64: string; mimeType: string; kind: string }[];

  // 메시지 조회
  const msgsSnap = await adminDb
    .collection('registrations')
    .doc(registrationId)
    .collection('messages')
    .orderBy('timestamp', 'asc')
    .get();

  const messages = msgsSnap.docs.map((d) => ({
    role: d.data().role as string,
    content: d.data().content as string,
  }));

  // 문서 생성
  const [explainBuf, drawingBuf, chatBuf, guideBuf] = await Promise.all([
    buildExplainDocx(ipType, extractedFields, title),
    buildDrawingDocx(assets),
    buildChatDocx(messages),
    buildGuideDocx(ipType),
  ]);

  // ZIP 번들
  const zip = new JSZip();
  zip.file('01_명세서초안.docx', explainBuf);
  zip.file('02_도면.docx', drawingBuf);
  zip.file('03_대화록.docx', chatBuf);
  zip.file('04_제출가이드.docx', guideBuf);

  // 특허: 청구범위 추천안 추가
  const fileNames = ['01_명세서초안.docx', '02_도면.docx', '03_대화록.docx', '04_제출가이드.docx'];
  if (ipType === 'patent' && suggestedClaims.length > 0) {
    const claimsBuf = await buildClaimsDocx(suggestedClaims as SuggestedClaimDoc[]);
    zip.file('05_청구범위추천안.docx', claimsBuf);
    fileNames.push('05_청구범위추천안.docx');
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  // Firebase Storage 업로드
  const storagePath = `packages/${uid}/${registrationId}/package_${Date.now()}.zip`;
  const bucket = adminStorage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const file = bucket.file(storagePath);

  await file.save(zipBuffer, {
    metadata: { contentType: 'application/zip' },
    resumable: false,
  });

  // Signed URL (1시간)
  const expiresAt = Date.now() + 3600 * 1000;
  const [packageUrl] = await file.getSignedUrl({
    action: 'read',
    expires: expiresAt,
  });

  // Firestore에 패키지 기록
  const now = FieldValue.serverTimestamp();
  await adminDb.collection('packages').add({
    registrationId,
    userId: uid,
    storagePath,
    packageUrl,
    expiresAt: new Date(expiresAt),
    fileNames,
    createdAt: now,
  });

  return NextResponse.json({
    packageUrl,
    expiresAt,
    fileNames,
  });
}

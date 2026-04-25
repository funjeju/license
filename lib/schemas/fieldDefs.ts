export interface FieldDef {
  key: string;
  label: string;
  required: boolean;
  multiline?: boolean;
}

export interface SectionDef {
  id: string;
  title: string;
  fields: FieldDef[];
}

export const COPYRIGHT_SECTIONS: SectionDef[] = [
  {
    id: 'work',
    title: '저작물 정보',
    fields: [
      { key: 'title',          label: '저작물 제목',    required: true },
      { key: 'titleEn',        label: '영문 제목',       required: false },
      { key: 'typeCode',       label: '저작물 유형',     required: true },
      { key: 'subTypeCode',    label: '세부 유형',       required: false },
      { key: 'description',    label: '저작물 설명',     required: true, multiline: true },
      { key: 'creationDate',   label: '창작 완성일',     required: true },
    ],
  },
  {
    id: 'author',
    title: '저작자 정보',
    fields: [
      { key: 'authorName',        label: '저작자 성명',   required: true },
      { key: 'authorNameEn',      label: '저작자 영문명', required: false },
      { key: 'authorType',        label: '저작자 유형',   required: true },
      { key: 'authorNationality', label: '국적',          required: false },
      { key: 'authorBirthYear',   label: '출생연도',      required: false },
    ],
  },
  {
    id: 'publication',
    title: '공표 정보',
    fields: [
      { key: 'publicationStatus', label: '공표 여부',   required: true },
      { key: 'publicationDate',   label: '공표일',       required: false },
      { key: 'publicationCountry',label: '공표 국가',    required: false },
      { key: 'firstPublicationMedium', label: '최초 공표 매체', required: false },
    ],
  },
  {
    id: 'special',
    title: '특이사항',
    fields: [
      { key: 'usesAIAssistance',       label: 'AI 보조 사용 여부', required: false },
      { key: 'aiAssistanceDescription',label: 'AI 활용 내용',      required: false, multiline: true },
      { key: 'isDerivativeWork',        label: '2차 저작물 여부',   required: false },
      { key: 'originalWorkInfo',        label: '원저작물 정보',     required: false, multiline: true },
    ],
  },
];

export const TRADEMARK_SECTIONS: SectionDef[] = [
  {
    id: 'mark',
    title: '상표 정보',
    fields: [
      { key: 'markName',        label: '상표명',       required: true },
      { key: 'markType',        label: '상표 유형',    required: true },
      { key: 'markDescription', label: '상표 설명',    required: true, multiline: true },
    ],
  },
  {
    id: 'class',
    title: '지정 상품/서비스',
    fields: [
      { key: 'niceClasses', label: '니스 분류',      required: true },
    ],
  },
  {
    id: 'applicant',
    title: '출원인 정보',
    fields: [
      { key: 'applicantName',    label: '출원인 성명/상호', required: true },
      { key: 'applicantType',    label: '출원인 유형',      required: true },
      { key: 'applicantAddress', label: '주소',             required: true },
      { key: 'applicantBusinessNumber', label: '사업자등록번호', required: false },
    ],
  },
];

export const DESIGN_SECTIONS: SectionDef[] = [
  {
    id: 'design',
    title: '디자인 정보',
    fields: [
      { key: 'designTitle',      label: '디자인 명칭',  required: true },
      { key: 'articleName',      label: '물품 명칭',    required: true },
      { key: 'locarnoClass',     label: '로카르노 분류',required: true },
      { key: 'articleDescription',label: '물품 설명',   required: false, multiline: true },
      { key: 'designConcept',    label: '디자인 개념',  required: true, multiline: true },
      { key: 'featureDescription',label: '형태적 특징', required: false, multiline: true },
    ],
  },
  {
    id: 'partial',
    title: '부분 디자인',
    fields: [
      { key: 'partialDesign',      label: '부분 디자인 여부', required: false },
      { key: 'partialDescription', label: '부분 설명',        required: false, multiline: true },
    ],
  },
];

export const PATENT_SECTIONS: SectionDef[] = [
  {
    id: 'title',
    title: '발명의 명칭',
    fields: [
      { key: 'inventionTitle',   label: '발명의 명칭',   required: true },
      { key: 'inventionTitleEn', label: '영문 명칭',     required: false },
      { key: 'technicalField',   label: '기술 분야',     required: true, multiline: true },
      { key: 'ipcCode',          label: 'IPC 분류',      required: false },
    ],
  },
  {
    id: 'background',
    title: '배경기술',
    fields: [
      { key: 'backgroundArt', label: '배경기술 설명', required: true, multiline: true },
    ],
  },
  {
    id: 'invention',
    title: '발명의 내용',
    fields: [
      { key: 'problemToSolve',     label: '해결하려는 과제', required: true, multiline: true },
      { key: 'solution',           label: '과제 해결 수단', required: true, multiline: true },
      { key: 'effects',            label: '발명의 효과',    required: true, multiline: true },
      { key: 'detailedDescription',label: '상세 설명',      required: false, multiline: true },
    ],
  },
  {
    id: 'applicant',
    title: '출원인 정보',
    fields: [
      { key: 'applicantName',    label: '출원인 성명/상호', required: false },
      { key: 'applicantAddress', label: '주소',             required: false },
    ],
  },
];

import type { IPType } from '@/lib/agents/classifier';

export const SECTIONS_BY_TYPE: Record<IPType, SectionDef[]> = {
  copyright: COPYRIGHT_SECTIONS,
  trademark: TRADEMARK_SECTIONS,
  design:    DESIGN_SECTIONS,
  patent:    PATENT_SECTIONS,
};

export const DOC_TITLES: Record<IPType, string> = {
  copyright: '저 작 권 등 록 신 청 서',
  trademark: '상 표 등 록 출 원 서',
  design:    '디 자 인 등 록 출 원 서',
  patent:    '특 허 출 원 서',
};

export interface LocarnoSubclass {
  code: string;
  nameKo: string;
}

export interface LocarnoClass {
  code: string;
  nameKo: string;
  subclasses: LocarnoSubclass[];
}

export const LOCARNO_CLASSES: LocarnoClass[] = [
  {
    code: '01',
    nameKo: '식품 및 음료',
    subclasses: [
      { code: '01-01', nameKo: '제과류, 비스킷, 그 밖의 제과' },
      { code: '01-02', nameKo: '초콜릿, 당과류, 사탕' },
      { code: '01-03', nameKo: '과실 및 채소' },
      { code: '01-04', nameKo: '육류 제품, 생선, 가금류' },
      { code: '01-06', nameKo: '음료' },
    ],
  },
  {
    code: '02',
    nameKo: '의류 및 패션 소품',
    subclasses: [
      { code: '02-01', nameKo: '속옷, 내의' },
      { code: '02-02', nameKo: '상의 (셔츠, 블라우스, 재킷)' },
      { code: '02-03', nameKo: '하의 (바지, 치마)' },
      { code: '02-04', nameKo: '신발' },
      { code: '02-05', nameKo: '모자, 두건' },
      { code: '02-06', nameKo: '장갑, 양말' },
      { code: '02-07', nameKo: '스카프, 넥타이' },
    ],
  },
  {
    code: '03',
    nameKo: '여행용품, 케이스, 우산, 개인용품',
    subclasses: [
      { code: '03-01', nameKo: '트렁크, 여행 가방' },
      { code: '03-02', nameKo: '핸드백, 지갑, 클러치' },
      { code: '03-03', nameKo: '서류 가방, 백팩' },
      { code: '03-04', nameKo: '우산, 지팡이' },
    ],
  },
  {
    code: '05',
    nameKo: '섬유, 의복재료',
    subclasses: [
      { code: '05-01', nameKo: '직물, 천' },
      { code: '05-05', nameKo: '레이스' },
    ],
  },
  {
    code: '06',
    nameKo: '가구',
    subclasses: [
      { code: '06-01', nameKo: '좌석' },
      { code: '06-02', nameKo: '침대, 소파' },
      { code: '06-03', nameKo: '테이블, 책상' },
      { code: '06-04', nameKo: '수납 가구 (장롱, 서랍장)' },
      { code: '06-07', nameKo: '선반' },
    ],
  },
  {
    code: '07',
    nameKo: '가정용 세간',
    subclasses: [
      { code: '07-01', nameKo: '그릇, 식기류' },
      { code: '07-02', nameKo: '요리 기구 (냄비, 프라이팬)' },
      { code: '07-05', nameKo: '병, 용기' },
    ],
  },
  {
    code: '08',
    nameKo: '도구 및 철물',
    subclasses: [
      { code: '08-01', nameKo: '드릴, 스크류드라이버' },
      { code: '08-02', nameKo: '망치, 칼' },
      { code: '08-06', nameKo: '칼날, 커터' },
    ],
  },
  {
    code: '09',
    nameKo: '포장 용기',
    subclasses: [
      { code: '09-01', nameKo: '병, 플라스크' },
      { code: '09-03', nameKo: '상자, 케이스' },
      { code: '09-07', nameKo: '포장재, 봉투' },
    ],
  },
  {
    code: '10',
    nameKo: '시계, 측정기기',
    subclasses: [
      { code: '10-01', nameKo: '손목시계, 탁상시계' },
      { code: '10-04', nameKo: '측정 기기' },
    ],
  },
  {
    code: '11',
    nameKo: '장신구, 귀금속 제품',
    subclasses: [
      { code: '11-01', nameKo: '반지, 팔찌' },
      { code: '11-02', nameKo: '목걸이, 귀걸이' },
      { code: '11-04', nameKo: '브로치' },
    ],
  },
  {
    code: '12',
    nameKo: '운송수단',
    subclasses: [
      { code: '12-08', nameKo: '자동차' },
      { code: '12-11', nameKo: '자전거, 오토바이' },
      { code: '12-16', nameKo: '항공기' },
    ],
  },
  {
    code: '13',
    nameKo: '발전, 점화, 취사, 냉난방 기기',
    subclasses: [
      { code: '13-03', nameKo: '에어컨, 히터' },
    ],
  },
  {
    code: '14',
    nameKo: '기록, 통신, 정보 처리 장치',
    subclasses: [
      { code: '14-01', nameKo: '컴퓨터 본체, 서버' },
      { code: '14-02', nameKo: '모니터, 디스플레이' },
      { code: '14-03', nameKo: '프린터, 스캐너' },
      { code: '14-04', nameKo: '스마트폰, 태블릿' },
      { code: '14-99', nameKo: '기타 정보 처리 장치' },
    ],
  },
  {
    code: '15',
    nameKo: '기계류',
    subclasses: [
      { code: '15-01', nameKo: '엔진, 모터' },
      { code: '15-09', nameKo: '로봇' },
    ],
  },
  {
    code: '16',
    nameKo: '사진, 영화, 광학 기기',
    subclasses: [
      { code: '16-01', nameKo: '카메라' },
      { code: '16-05', nameKo: '안경, 렌즈' },
    ],
  },
  {
    code: '17',
    nameKo: '악기',
    subclasses: [
      { code: '17-01', nameKo: '건반 악기' },
      { code: '17-04', nameKo: '현악기' },
    ],
  },
  {
    code: '18',
    nameKo: '인쇄, 사무기기',
    subclasses: [
      { code: '18-01', nameKo: '필기구' },
    ],
  },
  {
    code: '19',
    nameKo: '문구, 사무용품',
    subclasses: [
      { code: '19-01', nameKo: '노트, 공책' },
      { code: '19-06', nameKo: '달력' },
    ],
  },
  {
    code: '20',
    nameKo: '판매, 광고 장비, 게시판',
    subclasses: [
      { code: '20-02', nameKo: '광고판, 간판' },
    ],
  },
  {
    code: '21',
    nameKo: '오락, 스포츠용품',
    subclasses: [
      { code: '21-01', nameKo: '운동 기기' },
      { code: '21-03', nameKo: '장난감, 인형' },
      { code: '21-04', nameKo: '낚시 용품' },
    ],
  },
  {
    code: '22',
    nameKo: '무기, 폭발물, 폭죽',
    subclasses: [],
  },
  {
    code: '23',
    nameKo: '유체 분배 장치',
    subclasses: [
      { code: '23-01', nameKo: '수도꼭지, 밸브' },
    ],
  },
  {
    code: '24',
    nameKo: '의료 및 실험 장비',
    subclasses: [
      { code: '24-01', nameKo: '의료 기기, 수술 도구' },
      { code: '24-02', nameKo: '보조기구 (휠체어, 목발)' },
    ],
  },
  {
    code: '25',
    nameKo: '건물 및 건설 요소',
    subclasses: [
      { code: '25-01', nameKo: '건축물 외형' },
      { code: '25-03', nameKo: '문, 창문' },
    ],
  },
  {
    code: '26',
    nameKo: '조명 장치',
    subclasses: [
      { code: '26-01', nameKo: '샹들리에, 천장 조명' },
      { code: '26-04', nameKo: '가로등, 외부 조명' },
      { code: '26-05', nameKo: '손전등' },
    ],
  },
  {
    code: '27',
    nameKo: '담배, 흡연용품',
    subclasses: [],
  },
  {
    code: '28',
    nameKo: '의약품, 화장품, 화장 용기',
    subclasses: [
      { code: '28-03', nameKo: '화장품 용기, 파우더 케이스' },
    ],
  },
  {
    code: '29',
    nameKo: '안전 장치',
    subclasses: [
      { code: '29-02', nameKo: '잠금 장치, 자물쇠' },
    ],
  },
  {
    code: '30',
    nameKo: '동물 관리, 스포츠 용품',
    subclasses: [
      { code: '30-01', nameKo: '애완동물 관련 제품' },
    ],
  },
  {
    code: '31',
    nameKo: '요리, 식품 기계',
    subclasses: [
      { code: '31-00', nameKo: '식품 가공 기계' },
    ],
  },
  {
    code: '32',
    nameKo: '그래픽 심벌 (화상 디자인)',
    subclasses: [
      { code: '32-00', nameKo: '장식 문양, 그래픽 심벌' },
    ],
  },
];

export const LOCARNO_MAP: Record<string, LocarnoClass> = Object.fromEntries(
  LOCARNO_CLASSES.map((c) => [c.code, c]),
);

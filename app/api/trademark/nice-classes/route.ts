import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

// 45개 니스 분류 간략 레이블
const NICE_CLASS_LABELS: Record<string, string> = {
  '1': '화학제품',
  '2': '도료·염료',
  '3': '화장품·세제',
  '4': '연료·오일·양초',
  '5': '의약품·위생',
  '6': '금속제품',
  '7': '기계·기기',
  '8': '수공구·칼날류',
  '9': '전자·통신기기',
  '10': '의료기기',
  '11': '조명·냉난방기기',
  '12': '운송수단',
  '13': '화기·폭발물',
  '14': '귀금속·시계',
  '15': '악기',
  '16': '종이·인쇄물',
  '17': '고무·플라스틱',
  '18': '가죽·가방',
  '19': '건축재료',
  '20': '가구',
  '21': '주방용품·식기',
  '22': '로프·섬유',
  '23': '실·사',
  '24': '직물·침구',
  '25': '의류·신발·모자',
  '26': '레이스·단추·바늘',
  '27': '카펫·벽지',
  '28': '게임·장난감·스포츠용품',
  '29': '육류·생선·유제품',
  '30': '커피·밀가루·빵',
  '31': '농산물·생화',
  '32': '맥주·음료',
  '33': '주류(맥주 제외)',
  '34': '담배',
  '35': '광고·경영·도·소매',
  '36': '금융·보험·부동산',
  '37': '건설·수리',
  '38': '통신',
  '39': '운송·여행',
  '40': '재료 가공·처리',
  '41': '교육·오락·문화',
  '42': 'IT·과학·연구',
  '43': '음식·숙박',
  '44': '의료·미용·농업',
  '45': '법률·개인서비스',
};

const RecommendationSchema = z.object({
  recommendations: z.array(z.object({
    classNumber: z.string(),
    label: z.string(),
    reason: z.string(),
    confidence: z.enum(['high', 'medium', 'low']),
    sampleGoods: z.array(z.string()),
  })),
  summary: z.string(),
});

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await adminAuth.verifyIdToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { markName, markDescription, businessArea } = await req.json();
  if (!markName) {
    return NextResponse.json({ error: 'markName required' }, { status: 400 });
  }

  const classListText = Object.entries(NICE_CLASS_LABELS)
    .map(([num, label]) => `${num}류: ${label}`)
    .join('\n');

  const { object } = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: RecommendationSchema,
    prompt: `You are a Korean trademark classification expert. Recommend the most appropriate Nice Classification classes for the following trademark.

Trademark name: ${markName}
Description: ${markDescription ?? '(not provided)'}
Business area: ${businessArea ?? '(not provided)'}

Available Nice Classes:
${classListText}

Recommend 1 to 5 most relevant classes. For each:
- Explain why it applies (in Korean)
- List 3-5 sample designated goods/services in Korean (specific product names, not categories)
- Rate confidence as high/medium/low

Also provide a brief Korean summary of your recommendation.`,
  });

  return NextResponse.json({
    recommendations: object.recommendations.map((r) => ({
      ...r,
      label: NICE_CLASS_LABELS[r.classNumber] ?? r.label,
    })),
    summary: object.summary,
    allClasses: NICE_CLASS_LABELS,
  });
}

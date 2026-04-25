import { z } from 'zod';

// ─── 저작권 ───────────────────────────────────────────────────────────────────
export const CopyrightSchema = z.object({
  title: z.string().min(1),
  titleEn: z.string().optional(),
  typeCode: z.enum([
    'literary', 'musical', 'dramatic', 'art',
    'architectural', 'photographic', 'film',
    'graphic', 'applied_art', 'computer_program',
    'compilation', 'derivative',
  ]),
  subTypeCode: z.string().optional(),
  description: z.string().min(20),
  creationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),

  authorName: z.string(),
  authorNameEn: z.string().optional(),
  authorBirthYear: z.number().int().optional(),
  authorNationality: z.string().default('KR'),
  authorType: z.enum(['individual', 'corporate', 'joint']),
  jointAuthors: z.array(z.object({
    name: z.string(),
    contributionRatio: z.number().min(0).max(100),
  })).optional(),

  publicationStatus: z.enum(['published', 'unpublished']),
  publicationDate: z.string().optional(),
  publicationCountry: z.string().optional(),
  firstPublicationMedium: z.string().optional(),

  usesAIAssistance: z.boolean().optional(),
  aiAssistanceDescription: z.string().optional(),
  isDerivativeWork: z.boolean().optional(),
  originalWorkInfo: z.string().optional(),

  registrantSameAsAuthor: z.boolean().default(true),
  registrantInfo: z.object({
    name: z.string(),
    address: z.string(),
    phone: z.string(),
    email: z.string().email(),
  }).optional(),
});

// ─── 상표 ────────────────────────────────────────────────────────────────────
export const TrademarkSchema = z.object({
  markName: z.string(),
  markType: z.enum(['text', 'figurative', 'combined', 'color', 'sound', 'motion', '3d']),
  markDescription: z.string(),

  niceClasses: z.array(z.string()).min(1),
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

// ─── 디자인권 ─────────────────────────────────────────────────────────────────
export const DesignSchema = z.object({
  designTitle: z.string(),
  locarnoClass: z.string(),
  articleName: z.string(),
  articleDescription: z.string(),

  designConcept: z.string(),
  featureDescription: z.string(),

  views: z.object({
    front: z.string().optional(),
    back: z.string().optional(),
    left: z.string().optional(),
    right: z.string().optional(),
    top: z.string().optional(),
    bottom: z.string().optional(),
    perspective: z.string().optional(),
  }),

  partialDesign: z.boolean().optional(),
  partialDescription: z.string().optional(),

  designerInfo: z.object({
    name: z.string(),
    address: z.string().optional(),
  }).optional(),
});

// ─── 특허 ────────────────────────────────────────────────────────────────────
export const PatentSchema = z.object({
  inventionTitle: z.string(),
  inventionTitleEn: z.string().optional(),

  technicalField: z.string(),
  ipcCode: z.string().optional(),

  backgroundArt: z.string(),
  priorArtReferences: z.array(z.object({
    title: z.string(),
    source: z.string(),
    registrationNumber: z.string().optional(),
    differences: z.string(),
  })).optional(),

  problemToSolve: z.string(),
  solution: z.string(),
  effects: z.string(),

  detailedDescription: z.string().optional(),

  inventorInfo: z.object({
    name: z.string(),
    address: z.string().optional(),
    nationality: z.string().optional(),
  }).optional(),

  applicantName: z.string().optional(),
  applicantAddress: z.string().optional(),
});

// ─── 유니온 헬퍼 ──────────────────────────────────────────────────────────────
export type CopyrightFields = z.infer<typeof CopyrightSchema>;
export type TrademarkFields = z.infer<typeof TrademarkSchema>;
export type DesignFields    = z.infer<typeof DesignSchema>;
export type PatentFields    = z.infer<typeof PatentSchema>;

export const IP_SCHEMAS = {
  copyright: CopyrightSchema,
  trademark: TrademarkSchema,
  design:    DesignSchema,
  patent:    PatentSchema,
} as const;

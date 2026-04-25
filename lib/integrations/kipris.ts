import { XMLParser } from 'fast-xml-parser';

const BASE_URL = process.env.KIPRIS_API_BASE_URL ?? 'http://plus.kipris.or.kr/kipo-api/kipi';
const SERVICE_KEY = process.env.KIPRIS_API_KEY ?? '';

const parser = new XMLParser({ ignoreAttributes: false });

export interface TrademarkResult {
  applicationNumber: string;
  applicantName: string;
  markName: string;
  markType: string;
  niceClasses: string[];
  applicationDate: string;
  registrationStatus: string;
  imageUrl?: string;
}

export interface PatentResult {
  applicationNumber: string;
  inventionTitle: string;
  applicantName: string;
  applicationDate: string;
  ipcCode: string;
  registrationStatus: string;
}

export interface DesignResult {
  applicationNumber: string;
  articleName: string;
  applicantName: string;
  applicationDate: string;
  locarnoClass: string;
  registrationStatus: string;
}

async function callKipris(service: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(`${BASE_URL}/${service}`);
  url.searchParams.set('ServiceKey', SERVICE_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`KIPRIS API error: ${res.status}`);
  const xml = await res.text();
  return parser.parse(xml);
}

function extractItems(parsed: unknown, itemPath: string[]): unknown[] {
  let node: unknown = parsed;
  for (const key of itemPath) {
    if (node == null || typeof node !== 'object') return [];
    node = (node as Record<string, unknown>)[key];
  }
  if (Array.isArray(node)) return node;
  if (node != null) return [node];
  return [];
}

export async function searchTrademarks(
  query: string,
  niceClass?: string,
): Promise<TrademarkResult[]> {
  const params: Record<string, string> = {
    trademarkName: query,
    searchType: '1',
    page: '1',
    numOfRows: '10',
  };
  if (niceClass) params.niceTypeCodeList = niceClass;

  try {
    const parsed = await callKipris(
      'trademarkInfoSearchService/getTrademarkInfoSearch',
      params,
    );

    const items = extractItems(parsed, [
      'response', 'body', 'items', 'item',
    ]) as Record<string, unknown>[];

    return items.map((item) => ({
      applicationNumber: String(item['applicationNumber'] ?? ''),
      applicantName: String(item['applicantName'] ?? ''),
      markName: String(item['trademarkName'] ?? query),
      markType: String(item['markType'] ?? ''),
      niceClasses: String(item['niceTypeCode'] ?? '').split(',').filter(Boolean),
      applicationDate: String(item['applicationDate'] ?? ''),
      registrationStatus: String(item['registerStatus'] ?? ''),
      imageUrl: item['drawing'] ? String(item['drawing']) : undefined,
    }));
  } catch {
    return [];
  }
}

export async function searchPatents(
  query: string,
  ipcCode?: string,
): Promise<PatentResult[]> {
  const params: Record<string, string> = {
    inventionTitle: query,
    page: '1',
    numOfRows: '10',
  };
  if (ipcCode) params.ipcCode = ipcCode;

  try {
    const parsed = await callKipris(
      'patUtilityModelInfoSearchSevice/getPatentUtilityModelInfoSearch',
      params,
    );

    const items = extractItems(parsed, [
      'response', 'body', 'items', 'item',
    ]) as Record<string, unknown>[];

    return items.map((item) => ({
      applicationNumber: String(item['applicationNumber'] ?? ''),
      inventionTitle: String(item['inventionTitle'] ?? ''),
      applicantName: String(item['applicantName'] ?? ''),
      applicationDate: String(item['applicationDate'] ?? ''),
      ipcCode: String(item['ipcCode'] ?? ''),
      registrationStatus: String(item['registerStatus'] ?? ''),
    }));
  } catch {
    return [];
  }
}

export async function searchDesigns(
  query: string,
  locarnoClass?: string,
): Promise<DesignResult[]> {
  const params: Record<string, string> = {
    articleName: query,
    page: '1',
    numOfRows: '10',
  };
  if (locarnoClass) params.locarnoCode = locarnoClass;

  try {
    const parsed = await callKipris(
      'designInfoSearchService/getDesignInfoSearch',
      params,
    );

    const items = extractItems(parsed, [
      'response', 'body', 'items', 'item',
    ]) as Record<string, unknown>[];

    return items.map((item) => ({
      applicationNumber: String(item['applicationNumber'] ?? ''),
      articleName: String(item['articleName'] ?? ''),
      applicantName: String(item['applicantName'] ?? ''),
      applicationDate: String(item['applicationDate'] ?? ''),
      locarnoClass: String(item['locarnoCode'] ?? ''),
      registrationStatus: String(item['registerStatus'] ?? ''),
    }));
  } catch {
    return [];
  }
}

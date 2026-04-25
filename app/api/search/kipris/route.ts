import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { searchTrademarks, searchPatents, searchDesigns } from '@/lib/integrations/kipris';

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

  const { type, query, filters } = await req.json();
  if (!type || !query) {
    return NextResponse.json({ error: 'type and query required' }, { status: 400 });
  }

  let results: unknown[] = [];
  let total = 0;

  if (type === 'trademark') {
    results = await searchTrademarks(query, filters?.niceClass);
  } else if (type === 'patent') {
    results = await searchPatents(query, filters?.ipcCode);
  } else if (type === 'design') {
    results = await searchDesigns(query, filters?.locarnoClass);
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  total = results.length;
  return NextResponse.json({ results, total });
}

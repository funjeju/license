import { readFileSync } from 'fs';
import { join } from 'path';
import type { IPType } from './classifier';

type Message = { role: 'user' | 'assistant'; content: string };

function loadPrompt(ipType: IPType): string {
  const file = `interviewer-${ipType}.md`;
  return readFileSync(join(process.cwd(), 'lib/agents/prompts', file), 'utf-8');
}

export function buildInterviewerSystem(
  ipType: IPType,
  extractedFields: Record<string, unknown>,
  recentMessages: Message[],
  requiredFields: string[]
): string {
  const template = loadPrompt(ipType);

  const filledFields = Object.keys(extractedFields).filter(
    (k) => extractedFields[k] !== null && extractedFields[k] !== undefined && extractedFields[k] !== ''
  );
  const missingFields = requiredFields.filter((f) => !filledFields.includes(f));

  const checklist = requiredFields
    .map((f) => `${filledFields.includes(f) ? '[완료]' : '[미완료]'} ${f}`)
    .join('\n');

  const recentStr = recentMessages
    .slice(-6)
    .map((m) => `${m.role === 'user' ? '유저' : 'AI'}: ${m.content}`)
    .join('\n');

  return template
    .replace('{extractedFields}', JSON.stringify(extractedFields, null, 2))
    .replace('{recentMessages}', recentStr || '(첫 번째 대화)')
    .replace('{requiredFieldsChecklist}', checklist);
}

export { loadPrompt };
export type { Message };

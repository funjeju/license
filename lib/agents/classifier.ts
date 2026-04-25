import { generateText } from 'ai';
import { google } from '@/lib/ai/providers';
import { readFileSync } from 'fs';
import { join } from 'path';

export type IPType = 'copyright' | 'trademark' | 'design' | 'patent';

export interface ClassifierResult {
  primaryType: IPType;
  subType: string;
  alternativeTypes: IPType[];
  confidence: number;
  rationale: string;
}

const systemPrompt = readFileSync(
  join(process.cwd(), 'lib/agents/prompts/classifier.md'),
  'utf-8'
);

export async function classifyIP(userMessage: string): Promise<ClassifierResult> {
  const { text } = await generateText({
    model: google('gemini-2.0-flash-lite'),
    system: systemPrompt,
    prompt: userMessage,
    maxOutputTokens: 256,
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Classifier returned non-JSON response');

  return JSON.parse(jsonMatch[0]) as ClassifierResult;
}

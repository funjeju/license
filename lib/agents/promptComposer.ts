import { generateText } from 'ai';
import { google } from '@/lib/ai/providers';
import { readFileSync } from 'fs';
import { join } from 'path';

const systemPrompt = readFileSync(
  join(process.cwd(), 'lib/agents/prompts/prompt-composer.md'),
  'utf-8'
);

export type StyleOption = 'line_art' | '3d_render' | 'circuit' | 'isometric' | 'blueprint' | 'sketch';
export type CompositionOption = 'single' | 'multiview_6' | 'exploded' | 'sequence';

export interface PromptComposerInput {
  extractedFields: Record<string, unknown>;
  style: StyleOption;
  composition: CompositionOption;
  userAddition: string;
  ipType: string;
}

export async function composeImagePrompt(input: PromptComposerInput): Promise<string> {
  const userMessage = `
IP Type: ${input.ipType}
Extracted Fields: ${JSON.stringify(input.extractedFields, null, 2)}
Style: ${input.style}
Composition: ${input.composition}
User additional instructions: ${input.userAddition || 'none'}
`.trim();

  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    prompt: userMessage,
    maxOutputTokens: 512,
  });

  return text.trim();
}

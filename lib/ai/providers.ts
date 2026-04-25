import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';

const clean = (s: string | undefined) => s?.replace(/^﻿/, '').trim();

export const google = createGoogleGenerativeAI({
  apiKey: clean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
});

export const anthropic = createAnthropic({
  apiKey: clean(process.env.ANTHROPIC_API_KEY),
});

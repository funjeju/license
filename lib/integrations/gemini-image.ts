import { generateImage } from 'ai';
import { google } from '@ai-sdk/google';

export interface GeneratedImageResult {
  base64: string;
  mimeType: string;
}

export async function generateVariants(
  prompt: string,
  count = 4
): Promise<GeneratedImageResult[]> {
  const { images } = await generateImage({
    model: google.image('gemini-2.5-flash-image'),
    prompt,
    n: count,
    aspectRatio: '1:1',
  });

  return images.map((img) => ({
    base64: img.base64,
    mimeType: img.mediaType ?? 'image/png',
  }));
}

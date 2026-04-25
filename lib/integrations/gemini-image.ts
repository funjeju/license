import { generateImage, generateText } from 'ai';
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

export async function editImage(
  sourceBase64: string,
  sourceMimeType: string,
  instruction: string
): Promise<GeneratedImageResult> {
  const { files } = await generateText({
    model: google('gemini-2.5-flash-image'),
    providerOptions: {
      google: { responseModalities: ['IMAGE'] },
    },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'file',
            data: sourceBase64,
            mediaType: sourceMimeType,
          },
          {
            type: 'text',
            text: `Edit this image: ${instruction}. Return only the edited image.`,
          },
        ],
      },
    ],
  });

  if (!files || files.length === 0) {
    throw new Error('No image returned from Gemini edit');
  }

  return {
    base64: files[0].base64,
    mimeType: files[0].mediaType ?? 'image/png',
  };
}

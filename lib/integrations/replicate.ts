import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY ?? '' });

// ImageBind: 512-dim multimodal embedding model
// Model: daanelson/imagebind
const IMAGEBIND_VERSION = '0383f62e173dc821ec52663ed22a076d9c970549ccd14ac6d2a9a4bef5a5dda9';

export async function getImageEmbedding(imageBase64: string, mimeType: string): Promise<number[]> {
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  const output = await replicate.run(
    `daanelson/imagebind:${IMAGEBIND_VERSION}`,
    { input: { input: dataUrl } },
  ) as number[][];

  if (!Array.isArray(output) || output.length === 0) {
    throw new Error('ImageBind returned no embedding');
  }

  // ImageBind returns array of embeddings; take first (vision)
  const emb = Array.isArray(output[0]) ? output[0] : output;
  return emb as number[];
}

// Fallback: simple URL-based embedding
export async function getImageEmbeddingFromUrl(imageUrl: string): Promise<number[]> {
  const output = await replicate.run(
    `daanelson/imagebind:${IMAGEBIND_VERSION}`,
    { input: { input: imageUrl } },
  ) as number[][];

  if (!Array.isArray(output) || output.length === 0) {
    throw new Error('ImageBind returned no embedding');
  }

  const emb = Array.isArray(output[0]) ? output[0] : output;
  return emb as number[];
}

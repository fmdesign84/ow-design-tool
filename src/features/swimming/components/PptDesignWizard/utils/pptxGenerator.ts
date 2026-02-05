import { SlideConfig, DesignTokens } from '../types';

/**
 * PPTX 생성 유틸리티
 * API를 통해 서버사이드에서 PPTX 생성
 */

export async function generatePPTX(
  slides: SlideConfig[],
  tokens: DesignTokens,
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
  }
): Promise<Blob> {
  const response = await fetch('/api/generate-pptx-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template: {
        slides,
        tokens,
        metadata,
      },
      filename: metadata?.title || 'presentation',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PPTX 생성 실패: ${error}`);
  }

  return response.blob();
}

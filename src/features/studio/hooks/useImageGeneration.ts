/**
 * 이미지 생성 훅
 */

import { useState, useCallback } from 'react';
import type { ImageGenerationParams, GalleryItem } from '../types';

interface UseImageGenerationReturn {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  generatedImage: GalleryItem | null;
  generate: (params: ImageGenerationParams) => Promise<GalleryItem | null>;
  reset: () => void;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GalleryItem | null>(null);

  const generate = useCallback(async (params: ImageGenerationParams): Promise<GalleryItem | null> => {
    try {
      setIsGenerating(true);
      setError(null);
      setProgress(10);

      // 프롬프트 검증
      if (!params.prompt.trim()) {
        throw new Error('프롬프트를 입력해주세요.');
      }

      setProgress(30);

      // GPT Image 1.5는 별도 API 엔드포인트 사용
      const isOpenAI = params.model === 'gptimage15';
      const apiEndpoint = isOpenAI ? '/api/generate-image-openai' : '/api/generate-image';

      // 비율을 OpenAI 형식으로 변환 (1:1 → 1024x1024)
      const getOpenAISize = (ratio: string): string => {
        const sizeMap: Record<string, string> = {
          '1:1': '1024x1024',
          '4:3': '1536x1024',
          '3:4': '1024x1536',
          '16:9': '1792x1024',
          '9:16': '1024x1792',
        };
        return sizeMap[ratio] || '1024x1024';
      };

      const requestBody = isOpenAI
        ? {
            prompt: params.prompt,
            size: getOpenAISize(params.aspectRatio),
            quality: params.quality === 'hd' ? 'hd' : 'standard',
            style: params.style === 'photo' ? 'natural' : 'vivid',
            referenceImage: params.referenceImage,
          }
        : {
            prompt: params.prompt,
            model: params.model,
            aspectRatio: params.aspectRatio,
            quality: params.quality,
            style: params.style,
            negativePrompt: params.negativePrompt,
            referenceImage: params.referenceImage,
          };

      // API 호출
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `생성 실패 (${response.status})`);
      }

      const data = await response.json();
      setProgress(90);

      // API 응답 형식 처리: { image: ... } 또는 { success, data: { url } }
      const imageUrl = data.image || data.data?.url;

      if (!imageUrl) {
        throw new Error(data.error || '이미지 생성에 실패했습니다.');
      }

      setProgress(100);

      // savedImage가 있으면 이미 Supabase에 저장됨
      const savedId = data.savedImage?.id || Date.now().toString();

      const newItem: GalleryItem = {
        id: savedId,
        type: 'image',
        image: imageUrl,
        prompt: params.prompt,
        aspectRatio: params.aspectRatio,
        imagenModel: params.model,
        created_at: new Date().toISOString(),
      };

      setGeneratedImage(newItem);
      return newItem;
    } catch (err) {
      console.error('[useImageGeneration] Error:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setError(null);
    setGeneratedImage(null);
  }, []);

  return {
    isGenerating,
    progress,
    error,
    generatedImage,
    generate,
    reset,
  };
}

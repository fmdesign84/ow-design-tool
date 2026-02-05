/**
 * 영상 생성 훅
 */

import { useState, useCallback } from 'react';
import type { VideoGenerationParams, GalleryItem } from '../types';

interface UseVideoGenerationReturn {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  generatedVideo: GalleryItem | null;
  generate: (params: VideoGenerationParams) => Promise<GalleryItem | null>;
  reset: () => void;
}

export function useVideoGeneration(): UseVideoGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<GalleryItem | null>(null);

  const generate = useCallback(async (params: VideoGenerationParams): Promise<GalleryItem | null> => {
    try {
      setIsGenerating(true);
      setError(null);
      setProgress(10);

      // 프롬프트 검증
      if (!params.prompt.trim()) {
        throw new Error('프롬프트를 입력해주세요.');
      }

      setProgress(20);

      // API 호출
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: params.prompt,
          aspectRatio: params.aspectRatio,
          duration: params.duration,
          sourceImage: params.sourceImage,
        }),
      });

      setProgress(60);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `영상 생성 실패 (${response.status})`);
      }

      const data = await response.json();
      setProgress(80);

      if (!data.success || !data.videoUrl) {
        throw new Error(data.error || '영상 생성에 실패했습니다.');
      }

      // Supabase에 저장
      const saveResponse = await fetch('/api/supabase-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: data.videoUrl,
          prompt: params.prompt,
          type: 'video',
          metadata: {
            model: params.model,
            aspectRatio: params.aspectRatio,
            duration: params.duration,
          },
        }),
      });

      const saveData = await saveResponse.json();
      setProgress(100);

      const newItem: GalleryItem = {
        id: saveData.id || Date.now().toString(),
        type: 'video',
        image: data.videoUrl,
        prompt: params.prompt,
        aspectRatio: params.aspectRatio,
        metadata: {
          duration: params.duration,
        },
        created_at: new Date().toISOString(),
      };

      setGeneratedVideo(newItem);
      return newItem;
    } catch (err) {
      console.error('[useVideoGeneration] Error:', err);
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
    setGeneratedVideo(null);
  }, []);

  return {
    isGenerating,
    progress,
    error,
    generatedVideo,
    generate,
    reset,
  };
}

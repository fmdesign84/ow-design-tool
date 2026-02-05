/**
 * 추천 이미지 관리 훅
 * - 홈 페이지용 추천 이미지/목업 로드
 * - 중앙 스토어 사용으로 중복 API 호출 방지
 */

import { useCallback, useMemo } from 'react';
import { useFeaturedStore } from '../../../stores/useFeaturedStore';
import { GalleryItem } from './types';

interface UseFeaturedImagesReturn {
  featuredImages: GalleryItem[];
  featuredMockups: GalleryItem[];
  loadFeaturedImages: () => Promise<void>;
}

export function useFeaturedImages(): UseFeaturedImagesReturn {
  const {
    featuredImages: storeImages,
    featuredMockups: storeMockups,
    fetchFeatured,
  } = useFeaturedStore();

  // 스토어 데이터를 GalleryItem 형식으로 변환
  const featuredImages = useMemo((): GalleryItem[] =>
    storeImages.map(img => ({
      id: img.id as string,
      image: (img.image_url || img.image) as string,
      prompt: img.prompt as string,
      model: (img.model as string) || '',
      aspectRatio: (img.aspect_ratio as string) || '1:1',
      quality: 'standard',
      style: img.style as string | null,
      mockupType: null,
      mockupLabel: null,
      type: (img.type as 'image' | 'video' | 'mockup') || 'image',
      metadata: img.metadata as Record<string, unknown> | null,
      createdAt: img.created_at ? new Date(img.created_at) : new Date(),
      detectedStyles: [],
      mood: null,
      colors: [],
      analysisStatus: 'none' as const,
      is_featured: true,
    }))
  , [storeImages]);

  const featuredMockups = useMemo((): GalleryItem[] =>
    storeMockups.map(img => ({
      id: img.id as string,
      image: (img.image_url || img.image) as string,
      prompt: img.prompt as string,
      model: (img.model as string) || '',
      aspectRatio: (img.aspect_ratio as string) || '1:1',
      quality: 'standard',
      style: img.style as string | null,
      mockupType: null,
      mockupLabel: null,
      type: 'mockup' as const,
      metadata: img.metadata as Record<string, unknown> | null,
      createdAt: img.created_at ? new Date(img.created_at) : new Date(),
      detectedStyles: [],
      mood: null,
      colors: [],
      analysisStatus: 'none' as const,
      is_featured: true,
    }))
  , [storeMockups]);

  // 추천 이미지 로드 (스토어의 캐싱 로직 사용)
  const loadFeaturedImages = useCallback(async () => {
    await fetchFeatured();
  }, [fetchFeatured]);

  return {
    featuredImages,
    featuredMockups,
    loadFeaturedImages,
  };
}

export default useFeaturedImages;

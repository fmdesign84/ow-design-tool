/**
 * 추천 이미지/영상 데이터 가져오기 훅
 * - featuredImages: 일반 이미지/영상 (목업 제외)
 * - featuredMockups: 목업 이미지만
 * - 중앙 스토어 사용으로 중복 API 호출 방지
 */

import { useState, useEffect, useCallback } from 'react';
import { useFeaturedStore } from '../../../stores/useFeaturedStore';
import type { GalleryItem, AspectRatio } from '../types';

interface UseFeaturedImagesReturn {
  featuredImages: GalleryItem[];
  featuredMockups: GalleryItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleFeatured: (item: GalleryItem) => Promise<void>;
  deleteItem: (item: GalleryItem) => Promise<void>;
}

export function useFeaturedImages(): UseFeaturedImagesReturn {
  // 중앙 스토어 사용
  const {
    featuredImages: storeImages,
    featuredMockups: storeMockups,
    isLoading: storeLoading,
    error: storeError,
    fetchFeatured,
    invalidateCache,
  } = useFeaturedStore();

  // 로컬 상태 (토글/삭제 시 즉시 UI 반영용)
  const [localImages, setLocalImages] = useState<GalleryItem[]>([]);
  const [localMockups, setLocalMockups] = useState<GalleryItem[]>([]);

  // 스토어 데이터를 GalleryItem 형식으로 변환
  const formatStoreData = useCallback((items: typeof storeImages): GalleryItem[] => {
    return items.map((img) => {
      // mockup은 image로 처리 (GalleryItem 타입 호환)
      const itemType = img.type === 'mockup' ? 'image' : (img.type || 'image');
      return {
        id: img.id,
        type: itemType as 'image' | 'video',
        image: img.image_url || img.image || '',
        prompt: img.prompt,
        style: img.style ?? undefined, // null -> undefined 변환
        aspectRatio: img.aspect_ratio as AspectRatio | undefined,
        imagenModel: img.model,
        detectedStyles: [],
        metadata: img.metadata as GalleryItem['metadata'],
        created_at: img.created_at || '',
        isFeatured: img.is_featured ?? true,
      };
    });
  }, []);

  // 스토어 데이터가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setLocalImages(formatStoreData(storeImages));
  }, [storeImages, formatStoreData]);

  useEffect(() => {
    setLocalMockups(formatStoreData(storeMockups));
  }, [storeMockups, formatStoreData]);

  // 초기 로드
  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  // 추천 토글
  const toggleFeatured = useCallback(async (item: GalleryItem) => {
    try {
      const response = await fetch('/api/supabase-images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          is_featured: !item.isFeatured,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }

      // 로컬 상태 업데이트 (즉시 UI 반영)
      if (item.isFeatured) {
        setLocalImages(prev => prev.filter(img => img.id !== item.id));
        setLocalMockups(prev => prev.filter(img => img.id !== item.id));
      } else {
        setLocalImages(prev => [{ ...item, isFeatured: true }, ...prev]);
      }

      // 스토어 캐시 무효화 (다른 컴포넌트에서 새로고침 시 반영)
      invalidateCache();
    } catch (err) {
      console.error('[useFeaturedImages] Toggle error:', err);
      throw err;
    }
  }, [invalidateCache]);

  // 삭제
  const deleteItem = useCallback(async (item: GalleryItem) => {
    try {
      const response = await fetch('/api/supabase-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // 로컬 상태 업데이트
      setLocalImages(prev => prev.filter(img => img.id !== item.id));
      setLocalMockups(prev => prev.filter(img => img.id !== item.id));

      // 스토어 캐시 무효화
      invalidateCache();
    } catch (err) {
      console.error('[useFeaturedImages] Delete error:', err);
      throw err;
    }
  }, [invalidateCache]);

  // refetch (강제 새로고침)
  const refetch = useCallback(async () => {
    await fetchFeatured(true);
  }, [fetchFeatured]);

  return {
    featuredImages: localImages,
    featuredMockups: localMockups,
    isLoading: storeLoading,
    error: storeError,
    refetch,
    toggleFeatured,
    deleteItem,
  };
}

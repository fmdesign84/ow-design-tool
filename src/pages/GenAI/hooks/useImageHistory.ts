/**
 * 이미지 히스토리 관리 훅
 * - Supabase에서 이미지 목록 로드
 * - 무한 스크롤 지원
 */

import { useState, useCallback, useRef, useEffect, RefObject } from 'react';
import { GalleryItem, MOCKUP_STYLE_KEYS } from './types';

interface UseImageHistoryOptions {
  archiveEndRef?: RefObject<HTMLDivElement>;
  resultEndRef?: RefObject<HTMLDivElement>;
}

interface UseImageHistoryReturn {
  imageHistory: GalleryItem[];
  setImageHistory: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  isLoadingData: boolean;
  isLoadingMore: boolean;
  hasMoreImages: boolean;
  loadImages: (reset?: boolean) => Promise<void>;
}

export function useImageHistory(options: UseImageHistoryOptions = {}): UseImageHistoryReturn {
  const { archiveEndRef, resultEndRef } = options;

  // 상태
  const [imageHistory, setImageHistory] = useState<GalleryItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreImages, setHasMoreImages] = useState(true);

  // refs (stale closure 방지)
  const imageOffsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const isLoadingDataRef = useRef(true);

  // refs와 state 동기화
  useEffect(() => { hasMoreRef.current = hasMoreImages; }, [hasMoreImages]);
  useEffect(() => { isLoadingMoreRef.current = isLoadingMore; }, [isLoadingMore]);
  useEffect(() => { isLoadingDataRef.current = isLoadingData; }, [isLoadingData]);

  // Supabase에서 이미지 목록 로드
  const loadImages = useCallback(async (reset = true) => {
    // 추가 로드 시 중복 호출 방지
    if (!reset && isLoadingMoreRef.current) return;

    try {
      const offset = reset ? 0 : imageOffsetRef.current;
      const limit = 50;

      if (reset) {
        setIsLoadingData(true);
      } else {
        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);
      }

      const response = await fetch(`/api/supabase-images?offset=${offset}&limit=${limit}`);
      const data = await response.json();

      if (data.images) {
        // DB 필드명을 프론트엔드 형식으로 변환
        const formatted: GalleryItem[] = data.images.map((img: Record<string, unknown>) => {
          const isMockup = img.style && MOCKUP_STYLE_KEYS.includes(img.style as typeof MOCKUP_STYLE_KEYS[number]);
          const inferredType = (img.type as string) || (isMockup ? 'mockup' : 'image');

          return {
            id: img.id as string,
            image: img.image_url as string,
            prompt: img.prompt as string,
            model: img.model as string,
            imagenModel: img.model as string,
            aspectRatio: img.aspect_ratio as string,
            quality: img.quality as string,
            style: img.style as string | null,
            mockupType: isMockup ? img.style as string : null,
            mockupLabel: isMockup ? (img.prompt as string)?.replace(' 목업', '') : null,
            createdAt: new Date(img.created_at as string),
            type: inferredType as 'image' | 'video' | 'mockup',
            metadata: img.metadata ? (typeof img.metadata === 'string' ? JSON.parse(img.metadata) : img.metadata) as Record<string, unknown> : null,
            detectedStyles: (img.detected_styles as string[]) || [],
            mood: img.mood as string | null,
            colors: (img.colors as string[]) || [],
            analysisStatus: (img.detected_styles as string[])?.length > 0 ? 'completed' : 'none',
            is_featured: (img.is_featured as boolean) || false
          } as GalleryItem;
        });

        if (reset) {
          imageOffsetRef.current = formatted.length;
          setImageHistory(formatted);
        } else {
          imageOffsetRef.current += formatted.length;
          setImageHistory(prev => [...prev, ...formatted]);
        }

        const hasMore = data.hasMore === true;
        hasMoreRef.current = hasMore;
        setHasMoreImages(hasMore);
      }
    } catch (err) {
      console.error('Failed to load images:', err);
    } finally {
      if (isLoadingDataRef.current) {
        setIsLoadingData(false);
      }
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, []);

  // 무한 스크롤 - IntersectionObserver
  useEffect(() => {
    if (!archiveEndRef?.current && !resultEndRef?.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some(entry => entry.isIntersecting);
        if (isVisible && hasMoreRef.current && !isLoadingMoreRef.current && !isLoadingDataRef.current) {
          loadImages(false);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (resultEndRef?.current) {
      observer.observe(resultEndRef.current);
    }
    if (archiveEndRef?.current) {
      observer.observe(archiveEndRef.current);
    }

    return () => observer.disconnect();
  }, [loadImages, archiveEndRef, resultEndRef]);

  return {
    imageHistory,
    setImageHistory,
    isLoadingData,
    isLoadingMore,
    hasMoreImages,
    loadImages,
  };
}

export default useImageHistory;

/**
 * 추천 콘텐츠 (이미지/목업/영상) 중앙 스토어
 * - 중복 API 호출 방지
 * - 데이터 캐싱 (5분)
 */

import { create } from 'zustand';
import { getApiUrl } from '../utils/apiRoute';

// 캐시 유효 시간 (5분)
const CACHE_DURATION = 5 * 60 * 1000;

interface FeaturedItem {
  id: string;
  image_url?: string;
  image?: string;
  prompt?: string;
  type?: 'image' | 'video' | 'mockup';
  style?: string | null;
  aspect_ratio?: string;
  model?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  is_featured?: boolean;
  [key: string]: unknown;
}

interface FeaturedState {
  // 데이터
  featuredImages: FeaturedItem[];
  featuredMockups: FeaturedItem[];
  featuredVideos: FeaturedItem[];

  // 상태
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  // 액션
  fetchFeatured: (force?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

export const useFeaturedStore = create<FeaturedState>((set, get) => ({
  // 초기 상태
  featuredImages: [],
  featuredMockups: [],
  featuredVideos: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  // 추천 콘텐츠 로드 (캐시 지원)
  fetchFeatured: async (force = false) => {
    const state = get();

    // 이미 로딩 중이면 스킵
    if (state.isLoading) return;

    // 캐시가 유효하면 스킵 (force가 아닐 경우)
    if (
      !force &&
      state.lastFetchedAt &&
      Date.now() - state.lastFetchedAt < CACHE_DURATION &&
      (state.featuredImages.length > 0 || state.featuredMockups.length > 0)
    ) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // 일반 이미지와 목업 병렬 로드
      const [generalRes, mockupRes] = await Promise.all([
        fetch(getApiUrl('/api/supabase-images?featured=true&contentType=general')),
        fetch(getApiUrl('/api/supabase-images?featured=true&contentType=mockup')),
      ]);

      const [generalData, mockupData] = await Promise.all([
        generalRes.json(),
        mockupRes.json(),
      ]);

      const images: FeaturedItem[] = [];
      const videos: FeaturedItem[] = [];
      const mockups: FeaturedItem[] = [];

      // 일반 콘텐츠 분류 (이미지/영상)
      if (generalData.success && generalData.images) {
        generalData.images.forEach((item: FeaturedItem) => {
          if (item.type === 'video') {
            videos.push(item);
          } else {
            images.push(item);
          }
        });
      }

      // 목업
      if (mockupData.success && mockupData.images) {
        mockups.push(...mockupData.images);
      }

      set({
        featuredImages: images,
        featuredMockups: mockups,
        featuredVideos: videos,
        isLoading: false,
        lastFetchedAt: Date.now(),
      });
    } catch (err) {
      console.error('[useFeaturedStore] Error:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to load featured content',
        isLoading: false,
      });
    }
  },

  // 캐시 무효화 (관리자가 추천 변경 시)
  invalidateCache: () => {
    set({ lastFetchedAt: null });
  },
}));

export default useFeaturedStore;

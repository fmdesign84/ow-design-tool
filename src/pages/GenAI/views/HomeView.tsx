/**
 * Home View (홈 화면)
 * - 프롬프트 입력
 * - 추천 이미지/목업 갤러리
 * - 빠른 생성 버튼
 */

import React, { useState, useCallback, useEffect } from 'react';
import { HomeSection } from '../../../features/studio';
import { MOCKUP_STYLES } from '../constants';
import type { GalleryItem, AspectRatio } from '../../../features/studio/types';

// 메뉴 타입
type MainMenu = 'home' | 'image' | 'video' | 'tools' | 'design' | 'library' | 'wave' | 'swimming' | 'chat' | 'copilot';

interface HomeViewProps {
  // 공유 상태
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // 네비게이션
  onNavigate: (menu: MainMenu) => void;
  // 이미지 클릭 (라이트박스)
  onImageClick?: (item: GalleryItem) => void;
  // 모바일 여부
  isMobile?: boolean;
  // 에러
  onError?: (error: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  isLoading,
  setIsLoading,
  onNavigate,
  onImageClick,
  isMobile = false,
  onError,
}) => {
  // 내부 상태
  const [prompt, setPrompt] = useState('');
  const [homeGenType, setHomeGenType] = useState<'image' | 'video'>('image');
  const [homeAspectRatio, setHomeAspectRatio] = useState<AspectRatio>('1:1');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [featuredImages, setFeaturedImages] = useState<GalleryItem[]>([]);
  const [featuredMockups, setFeaturedMockups] = useState<GalleryItem[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<GalleryItem[]>([]);

  // 추천 이미지 로드
  useEffect(() => {
    const loadFeaturedData = async () => {
      try {
        // 최신 이미지 30개 로드 (featured 조건 제거)
        const response = await fetch('/api/supabase-images?limit=30');
        const data = await response.json();
        if (data.images) {
          // DB 필드명(snake_case) → 프론트엔드 필드명(camelCase) 매핑
          const mapItem = (item: Record<string, unknown>): GalleryItem => ({
            id: String(item.id),
            type: (item.type as 'image' | 'video') || 'image',
            image: String(item.image_url || item.image || ''),
            prompt: String(item.prompt || ''),
            style: String(item.style || ''),
            aspectRatio: (item.aspect_ratio || item.aspectRatio) as AspectRatio,
            imagenModel: String(item.model || item.imagenModel || ''),
            detectedStyles: (item.detected_styles || item.detectedStyles) as string[] | undefined,
            metadata: item.metadata ? (typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata) as GalleryItem['metadata'] : undefined,
            created_at: String(item.created_at || ''),
            isFeatured: Boolean(item.is_featured || item.isFeatured),
          });

          const mappedImages = data.images.map(mapItem);

          // 목업, 영상, 이미지 분리
          const mockups = mappedImages.filter((item: GalleryItem) =>
            MOCKUP_STYLES.includes(item.style || '')
          );
          const videos = mappedImages.filter((item: GalleryItem) =>
            item.type === 'video'
          );
          const images = mappedImages.filter((item: GalleryItem) =>
            item.type === 'image' && !MOCKUP_STYLES.includes(item.style || '')
          );
          setFeaturedImages(images.slice(0, 10));
          setFeaturedMockups(mockups.slice(0, 10));
          setFeaturedVideos(videos.slice(0, 10));
        }
      } catch (err) {
        console.error('Failed to load featured data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadFeaturedData();
  }, []);

  // 프롬프트 강화
  const handleEnhancePrompt = useCallback(async (type: 'image' | 'video') => {
    if (!prompt.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      });
      const data = await response.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      onError?.('프롬프트 강화 실패');
    } finally {
      setIsEnhancing(false);
    }
  }, [prompt, isEnhancing, onError]);

  // 홈에서 생성 버튼 클릭
  const handleHomeGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    // 해당 페이지로 이동 (생성은 해당 View에서 처리)
    if (homeGenType === 'video') {
      onNavigate('video');
    } else {
      onNavigate('image');
    }
  }, [prompt, homeGenType, onNavigate]);

  // 홈에서 특정 메뉴로 이동
  const handleHomeNavigate = useCallback((menu: string) => {
    onNavigate(menu as MainMenu);
  }, [onNavigate]);

  // Wave 에디터로 이동
  const handleNavigateToWave = useCallback(() => {
    onNavigate('wave');
  }, [onNavigate]);

  // 이미지 클릭 (라이트박스)
  const handleImageClick = useCallback((item: GalleryItem) => {
    onImageClick?.(item);
  }, [onImageClick]);

  return (
    <HomeSection
      prompt={prompt}
      setPrompt={setPrompt}
      isLoading={isLoading}
      isLoadingData={isLoadingData}
      isEnhancing={isEnhancing}
      featuredImages={featuredImages}
      featuredMockups={featuredMockups}
      featuredVideos={featuredVideos}
      isMobile={isMobile}
      homeGenType={homeGenType}
      setHomeGenType={setHomeGenType}
      homeAspectRatio={homeAspectRatio}
      setHomeAspectRatio={setHomeAspectRatio}
      onGenerate={handleHomeGenerate}
      onEnhancePrompt={handleEnhancePrompt}
      onNavigate={handleHomeNavigate}
      onNavigateToWave={handleNavigateToWave}
      onImageClick={handleImageClick}
    />
  );
};

export default HomeView;

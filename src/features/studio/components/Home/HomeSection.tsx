/**
 * HomeSection - 홈 화면 전체 컴포넌트
 *
 * 포함 요소:
 * - 히어로 배경 프레임
 * - 검색 카드
 * - 빠른 시작 (QuickActions)
 * - 추천 갤러리 (FeaturedGallery)
 * - 창작 아이디어
 */

import React, { useState, lazy, Suspense } from 'react';
// useNavigate 제거됨 - onNavigate prop 사용
import { Button, Badge, SectionCard } from '../../../../components/common';
import { OrangeWhaleIcon, ImageGenIcon, VideoGenIcon } from '../../../../components/common/Icons';
import { QuickActions } from './QuickActions';
import { RecentWorks } from './RecentWorks';
import { FeaturedGallery } from './FeaturedGallery';
import { IMAGE_ASPECT_RATIOS, VIDEO_ASPECT_RATIOS, CREATIVE_IDEAS } from '../../constants';
import type { GalleryItem, StudioMenu, AspectRatio, GenerationType } from '../../types';
import styles from './HomeSection.module.css';

// FeaturedWaves는 @xyflow 의존성이 무거워서 lazy loading
const FeaturedWaves = lazy(() => import('./FeaturedWaves'));

interface HomeSectionProps {
  // 상태
  prompt: string;
  setPrompt: (value: string) => void;
  isLoading: boolean;
  isLoadingData: boolean;
  isEnhancing: boolean;
  featuredImages: GalleryItem[];
  featuredMockups: GalleryItem[];
  featuredVideos: GalleryItem[];
  isMobile: boolean;

  // 홈 생성 옵션
  homeGenType: GenerationType;
  setHomeGenType: (type: GenerationType) => void;
  homeAspectRatio: AspectRatio;
  setHomeAspectRatio: (ratio: AspectRatio) => void;

  // 핸들러
  onGenerate: () => void;
  onEnhancePrompt: (type: GenerationType) => void;
  onNavigate: (menu: StudioMenu, subMenu: string, path: string) => void;
  onNavigateToWave?: (workflowId: string) => void;
  onImageClick: (item: GalleryItem) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  prompt,
  setPrompt,
  isLoading,
  isLoadingData,
  isEnhancing,
  featuredImages,
  featuredMockups,
  featuredVideos,
  isMobile,
  homeGenType,
  setHomeGenType,
  homeAspectRatio,
  setHomeAspectRatio,
  onGenerate,
  onEnhancePrompt,
  onNavigate,
  onNavigateToWave,
  onImageClick,
}) => {
  const [isWhaleBouncing, setIsWhaleBouncing] = useState(false);

  // 고래 아이콘 클릭 핸들러
  const handleWhaleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prompt.trim() && !isLoading && !isEnhancing) {
      onEnhancePrompt(homeGenType);
    } else if (!isWhaleBouncing) {
      setIsWhaleBouncing(true);
      setTimeout(() => setIsWhaleBouncing(false), 1050);
    }
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !isLoading) {
      onGenerate();
    }
  };

  // 아이디어 클릭 핸들러
  const handleIdeaClick = (idea: { text: string; type: GenerationType }) => {
    setPrompt(idea.text);
    setHomeGenType(idea.type);
    setHomeAspectRatio(idea.type === 'video' ? '16:9' : '1:1');
  };

  const aspectRatios = homeGenType === 'video' ? VIDEO_ASPECT_RATIOS : IMAGE_ASPECT_RATIOS;

  return (
    <div className={styles.homeContainer}>
      {/* 검색 카드 - 영상 포함 */}
      <div className={styles.homeSearchCard}>
        {/* 영상 프레임 - 검색바 카드 안에 배치 */}
        <div className={styles.videoFrame}>
          <div className={styles.frameVideo} />
        </div>

        {/* 검색 입력 영역 */}
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrapper}>
            <div
              className={`${styles.searchLogoInside} ${isWhaleBouncing ? styles.whaleBounce : ''} ${isLoading ? styles.whaleSwim : ''} ${isEnhancing ? styles.whaleEnhancing : ''}`}
              onClick={handleWhaleClick}
              title="AI로 프롬프트 생성"
              style={{ cursor: 'pointer' }}
            >
              <OrangeWhaleIcon size={42} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={homeGenType === 'video' ? '영상으로 만들 장면을 설명해주세요...' : '상상하는 이미지를 말해주세요...'}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="primary"
              size="md"
              onClick={onGenerate}
              disabled={!prompt.trim() || isLoading}
              isLoading={isLoading}
            >
              Generate
            </Button>

            {/* 구분선 */}
            <div className={styles.optionsDivider} />

            {/* 옵션 - 생성바 안에 배치 */}
            <div className={styles.homeOptionsBadges}>
              <button
                type="button"
                className={`${styles.optionBtn} ${homeGenType === 'image' ? styles.optionBtnActive : ''}`}
                onClick={() => {
                  setHomeGenType('image');
                  setHomeAspectRatio('1:1');
                }}
              >
                <ImageGenIcon size={14} />
                이미지
              </button>
              <button
                type="button"
                className={`${styles.optionBtn} ${homeGenType === 'video' ? styles.optionBtnActive : ''}`}
                onClick={() => {
                  setHomeGenType('video');
                  setHomeAspectRatio('16:9');
                }}
              >
                <VideoGenIcon size={14} />
                영상
              </button>
            </div>

            <select
              className={styles.homeRatioSelect}
              value={homeAspectRatio}
              onChange={(e) => setHomeAspectRatio(e.target.value as AspectRatio)}
            >
              {aspectRatios.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label} {r.desc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 빠른 시작 */}
      {!isLoadingData && <QuickActions onNavigate={onNavigate} />}

      {/* 최근 작업 */}
      {!isLoadingData && <RecentWorks onItemClick={onImageClick} maxItems={10} />}

      {/* 추천 갤러리 */}
      {!isLoadingData && (
        <div className={styles.featuredSections}>
          {/* 최근 이미지 */}
          {featuredImages.length > 0 && (
            <FeaturedGallery
              title="최근 생성된 이미지"
              items={featuredImages}
              type="image"
              maxItems={isMobile ? 6 : 15}
              onItemClick={onImageClick}
            />
          )}

          {/* 추천 목업 (목업 이미지가 있을 때만 표시) */}
          {featuredMockups.length > 0 && (
            <FeaturedGallery
              title="목업 갤러리"
              items={featuredMockups}
              type="mockup"
              maxItems={isMobile ? 4 : 10}
              onItemClick={onImageClick}
            />
          )}

          {/* 추천 웨이브 - 추천 목업 아래에 배치 (lazy loaded) */}
          {onNavigateToWave && (
            <Suspense fallback={<div style={{ height: 200 }} />}>
              <FeaturedWaves onNavigateToWave={onNavigateToWave} />
            </Suspense>
          )}

          {/* 추천 영상 (영상이 있을 때만 표시) */}
          {featuredVideos.length > 0 && (
            <FeaturedGallery
              title="영상 갤러리"
              items={featuredVideos}
              type="video"
              maxItems={isMobile ? 4 : 8}
              onItemClick={onImageClick}
            />
          )}
        </div>
      )}

      {/* 창작 아이디어 */}
      {!isLoadingData && (
        <SectionCard title="오늘의 창작 아이디어" className={styles.ideasSection} animationDelay={0.5}>
          <div className={styles.ideasGrid}>
            {CREATIVE_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                className={styles.ideaCard}
                onClick={() => handleIdeaClick(idea)}
              >
                <span className={styles.ideaEmoji}>{idea.emoji}</span>
                <span className={styles.ideaText}>{idea.text}</span>
                <Badge size="sm" variant={idea.type === 'video' ? 'info' : 'primary'}>
                  {idea.type === 'video' ? '영상' : '이미지'}
                </Badge>
              </button>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default HomeSection;

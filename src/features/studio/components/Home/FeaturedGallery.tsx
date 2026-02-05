/**
 * FeaturedGallery - 추천 이미지/영상 갤러리
 */

import React from 'react';
import { SectionCard, Badge, LazyImage } from '../../../../components/common';
import type { GalleryItem } from '../../types';
import styles from './FeaturedGallery.module.css';

interface FeaturedGalleryProps {
  title: string;
  items: GalleryItem[];
  type: 'image' | 'video' | 'mockup';
  maxItems?: number;
  onItemClick?: (item: GalleryItem) => void;
  isLoading?: boolean;
}

export const FeaturedGallery: React.FC<FeaturedGalleryProps> = ({
  title,
  items,
  type,
  maxItems = 5,
  onItemClick,
  isLoading = false,
}) => {
  // 타입별 필터링
  const filteredItems = items
    .filter((item) => {
      if (type === 'mockup') return true;
      if (type === 'video') return item.type === 'video';
      return item.type !== 'video';
    })
    .slice(0, maxItems);

  if (filteredItems.length === 0 && !isLoading) {
    return null;
  }

  return (
    <SectionCard title={title} className={styles.featuredSection} animationDelay={0.3}>
      <div className={styles.featuredGrid}>
        {isLoading ? (
          Array.from({ length: maxItems }).map((_, idx) => (
            <div key={idx} className={styles.featuredItemSkeleton} />
          ))
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={styles.featuredItem}
              onClick={() => onItemClick?.(item)}
            >
              <div className={styles.featuredItemInner}>
                {type === 'video' ? (
                  <>
                    <video
                      src={item.image}
                      muted
                      loop
                      playsInline
                      autoPlay
                    />
                    <span className={styles.featuredVideoIcon}>▶</span>
                  </>
                ) : (
                  <LazyImage src={item.image} alt={item.prompt || ''} />
                )}
                <div className={styles.featuredItemOverlay}>
                  <div className={styles.featuredBadges}>
                    <Badge size="sm">
                      {type === 'video' ? 'Veo 3.1' : type === 'mockup' ? (item.style || 'Mockup') : (item.imagenModel || 'Gemini Image')}
                    </Badge>
                    {item.aspectRatio && (
                      <Badge size="sm">{item.aspectRatio}</Badge>
                    )}
                    {type === 'video' && item.metadata?.duration && (
                      <Badge size="sm">{item.metadata.duration}초</Badge>
                    )}
                    {type !== 'mockup' && item.detectedStyles?.slice(0, 2).map((style, idx) => (
                      <Badge key={idx} size="sm">{style}</Badge>
                    ))}
                  </div>
                  {item.prompt && (
                    <div className={styles.featuredPromptPreview}>{item.prompt}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
};

export default FeaturedGallery;

/**
 * RecentWorks - 최근 작업 섹션 (가로 스크롤)
 */

import React, { useEffect, useState } from 'react';
import { SectionCard, LazyImage } from '../../../../components/common';
import type { GalleryItem } from '../../types';
import styles from './RecentWorks.module.css';

interface RecentWorksProps {
  onItemClick?: (item: GalleryItem) => void;
  maxItems?: number;
}

export const RecentWorks: React.FC<RecentWorksProps> = ({
  onItemClick,
  maxItems = 10,
}) => {
  const [recentItems, setRecentItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentWorks = async () => {
      try {
        const response = await fetch(`/api/supabase-images?limit=${maxItems}&sort=created_at&order=desc`);
        const data = await response.json();
        if (data.images) {
          const mapped = data.images.map((item: Record<string, unknown>): GalleryItem => ({
            id: String(item.id),
            type: (item.type as 'image' | 'video') || 'image',
            image: String(item.image_url || item.image || ''),
            prompt: String(item.prompt || ''),
            style: String(item.style || ''),
            aspectRatio: (item.aspect_ratio || item.aspectRatio) as GalleryItem['aspectRatio'],
            imagenModel: String(item.model || item.imagenModel || ''),
            created_at: String(item.created_at || ''),
          }));
          setRecentItems(mapped);
        }
      } catch (err) {
        console.error('Failed to load recent works:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecentWorks();
  }, [maxItems]);

  if (!isLoading && recentItems.length === 0) {
    return null;
  }

  // 상대적 시간 포맷
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <SectionCard title="최근 작업" className={styles.recentSection} animationDelay={0.2}>
      <div className={styles.scrollContainer}>
        <div className={styles.scrollTrack}>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className={styles.recentItemSkeleton} />
            ))
          ) : (
            recentItems.map((item) => (
              <div
                key={item.id}
                className={styles.recentItem}
                onClick={() => onItemClick?.(item)}
              >
                <div className={styles.recentItemImage}>
                  {item.type === 'video' ? (
                    <video src={item.image} muted loop playsInline />
                  ) : (
                    <LazyImage src={item.image} alt={item.prompt || ''} />
                  )}
                  {item.type === 'video' && (
                    <span className={styles.videoIndicator}>▶</span>
                  )}
                </div>
                <div className={styles.recentItemInfo}>
                  <span className={styles.recentItemPrompt}>
                    {item.prompt || '제목 없음'}
                  </span>
                  <span className={styles.recentItemTime}>
                    {formatRelativeTime(item.created_at || '')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default RecentWorks;

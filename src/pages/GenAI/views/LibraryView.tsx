/**
 * Library View (내 라이브러리)
 * - all: 전체
 * - images: 이미지
 * - design: 디자인
 * - videos: 영상
 * - favorites: 즐겨찾기
 */

import React, { useMemo, useCallback, useState } from 'react';
import type { GalleryItem } from '../../../features/studio/types';
import { isDesignImage, getStyleCategory, DESIGN_SUBCATEGORIES, IMAGE_SUBCATEGORIES } from '../constants';
import { TrashIcon, StarIcon } from '../../../components/common/Icons';
import styles from '../ImageGenPage.module.css';

// 서브메뉴 타입
type LibrarySubMenu = 'all' | 'images' | 'design' | 'videos' | 'favorites';

interface LibraryViewProps {
  activeSubMenu: LibrarySubMenu;
  // 이미지 히스토리
  imageHistory: GalleryItem[];
  // 이벤트 핸들러
  onImageClick?: (item: GalleryItem) => void;
  onDeleteImage?: (item: GalleryItem) => void;
  onToggleFavorite?: (item: GalleryItem) => void;
  onDownloadImage?: (item: GalleryItem) => void;
  // 로딩 상태
  isLoading?: boolean;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  activeSubMenu,
  imageHistory,
  onImageClick,
  onDeleteImage,
  onToggleFavorite,
  onDownloadImage,
  isLoading = false,
}) => {
  // 디자인 하위 카테고리
  const [designSubCategory, setDesignSubCategory] = useState<string>('all');
  // 이미지 하위 카테고리
  const [imageSubCategory, setImageSubCategory] = useState<string>('all');

  // 필터링된 이미지
  const filteredImages = useMemo(() => {
    let filtered = [...imageHistory];

    switch (activeSubMenu) {
      case 'all':
        // 전체 - 필터 없음
        break;

      case 'images':
        // 이미지만 (디자인/목업 제외)
        filtered = filtered.filter((item) =>
          item.type === 'image' && !isDesignImage(item)
        );
        // 하위 카테고리 필터
        if (imageSubCategory !== 'all') {
          filtered = filtered.filter((item) => {
            const style = item.style || '';
            switch (imageSubCategory) {
              case 'text-to-image':
                return !['inpaint', 'idphoto', 'composite'].includes(style);
              case 'inpainting':
                return ['inpaint', 'inpainting', 'outpaint'].includes(style);
              case 'idphoto':
                return style === 'idphoto';
              case 'composite':
                return ['composite', 'background-gen'].includes(style);
              default:
                return true;
            }
          });
        }
        break;

      case 'design':
        // 디자인/목업만
        filtered = filtered.filter((item) => isDesignImage(item));
        // 하위 카테고리 필터
        if (designSubCategory !== 'all') {
          filtered = filtered.filter((item) =>
            getStyleCategory(item.style) === designSubCategory
          );
        }
        break;

      case 'videos':
        // 영상만
        filtered = filtered.filter((item) => item.type === 'video');
        break;

      case 'favorites':
        // 즐겨찾기만
        filtered = filtered.filter((item) => item.isFeatured);
        break;

      default:
        break;
    }

    return filtered;
  }, [imageHistory, activeSubMenu, designSubCategory, imageSubCategory]);

  // 이미지 클릭
  const handleImageClick = useCallback((item: GalleryItem) => {
    onImageClick?.(item);
  }, [onImageClick]);

  // 삭제
  const handleDelete = useCallback((e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation();
    if (window.confirm('이 항목을 삭제하시겠습니까?')) {
      onDeleteImage?.(item);
    }
  }, [onDeleteImage]);

  // 즐겨찾기 토글
  const handleToggleFavorite = useCallback((e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation();
    onToggleFavorite?.(item);
  }, [onToggleFavorite]);

  return (
    <div className={styles.libraryContainer}>
      {/* 하위 카테고리 필터 (디자인/이미지) */}
      {activeSubMenu === 'design' && (
        <div className={styles.libraryCategoryFilter}>
          {DESIGN_SUBCATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`${styles.libraryCategoryBtn} ${designSubCategory === cat.key ? styles.active : ''}`}
              onClick={() => setDesignSubCategory(cat.key)}
            >
              {cat.icon && <span className={styles.libraryCatIcon}>{cat.icon}</span>}
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {activeSubMenu === 'images' && (
        <div className={styles.libraryCategoryFilter}>
          {IMAGE_SUBCATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`${styles.libraryCategoryBtn} ${imageSubCategory === cat.key ? styles.active : ''}`}
              onClick={() => setImageSubCategory(cat.key)}
            >
              {cat.icon && <span className={styles.libraryCatIcon}>{cat.icon}</span>}
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* 갤러리 */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>불러오는 중...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p>저장된 항목이 없습니다.</p>
        </div>
      ) : (
        <div className={styles.libraryGrid}>
          {filteredImages.map((item) => {
            // 비율 클래스 결정
            const ratioClass = item.type === 'video'
              ? (item.aspectRatio === '9:16' ? styles.video9x16 : styles.video16x9)
              : (item.aspectRatio === '9:16' ? styles.portrait : styles.landscape);
            const videoClass = item.type === 'video' ? styles.videoItem : '';

            return (
              <div
                key={item.id}
                className={`${styles.libraryItem} ${ratioClass} ${videoClass}`}
                onClick={() => handleImageClick(item)}
              >
                <div className={styles.libraryMediaWrapper}>
                  {item.type === 'video' ? (
                    <video
                      src={item.image}
                      className={styles.libraryMedia}
                      muted
                      loop
                      onMouseEnter={(e) => {
                        const video = e.currentTarget as HTMLVideoElement & { _playPromise?: Promise<void> };
                        video._playPromise = video.play();
                        video._playPromise.catch(() => {});
                      }}
                      onMouseLeave={(e) => {
                        const video = e.currentTarget as HTMLVideoElement & { _playPromise?: Promise<void> };
                        const handlePause = () => {
                          video.pause();
                          video.currentTime = 0;
                        };
                        if (video._playPromise) {
                          video._playPromise.then(handlePause).catch(handlePause);
                        } else {
                          handlePause();
                        }
                      }}
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={item.prompt || ''}
                      className={styles.libraryMedia}
                      loading="lazy"
                    />
                  )}
                </div>

                {/* 호버 오버레이 */}
                <div className={styles.libraryItemOverlay}>
                  {item.prompt && (
                    <p className={styles.libraryItemPrompt}>
                      {item.prompt.length > 50
                        ? item.prompt.substring(0, 50) + '...'
                        : item.prompt}
                    </p>
                  )}
                  <div className={styles.libraryItemMeta}>
                    <div className={styles.libraryItemLeft}>
                      {item.type && (
                        <span className={styles.libraryItemType}>
                          {item.type === 'video' ? '영상' : '이미지'}
                        </span>
                      )}
                      {item.style && (
                        <span className={styles.libraryItemCategory}>{item.style}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 즐겨찾기 버튼 */}
                <button
                  className={`${styles.libraryFavoriteBtn} ${(item.isFeatured || (item as unknown as { is_featured?: boolean }).is_featured) ? styles.active : ''}`}
                  onClick={(e) => handleToggleFavorite(e, item)}
                  title={(item.isFeatured || (item as unknown as { is_featured?: boolean }).is_featured) ? '추천 해제' : '홈에 추천'}
                >
                  <StarIcon size={16} />
                </button>

                {/* 삭제 버튼 */}
                <button
                  className={styles.libraryDeleteBtn}
                  onClick={(e) => handleDelete(e, item)}
                  title="삭제"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LibraryView;

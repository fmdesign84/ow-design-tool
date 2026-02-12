/**
 * WaveShowcaseModal - 추천 웨이브 쇼케이스 팝업
 * - 결과물 이미지 갤러리
 * - 워크플로우 정보
 * - Wave 에디터로 이동 CTA
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from '../../../../components/common';
import { getApiUrl } from '../../../../utils/apiRoute';
import styles from './WaveShowcaseModal.module.css';

// 커스텀 아이콘
const LayersIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);

const TagIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

const RocketIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ImagesIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 22H4a2 2 0 0 1-2-2V6" />
    <rect x="6" y="2" width="16" height="16" rx="2" />
    <circle cx="12" cy="8" r="2" />
    <path d="m22 13-2.5-2.5a2 2 0 0 0-2.83 0L6 22" />
  </svg>
);

// 타입 정의
interface WaveShowcase {
  id: string;
  workflow_id: string;
  title: string;
  description?: string;
  result_images: string[];
  combined_image_url?: string;
  category: string;
  tags: string[];
  display_order: number;
  is_active: boolean;
  workflow?: {
    id: string;
    name: string;
    image_url?: string;
    node_count?: number;
  };
}

interface WaveShowcaseModalProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
  onStartWave: (workflowId: string) => void;
}

// 카테고리 라벨
const CATEGORY_LABELS: Record<string, string> = {
  mockup: '목업',
  image: '이미지',
  video: '영상',
  edit: '편집',
  workflow: '워크플로우',
};

export const WaveShowcaseModal: React.FC<WaveShowcaseModalProps> = ({
  workflowId,
  isOpen,
  onClose,
  onStartWave,
}) => {
  const [showcase, setShowcase] = useState<WaveShowcase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 쇼케이스 데이터 로드
  useEffect(() => {
    if (!isOpen || !workflowId) return;

    const loadShowcase = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedIndex(0);

      try {
        const res = await fetch(getApiUrl(`/api/wave-showcase?workflowId=${workflowId}`));
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error);
        }

        setShowcase(data.showcase);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 로드 실패');
      } finally {
        setIsLoading(false);
      }
    };

    loadShowcase();
  }, [isOpen, workflowId]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showcase?.result_images) return;
      if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : showcase.result_images.length - 1
        );
      }
      if (e.key === 'ArrowRight') {
        setSelectedIndex(prev =>
          prev < showcase.result_images.length - 1 ? prev + 1 : 0
        );
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showcase]);

  const handleStartWave = () => {
    onClose();
    onStartWave(workflowId);
  };

  const handlePrev = () => {
    if (!showcase) return;
    setSelectedIndex(prev =>
      prev > 0 ? prev - 1 : showcase.result_images.length - 1
    );
  };

  const handleNext = () => {
    if (!showcase) return;
    setSelectedIndex(prev =>
      prev < showcase.result_images.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={true}
      className={styles.showcaseModal}
    >
      {/* 로딩 */}
      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>로딩 중...</p>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {/* 쇼케이스가 없는 경우 */}
      {!isLoading && !error && !showcase && (
        <div className={styles.noShowcase}>
          <p>쇼케이스가 아직 등록되지 않았습니다.</p>
          <Button
            variant="primary"
            leftIcon={<RocketIcon />}
            onClick={handleStartWave}
          >
            Wave에서 시작하기
          </Button>
        </div>
      )}

      {/* 쇼케이스 콘텐츠 */}
      {!isLoading && !error && showcase && (
        <div className={styles.content}>
          {/* 왼쪽: 갤러리 */}
          <div className={styles.gallery}>
            {/* 메인 이미지 */}
            <div className={styles.mainImage}>
              <img
                src={showcase.result_images[selectedIndex]}
                alt={`${showcase.title} - ${selectedIndex + 1}`}
              />

              {/* 이전/다음 버튼 */}
              {showcase.result_images.length > 1 && (
                <>
                  <button className={styles.navBtnLeft} onClick={handlePrev}>
                    <ChevronLeftIcon />
                  </button>
                  <button className={styles.navBtnRight} onClick={handleNext}>
                    <ChevronRightIcon />
                  </button>
                </>
              )}

              {/* 인디케이터 */}
              <div className={styles.indicator}>
                {selectedIndex + 1} / {showcase.result_images.length}
              </div>
            </div>

            {/* 썸네일 그리드 */}
            {showcase.result_images.length > 1 && (
              <div className={styles.thumbnails}>
                {showcase.result_images.map((url, idx) => (
                  <button
                    key={idx}
                    className={`${styles.thumbnail} ${idx === selectedIndex ? styles.active : ''}`}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <img src={url} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 정보 */}
          <div className={styles.info}>
            <h2 className={styles.title}>{showcase.title}</h2>

            {showcase.description && (
              <p className={styles.description}>{showcase.description}</p>
            )}

            {/* 메타 정보 */}
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <TagIcon />
                <span>카테고리</span>
                <Badge variant="default" size="sm">
                  {CATEGORY_LABELS[showcase.category] || showcase.category}
                </Badge>
              </div>
              {showcase.workflow?.node_count && (
                <div className={styles.metaItem}>
                  <LayersIcon />
                  <span>노드 수</span>
                  <Badge variant="info" size="sm">
                    {showcase.workflow.node_count}개
                  </Badge>
                </div>
              )}
              <div className={styles.metaItem}>
                <ImagesIcon />
                <span>결과물</span>
                <Badge variant="default" size="sm">
                  {showcase.result_images.length}장
                </Badge>
              </div>
            </div>

            {/* 태그 */}
            {showcase.tags && showcase.tags.length > 0 && (
              <div className={styles.tags}>
                {showcase.tags.map((tag, idx) => (
                  <Badge key={idx} variant="default" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* CTA 버튼 */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<RocketIcon />}
              onClick={handleStartWave}
              className={styles.ctaBtn}
            >
              Wave에서 시작하기
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default WaveShowcaseModal;

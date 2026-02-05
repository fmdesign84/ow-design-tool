/**
 * FeaturedWaves - 추천 웨이브(워크플로우) 섹션
 * wave-showcase API에서 활성 쇼케이스 목록을 가져와 표시
 * 클릭 시 쇼케이스 팝업 표시
 */

import React, { useEffect, useState, useCallback } from 'react';
import { SectionCard, Badge } from '../../../../components/common';
import { WaveShowcaseModal } from './WaveShowcaseModal';
import styles from './FeaturedWaves.module.css';

// 노드 아이콘
const NodeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="8" x="2" y="2" rx="2" />
    <rect width="8" height="8" x="14" y="2" rx="2" />
    <rect width="8" height="8" x="8" y="14" rx="2" />
  </svg>
);

// 쇼케이스 타입
interface WaveShowcase {
  id: string;
  workflow_id: string;
  title: string;
  description?: string;
  result_images: string[];
  category: string;
  display_order: number;
  is_active: boolean;
  workflow?: {
    id: string;
    name: string;
    node_count?: number;
  };
}

// 카테고리 라벨
const CATEGORY_LABELS: Record<string, string> = {
  mockup: '목업',
  image: '이미지',
  video: '영상',
  edit: '편집',
  workflow: '워크플로우',
};

interface FeaturedWavesProps {
  onNavigateToWave: (workflowId: string) => void;
}

export const FeaturedWaves: React.FC<FeaturedWavesProps> = ({ onNavigateToWave }) => {
  const [showcases, setShowcases] = useState<WaveShowcase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 쇼케이스 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  // 활성 쇼케이스 로드
  const loadShowcases = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wave-showcase?active=true');
      const data = await res.json();
      if (data.success) {
        setShowcases(data.showcases || []);
      }
    } catch (error) {
      console.error('Failed to fetch showcases:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShowcases();
  }, [loadShowcases]);

  // 카드 클릭 → 쇼케이스 모달 열기
  const handleCardClick = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setShowModal(true);
  };

  // 모달에서 "Wave에서 시작하기" 클릭
  const handleStartWave = (workflowId: string) => {
    setShowModal(false);
    onNavigateToWave(workflowId);
  };

  // 추천 쇼케이스가 없으면 표시하지 않음
  if (!isLoading && showcases.length === 0) {
    return null;
  }

  return (
    <>
      <SectionCard title="추천 웨이브" className={styles.container} animationDelay={0.35}>
        <div className={styles.grid}>
          {isLoading ? (
            // 로딩 스켈레톤
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={styles.skeleton} />
            ))
          ) : (
            showcases.slice(0, 6).map((showcase) => (
              <div
                key={showcase.id}
                className={styles.card}
                onClick={() => handleCardClick(showcase.workflow_id)}
              >
                <div className={styles.cardInner}>
                  {/* 썸네일 이미지 - 첫 번째 결과 이미지 사용 */}
                  {showcase.result_images[0] ? (
                    <img
                      src={showcase.result_images[0]}
                      alt={showcase.title}
                      className={styles.cardImage}
                    />
                  ) : (
                    <div className={styles.cardPlaceholder}>
                      <NodeIcon />
                    </div>
                  )}
                  {/* 오버레이 */}
                  <div className={styles.cardOverlay}>
                    <div className={styles.cardBadges}>
                      <Badge size="sm">
                        {CATEGORY_LABELS[showcase.category] || showcase.category}
                      </Badge>
                      {showcase.workflow?.node_count && (
                        <Badge size="sm">
                          <NodeIcon /> {showcase.workflow.node_count}
                        </Badge>
                      )}
                    </div>
                    <div className={styles.cardName}>{showcase.title}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      {/* 쇼케이스 모달 */}
      {selectedWorkflowId && (
        <WaveShowcaseModal
          workflowId={selectedWorkflowId}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onStartWave={handleStartWave}
        />
      )}
    </>
  );
};

export default FeaturedWaves;

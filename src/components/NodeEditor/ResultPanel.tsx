/**
 * Result Panel
 * 워크플로우 실행 결과 표시 - Wave 스타일 플로팅 아카이브 패널
 * + Supabase imageHistory 연동
 */

import React, { useState } from 'react';
import type { ExecutionResult } from '../../nodes/hooks';
import { OrangeWhaleIcon } from '../common/Icons';
import styles from './ResultPanel.module.css';

// 아이콘 컴포넌트 (인라인 SVG)
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const DownloadAllIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
    <path d="M3 15h3M18 15h3" />
  </svg>
);

const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const ChevronDownIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);


// imageHistory 아이템 타입
interface ImageHistoryItem {
  id: string;
  image: string;
  prompt: string;
  model?: string;
  type: 'image' | 'video' | 'mockup';
  createdAt: Date;
  mockupType?: string;
}

interface ResultPanelProps {
  isOpen: boolean;
  isRunning: boolean;
  results: ExecutionResult[];
  finalOutputs: Record<string, unknown>;
  error: { nodeId: string; message: string } | null;
  duration: number;
  onClose: () => void;
  // imageHistory 관련 props
  imageHistory?: ImageHistoryItem[];
  isLoadingHistory?: boolean;
  onDeleteHistoryItem?: (id: string) => void;
  onRefreshHistory?: () => void;
  // 라이트박스 상태 콜백
  onLightboxChange?: (isOpen: boolean) => void;
}

// 날짜 포맷 (오늘/어제/날짜)
const formatDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) {
    return `오늘 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  if (target.getTime() === yesterday.getTime()) {
    return `어제 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * 결과 값 렌더링
 */
const ResultValue: React.FC<{ value: unknown; label: string }> = ({ value, label }) => {
  if (value === null || value === undefined) {
    return (
      <div className={styles.resultItem}>
        <span className={styles.resultLabel}>{label}</span>
        <span className={styles.resultEmpty}>—</span>
      </div>
    );
  }

  // 이미지/영상 URL은 별도 처리 (프리뷰 섹션에서)
  if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:'))) {
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)/i.test(value) || value.startsWith('data:image');
    const isVideo = /\.(mp4|webm|mov)/i.test(value);

    if (isImage || isVideo) {
      return null; // 프리뷰 섹션에서 처리
    }

    return (
      <div className={styles.resultItem}>
        <span className={styles.resultLabel}>{label}</span>
        <a href={value} target="_blank" rel="noopener noreferrer" className={styles.resultLink}>
          {value.length > 40 ? `${value.substring(0, 40)}...` : value}
        </a>
      </div>
    );
  }

  // JSON 객체
  if (typeof value === 'object') {
    return (
      <div className={styles.resultItem}>
        <span className={styles.resultLabel}>{label}</span>
        <pre className={styles.resultJson}>{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
  }

  // 기본 값
  return (
    <div className={styles.resultItem}>
      <span className={styles.resultLabel}>{label}</span>
      <span className={styles.resultValue}>{String(value)}</span>
    </div>
  );
};

/**
 * 아카이브 패널 컴포넌트 (오른쪽 슬라이드)
 */
const ResultPanel: React.FC<ResultPanelProps> = ({
  isOpen,
  isRunning,
  results,
  finalOutputs,
  error,
  duration,
  onClose,
  imageHistory = [],
  isLoadingHistory = false,
  onDeleteHistoryItem,
  onRefreshHistory,
  onLightboxChange,
}) => {
  const hasResults = results.length > 0 || Object.keys(finalOutputs).length > 0;

  // 접기/펼치기 상태
  const [isExpanded, setIsExpanded] = useState(true);

  // 라이트박스 상태
  const [lightboxItem, setLightboxItem] = useState<ImageHistoryItem | null>(null);

  // 프롬프트 펼침 상태
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  // 라이트박스 열기/닫기 핸들러
  const openLightbox = (item: ImageHistoryItem) => {
    setLightboxItem(item);
    setIsPromptExpanded(false); // 프롬프트 초기화
    onLightboxChange?.(true);
  };

  const closeLightbox = () => {
    setLightboxItem(null);
    onLightboxChange?.(false);
  };

  // 캐러셀 인덱스
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 모든 이미지/영상 결과 추출 (results 배열에서)
  const allMedia: { url: string; type: 'image' | 'video'; nodeId: string }[] = [];

  // results에서 이미지/비디오 추출
  results.forEach((result) => {
    if (result.outputs?.image && typeof result.outputs.image === 'string') {
      allMedia.push({ url: result.outputs.image, type: 'image', nodeId: result.nodeId });
    }
    if (result.outputs?.video && typeof result.outputs.video === 'string') {
      allMedia.push({ url: result.outputs.video, type: 'video', nodeId: result.nodeId });
    }
  });

  // finalOutputs에서도 추출 (중복 아니면)
  if (finalOutputs.image && typeof finalOutputs.image === 'string') {
    if (!allMedia.some(m => m.url === finalOutputs.image)) {
      allMedia.push({ url: finalOutputs.image as string, type: 'image', nodeId: 'final' });
    }
  }
  if (finalOutputs.video && typeof finalOutputs.video === 'string') {
    if (!allMedia.some(m => m.url === finalOutputs.video)) {
      allMedia.push({ url: finalOutputs.video as string, type: 'video', nodeId: 'final' });
    }
  }

  const hasMedia = allMedia.length > 0;
  const currentMedia = allMedia[currentImageIndex] || null;

  // 캐러셀 네비게이션
  const goToPrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  // 단일 다운로드 핸들러
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  // 전체 다운로드 핸들러
  const handleDownloadAll = async () => {
    for (let i = 0; i < allMedia.length; i++) {
      const media = allMedia[i];
      const ext = media.type === 'video' ? 'mp4' : 'png';
      await handleDownload(media.url, `wave-${Date.now()}-${i + 1}.${ext}`);
      // 약간의 딜레이를 줘서 브라우저가 처리할 수 있게
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  // 새 탭에서 열기
  const handleOpenInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  // 휠 이벤트 전파 방지 (ReactFlow 줌 방지)
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div
        className={`${styles.archivePanel} ${isOpen ? styles.open : ''}`}
        onWheel={handleWheel}
      >
        {/* 패널 헤더 (클릭으로 접기/펼치기) */}
        <div className={styles.archiveHeader} onClick={() => setIsExpanded(!isExpanded)}>
          <div className={styles.archiveTitle}>
            <GridIcon />
            <span>아카이브</span>
            <span className={styles.archiveCount}>{imageHistory.length}</span>
          </div>
          <div className={styles.headerActions}>
            {onRefreshHistory && (
              <button
                className={styles.refreshBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onRefreshHistory();
                }}
                disabled={isLoadingHistory}
                title="새로고침"
              >
                <RefreshIcon />
              </button>
            )}
            <ChevronDownIcon expanded={isExpanded} />
          </div>
        </div>

        {/* 패널 컨텐츠 (접을 수 있음) */}
        {isExpanded && (
        <div className={styles.archiveContent}>
          {/* 실행 중 - 고래 애니메이션 */}
          {isRunning && (
            <div className={styles.runningState}>
              <div className={styles.whaleAnimation}>
                <OrangeWhaleIcon size={56} />
              </div>
              <p className={styles.runningText}>생성 중...</p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} />
              </div>
            </div>
          )}

          {/* 에러 */}
          {!isRunning && error && (
            <div className={styles.errorState}>
              <span className={styles.errorBadge}>⚠️ 오류</span>
              <p className={styles.errorMessage}>{error.message}</p>
              {error.nodeId && (
                <p className={styles.errorNode}>노드: {error.nodeId}</p>
              )}
            </div>
          )}

          {/* 성공 결과 */}
          {!isRunning && !error && hasResults && (
            <>
              {/* 상단 완료 배지 */}
              <div className={styles.completeBadge}>
                <span className={styles.completeIcon}><CheckIcon /></span>
                <span>완료</span>
                <span className={styles.completeDuration}>{(duration / 1000).toFixed(1)}s</span>
              </div>

              {/* 미디어 프리뷰 (캐러셀) */}
              {hasMedia && currentMedia && (
                <div className={styles.mediaPreview}>
                  {/* 이미지/비디오 컨테이너 */}
                  <div className={styles.mediaContainer}>
                    {currentMedia.type === 'image' ? (
                      <img src={currentMedia.url} alt="Generated" className={styles.previewImage} />
                    ) : (
                      <video src={currentMedia.url} controls className={styles.previewVideo} />
                    )}

                    {/* 호버 오버레이 액션 */}
                    <div className={styles.mediaHoverOverlay}>
                      <button
                        className={styles.hoverActionBtn}
                        onClick={() => handleDownload(
                          currentMedia.url,
                          `wave-${Date.now()}.${currentMedia.type === 'video' ? 'mp4' : 'png'}`
                        )}
                        title="다운로드"
                      >
                        <DownloadIcon />
                      </button>
                      <button
                        className={styles.hoverActionBtn}
                        onClick={() => handleOpenInNewTab(currentMedia.url)}
                        title="새 탭에서 보기"
                      >
                        <ExternalLinkIcon />
                      </button>
                    </div>

                    {/* 캐러셀 네비게이션 (2개 이상일 때만) */}
                    {allMedia.length > 1 && (
                      <>
                        <button className={`${styles.carouselBtn} ${styles.prev}`} onClick={goToPrev}>
                          <ChevronLeftIcon />
                        </button>
                        <button className={`${styles.carouselBtn} ${styles.next}`} onClick={goToNext}>
                          <ChevronRightIcon />
                        </button>
                        <div className={styles.carouselIndicator}>
                          {currentImageIndex + 1} / {allMedia.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* 다운로드 버튼들 */}
                  <div className={styles.mediaActions}>
                    <button
                      className={`${styles.mediaBtn} ${styles.primary}`}
                      onClick={() => handleDownload(
                        currentMedia.url,
                        `wave-${Date.now()}.${currentMedia.type === 'video' ? 'mp4' : 'png'}`
                      )}
                      title="현재 이미지 다운로드"
                    >
                      <DownloadIcon />
                      <span>단일 저장</span>
                    </button>
                    {allMedia.length > 1 && (
                      <button
                        className={`${styles.mediaBtn} ${styles.secondary}`}
                        onClick={handleDownloadAll}
                        title="전체 다운로드"
                      >
                        <DownloadAllIcon />
                        <span>전체 저장 ({allMedia.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 메타데이터 */}
              <div className={styles.metaSection}>
                {Object.entries(finalOutputs)
                  .filter(([key]) => key !== 'image' && key !== 'video')
                  .map(([key, value]) => (
                    <ResultValue key={key} label={key} value={value} />
                  ))}
              </div>

              {/* 노드별 결과 */}
              {results.length > 0 && (
                <details className={styles.detailsSection}>
                  <summary className={styles.detailsSummary}>
                    노드별 결과 ({results.length})
                  </summary>
                  <div className={styles.nodeResults}>
                    {results.map((result, index) => (
                      <div key={index} className={styles.nodeResultItem}>
                        <div className={styles.nodeResultHeader}>
                          <span className={`${styles.nodeStatusDot} ${result.error ? styles.error : ''}`} />
                          <span className={styles.nodeResultName}>{result.nodeId}</span>
                          <span className={styles.nodeResultTime}>
                            {(result.duration / 1000).toFixed(1)}s
                          </span>
                        </div>
                        {result.error && (
                          <p className={styles.nodeResultError}>{result.error.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}

          {/* 구분선 - 실행 결과가 있을 때만 */}
          {hasResults && imageHistory.length > 0 && (
            <div className={styles.sectionDivider} />
          )}

          {/* imageHistory 목록 */}
          {imageHistory.length > 0 && (
            <div className={styles.historySection}>
              <div className={styles.historyTitle}>전체 히스토리</div>
              <div className={styles.historyList}>
                {imageHistory.map((item) => (
                  <div key={item.id} className={styles.historyItem}>
                    <div className={styles.historyDate}>
                      <span>{formatDate(item.createdAt)}</span>
                      {onDeleteHistoryItem && (
                        <button
                          className={styles.historyDeleteBtn}
                          onClick={() => onDeleteHistoryItem(item.id)}
                          title="삭제"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                    <div
                      className={styles.historyThumbnail}
                      onClick={() => openLightbox(item)}
                    >
                      {item.type === 'video' ? (
                        <>
                          <video
                            src={item.image}
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                            onMouseLeave={(e) => {
                              const video = e.target as HTMLVideoElement;
                              video.pause();
                              video.currentTime = 0;
                            }}
                          />
                          <div className={styles.videoPlayIcon}>▶</div>
                        </>
                      ) : (
                        <img src={item.image} alt={item.prompt} />
                      )}
                      {item.type === 'mockup' && (
                        <span className={styles.typeBadge}>목업</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 히스토리 로딩 중 */}
          {isLoadingHistory && imageHistory.length === 0 && (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <span>히스토리 로딩 중...</span>
            </div>
          )}

          {/* 결과 없음 */}
          {!isRunning && !error && !hasResults && imageHistory.length === 0 && !isLoadingHistory && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎨</span>
              <p>워크플로우를 실행하면<br />결과가 여기에 표시됩니다</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* 라이트박스 */}
      {lightboxItem && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={closeLightbox}>
              <CloseIcon />
            </button>
            {lightboxItem.type === 'video' ? (
              <video
                src={lightboxItem.image}
                controls
                autoPlay
                loop
                className={styles.lightboxVideo}
              />
            ) : (
              <img src={lightboxItem.image} alt={lightboxItem.prompt} className={styles.lightboxImage} />
            )}
            <div className={styles.lightboxInfo}>
              {/* 프롬프트 - 기본 접힘 */}
              {lightboxItem.prompt && (
                <div className={styles.lightboxPromptWrapper}>
                  {isPromptExpanded ? (
                    <p className={styles.lightboxPrompt}>{lightboxItem.prompt}</p>
                  ) : (
                    <p className={styles.lightboxPromptCollapsed}>
                      {lightboxItem.prompt.length > 50
                        ? `${lightboxItem.prompt.substring(0, 50)}...`
                        : lightboxItem.prompt}
                    </p>
                  )}
                  {lightboxItem.prompt.length > 50 && (
                    <button
                      className={styles.promptToggleBtn}
                      onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                    >
                      {isPromptExpanded ? '접기' : '더보기'}
                    </button>
                  )}
                </div>
              )}
              <div className={styles.lightboxActions}>
                <button
                  className={styles.lightboxBtn}
                  onClick={() => handleDownload(
                    lightboxItem.image,
                    `wave-${Date.now()}.${lightboxItem.type === 'video' ? 'mp4' : 'png'}`
                  )}
                >
                  <DownloadIcon />
                  <span>다운로드</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultPanel;

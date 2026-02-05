/**
 * 웨이브 리스트 패널
 * 저장된 워크플로우 목록 표시 및 관리
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useWorkflowStore, WorkflowListItem } from '../../stores/useWorkflowStore';
import styles from './WaveListPanel.module.css';

// 아이콘
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6" />
    <path d="M21 13a9 9 0 1 1-3-7.7L21 8" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
  </svg>
);

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

// 날짜 포맷 (YY-MM-DD)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface WaveListPanelProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const WaveListPanel: React.FC<WaveListPanelProps> = ({ isExpanded, onToggleExpand }) => {
  const {
    savedWorkflows,
    session,
    isLoading,
    fetchWorkflows,
    loadWorkflow,
    deleteWorkflow,
    renameWorkflow,
    toggleFeatured,
  } = useWorkflowStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 컴포넌트 마운트 시 목록 로드
  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  // 이름 편집 시작
  const handleStartEdit = useCallback((workflow: WorkflowListItem) => {
    setEditingId(workflow.id);
    setEditName(workflow.name);
  }, []);

  // 이름 편집 완료
  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await renameWorkflow(editingId, editName.trim());
      setEditingId(null);
    } catch (error) {
      console.error('이름 변경 실패:', error);
    }
  }, [editingId, editName, renameWorkflow]);

  // 이름 편집 취소
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName('');
  }, []);

  // Enter 키로 저장
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  // 삭제 확인
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteWorkflow(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  }, [deleteConfirmId, deleteWorkflow]);

  // 추천 토글
  const handleToggleFeatured = useCallback(async (workflow: WorkflowListItem) => {
    try {
      await toggleFeatured(workflow.id, !workflow.is_featured);
    } catch (error) {
      console.error('추천 토글 실패:', error);
    }
  }, [toggleFeatured]);

  // 워크플로우 로드
  const handleLoad = useCallback(async (workflow: WorkflowListItem) => {
    try {
      await loadWorkflow(workflow.id);
    } catch (error) {
      console.error('로드 실패:', error);
    }
  }, [loadWorkflow]);

  return (
    <div className={styles.panel}>
      {/* 헤더 */}
      <div className={styles.header} onClick={onToggleExpand}>
        <div className={styles.headerTitle}>
          <span className={styles.headerIcon}><ListIcon /></span>
          <span>웨이브 리스트</span>
          <span className={styles.count}>{savedWorkflows.length}</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshBtn}
            onClick={(e) => {
              e.stopPropagation();
              fetchWorkflows();
            }}
            title="새로고침"
            disabled={isLoading}
          >
            <RefreshIcon />
          </button>
          <ChevronIcon expanded={isExpanded} />
        </div>
      </div>

      {/* 목록 */}
      {isExpanded && (
        <div className={styles.list}>
          {savedWorkflows.length === 0 ? (
            <div className={styles.emptyState}>
              <p>저장된 워크플로우가 없습니다</p>
              <span>워크플로우를 저장하면 여기에 표시됩니다</span>
            </div>
          ) : (
            savedWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className={`${styles.item} ${session.id === workflow.id ? styles.active : ''} ${editingId === workflow.id ? styles.editing : ''}`}
              >
                {/* 삭제 확인 오버레이 */}
                {deleteConfirmId === workflow.id && (
                  <div className={styles.deleteConfirm}>
                    <p>삭제하시겠습니까?</p>
                    <div className={styles.deleteActions}>
                      <button
                        className={styles.deleteYes}
                        onClick={handleDeleteConfirm}
                      >
                        삭제
                      </button>
                      <button
                        className={styles.deleteNo}
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {/* 메인 콘텐츠 */}
                <div className={styles.itemContent}>
                  {/* 이름 영역 */}
                  <div className={styles.nameRow}>
                    {editingId === workflow.id ? (
                      <div className={styles.editName}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                        <button onClick={handleSaveEdit}>
                          <CheckIcon />
                        </button>
                        <button onClick={handleCancelEdit}>
                          <CloseIcon />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className={styles.name}>{workflow.name}</span>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleStartEdit(workflow)}
                          title="이름 변경"
                        >
                          <EditIcon />
                        </button>
                      </>
                    )}
                  </div>

                  {/* 메타 정보 */}
                  <div className={styles.meta}>
                    <span className={styles.date}>{formatDate(workflow.updated_at)}</span>
                    <span className={styles.nodeCount}>{workflow.node_count}개 노드</span>
                  </div>
                </div>

                {/* 액션 버튼 - 편집 모드가 아닐 때만 표시 */}
                {editingId !== workflow.id && (
                  <div className={styles.itemActions}>
                    <button
                      className={styles.loadBtn}
                      onClick={() => handleLoad(workflow)}
                      title="불러오기"
                    >
                      <PlayIcon />
                    </button>
                    <button
                      className={`${styles.starBtn} ${workflow.is_featured ? styles.featured : ''}`}
                      onClick={() => handleToggleFeatured(workflow)}
                      title={workflow.is_featured ? '추천 해제' : '추천하기'}
                    >
                      <StarIcon filled={workflow.is_featured} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteConfirmId(workflow.id)}
                      title="삭제"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WaveListPanel;

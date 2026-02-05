/**
 * 워크플로우 저장 다이얼로그
 * - 저장: 기존 워크플로우 덮어쓰기 (내 워크플로우만)
 * - 다른 이름으로 저장: 새 워크플로우로 생성
 */

import React, { useState, useEffect, useCallback } from 'react';
import styles from './SaveWorkflowDialog.module.css';

// 아이콘
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export type SaveMode = 'save' | 'saveAs';

interface SaveWorkflowDialogProps {
  isOpen: boolean;
  defaultName: string;
  isSaving: boolean;
  // 추천 워크플로우에서 온 경우 (저장 불가, 다른 이름으로만 저장 가능)
  isFromFeatured: boolean;
  // 세션 ID 유무 (null이면 첫 저장)
  hasSessionId: boolean;
  // 네비게이션 모드 (홈 이동 시)
  isNavigating?: boolean;
  // 콜백
  onSave: (name: string) => void;
  onSaveAs: (name: string) => void;
  onDiscard: () => void;
  onCancel: () => void;
}

const SaveWorkflowDialog: React.FC<SaveWorkflowDialogProps> = ({
  isOpen,
  defaultName,
  isSaving,
  isFromFeatured,
  hasSessionId,
  isNavigating = false,
  onSave,
  onSaveAs,
  onDiscard,
  onCancel,
}) => {
  const [name, setName] = useState(defaultName);
  const [mode, setMode] = useState<SaveMode>('save');

  // 첫 저장이거나 추천에서 온 경우 -> 항상 saveAs 모드
  const isFirstSave = !hasSessionId;
  const forceSaveAs = isFirstSave || isFromFeatured;

  // 다이얼로그가 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setName(defaultName || '새 워크플로우');
      setMode(forceSaveAs ? 'saveAs' : 'save');
    }
  }, [isOpen, defaultName, forceSaveAs]);

  // 저장 핸들러
  const handleSave = useCallback(() => {
    if (!name.trim()) return;

    if (mode === 'saveAs' || forceSaveAs) {
      onSaveAs(name.trim());
    } else {
      onSave(name.trim());
    }
  }, [name, mode, forceSaveAs, onSave, onSaveAs]);

  // Enter 키로 저장
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSave();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [handleSave, isSaving, onCancel]);

  if (!isOpen) return null;

  // 타이틀 결정
  const getTitle = () => {
    if (isFromFeatured) return '다른 이름으로 저장';
    if (isFirstSave) return '워크플로우 저장';
    if (isNavigating) return '변경사항 저장';
    return mode === 'saveAs' ? '다른 이름으로 저장' : '워크플로우 저장';
  };

  // 힌트 메시지
  const getHint = () => {
    if (isFromFeatured) {
      return '추천 워크플로우는 수정할 수 없습니다. 새 워크플로우로 저장됩니다.';
    }
    return '실행 결과 이미지에 워크플로우가 포함되어 저장됩니다.';
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.title}>{getTitle()}</h2>
          <button className={styles.closeBtn} onClick={onCancel}>
            <CloseIcon />
          </button>
        </div>

        {/* 본문 */}
        <div className={styles.body}>
          {/* 이름 입력 - 첫 저장이거나 saveAs 모드일 때 */}
          {(forceSaveAs || mode === 'saveAs') && (
            <>
              <label className={styles.label}>워크플로우 이름</label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="나의 워크플로우"
                autoFocus
                disabled={isSaving}
              />
            </>
          )}

          {/* 덮어쓰기 확인 - 기존 워크플로우 저장 시 */}
          {!forceSaveAs && mode === 'save' && (
            <p className={styles.message}>
              <strong>{defaultName}</strong> 워크플로우를 덮어씁니다.<br />
              변경사항을 저장하시겠습니까?
            </p>
          )}

          {/* 모드 전환 버튼 - 기존 워크플로우가 있고 추천이 아닐 때 */}
          {!forceSaveAs && (
            <div className={styles.modeSwitch}>
              <button
                className={`${styles.modeBtn} ${mode === 'save' ? styles.active : ''}`}
                onClick={() => setMode('save')}
                disabled={isSaving}
              >
                <SaveIcon />
                저장 (덮어쓰기)
              </button>
              <button
                className={`${styles.modeBtn} ${mode === 'saveAs' ? styles.active : ''}`}
                onClick={() => setMode('saveAs')}
                disabled={isSaving}
              >
                <CopyIcon />
                다른 이름으로 저장
              </button>
            </div>
          )}

          <div className={styles.hint}>
            <span className={styles.hintIcon}>💡</span>
            <span>{getHint()}</span>
          </div>
        </div>

        {/* 푸터 */}
        <div className={styles.footer}>
          {isNavigating ? (
            <>
              <button
                className={styles.discardBtn}
                onClick={onDiscard}
                disabled={isSaving}
              >
                저장 안 함
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
              >
                {isSaving ? (
                  <span className={styles.spinner} />
                ) : mode === 'saveAs' || forceSaveAs ? (
                  <CopyIcon />
                ) : (
                  <SaveIcon />
                )}
                <span>{isSaving ? '저장 중...' : '저장'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.cancelBtn}
                onClick={onCancel}
                disabled={isSaving}
              >
                취소
              </button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
              >
                {isSaving ? (
                  <span className={styles.spinner} />
                ) : mode === 'saveAs' || forceSaveAs ? (
                  <CopyIcon />
                ) : (
                  <SaveIcon />
                )}
                <span>{isSaving ? '저장 중...' : '저장'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveWorkflowDialog;

/**
 * Orange Wave Toolbar
 * 노드 에디터 상단 툴바 - 브랜딩, 줌, 액션 버튼
 */

import React from 'react';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  workflowName: string;
  isRunning: boolean;
  onRun: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onTogglePalette?: () => void;
  isPaletteOpen?: boolean;
  embedded?: boolean;
}

/**
 * Orange Wave 툴바 컴포넌트
 */
const Toolbar: React.FC<ToolbarProps> = ({
  workflowName,
  isRunning,
  onRun,
  onSave,
  onLoad,
  onClear,
  onZoomIn,
  onZoomOut,
  onFitView,
  onTogglePalette,
  isPaletteOpen = true,
  embedded = false,
}) => {
  return (
    <div className={`${styles.toolbar} ${embedded ? styles.embedded : ''}`}>
      {/* 왼쪽: 브랜드 로고 + 팔레트 토글 */}
      <div className={styles.left}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🌊</span>
          <span className={styles.brandName}>Orange Wave</span>
          <span className={styles.betaBadge}>Beta</span>
        </div>
        {onTogglePalette && (
          <button
            className={`${styles.iconButton} ${isPaletteOpen ? styles.active : ''}`}
            onClick={onTogglePalette}
            title={isPaletteOpen ? '노드 팔레트 숨기기' : '노드 팔레트 보기'}
          >
            ☰
          </button>
        )}
        <div className={styles.divider} />
        <span className={styles.workflowName}>{workflowName || '새 워크플로우'}</span>
      </div>

      {/* 가운데: 줌 컨트롤 */}
      <div className={styles.center}>
        <button
          className={styles.iconButton}
          onClick={onZoomOut}
          title="축소"
        >
          −
        </button>
        <button
          className={styles.iconButton}
          onClick={onFitView}
          title="화면에 맞추기"
        >
          ⊡
        </button>
        <button
          className={styles.iconButton}
          onClick={onZoomIn}
          title="확대"
        >
          +
        </button>
      </div>

      {/* 오른쪽: 액션 버튼 */}
      <div className={styles.right}>
        <button
          className={styles.iconButton}
          onClick={onLoad}
          title="불러오기"
        >
          📂
        </button>
        <button
          className={styles.iconButton}
          onClick={onSave}
          title="저장"
        >
          💾
        </button>
        <button
          className={styles.iconButton}
          onClick={onClear}
          title="초기화"
        >
          🗑️
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.runButton} ${isRunning ? styles.running : ''}`}
          onClick={onRun}
          disabled={isRunning}
          title="워크플로우 실행"
        >
          {isRunning ? (
            <>
              <span className={styles.spinner} />
              실행 중
            </>
          ) : (
            <>
              <span className={styles.playIcon}>▶</span>
              실행
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

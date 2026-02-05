/**
 * ProgressBar - 진행률 바 컴포넌트
 * 진행 상태 표시
 */

import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  /** 진행률 (0-100) */
  value: number;
  /** 최대값 */
  max?: number;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 색상 변형 */
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** 레이블 표시 */
  showLabel?: boolean;
  /** 레이블 위치 */
  labelPosition?: 'inside' | 'outside' | 'top';
  /** 애니메이션 */
  animated?: boolean;
  /** 줄무늬 효과 */
  striped?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  labelPosition = 'inside',
  animated = false,
  striped = false,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const containerClasses = [
    styles.container,
    styles[size],
    labelPosition === 'top' ? styles.labelTop : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const barClasses = [
    styles.bar,
    styles[variant],
    animated ? styles.animated : '',
    striped ? styles.striped : '',
  ]
    .filter(Boolean)
    .join(' ');

  const label = `${Math.round(percentage)}%`;

  return (
    <div className={containerClasses}>
      {showLabel && labelPosition === 'top' && (
        <div className={styles.labelOutside}>
          <span className={styles.labelText}>{label}</span>
        </div>
      )}

      <div className={styles.track}>
        <div
          className={barClasses}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {showLabel && labelPosition === 'inside' && percentage > 10 && (
            <span className={styles.labelInside}>{label}</span>
          )}
        </div>
      </div>

      {showLabel && labelPosition === 'outside' && (
        <span className={styles.labelOutside}>{label}</span>
      )}
    </div>
  );
};

export default ProgressBar;

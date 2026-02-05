/**
 * Tooltip - 툴팁 컴포넌트
 * 호버 시 정보 표시
 */

import React, { useState } from 'react';
import styles from './Tooltip.module.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** 툴팁 내용 */
  content: React.ReactNode;
  /** 트리거 요소 */
  children: React.ReactNode;
  /** 표시 위치 */
  placement?: TooltipPlacement;
  /** 표시 지연 (ms) */
  delay?: number;
  /** 비활성화 */
  disabled?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 200,
  disabled = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const containerClasses = [styles.container, className].filter(Boolean).join(' ');
  const tooltipClasses = [
    styles.tooltip,
    styles[placement],
    isVisible ? styles.visible : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {!disabled && (
        <div className={tooltipClasses} role="tooltip">
          <div className={styles.content}>{content}</div>
          <div className={styles.arrow} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;

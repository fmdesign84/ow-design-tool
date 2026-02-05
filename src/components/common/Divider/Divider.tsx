/**
 * Divider - 구분선 컴포넌트
 */

import React from 'react';
import styles from './Divider.module.css';

export interface DividerProps {
  /** 방향 */
  orientation?: 'horizontal' | 'vertical';
  /** 텍스트 (중앙에 표시) */
  children?: React.ReactNode;
  /** 여백 */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** 추가 클래스명 */
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  children,
  spacing = 'md',
  className = '',
}) => {
  const dividerClasses = [
    styles.divider,
    styles[orientation],
    styles[`spacing-${spacing}`],
    children ? styles.withText : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (children) {
    return (
      <div className={dividerClasses}>
        <span className={styles.line} />
        <span className={styles.text}>{children}</span>
        <span className={styles.line} />
      </div>
    );
  }

  return <div className={dividerClasses} role="separator" />;
};

export default Divider;

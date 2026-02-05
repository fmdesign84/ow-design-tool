/**
 * Badge - 공용 뱃지 컴포넌트
 */

import React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** 뱃지 텍스트 */
  children: React.ReactNode;
  /** 뱃지 스타일 변형 */
  variant?: BadgeVariant;
  /** 뱃지 크기 */
  size?: BadgeSize;
  /** 클릭 가능 여부 */
  clickable?: boolean;
  /** 활성 상태 (clickable일 때) */
  active?: boolean;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 클래스명 */
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  clickable = false,
  active = false,
  onClick,
  className = '',
}) => {
  const classNames = [
    styles.badge,
    styles[variant],
    styles[size],
    clickable ? styles.clickable : '',
    active ? styles.active : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (clickable) {
    return (
      <button type="button" className={classNames} onClick={onClick}>
        {children}
      </button>
    );
  }

  return <span className={classNames}>{children}</span>;
};

export default Badge;

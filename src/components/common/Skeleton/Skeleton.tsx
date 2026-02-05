/**
 * Skeleton - 로딩 스켈레톤 컴포넌트
 * 콘텐츠 로딩 중 플레이스홀더
 */

import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  /** 너비 */
  width?: string | number;
  /** 높이 */
  height?: string | number;
  /** 모양 */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** 애니메이션 */
  animation?: 'pulse' | 'wave' | 'none';
  /** 추가 클래스명 */
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  animation = 'pulse',
  className = '',
}) => {
  const skeletonClasses = [
    styles.skeleton,
    styles[variant],
    animation !== 'none' ? styles[animation] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return <div className={skeletonClasses} style={style} />;
};

// 프리셋 스켈레톤
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`${styles.textGroup} ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = { sm: 32, md: 40, lg: 48 };
  return (
    <Skeleton
      variant="circular"
      width={sizes[size]}
      height={sizes[size]}
      className={className}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${styles.cardSkeleton} ${className}`}>
    <Skeleton variant="rectangular" height={120} />
    <div className={styles.cardContent}>
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="40%" />
    </div>
  </div>
);

export default Skeleton;

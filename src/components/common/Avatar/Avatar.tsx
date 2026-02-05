/**
 * Avatar - 사용자 아바타 컴포넌트
 * 프로필 이미지 또는 이니셜 표시
 */

import React from 'react';
import styles from './Avatar.module.css';

export interface AvatarProps {
  /** 이미지 URL */
  src?: string;
  /** 대체 텍스트 (이미지 없을 때 이니셜로 표시) */
  alt?: string;
  /** 크기 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 모양 */
  shape?: 'circle' | 'square';
  /** 온라인 상태 표시 */
  status?: 'online' | 'offline' | 'busy' | 'away';
  /** 추가 클래스명 */
  className?: string;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  shape = 'circle',
  status,
  className = '',
}) => {
  const containerClasses = [
    styles.avatar,
    styles[size],
    styles[shape],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const initials = alt ? getInitials(alt) : '?';

  return (
    <div className={containerClasses}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = parent.querySelector(`.${styles.fallback}`) as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <span className={styles.fallback} style={{ display: src ? 'none' : 'flex' }}>
        {initials}
      </span>

      {status && (
        <span className={`${styles.status} ${styles[`status-${status}`]}`} />
      )}
    </div>
  );
};

export default Avatar;

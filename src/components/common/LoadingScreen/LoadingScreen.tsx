/**
 * LoadingScreen - 전체 화면 로딩 컴포넌트
 */

import React from 'react';
import styles from './LoadingScreen.module.css';

export interface LoadingScreenProps {
  /** 로딩 메시지 */
  message?: string;
  /** 전체 화면 여부 */
  fullScreen?: boolean;
  /** 스피너 크기 */
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = '로딩 중...',
  fullScreen = true,
  size = 'md',
}) => {
  const containerClass = fullScreen ? styles.fullScreen : styles.container;

  return (
    <div className={containerClass}>
      <div className={styles.content}>
        <div className={`${styles.spinner} ${styles[size]}`} />
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default LoadingScreen;

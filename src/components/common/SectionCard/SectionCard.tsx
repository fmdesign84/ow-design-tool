/**
 * SectionCard - 홈 화면 섹션 카드 공용 컴포넌트
 * QuickActions, FeaturedGallery, IdeasSection 등에서 공통으로 사용
 */

import React from 'react';
import styles from './SectionCard.module.css';

interface SectionCardProps {
  /** 섹션 제목 */
  title: string;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
  /** 추가 클래스명 */
  className?: string;
  /** 애니메이션 딜레이 (초 단위) */
  animationDelay?: number;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  className = '',
  animationDelay = 0.3,
}) => {
  return (
    <section
      className={`${styles.section} ${className}`}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionCard}>{children}</div>
    </section>
  );
};

export default SectionCard;

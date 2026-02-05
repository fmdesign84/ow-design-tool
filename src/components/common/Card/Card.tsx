/**
 * Card - 범용 카드 컴포넌트
 * 공용 카드 UI
 */

import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /** 카드 내용 */
  children: React.ReactNode;
  /** 카드 제목 */
  title?: string;
  /** 카드 부제목 */
  subtitle?: string;
  /** 우측 상단 액션 영역 */
  extra?: React.ReactNode;
  /** 헤더 영역 (title 대신 커스텀 헤더) */
  header?: React.ReactNode;
  /** 푸터 영역 */
  footer?: React.ReactNode;
  /** 패딩 없음 */
  noPadding?: boolean;
  /** 호버 효과 */
  hoverable?: boolean;
  /** 클릭 가능 */
  clickable?: boolean;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 클래스명 */
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  extra,
  header,
  footer,
  noPadding = false,
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
}) => {
  const cardClasses = [
    styles.card,
    noPadding ? styles.noPadding : '',
    hoverable || clickable ? styles.hoverable : '',
    clickable ? styles.clickable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const hasHeader = title || subtitle || extra || header;

  const CardWrapper = clickable ? 'button' : 'div';

  return (
    <CardWrapper
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      type={clickable ? 'button' : undefined}
    >
      {hasHeader && (
        <div className={styles.header}>
          {header || (
            <>
              <div className={styles.headerText}>
                {title && <h3 className={styles.title}>{title}</h3>}
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
              </div>
              {extra && <div className={styles.extra}>{extra}</div>}
            </>
          )}
        </div>
      )}

      <div className={styles.body}>{children}</div>

      {footer && <div className={styles.footer}>{footer}</div>}
    </CardWrapper>
  );
};

export default Card;

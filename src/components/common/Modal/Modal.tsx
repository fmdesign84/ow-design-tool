/**
 * Modal - 공용 모달 컴포넌트
 */

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 모달 제목 */
  title?: string;
  /** 모달 크기 */
  size?: ModalSize;
  /** 오버레이 클릭 시 닫기 */
  closeOnOverlayClick?: boolean;
  /** ESC 키로 닫기 */
  closeOnEsc?: boolean;
  /** 닫기 버튼 표시 */
  showCloseButton?: boolean;
  /** 자식 요소 */
  children: React.ReactNode;
  /** 푸터 요소 */
  footer?: React.ReactNode;
  /** 추가 클래스명 */
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  children,
  footer,
  className = '',
}) => {
  // ESC 키 핸들링
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEsc, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // 오버레이 클릭 핸들링
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${styles[size]} ${className}`}>
        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {showCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="닫기"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* 본문 */}
        <div className={styles.body}>{children}</div>

        {/* 푸터 */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;

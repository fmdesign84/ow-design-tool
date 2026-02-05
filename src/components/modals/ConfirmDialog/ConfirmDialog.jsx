import { useEffect, useState } from 'react';
import styles from './ConfirmDialog.module.css';

// 체크 아이콘 (등록/저장용) - 왼쪽 아래부터 그려지도록 path 방향 수정
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l5 5L20 6" />
  </svg>
);

// 경고 아이콘 (위험용)
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// 휴지통 아이콘 (삭제용)
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

/**
 * 확인 다이얼로그 컴포넌트
 */
const ConfirmDialog = ({
  isOpen,
  message = '진행하시겠습니까?',
  confirmedMessage = '',
  onConfirm,
  onCancel,
  confirmText = '네',
  cancelText = '아니요',
  variant = 'default',
  showIcon = true
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isConfirming) {
        onCancel?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isConfirming]);

  // 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsConfirming(false); // 열릴 때 상태 리셋
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 확인 버튼 클릭 - 애니메이션 후 콜백 실행
  const handleConfirm = () => {
    if (isConfirming) return;

    setIsConfirming(true);

    // 애니메이션 후 실행
    setTimeout(() => {
      onConfirm?.();
    }, 400);
  };

  if (!isOpen) return null;

  // 아이콘 선택
  const renderIcon = () => {
    if (variant === 'delete') return <TrashIcon />;
    if (variant === 'danger') return <AlertIcon />;
    return <CheckIcon />;
  };

  const iconClasses = [
    styles.iconWrapper,
    variant === 'danger' ? styles.dangerIcon : '',
    variant === 'delete' ? styles.deleteIcon : '',
    variant === 'warning' ? styles.warningIcon : '',
    isConfirming && variant === 'default' ? styles.confirmed : '',
    isConfirming && variant === 'warning' ? styles.confirmedWarning : '',
    isConfirming && variant === 'delete' ? styles.confirmedDelete : '',
    isConfirming && variant === 'danger' ? styles.confirmedWarning : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.overlay} onClick={isConfirming ? undefined : onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {showIcon && (
          <div className={iconClasses}>
            {renderIcon()}
          </div>
        )}
        <p className={`${styles.message} ${isConfirming && confirmedMessage ? (variant === 'delete' || variant === 'danger' ? styles.confirmedMessageDelete : (variant === 'warning' ? styles.confirmedMessageWarning : styles.confirmedMessage)) : ''}`}>
          {isConfirming && confirmedMessage ? confirmedMessage : message}
        </p>
        <div className={styles.buttons}>
          {cancelText && (
            <button
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={isConfirming}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`${styles.confirmBtn} ${variant === 'danger' ? styles.danger : ''}`}
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

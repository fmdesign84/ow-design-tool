/**
 * IconButton - 아이콘 버튼 컴포넌트
 * 아이콘만 있는 버튼
 */

import React from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 아이콘 (children으로 전달) */
  children: React.ReactNode;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 변형 */
  variant?: 'default' | 'ghost' | 'primary';
  /** 둥근 모양 */
  rounded?: boolean;
  /** 접근성 라벨 */
  'aria-label': string;
  /** 추가 클래스명 */
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  size = 'md',
  variant = 'default',
  rounded = false,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    styles.iconButton,
    styles[size],
    styles[variant],
    rounded ? styles.rounded : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default IconButton;

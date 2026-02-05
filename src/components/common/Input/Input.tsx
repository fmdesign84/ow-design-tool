/**
 * Input - 공용 입력 컴포넌트
 */

import React, { forwardRef, useId } from 'react';
import styles from './Input.module.css';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 입력 필드 크기 */
  size?: InputSize;
  /** 에러 상태 */
  error?: boolean;
  /** 에러 메시지 */
  errorMessage?: string;
  /** 라벨 */
  label?: string;
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: React.ReactNode;
  /** 전체 너비 사용 */
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      error = false,
      errorMessage,
      label,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const wrapperClassNames = [
      styles.wrapper,
      fullWidth ? styles.fullWidth : '',
    ]
      .filter(Boolean)
      .join(' ');

    const inputWrapperClassNames = [
      styles.inputWrapper,
      styles[size],
      error ? styles.error : '',
      disabled ? styles.disabled : '',
      leftIcon ? styles.hasLeftIcon : '',
      rightIcon ? styles.hasRightIcon : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClassNames}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <div className={inputWrapperClassNames}>
          {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={styles.input}
            disabled={disabled}
            {...props}
          />
          {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
        </div>
        {error && errorMessage && (
          <span className={styles.errorMessage}>{errorMessage}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

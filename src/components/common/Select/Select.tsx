/**
 * Select - 드롭다운 선택 컴포넌트
 * 공용 셀렉트 박스
 */

import React, { useEffect, useRef, useState } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** 옵션 목록 */
  options: SelectOption[];
  /** 현재 선택된 값 */
  value?: string;
  /** 값 변경 핸들러 */
  onChange: (value: string) => void;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 비활성화 */
  disabled?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** 전체 너비 */
  fullWidth?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  size = 'md',
  disabled = false,
  error = false,
  fullWidth = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const enabledOptions = options.filter((opt) => !opt.disabled);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const option = enabledOptions[focusedIndex];
          if (option) handleSelect(option.value);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => Math.min(prev + 1, enabledOptions.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const containerClasses = [
    styles.container,
    styles[size],
    fullWidth ? styles.fullWidth : '',
    disabled ? styles.disabled : '',
    error ? styles.error : '',
    isOpen ? styles.open : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? styles.value : styles.placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={styles.chevron}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {options.map((option, index) => {
            const enabledIndex = enabledOptions.findIndex((o) => o.value === option.value);
            const isFocused = enabledIndex === focusedIndex;
            const optionClasses = [
              styles.option,
              option.value === value ? styles.selected : '',
              option.disabled ? styles.optionDisabled : '',
              isFocused ? styles.focused : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={optionClasses}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Select;

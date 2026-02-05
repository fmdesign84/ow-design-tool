/**
 * Tabs - 탭 네비게이션 컴포넌트
 * 공용 탭 UI
 */

import React from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** 탭 아이템 목록 */
  items: TabItem[];
  /** 현재 활성 탭 key */
  activeKey: string;
  /** 탭 변경 핸들러 */
  onChange: (key: string) => void;
  /** 탭 스타일 변형 */
  variant?: 'default' | 'pills' | 'underline';
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 전체 너비 채우기 */
  fullWidth?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
}) => {
  const containerClasses = [
    styles.tabs,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={containerClasses} role="tablist">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const tabClasses = [
          styles.tab,
          isActive ? styles.active : '',
          item.disabled ? styles.disabled : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={item.disabled}
            className={tabClasses}
            onClick={() => !item.disabled && onChange(item.key)}
            disabled={item.disabled}
          >
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Tabs;

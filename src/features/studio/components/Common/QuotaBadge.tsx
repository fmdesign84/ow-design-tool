/**
 * 사용량 배지 컴포넌트
 * - 현재 사용량 / 최대 한도 표시
 * - 진행률 바
 * - 경고 상태 (80% 이상, 100% 도달)
 */

import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

interface QuotaBadgeProps {
  used: number;
  max: number;
  bonus?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const QuotaBadge: React.FC<QuotaBadgeProps> = ({
  used,
  max,
  bonus = 0,
  showProgress = true,
  size = 'md',
  className = '',
}) => {
  const total = max + bonus;
  const percent = Math.min(100, Math.round((used / total) * 100));

  // 상태 결정
  const isWarning = percent >= 80 && percent < 100;
  const isDanger = percent >= 100;

  // 크기별 스타일
  const sizeStyles = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 14,
      progressHeight: 'h-1',
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 16,
      progressHeight: 'h-1.5',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 18,
      progressHeight: 'h-2',
    },
  };

  const styles = sizeStyles[size];

  // 색상
  const colors = {
    normal: {
      bg: 'bg-neutral-800',
      text: 'text-neutral-200',
      progress: 'bg-blue-500',
      icon: 'text-blue-400',
    },
    warning: {
      bg: 'bg-yellow-900/30',
      text: 'text-yellow-200',
      progress: 'bg-yellow-500',
      icon: 'text-yellow-400',
    },
    danger: {
      bg: 'bg-red-900/30',
      text: 'text-red-200',
      progress: 'bg-red-500',
      icon: 'text-red-400',
    },
  };

  const colorSet = isDanger ? colors.danger : isWarning ? colors.warning : colors.normal;

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-lg
        ${colorSet.bg} ${colorSet.text} ${styles.container}
        ${className}
      `}
    >
      {/* 아이콘 */}
      {isDanger ? (
        <AlertTriangle size={styles.icon} className={colorSet.icon} />
      ) : (
        <Zap size={styles.icon} className={colorSet.icon} />
      )}

      {/* 텍스트 */}
      <span className="font-medium">
        {used} / {total}
      </span>

      {/* 보너스 표시 */}
      {bonus > 0 && (
        <span className="text-green-400 text-xs">
          (+{bonus})
        </span>
      )}

      {/* 진행률 바 */}
      {showProgress && (
        <div className={`w-16 ${styles.progressHeight} bg-neutral-700 rounded-full overflow-hidden`}>
          <div
            className={`h-full ${colorSet.progress} transition-all duration-300`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};

// 간단한 인라인 버전
interface QuotaInlineProps {
  used: number;
  max: number;
  bonus?: number;
  className?: string;
}

export const QuotaInline: React.FC<QuotaInlineProps> = ({
  used,
  max,
  bonus = 0,
  className = '',
}) => {
  const total = max + bonus;
  const percent = Math.min(100, Math.round((used / total) * 100));
  const isDanger = percent >= 100;
  const isWarning = percent >= 80;

  return (
    <span
      className={`
        font-mono text-sm
        ${isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-neutral-400'}
        ${className}
      `}
    >
      {used} / {total}
    </span>
  );
};

export default QuotaBadge;

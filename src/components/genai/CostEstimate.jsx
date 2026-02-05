/**
 * 포인트 비용 표시 컴포넌트
 * - 기능별 포인트 소비량 표시
 * - 포인트 정책 기반
 */

import React, { useMemo } from 'react';
import { calculatePoints, getActionKey } from '../../constants/pointPolicy';
import styles from './CostEstimate.module.css';

/**
 * 포인트 비용 표시 컴포넌트
 */
export function CostEstimate({
  action = 'image-gen-standard',
  model = 'gemini-3-pro',
  quality = 'standard',
  count = 1,
  compact = false,
  className = ''
}) {
  // 포인트 계산
  const { points, perItem } = useMemo(() => {
    const actionKey = getActionKey(action, quality);
    const unitPoints = calculatePoints(actionKey, { model, quality });
    const totalPoints = unitPoints * count;

    return {
      points: totalPoints,
      perItem: unitPoints
    };
  }, [action, model, quality, count]);

  if (compact) {
    return (
      <span className={`${styles.compact} ${className}`}>
        {points}P
      </span>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.main}>
        <span className={styles.label}>소비 포인트</span>
        <span className={styles.cost}>{points}P</span>
      </div>
      {count > 1 && (
        <div className={styles.breakdown}>
          {count}장 × {perItem}P
        </div>
      )}
    </div>
  );
}

/**
 * 포인트 계산 함수 (외부 사용)
 */
export function calculateCost(action, model, quality, count = 1) {
  const actionKey = getActionKey(action, quality);
  const unitPoints = calculatePoints(actionKey, { model, quality });
  return unitPoints * count;
}

/**
 * 포인트 포맷팅 (외부 사용)
 */
export function formatCost(points) {
  return `${points}P`;
}

export default CostEstimate;

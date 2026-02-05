/**
 * 모델 선택 컴포넌트
 * - 3개 모델 (Gemini 3 Pro, GPT Image 1.5, Imagen 4)
 * - 모델별 특성 뱃지 표시
 * - 자동 추천 표시
 * - 포인트 표시
 */

import React, { useMemo } from 'react';
import { calculatePoints } from '../../constants/pointPolicy';
import styles from './ModelSelector.module.css';

// 모델 정보
const MODELS = {
  'gemini-3-pro': {
    id: 'gemini-3-pro',
    key: 'gemini3pro',  // 기존 코드 호환
    name: 'Gemini 3 Pro',
    shortName: 'Gemini',
    badges: ['한글', '4K', '14장 참조'],
    description: '한글 프롬프트 최적화, 다중 이미지 참조 지원',
    bestFor: ['한글 프롬프트', '여러 이미지 조합', '고해상도'],
    basePoints: 3
  },
  'gpt-image-1.5': {
    id: 'gpt-image-1.5',
    key: 'gpt-image-1.5',
    name: 'GPT Image 1.5',
    shortName: 'GPT',
    badges: ['텍스트', '편집', '스타일'],
    description: '텍스트 렌더링 정확, 부분 편집 지원',
    bestFor: ['텍스트/로고 포함', '부분 수정', '스타일 전환'],
    basePoints: 4
  },
  'imagen-4': {
    id: 'imagen-4',
    key: 'imagen4',  // 기존 코드 호환
    name: 'Imagen 4',
    shortName: 'Imagen',
    badges: ['고품질', '빠름'],
    description: '고품질 영문 프롬프트, 빠른 생성',
    bestFor: ['영문 프롬프트', '상업용 이미지', '빠른 생성'],
    basePoints: 3
  }
};

// 모델 순서
const MODEL_ORDER = ['gemini-3-pro', 'gpt-image-1.5', 'imagen-4'];

/**
 * 모델 선택 컴포넌트
 */
export function ModelSelector({
  selectedModel,
  onModelChange,
  recommendedModel = null,
  recommendReason = null,
  disabled = false,
  compact = false,
  showCost = true,
  quality = 'standard',
  className = '',
  excludeModels = []  // 제외할 모델 ID 배열
}) {
  // 현재 선택된 모델 정보
  const currentModel = MODELS[selectedModel] || MODELS['gemini-3-pro'];

  // 포인트 계산
  const estimatedPoints = useMemo(() => {
    return calculatePoints('image-gen-standard', { model: selectedModel, quality });
  }, [selectedModel, quality]);

  const handleModelClick = (modelId) => {
    if (disabled) return;
    onModelChange(modelId);
  };

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''} ${className}`}>
      <div className={styles.header}>
        <span className={styles.label}>AI 모델</span>
        {recommendedModel && recommendedModel !== selectedModel && (
          <span className={styles.recommendBadge}>
            {MODELS[recommendedModel]?.shortName} 추천
          </span>
        )}
      </div>

      <div className={styles.models}>
        {MODEL_ORDER.filter(id => !excludeModels.includes(id)).map((modelId) => {
          const model = MODELS[modelId];
          const isSelected = selectedModel === modelId;
          const isRecommended = recommendedModel === modelId;

          return (
            <button
              key={modelId}
              type="button"
              className={`${styles.modelButton} ${isSelected ? styles.selected : ''} ${isRecommended ? styles.recommended : ''}`}
              onClick={() => handleModelClick(modelId)}
              disabled={disabled}
            >
              <div className={styles.modelHeader}>
                <span className={styles.modelName}>{model.shortName}</span>
                {isRecommended && !isSelected && (
                  <span className={styles.recIcon}>*</span>
                )}
              </div>

              {!compact && (
                <div className={styles.badges}>
                  {model.badges.slice(0, 2).map((badge, idx) => (
                    <span key={idx} className={styles.badge}>{badge}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 모델 설명 */}
      {!compact && (
        <div className={styles.description}>
          <p>{currentModel.description}</p>
          {showCost && (
            <span className={styles.cost}>
              {estimatedPoints}P/장
            </span>
          )}
        </div>
      )}

      {/* 추천 이유 */}
      {recommendReason && recommendedModel !== selectedModel && (
        <div className={styles.recommendReason}>
          {recommendReason}
        </div>
      )}
    </div>
  );
}

/**
 * 모델 정보 가져오기 (외부 사용)
 */
export function getModelInfo(modelId) {
  return MODELS[modelId] || null;
}

/**
 * 모델 키 변환 (기존 코드 호환)
 * gemini3pro → gemini-3-pro
 */
export function normalizeModelKey(key) {
  const mapping = {
    'gemini3pro': 'gemini-3-pro',
    'gemini3flash': 'gemini-3-pro',  // Flash는 Pro로 매핑
    'imagen4': 'imagen-4',
    'gpt-image-1.5': 'gpt-image-1.5'
  };
  return mapping[key] || key;
}

/**
 * 모델 키를 기존 형식으로 변환
 * gemini-3-pro → gemini3pro
 */
export function toLegacyModelKey(modelId) {
  const model = MODELS[modelId];
  return model?.key || modelId;
}

export default ModelSelector;

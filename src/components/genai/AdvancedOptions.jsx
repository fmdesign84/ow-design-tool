/**
 * AdvancedOptions 컴포넌트
 * 이미지 생성 고급 옵션 패널
 * - 프롬프트 자동 개선
 * - 얼굴/로고 보존 (GPT)
 * - 실시간 검색 연동 (Gemini)
 * - 깊이 생각하기 (Gemini)
 * - 원본 충실도 슬라이더
 */
import React, { useState, useCallback } from 'react';
import styles from './AdvancedOptions.module.css';

// 아이콘
const ChevronIcon = ({ size = 16, open = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{
      transition: 'transform 0.2s',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    }}
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const SparkleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
  </svg>
);

const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BrainIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5" />
    <path d="M15.7 14.4a6 6 0 1 0-6.34-8.96" />
  </svg>
);

const ShieldIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// 옵션 정의
const OPTIONS = {
  autoEnhance: {
    key: 'autoEnhance',
    label: '프롬프트 자동 개선',
    icon: SparkleIcon,
    description: 'AI가 프롬프트를 더 상세하게 확장합니다',
    models: ['all'],
  },
  preserveFaces: {
    key: 'preserveFaces',
    label: '얼굴/로고 보존',
    icon: ShieldIcon,
    description: '원본 이미지의 얼굴과 로고를 유지합니다',
    models: ['gpt-image-1.5'],
  },
  searchIntegration: {
    key: 'searchIntegration',
    label: '실시간 검색 연동',
    icon: SearchIcon,
    description: 'Google 검색으로 최신 정보를 반영합니다',
    models: ['gemini-3-pro'],
  },
  thinkingMode: {
    key: 'thinkingMode',
    label: '깊이 생각하기',
    icon: BrainIcon,
    description: '복잡한 프롬프트를 더 정교하게 분석합니다',
    models: ['gemini-3-pro'],
  },
};

/**
 * AdvancedOptions 메인 컴포넌트
 */
export function AdvancedOptions({
  options = {},
  onChange,
  selectedModel = 'gemini-3-pro',
  fidelity = 70,
  onFidelityChange,
  disabled = false,
  defaultOpen = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // 옵션 토글
  const handleToggle = useCallback((key) => {
    if (disabled) return;
    const newOptions = { ...options, [key]: !options[key] };
    onChange?.(newOptions);
  }, [options, onChange, disabled]);

  // 모델에 따라 옵션 필터링
  const getAvailableOptions = useCallback(() => {
    return Object.values(OPTIONS).filter((opt) => {
      if (opt.models.includes('all')) return true;
      return opt.models.includes(selectedModel);
    });
  }, [selectedModel]);

  const availableOptions = getAvailableOptions();

  return (
    <div className={`${styles.container} ${className}`}>
      {/* 헤더 (접기/펼치기) */}
      <button
        type="button"
        className={styles.header}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={styles.headerLabel}>고급 옵션</span>
        <ChevronIcon size={16} open={isOpen} />
      </button>

      {/* 옵션 패널 */}
      {isOpen && (
        <div className={styles.panel}>
          {/* 토글 옵션들 */}
          <div className={styles.optionList}>
            {availableOptions.map((opt) => {
              const IconComponent = opt.icon;
              const isChecked = !!options[opt.key];

              return (
                <label
                  key={opt.key}
                  className={`${styles.optionItem} ${isChecked ? styles.checked : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(opt.key)}
                    disabled={disabled}
                    className={styles.checkbox}
                  />
                  <span className={styles.optionIcon}>
                    <IconComponent size={14} />
                  </span>
                  <div className={styles.optionText}>
                    <span className={styles.optionLabel}>{opt.label}</span>
                    <span className={styles.optionDesc}>{opt.description}</span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* 원본 충실도 슬라이더 */}
          {onFidelityChange && (
            <div className={styles.sliderGroup}>
              <div className={styles.sliderHeader}>
                <span className={styles.sliderLabel}>원본 충실도</span>
                <span className={styles.sliderValue}>{fidelity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={fidelity}
                onChange={(e) => onFidelityChange(Number(e.target.value))}
                className={styles.slider}
                disabled={disabled}
              />
              <div className={styles.sliderHints}>
                <span>창의적</span>
                <span>충실</span>
              </div>
            </div>
          )}

          {/* 모델별 안내 */}
          <p className={styles.modelHint}>
            {selectedModel.includes('gemini')
              ? '💡 Gemini 모델에서 검색 연동과 깊이 생각하기를 사용할 수 있습니다.'
              : selectedModel.includes('gpt')
              ? '💡 GPT 모델에서 얼굴/로고 보존 기능을 사용할 수 있습니다.'
              : '💡 모델에 따라 사용 가능한 옵션이 다릅니다.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default AdvancedOptions;

/**
 * FreeGeneration 컴포넌트
 * 자유 생성 UI - 모델 선택, 품질, 비율, 스타일, 네거티브 프롬프트 설정
 */
import React from 'react';
import { CloseIcon } from '../../../../components/common/Icons';
import { ModelSelector } from '../../../../components/genai';
import styles from './FreeGeneration.module.css';

interface QualityOption {
  key: string;
  label: string;
  desc: string;
}

interface AspectRatioOption {
  key: string;
  label: string;
  desc: string;
}

interface StylePreset {
  key: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ size: number; className?: string }>;
}

interface NegativePreset {
  key: string;
  label: string;
  prompt: string;
}

interface FreeGenerationProps {
  // Model Selection
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  recommendedModel?: string | null;
  recommendReason?: string | null;

  // Quality
  qualityOptions: QualityOption[];
  quality: string;
  onQualityChange: (quality: string) => void;

  // Aspect Ratio
  aspectRatios: AspectRatioOption[];
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;

  // Style Preset
  stylePresets: StylePreset[];
  stylePreset: string;
  onStylePresetChange: (style: string) => void;

  // Negative Prompt
  negativePrompt: string;
  onNegativePromptChange: (prompt: string) => void;
  negativePresets: NegativePreset[];
  selectedNegativePresets: string[];
  onNegativePresetToggle: (preset: NegativePreset) => void;

  // Loading state
  isLoading: boolean;
}

export const FreeGeneration: React.FC<FreeGenerationProps> = ({
  selectedModel,
  onModelChange,
  recommendedModel,
  recommendReason,
  qualityOptions,
  quality,
  onQualityChange,
  aspectRatios,
  aspectRatio,
  onAspectRatioChange,
  stylePresets,
  stylePreset,
  onStylePresetChange,
  negativePrompt,
  onNegativePromptChange,
  negativePresets,
  selectedNegativePresets,
  onNegativePresetToggle,
  isLoading,
}) => {
  return (
    <>
      {/* AI 모델 선택 */}
      {selectedModel && onModelChange && (
        <div className={styles.settingGroup}>
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            recommendedModel={recommendedModel || undefined}
            recommendReason={recommendReason || undefined}
            disabled={isLoading}
            quality={quality}
          />
        </div>
      )}

      {/* 품질/속도 설정 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>이미지 품질</label>
        <div className={styles.qualitySelector}>
          {qualityOptions.map((option) => (
            <button
              key={option.key}
              className={`${styles.qualityBtn} ${quality === option.key ? styles.active : ''}`}
              onClick={() => onQualityChange(option.key)}
              disabled={isLoading}
              title={option.desc}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className={styles.hint}>고품질일수록 생성 시간이 오래 걸립니다.</p>
      </div>

      {/* 이미지 비율 설정 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>이미지 비율</label>
        <div className={styles.ratioSelector}>
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.key}
              className={`${styles.ratioBtn} ${aspectRatio === ratio.key ? styles.active : ''}`}
              onClick={() => onAspectRatioChange(ratio.key)}
              disabled={isLoading}
              title={ratio.desc}
            >
              <span className={styles.ratioPreview} data-ratio={ratio.key} />
              <span className={styles.ratioLabel}>{ratio.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 스타일 프리셋 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>스타일 프리셋</label>
        <div className={styles.styleSelector}>
          {stylePresets.map((style) => (
            <button
              key={style.key}
              className={`${styles.styleBtn} ${stylePreset === style.key ? styles.active : ''}`}
              onClick={() => onStylePresetChange(style.key)}
              disabled={isLoading}
              title={style.desc}
            >
              <style.Icon size={24} className={styles.styleIcon} />
              <span className={styles.styleLabel}>{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 구분선 */}
      <div className={styles.divider} />

      {/* 네거티브 프롬프트 */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          네거티브 프롬프트
          <span className={styles.optional}>(선택)</span>
        </label>
        <textarea
          className={styles.textarea}
          placeholder="예: blurry, low quality, watermark, text, bad anatomy"
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          disabled={isLoading}
        />
        <p className={styles.hint}>이미지에서 제외하고 싶은 요소를 입력하거나 태그를 선택하세요.</p>
        <div className={styles.negativePresets}>
          {negativePresets.map((preset) => {
            const isSelected = selectedNegativePresets.includes(preset.key);
            return (
              <button
                key={preset.key}
                type="button"
                className={`${styles.presetBadge} ${isSelected ? styles.selected : ''}`}
                onClick={() => onNegativePresetToggle(preset)}
                disabled={isLoading}
              >
                {preset.label}
                {isSelected && (
                  <span className={styles.badgeClose}>
                    <CloseIcon size={10} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

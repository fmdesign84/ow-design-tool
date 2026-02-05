/**
 * SocialMediaCard 컴포넌트
 * SNS 카드 디자인 생성 UI
 */
import React from 'react';
import styles from './SocialMediaCard.module.css';

interface SocialPlatform {
  key: string;
  label: string;
}

interface SocialMediaCardProps {
  // Platform selection
  platforms: SocialPlatform[];
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;

  // Text inputs
  mainText: string;
  onMainTextChange: (text: string) => void;
  themeDescription: string;
  onThemeDescriptionChange: (text: string) => void;

  // Loading state
  isLoading: boolean;
}

export const SocialMediaCard: React.FC<SocialMediaCardProps> = ({
  platforms,
  selectedPlatform,
  onPlatformChange,
  mainText,
  onMainTextChange,
  themeDescription,
  onThemeDescriptionChange,
  isLoading,
}) => {
  return (
    <>
      {/* 플랫폼 선택 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>플랫폼</label>
        <div className={styles.qualitySelector}>
          {platforms.map((platform) => (
            <button
              key={platform.key}
              className={`${styles.qualityBtn} ${selectedPlatform === platform.key ? styles.active : ''}`}
              onClick={() => onPlatformChange(platform.key)}
              disabled={isLoading}
            >
              {platform.label}
            </button>
          ))}
        </div>
      </div>

      {/* 메인 텍스트 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          메인 텍스트
          <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.textInput}
          placeholder="예: 신제품 출시! 지금 바로 확인하세요"
          value={mainText}
          onChange={(e) => onMainTextChange(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* 테마/설명 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          테마/설명
          <span className={styles.optional}>(선택)</span>
        </label>
        <textarea
          className={styles.textarea}
          placeholder="원하는 색상, 분위기, 이미지 요소 등"
          value={themeDescription}
          onChange={(e) => onThemeDescriptionChange(e.target.value)}
          disabled={isLoading}
        />
      </div>
    </>
  );
};

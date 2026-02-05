/**
 * PosterBanner 컴포넌트
 * 포스터/배너 디자인 생성 UI
 */
import React from 'react';
import styles from './PosterBanner.module.css';

interface PosterSize {
  key: string;
  label: string;
}

interface PosterBannerProps {
  // Size selection
  sizes: PosterSize[];
  selectedSize: string;
  onSizeChange: (size: string) => void;

  // Text inputs
  headline: string;
  onHeadlineChange: (text: string) => void;
  subHeadline: string;
  onSubHeadlineChange: (text: string) => void;
  themeDescription: string;
  onThemeDescriptionChange: (text: string) => void;

  // Loading state
  isLoading: boolean;
}

export const PosterBanner: React.FC<PosterBannerProps> = ({
  sizes,
  selectedSize,
  onSizeChange,
  headline,
  onHeadlineChange,
  subHeadline,
  onSubHeadlineChange,
  themeDescription,
  onThemeDescriptionChange,
  isLoading,
}) => {
  return (
    <>
      {/* 사이즈 선택 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>사이즈</label>
        <div className={styles.qualitySelector}>
          {sizes.map((size) => (
            <button
              key={size.key}
              className={`${styles.qualityBtn} ${selectedSize === size.key ? styles.active : ''}`}
              onClick={() => onSizeChange(size.key)}
              disabled={isLoading}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* 헤드라인 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          헤드라인
          <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.textInput}
          placeholder="예: SUMMER SALE 50% OFF"
          value={headline}
          onChange={(e) => onHeadlineChange(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* 서브 헤드라인 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          서브 헤드라인
          <span className={styles.optional}>(선택)</span>
        </label>
        <input
          type="text"
          className={styles.textInput}
          placeholder="예: 7월 1일 ~ 31일"
          value={subHeadline}
          onChange={(e) => onSubHeadlineChange(e.target.value)}
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

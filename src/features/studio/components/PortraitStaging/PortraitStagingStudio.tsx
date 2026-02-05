/**
 * PortraitStagingStudio 컴포넌트
 * 연출 생성 - 목업 스타일 싱글 페이지 레이아웃
 */
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useToast } from '../../../../components/common';
import { UploadIcon, ChevronDownIcon, DownloadIcon } from '../../../../components/common/Icons';
import {
  STAGING_CATEGORIES,
  getPresetsByCategory,
  getPresetByKey,
} from '../../../../pages/GenAI/constants/stagingPresets';
import type { StagingCategoryKey } from '../../../../pages/GenAI/constants/stagingPresets';
import styles from './PortraitStagingStudio.module.css';

interface PortraitStagingStudioProps {
  className?: string;
  onHeaderChange?: (header: { title: string; showBack: boolean; onBack?: () => void }) => void;
}

// 파일명 줄임 처리
const truncateFileName = (name: string, maxLength: number = 15): string => {
  if (name.length <= maxLength) return name;
  const ext = name.lastIndexOf('.') > 0 ? name.slice(name.lastIndexOf('.')) : '';
  const baseName = name.slice(0, name.lastIndexOf('.') > 0 ? name.lastIndexOf('.') : name.length);
  const availableLength = maxLength - ext.length - 3;
  if (availableLength <= 0) return name.slice(0, maxLength - 3) + '...';
  const frontLength = Math.ceil(availableLength * 0.6);
  const backLength = availableLength - frontLength;
  return baseName.slice(0, frontLength) + '...' + baseName.slice(-backLength) + ext;
};

// 이미지를 base64로 변환
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const PortraitStagingStudio: React.FC<PortraitStagingStudioProps> = ({
  className = '',
  onHeaderChange,
}) => {
  const toast = useToast();

  // 인물 사진 상태
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [portraitFileName, setPortraitFileName] = useState<string>('');
  const [portraitBase64, setPortraitBase64] = useState<string | null>(null);

  // 키비/로고 상태
  const [keyVisualPreview, setKeyVisualPreview] = useState<string | null>(null);
  const [keyVisualFileName, setKeyVisualFileName] = useState<string>('');
  const [keyVisualBase64, setKeyVisualBase64] = useState<string | null>(null);

  // 기타 상태
  const [selectedCategory, setSelectedCategory] = useState<StagingCategoryKey>('event');
  const [selectedPreset, setSelectedPreset] = useState<string>('awards-ceremony');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const portraitInputRef = useRef<HTMLInputElement>(null);
  const keyVisualInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    if (isCategoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoryOpen]);

  // 현재 카테고리의 프리셋들
  const currentPresets = useMemo(() => getPresetsByCategory(selectedCategory), [selectedCategory]);

  // 선택된 프리셋 정보
  const selectedPresetInfo = useMemo(() => getPresetByKey(selectedPreset), [selectedPreset]);

  // 선택된 카테고리 정보
  const selectedCategoryInfo = useMemo(
    () => STAGING_CATEGORIES.find(c => c.key === selectedCategory),
    [selectedCategory]
  );

  // 인물 사진 업로드
  const handlePortraitUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setPortraitPreview(base64);
      setPortraitBase64(base64);
      setPortraitFileName(file.name);
      setErrorMessage(null);
    } catch {
      toast.error('이미지 처리 실패');
    }

    if (portraitInputRef.current) portraitInputRef.current.value = '';
  }, [toast]);

  // 키비/로고 업로드
  const handleKeyVisualUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setKeyVisualPreview(base64);
      setKeyVisualBase64(base64);
      setKeyVisualFileName(file.name);
      setErrorMessage(null);
    } catch {
      toast.error('이미지 처리 실패');
    }

    if (keyVisualInputRef.current) keyVisualInputRef.current.value = '';
  }, [toast]);

  // 인물 사진 삭제
  const handleRemovePortrait = () => {
    setPortraitPreview(null);
    setPortraitBase64(null);
    setPortraitFileName('');
  };

  // 키비/로고 삭제
  const handleRemoveKeyVisual = () => {
    setKeyVisualPreview(null);
    setKeyVisualBase64(null);
    setKeyVisualFileName('');
  };

  // 카테고리 변경
  const handleCategorySelect = (category: StagingCategoryKey) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
    const presets = getPresetsByCategory(category);
    if (presets.length > 0) {
      setSelectedPreset(presets[0].key);
    }
  };

  // 프리셋 선택
  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
  };

  // 생성 가능 여부
  const canGenerate = !!portraitBase64 && !!selectedPreset;

  // 업로드 상태 계산
  const hasPortrait = !!portraitPreview;
  const hasKeyVisual = !!keyVisualPreview;
  const uploadCount = (hasPortrait ? 1 : 0) + (hasKeyVisual ? 1 : 0);

  // 생성
  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedImages([]);

    try {
      console.log('[Staging] 생성 요청 시작:', {
        presetKey: selectedPreset,
        hasPortrait: !!portraitBase64,
        hasKeyVisual: !!keyVisualBase64
      });

      const response = await fetch('/api/generate-staging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portraitImage: portraitBase64,
          keyVisualImage: keyVisualBase64 || null,
          presetKey: selectedPreset,
          outputCount: 1,
        }),
      });

      console.log('[Staging] 응답 상태:', response.status);

      if (!response.ok) {
        const errText = await response.text();
        console.error('[Staging] API 에러:', response.status, errText);
        throw new Error(`API 오류 (${response.status}): ${errText.slice(0, 100)}`);
      }

      const data = await response.json();
      console.log('[Staging] 응답 데이터:', { success: data.success, imageCount: data.images?.length });

      if (!data.success) {
        throw new Error(data.friendlyMessage?.message || data.error || '생성 실패');
      }

      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images);
      } else {
        throw new Error('생성된 이미지가 없어요.');
      }
    } catch (error) {
      console.error('[Staging] 에러:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMessage || '네트워크 오류가 발생했어요.');
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, portraitBase64, keyVisualBase64, selectedPreset]);

  // 다운로드
  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `staging-${selectedPreset}-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  // 카테고리 썸네일
  const getCategorySampleImage = (categoryKey: string): string | null => {
    const presets = getPresetsByCategory(categoryKey as StagingCategoryKey);
    return presets[0]?.thumbnail || null;
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={portraitInputRef}
        onChange={handlePortraitUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={keyVisualInputRef}
        onChange={handleKeyVisualUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* 두 개 업로드 영역 */}
      <div className={styles.uploadRow}>
        {/* 인물 사진 업로드 */}
        <div className={styles.uploadColumn}>
          <label className={styles.uploadLabel}>인물</label>
          {!portraitPreview ? (
            <div
              className={styles.uploadZoneSmall}
              onClick={() => portraitInputRef.current?.click()}
            >
              <UploadIcon size={24} />
              <h4>인물 사진</h4>
              <p>얼굴이 잘 보이는 사진</p>
            </div>
          ) : (
            <div className={styles.previewAreaSmall}>
              <img
                src={portraitPreview}
                alt="인물 미리보기"
                className={styles.previewImageSmall}
              />
              <button
                className={styles.removeBtnSmall}
                onClick={handleRemovePortrait}
              >
                ✕
              </button>
              <span className={styles.fileNameSmall} title={portraitFileName}>
                {truncateFileName(portraitFileName)}
              </span>
            </div>
          )}
        </div>

        {/* 키비/로고 업로드 */}
        <div className={styles.uploadColumn}>
          <label className={styles.uploadLabel}>키비/로고</label>
          {!keyVisualPreview ? (
            <div
              className={styles.uploadZoneSmall}
              onClick={() => keyVisualInputRef.current?.click()}
            >
              <UploadIcon size={24} />
              <h4>키비주얼/로고</h4>
              <p>참고 이미지 (선택)</p>
            </div>
          ) : (
            <div className={styles.previewAreaSmall}>
              <img
                src={keyVisualPreview}
                alt="키비주얼 미리보기"
                className={styles.previewImageSmall}
              />
              <button
                className={styles.removeBtnSmall}
                onClick={handleRemoveKeyVisual}
              >
                ✕
              </button>
              <span className={styles.fileNameSmall} title={keyVisualFileName}>
                {truncateFileName(keyVisualFileName)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 업로드 안내 및 상태 */}
      <div className={styles.uploadInfo}>
        <p className={styles.uploadInfoText}>키비/로고 올리면 AI가 참고해요</p>
        <span className={uploadCount === 0 ? styles.statusWarning : uploadCount === 1 ? styles.statusOk : styles.statusBest}>
          {uploadCount === 0 && '최소 1장 필요'}
          {uploadCount === 1 && (hasPortrait ? '인물 업로드됨' : '키비만 업로드됨')}
          {uploadCount === 2 && '2개 모두 업로드'}
        </span>
      </div>

      {/* 카테고리 드롭다운 */}
      <div className={styles.settingGroup}>
        <label className={styles.sectionLabel}>카테고리</label>
        <div className={styles.categoryDropdown} ref={dropdownRef}>
          <button
            className={`${styles.categoryBtn} ${isCategoryOpen ? styles.open : ''}`}
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            disabled={isGenerating}
          >
            {getCategorySampleImage(selectedCategory) ? (
              <img
                src={getCategorySampleImage(selectedCategory)!}
                alt={selectedCategoryInfo?.label}
                className={styles.categoryImage}
              />
            ) : (
              <div className={styles.categoryPlaceholder}>
                <span>{selectedCategoryInfo?.icon}</span>
              </div>
            )}
            <div className={styles.categoryDimOverlay}></div>
            <div className={styles.categoryOverlay}>
              <span className={styles.categoryLabel}>{selectedCategoryInfo?.label}</span>
            </div>
            <span className={`${styles.categoryBtnArrow} ${isCategoryOpen ? styles.open : ''}`}>
              <ChevronDownIcon size={14} />
            </span>
          </button>

          {isCategoryOpen && (
            <div className={styles.categoryList}>
              {STAGING_CATEGORIES.map((cat) => {
                const catImage = getCategorySampleImage(cat.key);
                return (
                  <button
                    key={cat.key}
                    className={`${styles.categoryItem} ${selectedCategory === cat.key ? styles.active : ''}`}
                    onClick={() => handleCategorySelect(cat.key)}
                  >
                    <div className={styles.categoryItemImageWrapper}>
                      {catImage ? (
                        <img src={catImage} alt={cat.label} className={styles.categoryItemImage} />
                      ) : (
                        <div className={styles.categoryItemPlaceholder}>
                          <span>{cat.icon}</span>
                        </div>
                      )}
                    </div>
                    <span className={styles.categoryItemLabel}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 프리셋 타입 선택 */}
      <div className={styles.settingGroup}>
        <label className={styles.sectionLabel}>
          스타일
          {selectedPresetInfo && (
            <span className={styles.selectedInfo}>
              {selectedPresetInfo.label} ({selectedPresetInfo.aspectRatio})
            </span>
          )}
        </label>
        <div className={styles.presetGrid}>
          {currentPresets.map((preset) => (
            <button
              key={preset.key}
              className={`${styles.presetBtn} ${selectedPreset === preset.key ? styles.active : ''}`}
              onClick={() => handlePresetSelect(preset.key)}
              title={preset.description}
              disabled={isGenerating}
            >
              <div className={styles.presetImageWrapper}>
                {preset.thumbnail ? (
                  <img
                    src={preset.thumbnail}
                    alt={preset.label}
                    className={styles.presetImage}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.presetPlaceholder}>
                    {STAGING_CATEGORIES.find(c => c.key === preset.category)?.icon || '📷'}
                  </div>
                )}
                <div className={styles.presetOverlay}>
                  <span className={styles.presetLabel}>{preset.label}</span>
                  <span className={styles.presetRatio}>{preset.aspectRatio}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className={styles.errorCard}>⚠️ {errorMessage}</div>
      )}

      {/* 생성 버튼 */}
      <button
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
      >
        {isGenerating ? (
          <>
            <span className={styles.spinner} />
            생성 중... (약 20-40초)
          </>
        ) : (
          <>연출 이미지 생성하기 <span className={styles.pointCost}>5P</span></>
        )}
      </button>

      {/* 생성 결과 */}
      {generatedImages.length > 0 && (
        <div className={styles.resultSection}>
          <label className={styles.sectionLabel}>생성 결과</label>
          <div className={styles.resultGrid}>
            {generatedImages.map((img, idx) => (
              <div key={idx} className={styles.resultItem}>
                <img src={img} alt={`결과 ${idx + 1}`} />
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownload(img, idx)}
                >
                  <DownloadIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortraitStagingStudio;

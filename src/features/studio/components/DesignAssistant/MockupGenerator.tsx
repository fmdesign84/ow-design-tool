/**
 * MockupGenerator 컴포넌트
 * 로고 + 키비주얼 두 개 이미지로 목업 생성 UI
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UploadIcon, ChevronDownIcon } from '../../../../components/common/Icons';
import { STATIC_MOCKUP_SAMPLES } from '../../../../pages/GenAI/constants/mockups';
import styles from './MockupGenerator.module.css';

interface MockupCategory {
  key: string;
  label: string;
  icon: string;
}

interface MockupPreset {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size: number }>;
  ratio: string;
  category: string;
  description: string;
}

interface MockupResult {
  url: string;
  style: string;
  createdAt: string;
}

interface MockupGeneratorProps {
  // 로고 업로드
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenLogoPicker: () => void;
  logoPreview: string | null;
  logoFileName: string;
  onRemoveLogo: () => void;

  // 키비주얼 업로드
  keyVisualInputRef: React.RefObject<HTMLInputElement | null>;
  onKeyVisualUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenKeyVisualPicker: () => void;
  keyVisualPreview: string | null;
  keyVisualFileName: string;
  onRemoveKeyVisual: () => void;

  // 목업 선택
  mockupCategories: MockupCategory[];
  mockupPresets: MockupPreset[];
  selectedMockup: string;
  onMockupSelect: (key: string) => void;

  // 생성
  isLoading: boolean;
  canGenerate: boolean;
  onGenerate: () => void;

  // 결과
  mockupResult?: MockupResult | null;
}

// 파일명 줄임 처리
const truncateFileName = (name: string, maxLength: number = 20): string => {
  if (name.length <= maxLength) return name;

  const ext = name.lastIndexOf('.') > 0 ? name.slice(name.lastIndexOf('.')) : '';
  const baseName = name.slice(0, name.lastIndexOf('.') > 0 ? name.lastIndexOf('.') : name.length);

  const availableLength = maxLength - ext.length - 3;
  if (availableLength <= 0) return name.slice(0, maxLength - 3) + '...';

  const frontLength = Math.ceil(availableLength * 0.6);
  const backLength = availableLength - frontLength;

  return baseName.slice(0, frontLength) + '...' + baseName.slice(-backLength) + ext;
};

export const MockupGenerator: React.FC<MockupGeneratorProps> = ({
  logoInputRef,
  onLogoUpload,
  onOpenLogoPicker,
  logoPreview,
  logoFileName,
  onRemoveLogo,
  keyVisualInputRef,
  onKeyVisualUpload,
  onOpenKeyVisualPicker,
  keyVisualPreview,
  keyVisualFileName,
  onRemoveKeyVisual,
  mockupCategories,
  mockupPresets,
  selectedMockup,
  onMockupSelect,
  isLoading,
  canGenerate,
  onGenerate,
  mockupResult,
}) => {
  // 선택된 카테고리 상태
  const [selectedCategory, setSelectedCategory] = useState<string>('print');
  // 카테고리 드롭다운 열림/닫힘 상태
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  // 드롭다운 외부 클릭 감지용 ref
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

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryOpen]);

  // 선택된 카테고리 정보
  const selectedCategoryInfo = useMemo(() => {
    return mockupCategories.find(c => c.key === selectedCategory);
  }, [mockupCategories, selectedCategory]);

  // 카테고리 선택 핸들러
  const handleCategorySelect = (key: string) => {
    setSelectedCategory(key);
    setIsCategoryOpen(false);
  };

  // 현재 카테고리의 목업만 필터링
  const filteredPresets = useMemo(() => {
    return mockupPresets.filter(preset => preset.category === selectedCategory);
  }, [mockupPresets, selectedCategory]);

  // 선택된 목업 정보
  const selectedPresetInfo = useMemo(() => {
    return mockupPresets.find(p => p.key === selectedMockup);
  }, [mockupPresets, selectedMockup]);

  // 목업 타입별 샘플 이미지 찾기
  const getSampleImage = (mockupType: string): string | null => {
    return (STATIC_MOCKUP_SAMPLES as Record<string, string>)[mockupType] || null;
  };

  // 카테고리별 샘플 이미지 찾기
  const getCategorySampleImage = (categoryKey: string): string | null => {
    const categoryPresets = mockupPresets.filter(p => p.category === categoryKey);
    for (const preset of categoryPresets) {
      const sampleImage = getSampleImage(preset.key);
      if (sampleImage) return sampleImage;
    }
    return null;
  };

  // 업로드 상태 계산
  const hasLogo = !!logoPreview;
  const hasKeyVisual = !!keyVisualPreview;
  const uploadCount = (hasLogo ? 1 : 0) + (hasKeyVisual ? 1 : 0);

  return (
    <div className={styles.mockupContainer}>
      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={logoInputRef}
        onChange={onLogoUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={keyVisualInputRef}
        onChange={onKeyVisualUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* 두 개 업로드 영역 */}
      <div className={styles.uploadRow}>
        {/* 로고 업로드 */}
        <div className={styles.uploadColumn}>
          <label className={styles.uploadLabel}>로고</label>
          {!logoPreview ? (
            <div
              className={styles.uploadZoneSmall}
              onClick={onOpenLogoPicker}
            >
              <UploadIcon size={24} />
              <h4>로고 업로드</h4>
              <p>브랜드 로고, 심볼</p>
            </div>
          ) : (
            <div className={styles.previewAreaSmall}>
              <img
                src={logoPreview}
                alt="로고 미리보기"
                className={styles.previewImageSmall}
              />
              <button
                className={styles.removeBtnSmall}
                onClick={onRemoveLogo}
              >
                ✕
              </button>
              <span className={styles.fileNameSmall} title={logoFileName}>
                {truncateFileName(logoFileName, 15)}
              </span>
            </div>
          )}
        </div>

        {/* 키비주얼 업로드 */}
        <div className={styles.uploadColumn}>
          <label className={styles.uploadLabel}>키비주얼</label>
          {!keyVisualPreview ? (
            <div
              className={styles.uploadZoneSmall}
              onClick={onOpenKeyVisualPicker}
            >
              <UploadIcon size={24} />
              <h4>키비주얼 업로드</h4>
              <p>메인 이미지, 제품 사진</p>
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
                onClick={onRemoveKeyVisual}
              >
                ✕
              </button>
              <span className={styles.fileNameSmall} title={keyVisualFileName}>
                {truncateFileName(keyVisualFileName, 15)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 업로드 안내 및 상태 */}
      <div className={styles.uploadInfo}>
        <p className={styles.uploadInfoText}>둘 다 올리면 AI가 역할에 맞게 배치해요</p>
        <span className={uploadCount === 0 ? styles.statusWarning : uploadCount === 1 ? styles.statusOk : styles.statusBest}>
          {uploadCount === 0 && '최소 1장 필요'}
          {uploadCount === 1 && '1개 업로드됨'}
          {uploadCount === 2 && '2개 모두 업로드'}
        </span>
      </div>

      {/* 카테고리 드롭다운 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>카테고리</label>
        <div className={styles.categoryDropdown} ref={dropdownRef}>
          <button
            className={`${styles.categoryBtn} ${isCategoryOpen ? styles.open : ''}`}
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            disabled={isLoading}
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
              {mockupCategories.map((cat) => {
                const catImage = getCategorySampleImage(cat.key);
                return (
                  <button
                    key={cat.key}
                    className={`${styles.categoryItem} ${selectedCategory === cat.key ? styles.active : ''}`}
                    onClick={() => handleCategorySelect(cat.key)}
                  >
                    <div className={styles.categoryItemImageWrapper}>
                      {catImage ? (
                        <img
                          src={catImage}
                          alt={cat.label}
                          className={styles.categoryItemImage}
                        />
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

      {/* 목업 타입 선택 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          목업 타입
          {selectedPresetInfo && (
            <span className={styles.selectedInfo}>
              {selectedPresetInfo.label} ({selectedPresetInfo.ratio})
            </span>
          )}
        </label>
        <div className={styles.presetList}>
          {filteredPresets.map((preset) => {
            const sampleImage = getSampleImage(preset.key);
            return (
              <button
                key={preset.key}
                className={`${styles.presetBtn} ${selectedMockup === preset.key ? styles.active : ''}`}
                onClick={() => onMockupSelect(preset.key)}
                title={preset.description}
                disabled={isLoading}
              >
                <div className={styles.presetImageWrapper}>
                  {sampleImage ? (
                    <img
                      src={sampleImage}
                      alt={preset.label}
                      className={styles.presetImage}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.presetPlaceholder}>
                      <preset.Icon size={20} />
                    </div>
                  )}
                  <div className={styles.presetOverlay}>
                    <span className={styles.presetLabel}>{preset.label}</span>
                    <span className={styles.presetRatio}>{preset.ratio}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 생성 버튼 */}
      <button
        className={styles.generateBtn}
        onClick={onGenerate}
        disabled={!canGenerate || isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner} />
            목업 생성 중...
          </>
        ) : (
          '목업 이미지 생성하기'
        )}
      </button>

      {/* 생성 결과 */}
      {mockupResult && mockupResult.url && (
        <div className={styles.resultSection}>
          <label className={styles.label}>생성 결과</label>
          <div className={styles.resultImageWrapper}>
            <img
              src={mockupResult.url}
              alt="생성된 목업"
              className={styles.resultImage}
              onError={(e) => {
                console.error('목업 이미지 로드 실패:', mockupResult.url?.substring(0, 100));
              }}
            />
            <a
              href={mockupResult.url}
              download={`mockup-${mockupResult.style}-${Date.now()}.png`}
              className={styles.downloadBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              다운로드
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockupGenerator;

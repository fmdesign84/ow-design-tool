/**
 * CompositePhoto 컴포넌트
 * 합성 사진 - ProfileStudio 스타일 통일
 *
 * 플로우: 모드선택 → 이미지업로드 → 옵션설정 → 결과
 * 모드: 장소합성, 가상피팅, 배경생성
 */
import React from 'react';
import { UploadIcon, DownloadIcon } from '../../../../components/common/Icons';
import styles from '../IDPhotoStudio/ProfileStudio.module.css'; // ProfileStudio 스타일 공유

// ===== 타입 정의 =====

type CompositeMode = 'location' | 'tryon' | 'background';
type GarmentCategory = 'upper_body' | 'lower_body' | 'dresses';
type Step = 'mode' | 'upload' | 'options' | 'generating' | 'result';

// ===== 옵션 데이터 =====

const MODE_OPTIONS = [
  { id: 'location' as CompositeMode, name: '장소 합성', desc: '배경 + 인물 합성', icon: '🏞️' },
  { id: 'tryon' as CompositeMode, name: '가상 피팅', desc: '인물 + 의류 합성', icon: '👔' },
  { id: 'background' as CompositeMode, name: '배경 생성', desc: 'AI 배경 교체', icon: '🎨' },
];

const GARMENT_CATEGORIES = [
  { id: 'upper_body' as GarmentCategory, name: '상의', icon: '👕' },
  { id: 'lower_body' as GarmentCategory, name: '하의', icon: '👖' },
  { id: 'dresses' as GarmentCategory, name: '드레스', icon: '👗' },
];

// 아이콘은 ../../../../components/common/Icons에서 import

// ===== Props =====

export interface CompositePhotoProps {
  mode: CompositeMode;
  onModeChange?: (mode: CompositeMode) => void;
  hideModeSelector?: boolean;
  backgroundImage?: { preview: string; name: string } | null;
  foregroundImage?: { preview: string; name: string } | null;
  onBackgroundImageChange?: (image: { preview: string; name: string } | null) => void;
  onForegroundImageChange?: (image: { preview: string; name: string } | null) => void;
  humanImage?: { preview: string; name: string } | null;
  garmentImage?: { preview: string; name: string } | null;
  onHumanImageChange?: (image: { preview: string; name: string } | null) => void;
  onGarmentImageChange?: (image: { preview: string; name: string } | null) => void;
  garmentCategory?: GarmentCategory;
  onGarmentCategoryChange?: (category: GarmentCategory) => void;
  garmentDescription?: string;
  onGarmentDescriptionChange?: (desc: string) => void;
  sourceImage?: { preview: string; name: string } | null;
  onSourceImageChange?: (image: { preview: string; name: string } | null) => void;
  backgroundPrompt?: string;
  onBackgroundPromptChange?: (prompt: string) => void;
  backgroundInputRef?: React.RefObject<HTMLInputElement>;
  foregroundInputRef?: React.RefObject<HTMLInputElement>;
  humanInputRef?: React.RefObject<HTMLInputElement>;
  garmentInputRef?: React.RefObject<HTMLInputElement>;
  sourceInputRef?: React.RefObject<HTMLInputElement>;
  isDraggingBackground?: boolean;
  isDraggingForeground?: boolean;
  isDraggingHuman?: boolean;
  isDraggingGarment?: boolean;
  isDraggingSource?: boolean;
  onDragOver?: (e: React.DragEvent, type: string) => void;
  onDragLeave?: (e: React.DragEvent, type: string) => void;
  onDrop?: (e: React.DragEvent, type: string) => void;
  onFileInputChange?: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  resultImage?: string | null;
  onDownload?: () => void;
  onRetry?: () => void;
  error?: string | null;
}

// ===== 컴포넌트 =====

export const CompositePhoto: React.FC<CompositePhotoProps> = ({
  mode,
  onModeChange,
  hideModeSelector = false,
  backgroundImage,
  foregroundImage,
  onBackgroundImageChange,
  onForegroundImageChange,
  humanImage,
  garmentImage,
  onHumanImageChange,
  onGarmentImageChange,
  garmentCategory = 'upper_body',
  onGarmentCategoryChange,
  garmentDescription = '',
  onGarmentDescriptionChange,
  sourceImage,
  onSourceImageChange,
  backgroundPrompt = '',
  onBackgroundPromptChange,
  backgroundInputRef,
  foregroundInputRef,
  humanInputRef,
  garmentInputRef,
  sourceInputRef,
  onFileInputChange,
  isLoading,
  onGenerate,
  resultImage,
  onDownload,
  onRetry,
  error,
}) => {
  // 현재 스텝 계산
  const getStep = (): Step => {
    if (resultImage) return 'result';
    if (isLoading) return 'generating';

    // 모드별 업로드 완료 체크
    switch (mode) {
      case 'location':
        if (backgroundImage && foregroundImage) return 'options';
        break;
      case 'tryon':
        if (humanImage && garmentImage) return 'options';
        break;
      case 'background':
        if (sourceImage) return 'options';
        break;
    }
    return 'upload';
  };

  const step = getStep();

  // 스텝 번호
  const getStepNumber = () => {
    switch (step) {
      case 'mode': return 1;
      case 'upload': return 2;
      case 'options':
      case 'generating': return 3;
      case 'result': return 4;
      default: return 1;
    }
  };

  // 생성 가능 여부
  const canGenerate = (): boolean => {
    if (isLoading) return false;
    switch (mode) {
      case 'location':
        return !!backgroundImage && !!foregroundImage;
      case 'tryon':
        return !!humanImage && !!garmentImage;
      case 'background':
        return !!sourceImage && backgroundPrompt.trim().length > 0;
      default:
        return false;
    }
  };

  // 업로드 슬롯 렌더링
  const renderUploadSlot = (
    image: { preview: string; name: string } | null | undefined,
    inputRef: React.RefObject<HTMLInputElement> | undefined,
    type: string,
    label: string,
    hint: string,
    onRemove: () => void
  ) => (
    <div className={styles.uploadSlot}>
      <span className={styles.slotLabel}>
        {label}
        <span className={styles.required}>*</span>
        <span className={styles.slotHint}>{hint}</span>
      </span>
      {image ? (
        <div className={styles.slotPreview}>
          <img src={image.preview} alt={label} />
          <button className={styles.removeBtn} onClick={onRemove} disabled={isLoading}>✕</button>
          <span className={styles.mainBadge}>{label}</span>
        </div>
      ) : (
        <button
          className={styles.slotBtn}
          onClick={() => inputRef?.current?.click()}
          disabled={isLoading}
        >
          <UploadIcon size={28} />
          <span>{label}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => onFileInputChange?.(e, type)}
        style={{ display: 'none' }}
      />
    </div>
  );

  return (
    <div className={styles.container}>
      {/* 스텝 인디케이터 */}
      <div className={styles.stepIndicator}>
        {[1, 2, 3, 4].map((num) => (
          <div
            key={num}
            className={`${styles.stepDot} ${getStepNumber() === num ? styles.active : ''} ${getStepNumber() > num ? styles.completed : ''}`}
          >
            {num}
          </div>
        ))}
      </div>

      {/* 모드 선택 (hideModeSelector가 false일 때만 표시) */}
      {!hideModeSelector && (
        <div className={styles.optionGroup}>
          <label className={styles.optionLabel}>합성 모드</label>
          <div className={styles.optionChips}>
            {MODE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`${styles.optionChip} ${mode === opt.id ? styles.active : ''}`}
                onClick={() => onModeChange?.(opt.id)}
                disabled={isLoading}
              >
                <span style={{ marginRight: 4 }}>{opt.icon}</span>
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 업로드 단계 */}
      {(step === 'upload' || step === 'options') && !resultImage && (
        <div className={styles.uploadStep}>
          <h3 className={styles.stepTitle}>
            {mode === 'location' && '배경과 전경 이미지를 올려주세요'}
            {mode === 'tryon' && '인물과 의류 이미지를 올려주세요'}
            {mode === 'background' && '원본 이미지를 올려주세요'}
          </h3>
          <p className={styles.stepDesc}>
            {mode === 'location' && '두 이미지를 자연스럽게 합성해요'}
            {mode === 'tryon' && '인물에게 의류를 가상으로 입혀요'}
            {mode === 'background' && 'AI가 새로운 배경을 생성해요'}
          </p>

          {/* Try-On 라이선스 경고 */}
          {mode === 'tryon' && (
            <div className={styles.analysisCard} style={{ background: '#FFF8E1', borderColor: '#FFE082' }}>
              <span style={{ color: '#F57C00' }}>⚠️ 이 기능은 비상업적 용도로만 사용할 수 있어요</span>
            </div>
          )}

          <div className={styles.uploadGrid}>
            {/* Location 모드 */}
            {mode === 'location' && (
              <>
                {renderUploadSlot(
                  backgroundImage,
                  backgroundInputRef,
                  'background',
                  '배경',
                  '합성할 장소',
                  () => onBackgroundImageChange?.(null)
                )}
                {renderUploadSlot(
                  foregroundImage,
                  foregroundInputRef,
                  'foreground',
                  '전경',
                  '합성할 대상',
                  () => onForegroundImageChange?.(null)
                )}
              </>
            )}

            {/* Try-On 모드 */}
            {mode === 'tryon' && (
              <>
                {renderUploadSlot(
                  humanImage,
                  humanInputRef,
                  'human',
                  '인물',
                  '정면 전신',
                  () => onHumanImageChange?.(null)
                )}
                {renderUploadSlot(
                  garmentImage,
                  garmentInputRef,
                  'garment',
                  '의류',
                  '단품 사진',
                  () => onGarmentImageChange?.(null)
                )}
              </>
            )}

            {/* Background 모드 */}
            {mode === 'background' && (
              <>
                {renderUploadSlot(
                  sourceImage,
                  sourceInputRef,
                  'source',
                  '원본',
                  '배경 교체할 이미지',
                  () => onSourceImageChange?.(null)
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 옵션 단계 */}
      {step === 'options' && !resultImage && (
        <div className={styles.optionsStep}>
          {/* Try-On: 의류 카테고리 */}
          {mode === 'tryon' && (
            <>
              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>👔 의류 종류</label>
                <div className={styles.optionChips}>
                  {GARMENT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      className={`${styles.optionChip} ${garmentCategory === cat.id ? styles.active : ''}`}
                      onClick={() => onGarmentCategoryChange?.(cat.id)}
                      disabled={isLoading}
                    >
                      <span style={{ marginRight: 4 }}>{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>
                  📝 의류 설명
                  <span className={styles.sliderValue}>(선택)</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 화이트 버튼업 셔츠"
                  value={garmentDescription}
                  onChange={(e) => onGarmentDescriptionChange?.(e.target.value)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1.5px solid #E8E8E8',
                    borderRadius: '10px',
                    fontSize: '14px',
                  }}
                />
              </div>
            </>
          )}

          {/* Background: 프롬프트 */}
          {mode === 'background' && (
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>
                🎨 새 배경 설명
                <span className={styles.required}>*</span>
              </label>
              <textarea
                placeholder="예: 푸른 바다가 보이는 해변, 현대적인 오피스 공간..."
                value={backgroundPrompt}
                onChange={(e) => onBackgroundPromptChange?.(e.target.value)}
                disabled={isLoading}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1.5px solid #E8E8E8',
                  borderRadius: '10px',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className={styles.analysisCard} style={{ background: '#FFEBEE', borderColor: '#FFCDD2' }}>
              <span style={{ color: '#C62828' }}>❌ {error}</span>
            </div>
          )}

          {/* 생성 버튼 */}
          <button
            className={styles.primaryBtn}
            onClick={onGenerate}
            disabled={!canGenerate()}
          >
            {isLoading ? (
              <>
                <div className={styles.spinnerSmall} />
                생성 중...
              </>
            ) : (
              <>
                {mode === 'location' && '합성하기'}
                {mode === 'tryon' && '피팅하기'}
                {mode === 'background' && '배경 생성'}
                <span className={styles.pointCost}>5P</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 생성 중 */}
      {step === 'generating' && (
        <div className={styles.analysisStep}>
          <div className={styles.spinner} />
          <p>
            {mode === 'location' && '이미지를 합성하고 있어요...'}
            {mode === 'tryon' && '가상 피팅을 진행하고 있어요...'}
            {mode === 'background' && '새 배경을 생성하고 있어요...'}
          </p>
          <p style={{ fontSize: 12, color: '#9E9E9E' }}>약 10-20초 정도 걸려요</p>
        </div>
      )}

      {/* 결과 */}
      {step === 'result' && resultImage && (
        <div className={styles.resultStep}>
          <div className={styles.resultPreview}>
            <img src={resultImage} alt="Result" />
          </div>

          <div className={styles.optionSummary}>
            <h4>합성 정보</h4>
            <div className={styles.summaryTags}>
              <span className={styles.summaryTag}>
                {MODE_OPTIONS.find(m => m.id === mode)?.name}
              </span>
              {mode === 'tryon' && (
                <span className={styles.summaryTag}>
                  {GARMENT_CATEGORIES.find(c => c.id === garmentCategory)?.name}
                </span>
              )}
            </div>
          </div>

          <div className={styles.resultActions}>
            <button className={styles.downloadBtn} onClick={onDownload}>
              <DownloadIcon size={20} />
              다운로드
            </button>
            <button className={styles.secondaryBtn} onClick={onRetry}>
              다시 생성
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompositePhoto;

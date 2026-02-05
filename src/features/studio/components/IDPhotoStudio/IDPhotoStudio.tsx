/**
 * IDPhotoStudio 컴포넌트
 * 증명사진 스튜디오 - ProfileStudio 스타일 통일
 *
 * 플로우: 용도선택 → 사진업로드(최대5장) → 스타일설정 → 결과
 * Gemini 3 Pro Image 사용 (다중 참조 이미지 지원)
 *
 * 최적화: useImageUpload 훅으로 즉시 업로드 + Toast 알림
 */
import React, { useState, useRef, useCallback } from 'react';
import { useImageUpload } from '../../../../hooks/useImageUpload';
import { useToast } from '../../../../components/common';
import { UploadIcon, DownloadIcon } from '../../../../components/common/Icons';
import styles from './ProfileStudio.module.css'; // ProfileStudio 스타일 공유

type Step = 'purpose' | 'upload' | 'style' | 'generating' | 'result';

// ===== 옵션 데이터 =====

// 용도 옵션
const PURPOSE_OPTIONS = [
  { id: 'resume', name: '이력서/취업', desc: '채용 서류용', icon: '📄' },
  { id: 'employee', name: '사원증/명함', desc: '회사 내부용', icon: '🪪' },
  { id: 'visa', name: '여권/비자', desc: '출입국 서류용', icon: '✈️' },
  { id: 'profile', name: 'SNS/프로필', desc: '온라인 프로필', icon: '👤' },
];

// 배경 옵션
const BACKGROUND_OPTIONS = [
  { id: 'white', name: '흰색' },
  { id: 'light-gray', name: '연회색' },
  { id: 'light-blue', name: '연파랑' },
];

// 복장 - 상위 옵션 (현재유지 / 웜톤 / 쿨톤)
const CLOTHING_MODE_OPTIONS = [
  { id: 'keep', name: '현재 옷 유지' },
  { id: 'warm', name: '웜톤 (따뜻한 색)' },
  { id: 'cool', name: '쿨톤 (차가운 색)' },
];

// 복장 - 웜톤 하위 옵션
const CLOTHING_WARM_OPTIONS = [
  { id: 'suit-brown', name: '브라운 정장' },
  { id: 'suit-beige', name: '베이지 정장' },
  { id: 'suit-camel', name: '카멜 정장' },
  { id: 'casual-warm', name: '따뜻한 캐주얼' },
];

// 복장 - 쿨톤 하위 옵션
const CLOTHING_COOL_OPTIONS = [
  { id: 'suit-navy', name: '네이비 정장' },
  { id: 'suit-charcoal', name: '차콜 정장' },
  { id: 'suit-black', name: '블랙 정장' },
  { id: 'casual-cool', name: '시원한 캐주얼' },
];

// 머리스타일 - 상위 옵션 (현재유지 / 스타일지정)
const HAIR_MODE_OPTIONS = [
  { id: 'keep', name: '현재 그대로 유지' },
  { id: 'custom', name: '스타일 지정' },
];

// 성별 옵션
const HAIR_GENDER_OPTIONS = [
  { id: 'female', name: '여성 스타일' },
  { id: 'male', name: '남성 스타일' },
];

// 여성 머리 길이 (5단계)
const HAIR_FEMALE_OPTIONS = [
  { id: 'pixie', name: '숏컷', desc: '귀 위~귀 라인' },
  { id: 'bob', name: '단발', desc: '턱선~귀 아래' },
  { id: 'shoulder', name: '어깨 길이', desc: '쇄골 라인' },
  { id: 'mid-long', name: '중간 긴머리', desc: '가슴 위' },
  { id: 'long', name: '긴머리', desc: '가슴 아래' },
];

// 남성 머리 스타일 (5개)
const HAIR_MALE_OPTIONS = [
  { id: 'two-block', name: '투블럭', desc: '옆/뒷머리 짧게' },
  { id: 'dandy', name: '댄디컷', desc: '클래식 비즈니스' },
  { id: 'pomade', name: '포마드', desc: '슬릭백 스타일' },
  { id: 'side-part', name: '가르마', desc: '7:3 가르마' },
  { id: 'natural', name: '내추럴', desc: '자연스러운 다운펌' },
];

// 웨이브 옵션 (공통)
const HAIR_WAVE_OPTIONS = [
  { id: 'straight', name: '직모' },
  { id: 'wave', name: '웨이브' },
];

// 귀 노출 옵션
const EAR_VISIBILITY_OPTIONS = [
  { id: 'any', name: '상관없음' },
  { id: 'visible', name: '귀 보이게' },
];

// 앞머리 옵션
const BANGS_OPTIONS = [
  { id: 'keep', name: '현재 유지' },
  { id: 'with', name: '앞머리 있음' },
  { id: 'without', name: '앞머리 없음' },
];

// 화장 - 상위 옵션 (없음 / 웜톤 / 쿨톤)
const MAKEUP_MODE_OPTIONS = [
  { id: 'none', name: '화장 안함' },
  { id: 'warm', name: '웜톤 메이크업' },
  { id: 'cool', name: '쿨톤 메이크업' },
];

// 보정 슬라이더 기본값
const DEFAULT_RETOUCH = {
  blemish: 50,    // 잡티/기미 제거 (여드름, 점, 흉터, 기미)
  wrinkle: 30,    // 주름/모공 완화 (눈가, 팔자, 이마, 목주름, 모공)
  darkCircle: 40, // 다크서클 제거
  slimFace: 20,   // 얼굴 갸름하게
  brightEyes: 30, // 눈 생기있게
  brightness: 50, // 전체 밝기
};

// ===== Props =====

interface IDPhotoStudioProps {
  className?: string;
  fullWidth?: boolean;
  onHeaderChange?: (header: { title: string; showBack: boolean; onBack?: () => void }) => void;
}

// ===== 컴포넌트 =====

export const IDPhotoStudio: React.FC<IDPhotoStudioProps> = ({
  className = '',
  onHeaderChange,
}) => {
  // Toast 훅
  const toast = useToast();

  // 이미지 업로드 훅 (즉시 업로드 + 압축)
  const {
    images: uploadedImages,
    state: uploadState,
    upload,
    remove: removeImage,
    clear: clearImages,
  } = useImageUpload({
    prefix: 'idphoto',
    maxFiles: 5,
    compress: {
      maxWidth: 1536,
      maxHeight: 1536,
      quality: 0.85,
      format: 'jpeg',
    },
    toast,
  });

  // 상태
  const [step, setStep] = useState<Step>('purpose');
  const [purpose, setPurpose] = useState<string | null>(null);
  const [mainImageId, setMainImageId] = useState<string | null>(null); // 메인 이미지 ID
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [options, setOptions] = useState({
    background: 'white',
    // 복장 계층
    clothingMode: 'keep',
    clothingStyle: '',
    // 머리스타일 계층
    hairMode: 'keep',
    hairGender: 'female',
    hairStyle: 'shoulder',
    hairWave: 'straight',
    earVisibility: 'any',
    bangs: 'keep',
    // 화장 계층
    makeupMode: 'none',
    makeupIntensity: 50,
  });

  const [retouch, setRetouch] = useState({ ...DEFAULT_RETOUCH });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 스텝 타이틀
  const getStepTitle = useCallback(() => {
    switch (step) {
      case 'purpose': return '용도 선택';
      case 'upload': return '사진 업로드';
      case 'style': return '스타일 설정';
      case 'generating': return '생성 중...';
      case 'result': return '완성!';
      default: return '증명사진';
    }
  }, [step]);

  // 뒤로가기
  const handleBack = useCallback(() => {
    setErrorMessage(null);
    switch (step) {
      case 'upload':
        setPurpose(null);
        setStep('purpose');
        break;
      case 'style':
        setStep('upload');
        break;
      case 'result':
        setResultImage(null);
        setStep('style');
        break;
    }
  }, [step]);

  // 헤더 업데이트
  React.useEffect(() => {
    onHeaderChange?.({
      title: getStepTitle(),
      showBack: step !== 'purpose' && step !== 'generating',
      onBack: handleBack,
    });
  }, [step, onHeaderChange, getStepTitle, handleBack]);

  // 용도 선택
  const handleSelectPurpose = (purposeId: string) => {
    setPurpose(purposeId);
    setStep('upload');
  };

  // 이미지 업로드 (훅 사용)
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    const uploaded = await upload(files);

    // 첫 번째 업로드 시 메인 이미지 자동 설정
    if (uploaded.length > 0 && !mainImageId) {
      setMainImageId(uploaded[0].id);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [upload, mainImageId]);

  // 이미지 삭제
  const handleRemoveImage = (id: string) => {
    removeImage(id);
    // 메인 이미지 삭제 시 첫번째를 메인으로
    if (mainImageId === id) {
      const remaining = uploadedImages.filter(img => img.id !== id);
      setMainImageId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // 메인 이미지 설정
  const handleSetMain = (id: string) => {
    setMainImageId(id);
  };

  // 메인 이미지 여부 확인
  const isMainImage = useCallback((id: string) => {
    return mainImageId === id || (mainImageId === null && uploadedImages[0]?.id === id);
  }, [mainImageId, uploadedImages]);

  // 옵션 변경
  const handleOptionChange = (key: string, value: string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  // 슬라이더 변경
  const handleRetouchChange = (key: keyof typeof DEFAULT_RETOUCH, value: number) => {
    setRetouch(prev => ({ ...prev, [key]: value }));
  };

  // 생성
  const handleGenerate = useCallback(async () => {
    if (uploadedImages.length === 0) return;

    setIsGenerating(true);
    setStep('generating');
    setErrorMessage(null);

    try {
      // 메인 이미지를 첫 번째로 정렬
      const sortedImages = [...uploadedImages].sort((a, b) => {
        if (isMainImage(a.id)) return -1;
        if (isMainImage(b.id)) return 1;
        return 0;
      });
      const referenceImages = sortedImages.map(img => img.base64);

      const response = await fetch('/api/generate-idphoto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceImages,
          purpose,
          background: options.background,
          // 복장 계층
          clothingMode: options.clothingMode,
          clothingStyle: options.clothingStyle,
          // 머리스타일 계층
          hairMode: options.hairMode,
          hairGender: options.hairGender,
          hairStyle: options.hairStyle,
          hairWave: options.hairWave,
          earVisibility: options.earVisibility,
          bangs: options.bangs,
          // 화장 계층
          makeupMode: options.makeupMode,
          makeupIntensity: options.makeupIntensity,
          // 보정
          retouch,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.friendlyMessage?.message || data.error || '생성 실패');
      }

      if (data.image) {
        setResultImage(data.image);
        setStep('result');
      } else {
        throw new Error('생성된 이미지가 없어요.');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setErrorMessage(error instanceof Error ? error.message : '네트워크 오류가 발생했어요.');
      setStep('style');
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedImages, purpose, options, retouch, isMainImage]);

  // 다운로드
  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `id-photo-${purpose || 'photo'}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(resultImage, '_blank');
    }
  };

  // 리셋
  const handleReset = () => {
    setStep('purpose');
    setPurpose(null);
    clearImages(); // 훅의 clear 함수 사용
    setMainImageId(null);
    setResultImage(null);
    setErrorMessage(null);
    setOptions({
      background: 'white',
      clothingMode: 'keep',
      clothingStyle: '',
      hairMode: 'keep',
      hairGender: 'female',
      hairStyle: 'shoulder',
      hairWave: 'straight',
      earVisibility: 'any',
      bangs: 'keep',
      makeupMode: 'none',
      makeupIntensity: 50,
    });
    setRetouch({ ...DEFAULT_RETOUCH });
  };

  // 스텝 번호
  const getStepNumber = () => {
    switch (step) {
      case 'purpose': return 1;
      case 'upload': return 2;
      case 'style':
      case 'generating': return 3;
      case 'result': return 4;
      default: return 1;
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* 스텝 인디케이터 (ProfileStudio 스타일) */}
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

      {/* 스텝 1: 용도 선택 */}
      {step === 'purpose' && (
        <div className={styles.uploadStep}>
          <h3 className={styles.stepTitle}>어떤 용도로 사용하시나요?</h3>
          <p className={styles.stepDesc}>용도에 맞는 규격과 스타일을 추천해드려요</p>

          <div className={styles.optionCategories}>
            <div className={styles.optionChips}>
              {PURPOSE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={styles.optionChip}
                  onClick={() => handleSelectPurpose(opt.id)}
                >
                  <span style={{ marginRight: 6 }}>{opt.icon}</span>
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 스텝 2: 사진 업로드 */}
      {step === 'upload' && (
        <div className={styles.uploadStep}>
          <h3 className={styles.stepTitle}>사진을 올려주세요</h3>
          <p className={styles.stepDesc}>최대 5장까지 업로드 가능해요. 많을수록 정확해요!</p>

          <div className={styles.uploadGrid}>
            {/* 업로드된 이미지들 */}
            {uploadedImages.map((img, idx) => (
              <div key={img.id} className={styles.uploadSlot}>
                <span className={styles.slotLabel}>
                  {isMainImage(img.id) ? '메인' : `참조 ${idx}`}
                  {isMainImage(img.id) && <span className={styles.required}>*</span>}
                </span>
                <div className={styles.slotPreview}>
                  <img src={img.base64} alt={`사진 ${idx + 1}`} />
                  <button className={styles.removeBtn} onClick={() => handleRemoveImage(img.id)}>✕</button>
                  {isMainImage(img.id) ? (
                    <span className={styles.mainBadge}>메인</span>
                  ) : (
                    <button
                      className={styles.subBadge}
                      onClick={() => handleSetMain(img.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      메인으로
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 추가 업로드 슬롯 */}
            {uploadedImages.length < 5 && (
              <div className={styles.uploadSlot}>
                <span className={styles.slotLabel}>
                  {uploadedImages.length === 0 ? '메인 사진' : '추가 사진'}
                  {uploadedImages.length === 0 && <span className={styles.required}>*</span>}
                  <span className={styles.slotHint}>{uploadedImages.length}/5</span>
                </span>
                <button
                  className={styles.slotBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadState.isUploading}
                >
                  {uploadState.isUploading ? (
                    <div className={styles.spinnerSmall} />
                  ) : (
                    <>
                      <UploadIcon size={28} />
                      <span>사진 추가</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          {/* 에러 메시지 */}
          {errorMessage && (
            <div className={styles.analysisCard} style={{ background: '#FFEBEE', borderColor: '#FFCDD2' }}>
              <span style={{ color: '#C62828' }}>⚠️ {errorMessage}</span>
            </div>
          )}

          {/* 가이드 */}
          {uploadedImages.length > 0 && uploadedImages.length < 3 && (
            <div className={styles.analysisCard}>
              <div className={styles.analysisInfo}>
                <span className={styles.analysisTitle}>💡 더 좋은 결과를 원한다면</span>
                <span className={styles.analysisWarning}>다양한 각도의 사진을 추가하면 더 정확해요</span>
              </div>
            </div>
          )}

          <button
            className={styles.primaryBtn}
            onClick={() => setStep('style')}
            disabled={uploadedImages.length === 0 || uploadState.isUploading}
          >
            {uploadState.isUploading ? '업로드 중...' : '다음 단계'}
          </button>
        </div>
      )}

      {/* 스텝 3: 스타일 설정 */}
      {step === 'style' && (
        <div className={styles.optionsStep}>
          {/* 업로드된 이미지 썸네일 */}
          <div className={styles.analysisCard}>
            <div className={styles.analysisHeader}>
              <div className={styles.scoreCircle}>
                <span className={styles.scoreValue}>{uploadedImages.length}</span>
                <span className={styles.scoreLabel}>장</span>
              </div>
              <div className={styles.analysisInfo}>
                <span className={styles.analysisTitle}>참조 사진</span>
                <span className={styles.analysisGood}>
                  {uploadedImages.length >= 3 ? '충분해요!' : uploadedImages.length >= 2 ? '좋아요' : '추가하면 더 좋아요'}
                </span>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <div className={styles.analysisCard} style={{ background: '#FFEBEE', borderColor: '#FFCDD2' }}>
              <span style={{ color: '#C62828' }}>⚠️ {errorMessage}</span>
              <button
                className={styles.addMoreBtn}
                onClick={() => setErrorMessage(null)}
                style={{ marginTop: 8 }}
              >
                확인
              </button>
            </div>
          )}

          {/* 복장 - 상위 옵션 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>👔 복장</label>
            <div className={styles.optionChips}>
              {CLOTHING_MODE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.optionChip} ${options.clothingMode === opt.id ? styles.active : ''}`}
                  onClick={() => {
                    handleOptionChange('clothingMode', opt.id);
                    if (opt.id === 'keep') handleOptionChange('clothingStyle', '');
                  }}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* 복장 - 웜톤 하위 옵션 */}
          {options.clothingMode === 'warm' && (
            <div className={styles.optionGroup} style={{ marginLeft: 16, borderLeft: '2px solid #FFAB91', paddingLeft: 12 }}>
              <label className={styles.optionLabel} style={{ fontSize: 13 }}>🔸 웜톤 스타일</label>
              <div className={styles.optionChips}>
                {CLOTHING_WARM_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`${styles.optionChip} ${options.clothingStyle === opt.id ? styles.active : ''}`}
                    onClick={() => handleOptionChange('clothingStyle', opt.id)}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 복장 - 쿨톤 하위 옵션 */}
          {options.clothingMode === 'cool' && (
            <div className={styles.optionGroup} style={{ marginLeft: 16, borderLeft: '2px solid #90CAF9', paddingLeft: 12 }}>
              <label className={styles.optionLabel} style={{ fontSize: 13 }}>🔹 쿨톤 스타일</label>
              <div className={styles.optionChips}>
                {CLOTHING_COOL_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`${styles.optionChip} ${options.clothingStyle === opt.id ? styles.active : ''}`}
                    onClick={() => handleOptionChange('clothingStyle', opt.id)}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 배경 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>🎨 배경</label>
            <div className={styles.optionChips}>
              {BACKGROUND_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.optionChip} ${options.background === opt.id ? styles.active : ''}`}
                  onClick={() => handleOptionChange('background', opt.id)}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* 머리스타일 - 상위 옵션 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>💇 머리스타일</label>
            <div className={styles.optionChips}>
              {HAIR_MODE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.optionChip} ${options.hairMode === opt.id ? styles.active : ''}`}
                  onClick={() => handleOptionChange('hairMode', opt.id)}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* 머리스타일 - 스타일 지정 시 하위 옵션 */}
          {options.hairMode === 'custom' && (
            <>
              {/* 성별 선택 */}
              <div className={styles.optionGroup} style={{ marginLeft: 16, borderLeft: '2px solid #CE93D8', paddingLeft: 12 }}>
                <label className={styles.optionLabel} style={{ fontSize: 13 }}>👤 스타일 유형</label>
                <div className={styles.optionChips}>
                  {HAIR_GENDER_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      className={`${styles.optionChip} ${options.hairGender === opt.id ? styles.active : ''}`}
                      onClick={() => {
                        handleOptionChange('hairGender', opt.id);
                        // 성별 변경 시 기본 스타일로 리셋
                        handleOptionChange('hairStyle', opt.id === 'female' ? 'shoulder' : 'two-block');
                      }}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 여성 스타일 */}
              {options.hairGender === 'female' && (
                <div className={styles.optionGroup} style={{ marginLeft: 16, borderLeft: '2px solid #F48FB1', paddingLeft: 12 }}>
                  <label className={styles.optionLabel} style={{ fontSize: 13 }}>💇‍♀️ 머리 길이</label>
                  <div className={styles.optionChips}>
                    {HAIR_FEMALE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        className={`${styles.optionChip} ${options.hairStyle === opt.id ? styles.active : ''}`}
                        onClick={() => handleOptionChange('hairStyle', opt.id)}
                        title={opt.desc}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 남성 스타일 */}
              {options.hairGender === 'male' && (
                <div className={styles.optionGroup} style={{ marginLeft: 16, borderLeft: '2px solid #64B5F6', paddingLeft: 12 }}>
                  <label className={styles.optionLabel} style={{ fontSize: 13 }}>💇‍♂️ 헤어 스타일</label>
                  <div className={styles.optionChips}>
                    {HAIR_MALE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        className={`${styles.optionChip} ${options.hairStyle === opt.id ? styles.active : ''}`}
                        onClick={() => handleOptionChange('hairStyle', opt.id)}
                        title={opt.desc}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 웨이브 (공통) */}
              <div className={styles.optionGroup} style={{ marginLeft: 16, borderLeft: '2px solid #CE93D8', paddingLeft: 12 }}>
                <label className={styles.optionLabel} style={{ fontSize: 13 }}>〰️ 웨이브</label>
                <div className={styles.optionChips}>
                  {HAIR_WAVE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      className={`${styles.optionChip} ${options.hairWave === opt.id ? styles.active : ''}`}
                      onClick={() => handleOptionChange('hairWave', opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 귀 노출 */}
              <div className={styles.optionGroup} style={{ marginLeft: 16, borderLeft: '2px solid #CE93D8', paddingLeft: 12 }}>
                <label className={styles.optionLabel} style={{ fontSize: 13 }}>👂 귀 노출</label>
                <div className={styles.optionChips}>
                  {EAR_VISIBILITY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      className={`${styles.optionChip} ${options.earVisibility === opt.id ? styles.active : ''}`}
                      onClick={() => handleOptionChange('earVisibility', opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 앞머리 */}
              <div className={styles.optionGroup} style={{ marginLeft: 16, borderLeft: '2px solid #CE93D8', paddingLeft: 12 }}>
                <label className={styles.optionLabel} style={{ fontSize: 13 }}>✂️ 앞머리</label>
                <div className={styles.optionChips}>
                  {BANGS_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      className={`${styles.optionChip} ${options.bangs === opt.id ? styles.active : ''}`}
                      onClick={() => handleOptionChange('bangs', opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 화장 - 상위 옵션 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>💄 화장</label>
            <div className={styles.optionChips}>
              {MAKEUP_MODE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.optionChip} ${options.makeupMode === opt.id ? styles.active : ''}`}
                  onClick={() => handleOptionChange('makeupMode', opt.id)}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* 화장 - 강도 슬라이더 (화장 선택 시에만 표시) */}
          {options.makeupMode !== 'none' && (
            <div className={styles.optionGroup} style={{ marginLeft: 16, borderLeft: `2px solid ${options.makeupMode === 'warm' ? '#FFAB91' : '#90CAF9'}`, paddingLeft: 12 }}>
              <label className={styles.optionLabel} style={{ fontSize: 13 }}>
                {options.makeupMode === 'warm' ? '🔸' : '🔹'} 화장 강도
                <span className={styles.sliderValue}>{options.makeupIntensity}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={options.makeupIntensity}
                onChange={(e) => handleOptionChange('makeupIntensity', e.target.value)}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>연하게</span>
                <span>진하게</span>
              </div>
            </div>
          )}

          {/* 보정 옵션 슬라이더 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>
              ✨ 잡티/기미 제거
              <span className={styles.sliderValue}>{retouch.blemish}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={retouch.blemish}
              onChange={(e) => handleRetouchChange('blemish', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>자연스럽게</span>
              <span>깨끗하게</span>
            </div>
          </div>

          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>
              🧴 주름/모공 완화
              <span className={styles.sliderValue}>{retouch.wrinkle}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={retouch.wrinkle}
              onChange={(e) => handleRetouchChange('wrinkle', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>자연스럽게</span>
              <span>매끄럽게</span>
            </div>
          </div>

          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>
              🌙 다크서클 제거
              <span className={styles.sliderValue}>{retouch.darkCircle}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={retouch.darkCircle}
              onChange={(e) => handleRetouchChange('darkCircle', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>유지</span>
              <span>밝게</span>
            </div>
          </div>

          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>
              💎 얼굴 갸름하게
              <span className={styles.sliderValue}>{retouch.slimFace}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={retouch.slimFace}
              onChange={(e) => handleRetouchChange('slimFace', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>원본</span>
              <span>갸름하게</span>
            </div>
          </div>

          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>
              👁️ 눈 생기있게
              <span className={styles.sliderValue}>{retouch.brightEyes}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={retouch.brightEyes}
              onChange={(e) => handleRetouchChange('brightEyes', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>자연스럽게</span>
              <span>생기있게</span>
            </div>
          </div>

          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>
              ☀️ 전체 밝기
              <span className={styles.sliderValue}>{retouch.brightness}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={retouch.brightness}
              onChange={(e) => handleRetouchChange('brightness', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>어둡게</span>
              <span>밝게</span>
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            className={styles.primaryBtn}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className={styles.spinnerSmall} />
                생성 중...
              </>
            ) : (
              <>증명사진 생성하기 <span className={styles.pointCost}>5P</span></>
            )}
          </button>
        </div>
      )}

      {/* 스텝: 생성 중 */}
      {step === 'generating' && (
        <div className={styles.analysisStep}>
          <div className={styles.spinner} />
          <p>참조 사진을 바탕으로 증명사진을 생성하고 있어요...</p>
          <p style={{ fontSize: 12, color: '#9E9E9E' }}>약 15-25초 정도 걸려요</p>
        </div>
      )}

      {/* 스텝 4: 결과 */}
      {step === 'result' && (
        <div className={styles.resultStep}>
          <div className={styles.resultPreview}>
            {resultImage && <img src={resultImage} alt="Result" />}
          </div>

          {/* 선택한 옵션 요약 */}
          <div className={styles.optionSummary}>
            <h4>선택한 옵션</h4>
            <div className={styles.summaryTags}>
              <span className={styles.summaryTag}>
                {PURPOSE_OPTIONS.find(p => p.id === purpose)?.name || '일반'}
              </span>
              <span className={styles.summaryTag}>
                {options.clothingMode === 'keep' ? '현재 복장' :
                  options.clothingStyle ?
                    [...CLOTHING_WARM_OPTIONS, ...CLOTHING_COOL_OPTIONS].find(c => c.id === options.clothingStyle)?.name :
                    (options.clothingMode === 'warm' ? '웜톤' : '쿨톤')}
              </span>
              <span className={styles.summaryTag}>
                {BACKGROUND_OPTIONS.find(b => b.id === options.background)?.name} 배경
              </span>
              {options.makeupMode !== 'none' && (
                <span className={styles.summaryTag}>
                  {options.makeupMode === 'warm' ? '웜톤' : '쿨톤'} 메이크업
                </span>
              )}
            </div>
          </div>

          {/* 수정 제안 */}
          <div className={styles.editSuggestions}>
            <h4>수정하고 싶으신가요?</h4>
            <div className={styles.suggestionBtns}>
              <button onClick={() => setStep('style')}>옵션 변경</button>
              <button onClick={() => setStep('upload')}>다른 사진으로</button>
            </div>
          </div>

          {/* 다운로드 */}
          <div className={styles.resultActions}>
            <button className={styles.downloadBtn} onClick={handleDownload}>
              <DownloadIcon size={20} />
              다운로드
            </button>
            <button className={styles.secondaryBtn} onClick={handleReset}>
              처음부터
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IDPhotoStudio;

/**
 * ProfileStudio 컴포넌트
 * 프로필/포트폴리오 사진 생성 - 자유로운 커스터마이징
 *
 * 플로우: 사진업로드(메인+서브) → 분석결과 → 세부옵션 → 결과+수정
 */
import React, { useState, useRef, useCallback } from 'react';
import styles from './ProfileStudio.module.css';
import { processImage } from '../../../../utils/imageUtils';
import { UploadIcon, DownloadIcon } from '../../../../components/common/Icons';
import { getApiUrl } from '../../../../utils/apiRoute';

// ===== 옵션 데이터 정의 =====

// 복장 모드
export type ClothingMode = 'keep' | 'modify' | 'change';

export const CLOTHING_MODES = [
  { id: 'keep' as ClothingMode, name: '현재 복장 유지', desc: '메인 사진의 복장 그대로' },
  { id: 'modify' as ClothingMode, name: '스타일만 변경', desc: '비슷한 스타일, 다른 색상/디테일' },
  { id: 'change' as ClothingMode, name: '다른 복장으로', desc: '완전히 새로운 복장 선택' },
];

// 복장 옵션 (완전 변경 시에만 표시)
export const CLOTHING_OPTIONS = {
  formal: {
    label: '포멀',
    options: [
      { id: 'suit-navy', name: '네이비 정장', desc: '신뢰감, 면접 추천' },
      { id: 'suit-charcoal', name: '차콜 정장', desc: '세련된 느낌' },
      { id: 'suit-black', name: '블랙 정장', desc: '격식 있는 자리' },
      { id: 'shirt-white', name: '화이트 셔츠', desc: '깔끔한 기본' },
      { id: 'blouse-formal', name: '포멀 블라우스', desc: '여성 비즈니스' },
    ],
  },
  smartCasual: {
    label: '스마트 캐주얼',
    options: [
      { id: 'knit-collar', name: '카라 니트', desc: '깔끔한 캐주얼' },
      { id: 'cardigan-set', name: '가디건 세트', desc: '지적인 분위기' },
      { id: 'turtleneck', name: '터틀넥', desc: '모던한 느낌' },
      { id: 'polo', name: '폴로 셔츠', desc: '단정한 캐주얼' },
    ],
  },
  casual: {
    label: '캐주얼',
    options: [
      { id: 'tshirt-basic', name: '기본 티셔츠', desc: '편안한 일상' },
      { id: 'hoodie', name: '후드티', desc: '편안한 느낌' },
      { id: 'denim', name: '데님 재킷', desc: '활동적인 느낌' },
    ],
  },
  professional: {
    label: '전문직',
    options: [
      { id: 'doctor-coat', name: '의사 가운', desc: '의료 전문가' },
      { id: 'lab-coat', name: '연구원 가운', desc: '과학/연구직' },
      { id: 'chef', name: '셰프복', desc: '요리 전문가' },
    ],
  },
};

// 스타일 변경용 옵션 (modify 모드)
export const STYLE_MODIFY_OPTIONS = [
  { id: 'color-navy', name: '네이비 톤으로', desc: '신뢰감 있는 색상' },
  { id: 'color-neutral', name: '무채색 톤으로', desc: '차분한 느낌' },
  { id: 'color-warm', name: '따뜻한 톤으로', desc: '친근한 느낌' },
  { id: 'more-formal', name: '좀 더 포멀하게', desc: '격식 있는 느낌' },
  { id: 'more-casual', name: '좀 더 캐주얼하게', desc: '편안한 느낌' },
];

// 머리스타일 옵션
export const HAIRSTYLE_OPTIONS = {
  common: [
    { id: 'current', name: '현재 그대로', desc: '손대지 않음' },
    { id: 'current-neat', name: '살짝 정돈', desc: '현재 스타일 깔끔하게' },
  ],
  male: [
    { id: 'short-neat', name: '짧고 단정하게', desc: '직장인 스타일' },
    { id: 'natural-wave', name: '자연스러운 웨이브', desc: '부드러운 느낌' },
    { id: 'volum-perm', name: '볼륨 펌', desc: '풍성한 느낌' },
  ],
  female: [
    { id: 'long-straight', name: '긴 생머리', desc: '우아한 느낌' },
    { id: 'long-wave', name: '긴 웨이브', desc: '여성스러운 느낌' },
    { id: 'short-bob', name: '단발', desc: '세련된 느낌' },
    { id: 'updo', name: '올림머리', desc: '격식 있는 자리' },
  ],
};

// 표정 옵션 (직관적으로)
export const EXPRESSION_OPTIONS = [
  { id: 'natural-smile', name: '자연스러운 미소', desc: '가장 무난한 선택' },
  { id: 'confident', name: '자신감 있게', desc: '당당한 느낌' },
  { id: 'friendly', name: '친근하게', desc: '호감 가는 느낌' },
  { id: 'professional', name: '진지하게', desc: '전문가다운 느낌' },
  { id: 'soft', name: '부드럽게', desc: '편안한 느낌' },
];

// 포즈 옵션 (직관적, 분위기 기반)
export const POSE_OPTIONS = [
  { id: 'natural-casual', name: '자연스러운 일상', desc: '친구가 찍어준 것처럼' },
  { id: 'professional-studio', name: '프로 촬영 느낌', desc: '사진관에서 찍은 것처럼' },
  { id: 'magazine-style', name: '잡지 화보 스타일', desc: '세련된 모델 느낌' },
  { id: 'linkedin-style', name: '링크드인 프로필', desc: '비즈니스 전문가 느낌' },
  { id: 'creative-artist', name: '크리에이티브', desc: '예술가/디자이너 느낌' },
];

// 배경 옵션
export const BACKGROUND_OPTIONS = [
  { id: 'white', name: '흰색', desc: '깔끔한 기본' },
  { id: 'light-gray', name: '연회색', desc: '부드러운 느낌' },
  { id: 'gradient', name: '그라데이션', desc: '고급스러운 느낌' },
  { id: 'studio', name: '스튜디오', desc: '전문 촬영 느낌' },
  { id: 'office-blur', name: '사무실 (블러)', desc: '업무 환경' },
  { id: 'outdoor-blur', name: '야외 (블러)', desc: '자연스러운 느낌' },
];

// 촬영 범위 + 강제 비율 매핑
export const FRAME_OPTIONS = [
  { id: 'headshot', name: '얼굴 중심', desc: '증명사진/프로필', ratio: '3:4' },
  { id: 'upper-body', name: '상반신', desc: '허리 위까지', ratio: '3:4' },
  { id: 'three-quarter', name: '3/4샷', desc: '무릎 위까지', ratio: '3:4' },
  { id: 'full-body', name: '전신', desc: '발끝까지', ratio: '9:16' },
];

// 보정 단계 (명확하게)
export const RETOUCH_OPTIONS = [
  { id: 'minimal', name: '최소 보정', desc: '잡티만 정리' },
  { id: 'natural', name: '자연스러운 보정', desc: '피부결 정돈' },
  { id: 'studio', name: '스튜디오급 보정', desc: '전문 촬영 수준' },
];

// ===== 타입 정의 =====

interface UploadedImage {
  id: string;
  role: 'main' | 'sub';
  base64: string;
}

// 분석 API 응답 데이터
interface AnalysisResponseData {
  lightingScore?: number;
  angleOffset?: number;
  resolutionScore?: number;
  backgroundScore?: number;
  faceRatioScore?: number;
}

interface AnalysisDetail {
  label: string;
  status: 'good' | 'warning' | 'bad';
  score: number;
  message: string;
}

interface AnalysisResult {
  score: number;
  faceDetected: boolean;
  lighting: 'good' | 'warning' | 'bad';
  quality: 'good' | 'warning' | 'bad';
  suggestions: string[];
  details: AnalysisDetail[];
}

interface ProfileOptions {
  clothingMode: ClothingMode;
  clothing: string;
  styleModify: string;
  hairstyle: string;
  expression: string;
  pose: string;
  background: string;
  frame: string;
  retouch: string;
  height: number;
  gender: 'male' | 'female';
}

type Step = 'upload' | 'analysis' | 'options' | 'result';

interface ProfileStudioProps {
  className?: string;
  onHeaderChange?: (header: { title: string; showBack: boolean; onBack?: () => void }) => void;
  onBack?: () => void;
}

// ===== 컴포넌트 =====

export const ProfileStudio: React.FC<ProfileStudioProps> = ({
  className = '',
  onHeaderChange,
  onBack,
}) => {
  // 상태
  const [step, setStep] = useState<Step>('upload');
  const [mainImage, setMainImage] = useState<UploadedImage | null>(null);
  const [subImage, setSubImage] = useState<UploadedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [options, setOptions] = useState<ProfileOptions>({
    clothingMode: 'keep',
    clothing: 'suit-navy',
    styleModify: 'color-navy',
    hairstyle: 'current',
    expression: 'natural-smile',
    pose: 'natural-casual',
    background: 'white',
    frame: 'upper-body',
    retouch: 'natural',
    height: 170,
    gender: 'male',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadRole, setCurrentUploadRole] = useState<'main' | 'sub' | null>(null);

  // 스텝 타이틀
  const getStepTitle = useCallback(() => {
    switch (step) {
      case 'upload': return '사진 업로드';
      case 'analysis': return '분석 중...';
      case 'options': return '옵션 설정';
      case 'result': return '완성!';
      default: return '프로필 사진';
    }
  }, [step]);

  // 뒤로가기
  const handleBack = useCallback(() => {
    switch (step) {
      case 'upload':
        onBack?.();
        break;
      case 'analysis':
        setStep('upload');
        break;
      case 'options':
        setStep('upload');
        setAnalysisResult(null);
        break;
      case 'result':
        setStep('options');
        setResultImage(null);
        break;
    }
  }, [step, onBack]);

  // 헤더 업데이트
  React.useEffect(() => {
    onHeaderChange?.({
      title: getStepTitle(),
      showBack: true,
      onBack: handleBack,
    });
  }, [step, onHeaderChange, getStepTitle, handleBack]);

  // 이미지 업로드
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadRole) return;

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const originalBase64 = event.target?.result as string;
          const processedBase64 = await processImage(originalBase64, {
            maxWidth: 2048,
            maxHeight: 2048,
            quality: 0.85,
            format: 'jpeg',
          });

          const newImage: UploadedImage = {
            id: `img-${Date.now()}`,
            role: currentUploadRole,
            base64: processedBase64,
          };

          if (currentUploadRole === 'main') {
            setMainImage(newImage);
          } else {
            setSubImage(newImage);
          }
        } catch (error) {
          console.error('Image processing error:', error);
          alert('이미지 처리 중 오류가 발생했어요.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File read error:', error);
      setIsProcessing(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    setCurrentUploadRole(null);
  }, [currentUploadRole]);

  // 슬롯 클릭
  const handleSlotClick = (role: 'main' | 'sub') => {
    setCurrentUploadRole(role);
    fileInputRef.current?.click();
  };

  // 이미지 삭제
  const handleRemoveImage = (role: 'main' | 'sub') => {
    if (role === 'main') setMainImage(null);
    else setSubImage(null);
  };

  // 분석 결과 세부 항목 생성
  const createAnalysisDetails = (data: AnalysisResponseData): AnalysisDetail[] => {
    const lightingScore = data.lightingScore ?? 80;
    const angleOffset = data.angleOffset ?? 3;
    const resolutionScore = data.resolutionScore ?? 85;
    const backgroundScore = data.backgroundScore ?? 75;
    const faceRatioScore = data.faceRatioScore ?? 82;

    return [
      {
        label: '조명',
        status: lightingScore >= 80 ? 'good' : lightingScore >= 60 ? 'warning' : 'bad',
        score: lightingScore,
        message: lightingScore >= 80 ? '좋음' : lightingScore >= 60 ? '보통' : '부족',
      },
      {
        label: '각도',
        status: angleOffset <= 5 ? 'good' : angleOffset <= 15 ? 'warning' : 'bad',
        score: Math.max(0, 100 - angleOffset * 5),
        message: angleOffset <= 5 ? '좋음' : '조정 필요',
      },
      {
        label: '화질',
        status: resolutionScore >= 80 ? 'good' : resolutionScore >= 60 ? 'warning' : 'bad',
        score: resolutionScore,
        message: resolutionScore >= 80 ? '좋음' : '보통',
      },
      {
        label: '배경',
        status: backgroundScore >= 80 ? 'good' : backgroundScore >= 60 ? 'warning' : 'bad',
        score: backgroundScore,
        message: backgroundScore >= 80 ? '깔끔' : '복잡',
      },
      {
        label: '얼굴 비율',
        status: faceRatioScore >= 80 ? 'good' : faceRatioScore >= 60 ? 'warning' : 'bad',
        score: faceRatioScore,
        message: faceRatioScore >= 80 ? '적절' : '조정 필요',
      },
    ];
  };

  // 분석 시작
  const handleStartAnalysis = useCallback(async () => {
    if (!mainImage) return;

    setStep('analysis');
    setIsAnalyzing(true);

    try {
      const response = await fetch(getApiUrl('/api/analyze-face', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: mainImage.base64 }),
      });

      if (response.ok) {
        const data = await response.json();
        const details = createAnalysisDetails(data);
        const avgScore = Math.round(details.reduce((sum, d) => sum + d.score, 0) / details.length);

        setAnalysisResult({
          score: avgScore,
          faceDetected: data.faceDetected ?? true,
          lighting: data.lighting ?? 'good',
          quality: data.quality ?? 'good',
          suggestions: data.suggestions ?? [],
          details,
        });
      } else {
        const defaultDetails = createAnalysisDetails({});
        setAnalysisResult({
          score: 80,
          faceDetected: true,
          lighting: 'good',
          quality: 'good',
          suggestions: [],
          details: defaultDetails,
        });
      }

      setStep('options');
    } catch (error) {
      console.error('Analysis error:', error);
      const errorDetails = createAnalysisDetails({ lightingScore: 70, backgroundScore: 65 });
      setAnalysisResult({
        score: 70,
        faceDetected: true,
        lighting: 'warning',
        quality: 'warning',
        suggestions: ['분석 중 오류 발생'],
        details: errorDetails,
      });
      setStep('options');
    } finally {
      setIsAnalyzing(false);
    }
  }, [mainImage]);

  // 옵션 변경
  const handleOptionChange = <K extends keyof ProfileOptions>(key: K, value: ProfileOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  // 프롬프트 생성
  const buildPrompt = useCallback(() => {
    const frameOption = FRAME_OPTIONS.find(f => f.id === options.frame);
    const poseOption = POSE_OPTIONS.find(p => p.id === options.pose);
    const expressionOption = EXPRESSION_OPTIONS.find(e => e.id === options.expression);
    const backgroundOption = BACKGROUND_OPTIONS.find(b => b.id === options.background);
    const retouchOption = RETOUCH_OPTIONS.find(r => r.id === options.retouch);

    let clothingPrompt = '';
    if (options.clothingMode === 'keep') {
      clothingPrompt = 'Keep the exact same clothing from the reference image.';
    } else if (options.clothingMode === 'modify') {
      const modifyOption = STYLE_MODIFY_OPTIONS.find(s => s.id === options.styleModify);
      clothingPrompt = `Keep similar clothing style but ${modifyOption?.desc || 'adjust slightly'}.`;
    } else {
      const allClothingOptions = Object.values(CLOTHING_OPTIONS).flatMap(c => c.options);
      const clothingOption = allClothingOptions.find(c => c.id === options.clothing);
      clothingPrompt = `Wearing ${clothingOption?.name || 'formal attire'}.`;
    }

    const hairstyleOptions = [...HAIRSTYLE_OPTIONS.common, ...HAIRSTYLE_OPTIONS.male, ...HAIRSTYLE_OPTIONS.female];
    const hairstyleOption = hairstyleOptions.find(h => h.id === options.hairstyle);

    const prompt = `Create a professional ${frameOption?.name || 'upper body'} portrait photo.
Korean ${options.gender === 'male' ? 'man' : 'woman'}, approximately ${options.height}cm tall.
${clothingPrompt}
Hairstyle: ${hairstyleOption?.name || 'current style'}.
Expression: ${expressionOption?.name || 'natural smile'}.
Pose style: ${poseOption?.desc || 'natural casual'}.
Background: ${backgroundOption?.name || 'white'}.
Retouching level: ${retouchOption?.desc || 'natural'}.
The output image MUST be in ${frameOption?.ratio || '3:4'} aspect ratio.
High quality, professional studio lighting, sharp focus.`;

    return prompt;
  }, [options]);

  // 사진 생성
  const handleGenerate = useCallback(async () => {
    if (!mainImage) return;

    setIsGenerating(true);

    try {
      const frameOption = FRAME_OPTIONS.find(f => f.id === options.frame);
      const prompt = buildPrompt();

      const response = await fetch(getApiUrl('/api/generate-image', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          referenceImage: mainImage.base64,
          aspectRatio: frameOption?.ratio || '3:4',
          model: 'gemini3pro',
          quality: 'hd',
          stylePreset: 'photo',
        }),
      });

      const data = await response.json();

      if (data.savedImage?.image_url || data.image) {
        setResultImage(data.savedImage?.image_url || data.image);
        setStep('result');
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('이미지 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  }, [mainImage, options, buildPrompt]);

  // 다운로드 (외부 URL도 blob으로 변환하여 직접 다운로드)
  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      // 외부 URL인 경우 fetch로 blob 변환
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `profile-photo-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // blob URL 해제
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      // fallback: 새 탭에서 열기
      window.open(resultImage, '_blank');
    }
  };

  // 처음부터
  const handleReset = () => {
    setStep('upload');
    setMainImage(null);
    setSubImage(null);
    setAnalysisResult(null);
    setResultImage(null);
  };

  // 선택된 비율 가져오기
  const getSelectedRatio = () => {
    return FRAME_OPTIONS.find(f => f.id === options.frame)?.ratio || '3:4';
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* 스텝 인디케이터 */}
      <div className={styles.stepIndicator}>
        {['upload', 'analysis', 'options', 'result'].map((s, i) => (
          <div
            key={s}
            className={`${styles.stepDot} ${step === s ? styles.active : ''} ${['upload', 'analysis', 'options', 'result'].indexOf(step) > i ? styles.completed : ''}`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* 스텝 1: 업로드 */}
      {step === 'upload' && (
        <div className={styles.uploadStep}>
          <h3 className={styles.stepTitle}>사진을 올려주세요</h3>
          <p className={styles.stepDesc}>메인 사진은 필수, 서브 사진은 참고용이에요</p>

          <div className={styles.uploadGrid}>
            {/* 메인 사진 */}
            <div className={styles.uploadSlot}>
              <span className={styles.slotLabel}>
                메인 사진 <span className={styles.required}>*</span>
                <span className={styles.slotHint}>복장/스타일 기준</span>
              </span>
              {mainImage ? (
                <div className={styles.slotPreview}>
                  <img src={mainImage.base64} alt="메인" />
                  <button className={styles.removeBtn} onClick={() => handleRemoveImage('main')}>✕</button>
                  <span className={styles.mainBadge}>메인</span>
                </div>
              ) : (
                <button className={styles.slotBtn} onClick={() => handleSlotClick('main')}>
                  <UploadIcon size={28} />
                  <span>메인 사진</span>
                </button>
              )}
            </div>

            {/* 서브 사진 */}
            <div className={styles.uploadSlot}>
              <span className={styles.slotLabel}>
                서브 사진
                <span className={styles.slotHint}>추가 참고용 (선택)</span>
              </span>
              {subImage ? (
                <div className={styles.slotPreview}>
                  <img src={subImage.base64} alt="서브" />
                  <button className={styles.removeBtn} onClick={() => handleRemoveImage('sub')}>✕</button>
                  <span className={styles.subBadge}>서브</span>
                </div>
              ) : (
                <button className={styles.slotBtn} onClick={() => handleSlotClick('sub')}>
                  <UploadIcon size={28} />
                  <span>서브 사진</span>
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <button
            className={styles.primaryBtn}
            onClick={handleStartAnalysis}
            disabled={!mainImage || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className={styles.spinnerSmall} />
                이미지 처리 중...
              </>
            ) : (
              '분석 시작'
            )}
          </button>
        </div>
      )}

      {/* 스텝 2: 분석 중 */}
      {step === 'analysis' && (
        <div className={styles.analysisStep}>
          <div className={styles.spinner} />
          <p>AI가 사진을 분석하고 있어요...</p>
        </div>
      )}

      {/* 스텝 3: 옵션 설정 */}
      {step === 'options' && (
        <div className={styles.optionsStep}>
          {/* 분석 결과 */}
          {analysisResult && (
            <div className={styles.analysisCard}>
              <div className={styles.analysisHeader}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreValue}>{analysisResult.score}</span>
                  <span className={styles.scoreLabel}>점</span>
                </div>
                <div className={styles.analysisInfo}>
                  <span className={styles.analysisTitle}>사진 적합도</span>
                  {analysisResult.score >= 80 ? (
                    <span className={styles.analysisGood}>좋은 사진이에요!</span>
                  ) : analysisResult.score >= 60 ? (
                    <span className={styles.analysisWarning}>괜찮아요, 진행 가능해요</span>
                  ) : (
                    <span className={styles.analysisBad}>더 좋은 사진이 있으면 추가해주세요</span>
                  )}
                </div>
              </div>
              <div className={styles.analysisDetails}>
                {analysisResult.details?.map((detail, i) => (
                  <div key={i} className={`${styles.analysisDetailItem} ${styles[detail.status]}`}>
                    <span className={styles.detailLabel}>{detail.label}</span>
                    <div className={styles.detailBar}>
                      <div className={styles.detailBarFill} style={{ width: `${detail.score}%` }} />
                    </div>
                    <span className={styles.detailScore}>{detail.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 성별 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>성별</label>
            <div className={styles.optionBtns}>
              <button
                className={`${styles.optionBtn} ${options.gender === 'male' ? styles.active : ''}`}
                onClick={() => handleOptionChange('gender', 'male')}
              >
                남성
              </button>
              <button
                className={`${styles.optionBtn} ${options.gender === 'female' ? styles.active : ''}`}
                onClick={() => handleOptionChange('gender', 'female')}
              >
                여성
              </button>
            </div>
          </div>

          {/* 복장 모드 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>👔 복장</label>
            <div className={styles.optionChips}>
              {CLOTHING_MODES.map(mode => (
                <button
                  key={mode.id}
                  className={`${styles.optionChip} ${options.clothingMode === mode.id ? styles.active : ''}`}
                  onClick={() => handleOptionChange('clothingMode', mode.id)}
                  title={mode.desc}
                >
                  {mode.name}
                </button>
              ))}
            </div>

            {/* 스타일 변경 옵션 (modify 모드) */}
            {options.clothingMode === 'modify' && (
              <div className={styles.subOptions}>
                <span className={styles.subLabel}>어떻게 변경할까요?</span>
                <div className={styles.optionChips}>
                  {STYLE_MODIFY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      className={`${styles.optionChip} ${options.styleModify === opt.id ? styles.active : ''}`}
                      onClick={() => handleOptionChange('styleModify', opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 복장 선택 (change 모드) */}
            {options.clothingMode === 'change' && (
              <div className={styles.optionCategories}>
                {Object.entries(CLOTHING_OPTIONS).map(([key, category]) => (
                  <div key={key} className={styles.optionCategory}>
                    <span className={styles.categoryLabel}>{category.label}</span>
                    <div className={styles.optionChips}>
                      {category.options.map(opt => (
                        <button
                          key={opt.id}
                          className={`${styles.optionChip} ${options.clothing === opt.id ? styles.active : ''}`}
                          onClick={() => handleOptionChange('clothing', opt.id)}
                        >
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 머리스타일 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>💇 머리스타일</label>
            <div className={styles.optionCategories}>
              <div className={styles.optionCategory}>
                <div className={styles.optionChips}>
                  {HAIRSTYLE_OPTIONS.common.map(opt => (
                    <button
                      key={opt.id}
                      className={`${styles.optionChip} ${options.hairstyle === opt.id ? styles.active : ''}`}
                      onClick={() => handleOptionChange('hairstyle', opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.optionCategory}>
                <span className={styles.categoryLabel}>{options.gender === 'male' ? '남성' : '여성'} 스타일</span>
                <div className={styles.optionChips}>
                  {(options.gender === 'male' ? HAIRSTYLE_OPTIONS.male : HAIRSTYLE_OPTIONS.female).map(opt => (
                    <button
                      key={opt.id}
                      className={`${styles.optionChip} ${options.hairstyle === opt.id ? styles.active : ''}`}
                      onClick={() => handleOptionChange('hairstyle', opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 표정 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>😊 표정</label>
            <div className={styles.optionChips}>
              {EXPRESSION_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.optionChip} ${options.expression === opt.id ? styles.active : ''}`}
                  onClick={() => handleOptionChange('expression', opt.id)}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* 포즈/분위기 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>📸 분위기</label>
            <div className={styles.optionChips}>
              {POSE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.optionChip} ${options.pose === opt.id ? styles.active : ''}`}
                  onClick={() => handleOptionChange('pose', opt.id)}
                  title={opt.desc}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

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

          {/* 촬영 범위 (비율 강제 표시) */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>
              📐 촬영 범위
              <span className={styles.ratioIndicator}>{getSelectedRatio()}</span>
            </label>
            <div className={styles.optionChips}>
              {FRAME_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.optionChip} ${options.frame === opt.id ? styles.active : ''}`}
                  onClick={() => handleOptionChange('frame', opt.id)}
                >
                  {opt.name}
                  <span className={styles.chipRatio}>{opt.ratio}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 보정 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>✨ 보정</label>
            <div className={styles.optionChips}>
              {RETOUCH_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.optionChip} ${options.retouch === opt.id ? styles.active : ''}`}
                  onClick={() => handleOptionChange('retouch', opt.id)}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* 키 */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>
              📏 키 보정
              <span className={styles.sliderValue}>{options.height}cm</span>
            </label>
            <input
              type="range"
              min="140"
              max="200"
              step="10"
              value={options.height}
              onChange={(e) => handleOptionChange('height', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>140cm</span>
              <span>170cm</span>
              <span>200cm</span>
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
              <>사진 생성하기</>
            )}
          </button>
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
                {CLOTHING_MODES.find(m => m.id === options.clothingMode)?.name}
              </span>
              <span className={styles.summaryTag}>
                {POSE_OPTIONS.find(p => p.id === options.pose)?.name}
              </span>
              <span className={styles.summaryTag}>
                {BACKGROUND_OPTIONS.find(b => b.id === options.background)?.name}
              </span>
              <span className={styles.summaryTag}>
                {FRAME_OPTIONS.find(f => f.id === options.frame)?.name} ({getSelectedRatio()})
              </span>
            </div>
          </div>

          {/* 수정 제안 */}
          <div className={styles.editSuggestions}>
            <h4>수정하고 싶으신가요?</h4>
            <div className={styles.suggestionBtns}>
              <button onClick={() => setStep('options')}>옵션 변경</button>
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

export default ProfileStudio;

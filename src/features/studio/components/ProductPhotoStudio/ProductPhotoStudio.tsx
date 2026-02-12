/**
 * ProductPhotoStudio 컴포넌트
 * 제품 사진 스튜디오 메인 컨테이너
 *
 * 플로우: 사진업로드 → 배경제거 → 스타일선택 → 결과
 */
import React, { useState, useCallback } from 'react';
import { StyleSelector, ProductStyle, SeasonOption, BackgroundColorOption } from './StyleSelector';
import { useImageUpload } from '../../../../hooks/useImageUpload';
import { useToast } from '../../../../components/common';
import { getApiUrl } from '../../../../utils/apiRoute';
import styles from './ProductPhotoStudio.module.css';

// 아이콘 (중앙 시스템에서 import)
import { UploadIcon, CheckIcon, DownloadIcon, ImageIcon } from '../../../../components/common/Icons';

// 단계 정의
type Step = 'upload' | 'processing' | 'style' | 'result';

interface ProductPhotoStudioProps {
  className?: string;
  fullWidth?: boolean;
  onHeaderChange?: (header: { title: string; showBack: boolean; onBack?: () => void }) => void;
}

export const ProductPhotoStudio: React.FC<ProductPhotoStudioProps> = ({
  className = '',
  fullWidth = false,
  onHeaderChange,
}) => {
  // Toast 훅
  const toast = useToast();

  // 이미지 업로드 훅
  const {
    images: uploadedImages,
    state: uploadState,
    upload,
    clear: clearUploadedImage,
  } = useImageUpload({
    prefix: 'product',
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    compress: {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.9,
      format: 'jpeg',
    },
    toast,
  });

  // 업로드된 이미지 (base64)
  const uploadedImage = uploadedImages[0]?.base64 || null;

  // 상태
  const [step, setStep] = useState<Step>('upload');
  const [processedImage, setProcessedImage] = useState<string | null>(null); // 배경 제거된 이미지
  const [selectedStyle, setSelectedStyle] = useState<ProductStyle | null>(null);
  const [selectedSubOption, setSelectedSubOption] = useState<SeasonOption | BackgroundColorOption | null>(null);
  const [, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // fileInputRef는 더 이상 필요 없지만 JSX에서 참조하므로 유지
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 뒤로가기
  const handleBack = useCallback(() => {
    switch (step) {
      case 'processing':
        clearUploadedImage();
        setProcessedImage(null);
        setErrorMessage(null);
        setStep('upload');
        break;
      case 'style':
        setSelectedStyle(null);
        setSelectedSubOption(null);
        setProcessedImage(null);
        setStep('upload');
        break;
      case 'result':
        setResultImage(null);
        setStep('style');
        break;
      default:
        break;
    }
  }, [step, clearUploadedImage]);

  // 이미지 업로드 처리 (파일 선택)
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 형식 체크
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('JPG, PNG, WebP 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    setErrorMessage(null);
    await upload(file);

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [upload]);

  // 드래그 앤 드롭 처리
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // 파일 형식 체크
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('JPG, PNG, WebP 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    setErrorMessage(null);
    await upload(file);
  }, [upload]);

  // 이미지 삭제
  const handleRemoveImage = useCallback(() => {
    clearUploadedImage();
    setErrorMessage(null);
  }, [clearUploadedImage]);

  // 배경 제거 시작
  const handleStartProcessing = useCallback(async () => {
    if (!uploadedImage) return;

    setStep('processing');
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch(getApiUrl('/api/remove-background', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadedImage, threshold: 0 }),
      });

      const data = await response.json();

      if (data.success && data.image) {
        setProcessedImage(data.image);
        setStep('style');
      } else {
        setErrorMessage(data.friendlyMessage?.message || '배경 제거에 실패했습니다. 다시 시도해주세요.');
        setStep('upload');
      }
    } catch (error) {
      setErrorMessage('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage]);

  // 스타일 선택
  const handleStyleSelect = useCallback((style: ProductStyle, subOption?: SeasonOption | BackgroundColorOption) => {
    setSelectedStyle(style);
    setSelectedSubOption(subOption || null);
  }, []);

  // 제품 사진 생성
  const handleGenerate = useCallback(async () => {
    if (!processedImage || !selectedStyle) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // 프롬프트 생성
      let prompt = selectedStyle.promptTemplate;

      // 서브옵션 치환
      if (selectedSubOption) {
        if ('color' in selectedSubOption) {
          // 스튜디오 배경색
          prompt = prompt.replace('{color}', selectedSubOption.name.toLowerCase());
        } else if ('description' in selectedSubOption) {
          // 계절
          prompt = prompt.replace('{season}', selectedSubOption.name);
        }
      } else {
        // 기본값 치환
        prompt = prompt.replace('{color}', 'white').replace('{season}', 'spring');
      }

      // generate-image API 호출
      const response = await fetch(getApiUrl('/api/generate-image', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          referenceImage: processedImage,
          aspectRatio: '1:1',
          model: 'gemini3pro',
          quality: 'hd',
          stylePreset: 'photo',
        }),
      });

      const data = await response.json();

      if (data.savedImage?.image_url || data.image) {
        setResultImage(data.savedImage?.image_url || data.image);
        setStep('result');
      } else if (data.error) {
        setErrorMessage(data.friendlyMessage?.message || '이미지 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      setErrorMessage('이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  }, [processedImage, selectedStyle, selectedSubOption]);

  // 다운로드
  const handleDownload = useCallback(() => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `product-photo-${selectedStyle?.key || 'studio'}-${Date.now()}.png`;
    link.click();
  }, [resultImage, selectedStyle]);

  // 처음부터 다시
  const handleReset = useCallback(() => {
    setStep('upload');
    clearUploadedImage();
    setProcessedImage(null);
    setSelectedStyle(null);
    setSelectedSubOption(null);
    setResultImage(null);
    setErrorMessage(null);
  }, [clearUploadedImage]);

  // 현재 단계의 타이틀
  const getStepTitle = useCallback(() => {
    switch (step) {
      case 'upload':
        return '제품 사진';
      case 'processing':
        return '배경 제거 중';
      case 'style':
        return '스타일 선택';
      case 'result':
        return '완성!';
      default:
        return '제품 사진';
    }
  }, [step]);

  // 뒤로가기 버튼 표시 여부
  const showBackButton = step !== 'upload';

  // 부모에게 헤더 정보 전달
  React.useEffect(() => {
    if (onHeaderChange) {
      onHeaderChange({
        title: getStepTitle(),
        showBack: showBackButton,
        onBack: showBackButton ? handleBack : undefined,
      });
    }
  }, [step, onHeaderChange, getStepTitle, showBackButton, handleBack]);

  // 렌더링
  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
      {/* 업로드 단계 */}
      {step === 'upload' && (
        <div className={styles.uploadStep}>
          <div className={styles.uploadContent}>
            {/* 업로드 영역 */}
            <div className={styles.uploadArea}>
              {/* 업로드된 이미지 미리보기 */}
              {uploadedImage ? (
                <div className={styles.imagePreviewContainer}>
                  <div className={styles.imagePreview}>
                    <img src={uploadedImage} alt="Preview" />
                    <button
                      className={styles.removeImageBtn}
                      onClick={handleRemoveImage}
                    >
                      ✕
                    </button>
                  </div>

                  {/* 배경 제거 시작 버튼 */}
                  <button
                    className={styles.startProcessBtn}
                    onClick={handleStartProcessing}
                  >
                    배경 제거 시작 →
                  </button>
                </div>
              ) : uploadState.isUploading ? (
                /* 업로드 중 */
                <div className={styles.uploadBtn}>
                  <div className={styles.spinner} />
                  <span className={styles.uploadText}>업로드 중...</span>
                  <span className={styles.uploadHint}>
                    {uploadState.progress}% 완료
                  </span>
                </div>
              ) : (
                /* 초기 업로드 버튼 (드래그 앤 드롭 지원) */
                <button
                  className={`${styles.uploadBtn} ${isDragging ? styles.dragging : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <UploadIcon size={32} />
                  <span className={styles.uploadText}>
                    {isDragging ? '여기에 놓으세요' : '제품 사진 업로드'}
                  </span>
                  <span className={styles.uploadHint}>
                    드래그 앤 드롭 또는 클릭 (JPG, PNG, WebP)
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              {/* 에러 메시지 */}
              {errorMessage && (
                <div className={styles.errorCard}>
                  <h4 className={styles.errorTitle}>⚠️ 오류</h4>
                  <p className={styles.errorMessage}>{errorMessage}</p>
                  <button className={styles.retryBtn} onClick={() => setErrorMessage(null)}>
                    확인
                  </button>
                </div>
              )}
            </div>

            {/* 가이드 패널 */}
            <div className={styles.guidePanel}>
              <h4 className={styles.guideTitle}>📸 좋은 제품 사진 촬영 팁</h4>

              <div className={styles.guideChecklist}>
                <div className={styles.guideItem}>
                  <CheckIcon size={16} />
                  <span>제품이 화면의 50% 이상 차지</span>
                </div>
                <div className={styles.guideItem}>
                  <CheckIcon size={16} />
                  <span>선명하고 흔들리지 않은 이미지</span>
                </div>
                <div className={styles.guideItem}>
                  <CheckIcon size={16} />
                  <span>단순한 배경 (자동 제거 정확도 ↑)</span>
                </div>
                <div className={styles.guideItem}>
                  <CheckIcon size={16} />
                  <span>균일한 조명, 그림자 최소화</span>
                </div>
              </div>

              <div className={styles.guideTip}>
                💡 배경이 복잡해도 AI가 자동으로 제거합니다. 제품만 잘 보이면 OK!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 배경 제거 중 */}
      {step === 'processing' && (
        <div className={styles.processingStep}>
          <div className={styles.processingContent}>
            <div className={styles.processingPreview}>
              {uploadedImage && (
                <img src={uploadedImage} alt="Processing" className={styles.processingImg} />
              )}
              <div className={styles.processingOverlay}>
                <div className={styles.spinner} />
                <span className={styles.processingText}>AI가 배경을 제거하고 있어요...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 스타일 선택 */}
      {step === 'style' && (
        <div className={styles.styleStep}>
          <div className={styles.styleContent}>
            {/* 처리된 이미지 미리보기 */}
            {processedImage && (
              <div className={styles.processedPreview}>
                <img src={processedImage} alt="Processed" />
              </div>
            )}

            {/* 스타일 선택기 */}
            <StyleSelector
              onSelect={handleStyleSelect}
              selectedStyle={selectedStyle}
              selectedSubOption={selectedSubOption}
            />

            {/* 생성 버튼 */}
            <button
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={!selectedStyle || isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className={styles.spinnerSmall} />
                  <span>생성 중...</span>
                </>
              ) : !selectedStyle ? (
                <span>스타일을 선택해주세요</span>
              ) : (
                <>
                  <ImageIcon size={18} />
                  <span>제품 사진 생성하기</span>
                </>
              )}
            </button>

            {/* 에러 메시지 */}
            {errorMessage && (
              <div className={styles.errorCard}>
                <h4 className={styles.errorTitle}>⚠️ 오류</h4>
                <p className={styles.errorMessage}>{errorMessage}</p>
                <button className={styles.retryBtn} onClick={() => setErrorMessage(null)}>
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 결과 */}
      {step === 'result' && (
        <div className={styles.resultStep}>
          <div className={styles.resultContent}>
            <div className={styles.resultPreview}>
              {resultImage && (
                <img src={resultImage} alt="Result" className={styles.resultImg} />
              )}
            </div>

            <div className={styles.resultActions}>
              {/* 결과 정보 */}
              <div className={styles.resultInfo}>
                <h4 className={styles.resultInfoTitle}>📸 생성 정보</h4>
                <div className={styles.resultInfoItem}>
                  <span>스타일</span>
                  <span className={styles.resultInfoValue}>
                    {selectedStyle?.icon} {selectedStyle?.name}
                  </span>
                </div>
                {selectedSubOption && 'name' in selectedSubOption && (
                  <div className={styles.resultInfoItem}>
                    <span>옵션</span>
                    <span className={styles.resultInfoValue}>{selectedSubOption.name}</span>
                  </div>
                )}
              </div>

              {/* 다운로드 버튼들 */}
              <div className={styles.downloadOptions}>
                <button className={styles.downloadBtn} onClick={handleDownload}>
                  <DownloadIcon size={20} />
                  <span>다운로드</span>
                </button>
                <button className={styles.secondaryBtn} onClick={() => setStep('style')}>
                  <span>🔄 다른 스타일</span>
                </button>
              </div>

              {/* 추가 액션 */}
              <div className={styles.extraActions}>
                <button className={styles.linkBtn} onClick={handleReset}>
                  처음부터 다시
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPhotoStudio;

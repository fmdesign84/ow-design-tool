/**
 * Tools View (편집 도구)
 * - 업스케일
 * - 배경 제거
 * - 텍스트 보정
 * - WebP 변환
 */

import React, { useCallback } from 'react';
import { Upscale, RemoveBackground, VideoToWebP } from '../../../features/studio';
import type { UpscaleScale, EdgeMode } from '../../../features/studio';
import { useToolsStore } from '../../../stores/useToolsStore';
import { useFileUpload } from '../hooks/useFileUpload';
import { CloseIcon, UploadIcon, SearchIcon, WandSparkleIcon } from '../../../components/common/Icons';
import styles from '../ImageGenPage.module.css';

// 서브메뉴 타입
type ToolsSubMenu = 'upscale' | 'remove-bg' | 'text-correct' | 'video-to-webp';

interface ToolsViewProps {
  activeSubMenu: ToolsSubMenu;
  // 공유 상태
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // 에러
  onError?: (error: string) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  activeSubMenu,
  isLoading,
  setIsLoading,
  onError,
}) => {
  // Tools Store
  const {
    uploadedImage,
    setUploadedImage,
    upscaleScale,
    setUpscaleScale,
    setUpscaleResult,
    isUpscaling,
    setIsUpscaling,
    edgeMode,
    setEdgeMode,
    setRemoveBgResult,
    isRemovingBg,
    setIsRemovingBg,
    textCorrectImage,
    setTextCorrectImage,
    textAnalysis,
    setTextAnalysis,
    textCorrectResult,
    setTextCorrectResult,
    isAnalyzing,
    setIsAnalyzing,
    isCorrecting,
    setIsCorrecting,
    error,
    setError,
  } = useToolsStore();

  // 파일 업로드 훅
  const {
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
  } = useFileUpload({
    onFileSelect: (image) => {
      if (activeSubMenu === 'text-correct') {
        setTextCorrectImage(image);
        setTextAnalysis(null);
        setTextCorrectResult(null);
      } else {
        setUploadedImage(image);
        setUpscaleResult(null);
        setRemoveBgResult(null);
      }
    },
  });

  // 이미지 제거
  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    setUpscaleResult(null);
    setRemoveBgResult(null);
  }, [setUploadedImage, setUpscaleResult, setRemoveBgResult]);

  // 파일 선택 열기
  const handleOpenImagePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  // 업스케일 배율 변경
  const handleUpscaleScaleChange = useCallback((scale: UpscaleScale) => {
    setUpscaleScale(scale);
  }, [setUpscaleScale]);

  // 가장자리 모드 변경
  const handleEdgeModeChange = useCallback((mode: EdgeMode) => {
    setEdgeMode(mode);
  }, [setEdgeMode]);

  // 업스케일 실행
  const handleUpscale = useCallback(async () => {
    if (!uploadedImage) return;

    setIsUpscaling(true);
    setError(null);

    try {
      const response = await fetch('/api/upscale-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage.base64 || uploadedImage.preview,
          scale: upscaleScale === '4x' ? 4 : 2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '업스케일 실패');
      }

      setUpscaleResult(data.image);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '업스케일 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUpscaling(false);
    }
  }, [uploadedImage, upscaleScale, setIsUpscaling, setError, setUpscaleResult, onError]);

  // 배경 제거 실행
  const handleRemoveBackground = useCallback(async () => {
    if (!uploadedImage) return;

    setIsRemovingBg(true);
    setError(null);

    // edgeMode를 threshold로 변환
    const thresholdMap: Record<string, number> = { soft: 0, medium: 0.3, sharp: 0.6 };
    const threshold = thresholdMap[edgeMode] || 0;

    try {
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage.base64 || uploadedImage.preview,
          threshold,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '배경 제거 실패');
      }

      setRemoveBgResult(data.image);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '배경 제거 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsRemovingBg(false);
    }
  }, [uploadedImage, edgeMode, setIsRemovingBg, setError, setRemoveBgResult, onError]);

  // 텍스트 분석 실행
  const handleAnalyzeText = useCallback(async () => {
    if (!textCorrectImage) return;

    setIsAnalyzing(true);
    setError(null);
    setTextAnalysis(null);

    try {
      const response = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: textCorrectImage.preview,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '텍스트 분석 실패');
      }

      setTextAnalysis(data.analysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '텍스트 분석 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, [textCorrectImage, setIsAnalyzing, setError, setTextAnalysis, onError]);

  // 텍스트 보정 실행
  const handleCorrectText = useCallback(async () => {
    if (!textCorrectImage || !textAnalysis?.textAreas) return;

    const areasToCorrect = textAnalysis.textAreas.filter((area: { needsCorrection: boolean }) => area.needsCorrection);
    if (areasToCorrect.length === 0) {
      setError('보정할 텍스트 영역이 없습니다.');
      return;
    }

    setIsCorrecting(true);
    setError(null);

    try {
      const response = await fetch('/api/correct-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: textCorrectImage.preview,
          correctionAreas: areasToCorrect,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '텍스트 보정 실패');
      }

      setTextCorrectResult(data.image);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '텍스트 보정 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsCorrecting(false);
    }
  }, [textCorrectImage, textAnalysis, setIsCorrecting, setError, setTextCorrectResult, onError]);

  // 텍스트 보정 이미지 제거
  const handleRemoveTextCorrectImage = useCallback(() => {
    setTextCorrectImage(null);
    setTextAnalysis(null);
    setTextCorrectResult(null);
  }, [setTextCorrectImage, setTextAnalysis, setTextCorrectResult]);

  // 서브메뉴별 렌더링
  switch (activeSubMenu) {
    case 'upscale':
      return (
        <Upscale
          uploadedImage={uploadedImage}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileInputChange={handleFileInputChange}
          onRemoveImage={handleRemoveImage}
          onOpenImagePicker={handleOpenImagePicker}
          upscaleScale={upscaleScale}
          onUpscaleScaleChange={handleUpscaleScaleChange}
          isLoading={isUpscaling}
          onUpscale={handleUpscale}
        />
      );

    case 'remove-bg':
      return (
        <RemoveBackground
          uploadedImage={uploadedImage}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileInputChange={handleFileInputChange}
          onRemoveImage={handleRemoveImage}
          onOpenImagePicker={handleOpenImagePicker}
          edgeMode={edgeMode}
          onEdgeModeChange={handleEdgeModeChange}
          isLoading={isRemovingBg}
          onRemoveBackground={handleRemoveBackground}
        />
      );

    case 'text-correct':
      return (
        <div className={styles.textCorrectContainer}>
          <div className={styles.textCorrectUpload}>
            {!textCorrectImage ? (
              <div
                className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleOpenImagePicker}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                <UploadIcon size={48} />
                <p>텍스트가 포함된 이미지를 업로드하세요</p>
                <span className={styles.dropZoneHint}>PNG, JPG, WEBP (최대 10MB)</span>
              </div>
            ) : (
              <div className={styles.textCorrectPreview}>
                <div className={styles.previewImageWrapper}>
                  <img src={textCorrectImage.preview} alt="분석할 이미지" />
                  <button
                    className={styles.removeImageBtn}
                    onClick={handleRemoveTextCorrectImage}
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>

                {/* 분석 버튼 */}
                {!textAnalysis && (
                  <button
                    className={styles.analyzeBtn}
                    onClick={handleAnalyzeText}
                    disabled={isAnalyzing}
                  >
                    <SearchIcon size={16} />
                    {isAnalyzing ? '분석 중...' : '텍스트 분석'}
                  </button>
                )}

                {/* 분석 결과 */}
                {textAnalysis && (
                  <div className={styles.analysisResult}>
                    <h4>분석 결과</h4>
                    {textAnalysis.hasText ? (
                      <>
                        <p className={styles.qualityBadge} data-quality={textAnalysis.textQuality}>
                          텍스트 품질: {textAnalysis.textQuality === 'good' ? '양호' : textAnalysis.textQuality === 'poor' ? '보정 필요' : '없음'}
                        </p>
                        {textAnalysis.suggestions && textAnalysis.suggestions.length > 0 && (
                          <ul className={styles.suggestions}>
                            {textAnalysis.suggestions.map((suggestion: string, idx: number) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        )}
                        {textAnalysis.textAreas?.some((area: { needsCorrection: boolean }) => area.needsCorrection) && (
                          <button
                            className={styles.correctBtn}
                            onClick={handleCorrectText}
                            disabled={isCorrecting}
                          >
                            <WandSparkleIcon size={16} />
                            {isCorrecting ? '보정 중...' : '텍스트 보정'}
                          </button>
                        )}
                      </>
                    ) : (
                      <p>이미지에서 텍스트를 찾을 수 없습니다.</p>
                    )}
                  </div>
                )}

                {/* 보정 결과 */}
                {textCorrectResult && (
                  <div className={styles.correctionResult}>
                    <h4>보정 결과</h4>
                    <img src={textCorrectResult} alt="보정된 이미지" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}
        </div>
      );

    case 'video-to-webp':
      return <VideoToWebP />;

    default:
      return <Upscale
        uploadedImage={uploadedImage}
        isDragging={isDragging}
        fileInputRef={fileInputRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInputChange={handleFileInputChange}
        onRemoveImage={handleRemoveImage}
        onOpenImagePicker={handleOpenImagePicker}
        upscaleScale={upscaleScale}
        onUpscaleScaleChange={handleUpscaleScaleChange}
        isLoading={isUpscaling}
        onUpscale={handleUpscale}
      />;
  }
};

export default ToolsView;

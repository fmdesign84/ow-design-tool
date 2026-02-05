/**
 * Image View (이미지 생성)
 * - text-to-image: FreeGeneration
 * - image-to-image: ImageToImage
 * - inpainting: InpaintingEditor
 * - id-photo-studio: IDPhotoStudio
 * - free-photo: ProfileStudio
 * - composite-photo: CompositePhoto
 */

import React, { useCallback } from 'react';
import {
  FreeGeneration,
  ImageToImage,
  InpaintingEditor,
  IDPhotoStudio,
  ProfileStudio,
} from '../../../features/studio';
import type { InpaintingData, ReferenceImage } from '../../../features/studio';
import { useImageGenStore } from '../../../stores/useImageGenStore';
import { useFileUpload } from '../hooks/useFileUpload';
import {
  QUALITY_OPTIONS,
  ASPECT_RATIOS,
  STYLE_PRESETS,
  NEGATIVE_PRESETS,
} from '../constants';
import type { GalleryItem } from '../../../features/studio/types';

// 서브메뉴 타입
type ImageSubMenu =
  | 'text-to-image'
  | 'image-to-image'
  | 'inpainting'
  | 'id-photo-studio'
  | 'free-photo'
  | 'composite-photo'
  | 'product-photo';

interface ImageViewProps {
  activeSubMenu: ImageSubMenu;
  // 프롬프트 (ImageGenPage에서 전달)
  prompt: string;
  // 공유 상태
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // 히스토리 관련
  imageHistory?: GalleryItem[];
  onImageGenerated?: (image: GalleryItem) => void;
  // 헤더 변경 (IDPhotoStudio, ProfileStudio)
  onIdPhotoHeaderChange?: (header: { title: string; showBack: boolean; onBack?: () => void }) => void;
  onFreePhotoHeaderChange?: (header: { title: string; showBack: boolean; onBack?: () => void }) => void;
  // 에러
  onError?: (error: string) => void;
}

export const ImageView: React.FC<ImageViewProps> = ({
  activeSubMenu,
  prompt,
  isLoading,
  setIsLoading,
  imageHistory,
  onImageGenerated,
  onIdPhotoHeaderChange,
  onFreePhotoHeaderChange,
  onError,
}) => {
  // Image Gen Store (prompt는 props로 받음)
  const {
    negativePrompt,
    selectedNegativePresets,
    selectedModel,
    setSelectedModel,
    quality,
    setQuality,
    aspectRatio,
    setAspectRatio,
    stylePreset,
    setStylePreset,
    uploadedImage,
    setUploadedImage,
    referenceImages,
    setReferenceImages,
    multiImageMode,
    inpaintingImage,
    recommendedModel,
    recommendReason,
    setError,
    setGeneratedImage,
    toggleNegativePreset,
    setNegativePrompt,
  } = useImageGenStore();

  // 파일 업로드 훅
  const {
    isDragging,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
  } = useFileUpload({
    onFileSelect: setUploadedImage,
    onError,
  });

  // 이미지 제거
  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
  }, [setUploadedImage]);

  // 파일 선택 열기
  const handleOpenImagePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  // 품질 변경
  const handleQualityChange = useCallback((q: string) => {
    setQuality(q);
  }, [setQuality]);

  // 비율 변경
  const handleAspectRatioChange = useCallback((ratio: string) => {
    setAspectRatio(ratio);
  }, [setAspectRatio]);

  // 스타일 변경
  const handleStylePresetChange = useCallback((style: string) => {
    setStylePreset(style);
  }, [setStylePreset]);

  // 네거티브 프롬프트 변경
  const handleNegativePromptChange = useCallback((p: string) => {
    setNegativePrompt(p);
  }, [setNegativePrompt]);

  // 네거티브 프리셋 토글
  const handleNegativePresetToggle = useCallback((preset: { key: string; label: string; prompt?: string; value?: string }) => {
    toggleNegativePreset(preset.key);
  }, [toggleNegativePreset]);

  // 참조 이미지 변경
  const handleReferenceImagesChange = useCallback((images: ReferenceImage[]) => {
    setReferenceImages(images);
  }, [setReferenceImages]);

  // 인페인팅 생성
  const handleInpaintingGenerate = useCallback(async (data: InpaintingData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: data.prompt,
          model: data.model,
          image: data.image,
          mask: data.mask,
          mode: 'inpainting',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '이미지 생성 실패');
      }

      setGeneratedImage(result.image || result.url);

      // 히스토리에 추가
      if (onImageGenerated && result.image) {
        onImageGenerated({
          id: result.id || Date.now().toString(),
          type: 'image',
          image: result.image,
          prompt: data.prompt,
          style: 'inpainting',
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '이미지 생성 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setGeneratedImage, onImageGenerated, onError]);

  // 프롬프트 변경 핸들러 (인페인팅용)
  const handlePromptChange = useCallback((p: string) => {
    useImageGenStore.getState().setPrompt(p);
  }, []);

  // 이미지로 생성 핸들러
  const handleImageToImageGenerate = useCallback(async () => {
    if (!uploadedImage && referenceImages.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          referenceImages: multiImageMode
            ? referenceImages.map(img => img.base64 || img.preview)
            : uploadedImage?.base64 || uploadedImage?.preview,
          aspectRatio,
          mode: 'image-to-image',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '이미지 생성 실패');
      }

      setGeneratedImage(result.image || result.url);

      if (onImageGenerated && result.image) {
        onImageGenerated({
          id: result.id || Date.now().toString(),
          type: 'image',
          image: result.image,
          prompt,
          style: 'image-to-image',
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '이미지 생성 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, referenceImages, prompt, selectedModel, multiImageMode, aspectRatio, setIsLoading, setError, setGeneratedImage, onImageGenerated, onError]);

  // 서브메뉴별 렌더링
  switch (activeSubMenu) {
    case 'text-to-image':
      return (
        <FreeGeneration
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          recommendedModel={recommendedModel}
          recommendReason={recommendReason}
          qualityOptions={QUALITY_OPTIONS}
          quality={quality}
          onQualityChange={handleQualityChange}
          aspectRatios={ASPECT_RATIOS}
          aspectRatio={aspectRatio}
          onAspectRatioChange={handleAspectRatioChange}
          stylePresets={STYLE_PRESETS}
          stylePreset={stylePreset}
          onStylePresetChange={handleStylePresetChange}
          negativePrompt={negativePrompt}
          onNegativePromptChange={handleNegativePromptChange}
          negativePresets={NEGATIVE_PRESETS.map(p => ({ ...p, prompt: p.value || '' }))}
          selectedNegativePresets={selectedNegativePresets}
          onNegativePresetToggle={handleNegativePresetToggle}
          isLoading={isLoading}
        />
      );

    case 'image-to-image':
      return (
        <ImageToImage
          multiImageMode={multiImageMode}
          referenceImages={referenceImages}
          onReferenceImagesChange={handleReferenceImagesChange}
          maxImages={14}
          uploadedImage={uploadedImage}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileInputChange={handleFileInputChange}
          onRemoveImage={handleRemoveImage}
          onOpenImagePicker={handleOpenImagePicker}
          aspectRatios={ASPECT_RATIOS}
          aspectRatio={aspectRatio}
          onAspectRatioChange={handleAspectRatioChange}
          prompt={prompt}
          isLoading={isLoading}
          onGenerate={handleImageToImageGenerate}
        />
      );

    case 'inpainting':
      return (
        <InpaintingEditor
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          prompt={prompt}
          onPromptChange={handlePromptChange}
          isLoading={isLoading}
          onGenerate={handleInpaintingGenerate}
          initialImage={inpaintingImage}
        />
      );

    case 'id-photo-studio':
      return (
        <IDPhotoStudio
          fullWidth
          onHeaderChange={onIdPhotoHeaderChange}
        />
      );

    case 'free-photo':
      return (
        <ProfileStudio
          onHeaderChange={onFreePhotoHeaderChange}
        />
      );

    case 'composite-photo':
      // TODO: CompositePhoto는 많은 상태 필요 - 추후 구현
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
          <h3>합성 사진</h3>
          <p>준비 중입니다.</p>
        </div>
      );

    case 'product-photo':
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
          <h3>제품 사진</h3>
          <p>준비 중입니다.</p>
        </div>
      );

    default:
      return (
        <FreeGeneration
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          recommendedModel={recommendedModel}
          recommendReason={recommendReason}
          qualityOptions={QUALITY_OPTIONS}
          quality={quality}
          onQualityChange={handleQualityChange}
          aspectRatios={ASPECT_RATIOS}
          aspectRatio={aspectRatio}
          onAspectRatioChange={handleAspectRatioChange}
          stylePresets={STYLE_PRESETS}
          stylePreset={stylePreset}
          onStylePresetChange={handleStylePresetChange}
          negativePrompt={negativePrompt}
          onNegativePromptChange={handleNegativePromptChange}
          negativePresets={NEGATIVE_PRESETS.map(p => ({ ...p, prompt: p.value || '' }))}
          selectedNegativePresets={selectedNegativePresets}
          onNegativePresetToggle={handleNegativePresetToggle}
          isLoading={isLoading}
        />
      );
  }
};

export default ImageView;

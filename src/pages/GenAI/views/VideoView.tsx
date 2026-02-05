/**
 * Video View (영상 생성)
 * - TextToVideo, ImageToVideo, MultiImageToVideo 서브메뉴
 */

import React, { useCallback, useRef, useState } from 'react';
import { TextToVideo, ImageToVideo, MultiImageToVideo } from '../../../features/studio';
import { useVideoStore } from '../../../stores/useVideoStore';
import type { VideoAspectRatio, VideoDuration, VideoResolution } from '../../../stores/useVideoStore';
import type { GalleryItem } from '../../../features/studio/types';
import { useFileUpload } from '../hooks/useFileUpload';

// 서브메뉴 타입
type VideoSubMenu = 'text-to-video' | 'image-to-video' | 'multi-image-to-video';

interface VideoViewProps {
  activeSubMenu: VideoSubMenu;
  // 프롬프트 (ImageGenPage에서 전달)
  videoPrompt: string;
  // 공유 상태
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // 히스토리 관련
  imageHistory?: GalleryItem[];
  onImageGenerated?: (image: GalleryItem) => void;
  // 에러
  onError?: (error: string) => void;
}

export const VideoView: React.FC<VideoViewProps> = ({
  activeSubMenu,
  videoPrompt,
  isLoading,
  setIsLoading,
  onError,
}) => {
  // Video Store (videoPrompt는 props로 받음)
  const {
    videoAspectRatio,
    setVideoAspectRatio,
    videoAspectRatioLocked,
    videoAspectRatioMismatch,
    videoDuration,
    setVideoDuration,
    videoResolution,
    setVideoResolution,
    videoGenerateAudio,
    setVideoGenerateAudio,
    uploadedImage,
    setUploadedImage,
    endImage,
    setEndImage,
    generatedVideo,
    setGeneratedVideo,
    setError,
  } = useVideoStore();

  // 파일 업로드 (시작 이미지)
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

  // 마지막 이미지용 상태 (MultiImageToVideo)
  const [isEndDragging, setIsEndDragging] = useState(false);
  const endImageInputRef = useRef<HTMLInputElement>(null);

  // 마지막 이미지 드래그 핸들러
  const handleEndDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsEndDragging(true);
  }, []);

  const handleEndDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsEndDragging(true);
  }, []);

  const handleEndDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsEndDragging(false);
  }, []);

  // File → 압축된 base64 data URL 변환 헬퍼
  const fileToBase64 = useCallback((file: File, maxSize = 2048, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // 리사이즈 필요 여부
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // 캔버스에 그리기
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // 압축된 data URL 반환
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleEndDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsEndDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await fileToBase64(file);
        setEndImage({ preview: base64, name: file.name, base64, file });
      } catch (err) {
        onError?.('이미지 처리 중 오류가 발생했습니다.');
      }
    }
  }, [setEndImage, fileToBase64, onError]);

  const handleEndImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setEndImage({ preview: base64, name: file.name, base64, file });
      } catch (err) {
        onError?.('이미지 처리 중 오류가 발생했습니다.');
      }
    }
    e.target.value = '';
  }, [setEndImage, fileToBase64, onError]);

  // 이미지 제거 핸들러
  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
  }, [setUploadedImage]);

  const handleRemoveEndImage = useCallback(() => {
    setEndImage(null);
  }, [setEndImage]);

  // 이미지 선택 열기
  const handleOpenImagePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  const handleOpenEndImagePicker = useCallback(() => {
    endImageInputRef.current?.click();
  }, []);

  // 영상 옵션 변경 핸들러
  const handleVideoAspectRatioChange = useCallback((ratio: VideoAspectRatio) => {
    setVideoAspectRatio(ratio);
  }, [setVideoAspectRatio]);

  const handleVideoDurationChange = useCallback((duration: VideoDuration) => {
    setVideoDuration(duration);
  }, [setVideoDuration]);

  const handleVideoResolutionChange = useCallback((resolution: VideoResolution) => {
    setVideoResolution(resolution);
  }, [setVideoResolution]);

  const handleVideoGenerateAudioChange = useCallback((checked: boolean) => {
    setVideoGenerateAudio(checked);
  }, [setVideoGenerateAudio]);

  // 영상 생성 핸들러
  const handleGenerateVideo = useCallback(async () => {
    // 모드별 유효성 검사
    if (activeSubMenu === 'text-to-video') {
      if (!videoPrompt.trim()) {
        onError?.('영상 설명을 입력해주세요.');
        return;
      }
    } else if (activeSubMenu === 'image-to-video') {
      if (!uploadedImage) {
        onError?.('시작 이미지를 업로드해주세요.');
        return;
      }
      if (!videoPrompt.trim()) {
        onError?.('영상 설명을 입력해주세요.');
        return;
      }
    } else if (activeSubMenu === 'multi-image-to-video') {
      if (!uploadedImage) {
        onError?.('시작 이미지를 업로드해주세요.');
        return;
      }
      if (!endImage) {
        onError?.('종료 이미지를 업로드해주세요.');
        return;
      }
      if (!videoPrompt.trim()) {
        onError?.('영상 설명을 입력해주세요.');
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      const requestBody: Record<string, unknown> = {
        prompt: videoPrompt,
        aspectRatio: videoAspectRatio,
        duration: parseInt(videoDuration),
        resolution: videoResolution,
        generateAudio: videoGenerateAudio,
      };

      // 이미지가 있으면 추가
      if (uploadedImage) {
        requestBody.image = uploadedImage.base64 || uploadedImage.preview;
      }
      if (endImage) {
        requestBody.endImage = endImage.base64 || endImage.preview;
      }

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '영상 생성 실패');
      }

      setGeneratedVideo(data.videoUrl || data.url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '영상 생성 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeSubMenu,
    videoPrompt,
    videoAspectRatio,
    videoDuration,
    videoResolution,
    videoGenerateAudio,
    uploadedImage,
    endImage,
    setIsLoading,
    setError,
    setGeneratedVideo,
    onError,
  ]);

  // 서브메뉴별 렌더링
  switch (activeSubMenu) {
    case 'text-to-video':
      return (
        <TextToVideo
          videoAspectRatio={videoAspectRatio}
          onVideoAspectRatioChange={handleVideoAspectRatioChange}
          videoDuration={videoDuration}
          onVideoDurationChange={handleVideoDurationChange}
          videoResolution={videoResolution}
          onVideoResolutionChange={handleVideoResolutionChange}
          videoGenerateAudio={videoGenerateAudio}
          onVideoGenerateAudioChange={handleVideoGenerateAudioChange}
          videoPrompt={videoPrompt}
          isLoading={isLoading}
          onGenerateVideo={handleGenerateVideo}
          generatedVideo={generatedVideo}
        />
      );

    case 'image-to-video':
      return (
        <ImageToVideo
          uploadedImage={uploadedImage}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileInputChange={handleFileInputChange}
          onRemoveImage={handleRemoveImage}
          onOpenImagePicker={handleOpenImagePicker}
          videoAspectRatioMismatch={videoAspectRatioMismatch}
          videoAspectRatioLocked={videoAspectRatioLocked}
          videoAspectRatio={videoAspectRatio}
          onVideoAspectRatioChange={handleVideoAspectRatioChange}
          videoDuration={videoDuration}
          onVideoDurationChange={handleVideoDurationChange}
          videoResolution={videoResolution}
          onVideoResolutionChange={handleVideoResolutionChange}
          videoGenerateAudio={videoGenerateAudio}
          onVideoGenerateAudioChange={handleVideoGenerateAudioChange}
          videoPrompt={videoPrompt}
          isLoading={isLoading}
          onGenerateVideo={handleGenerateVideo}
          generatedVideo={generatedVideo}
        />
      );

    case 'multi-image-to-video':
      return (
        <MultiImageToVideo
          uploadedImage={uploadedImage}
          fileInputRef={fileInputRef}
          onFileInputChange={handleFileInputChange}
          onRemoveStartImage={handleRemoveImage}
          onOpenStartImagePicker={handleOpenImagePicker}
          endImage={endImage}
          endImageInputRef={endImageInputRef}
          onEndImageChange={handleEndImageChange}
          onRemoveEndImage={handleRemoveEndImage}
          onOpenEndImagePicker={handleOpenEndImagePicker}
          isStartDragging={isDragging}
          isEndDragging={isEndDragging}
          onStartDragEnter={handleDragOver}
          onStartDragOver={handleDragOver}
          onStartDragLeave={handleDragLeave}
          onStartDrop={handleDrop}
          onEndDragEnter={handleEndDragEnter}
          onEndDragOver={handleEndDragOver}
          onEndDragLeave={handleEndDragLeave}
          onEndDrop={handleEndDrop}
          videoAspectRatioMismatch={videoAspectRatioMismatch}
          videoAspectRatioLocked={videoAspectRatioLocked}
          videoAspectRatio={videoAspectRatio}
          onVideoAspectRatioChange={handleVideoAspectRatioChange}
          videoDuration={videoDuration}
          onVideoDurationChange={handleVideoDurationChange}
          videoResolution={videoResolution}
          onVideoResolutionChange={handleVideoResolutionChange}
          videoGenerateAudio={videoGenerateAudio}
          onVideoGenerateAudioChange={handleVideoGenerateAudioChange}
          videoPrompt={videoPrompt}
          isLoading={isLoading}
          onGenerateVideo={handleGenerateVideo}
          generatedVideo={generatedVideo}
        />
      );

    default:
      return (
        <TextToVideo
          videoAspectRatio={videoAspectRatio}
          onVideoAspectRatioChange={handleVideoAspectRatioChange}
          videoDuration={videoDuration}
          onVideoDurationChange={handleVideoDurationChange}
          videoResolution={videoResolution}
          onVideoResolutionChange={handleVideoResolutionChange}
          videoGenerateAudio={videoGenerateAudio}
          onVideoGenerateAudioChange={handleVideoGenerateAudioChange}
          videoPrompt={videoPrompt}
          isLoading={isLoading}
          onGenerateVideo={handleGenerateVideo}
          generatedVideo={generatedVideo}
        />
      );
  }
};

export default VideoView;

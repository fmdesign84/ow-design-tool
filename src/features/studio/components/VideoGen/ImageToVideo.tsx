/**
 * ImageToVideo 컴포넌트
 * 시작 이미지로 영상을 생성하는 UI
 */
import React from 'react';
import { UploadIcon, CloseIcon, LockIcon } from '../../../../components/common/Icons';
import type { UploadedImage } from '../../types';
import type { VideoAspectRatio, VideoDuration, VideoResolution } from './TextToVideo';
import styles from './ImageToVideo.module.css';

interface AspectRatioMismatch {
  original: string;
  target: string;
}

interface ImageToVideoProps {
  // 이미지 업로드
  uploadedImage: UploadedImage | null;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onOpenImagePicker: () => void;

  // 비율 불일치
  videoAspectRatioMismatch: AspectRatioMismatch | null;
  videoAspectRatioLocked: boolean;

  // 영상 설정
  videoAspectRatio: VideoAspectRatio;
  onVideoAspectRatioChange: (ratio: VideoAspectRatio) => void;
  videoDuration: VideoDuration;
  onVideoDurationChange: (duration: VideoDuration) => void;
  videoResolution: VideoResolution;
  onVideoResolutionChange: (resolution: VideoResolution) => void;
  videoGenerateAudio: boolean;
  onVideoGenerateAudioChange: (checked: boolean) => void;

  // 생성 관련
  videoPrompt: string;
  isLoading: boolean;
  onGenerateVideo: () => void;
  generatedVideo: string | null;
}

export const ImageToVideo: React.FC<ImageToVideoProps> = ({
  uploadedImage,
  isDragging,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onRemoveImage,
  onOpenImagePicker,
  videoAspectRatioMismatch,
  videoAspectRatioLocked,
  videoAspectRatio,
  onVideoAspectRatioChange,
  videoDuration,
  onVideoDurationChange,
  videoResolution,
  onVideoResolutionChange,
  videoGenerateAudio,
  onVideoGenerateAudioChange,
  videoPrompt,
  isLoading,
  onGenerateVideo,
  generatedVideo,
}) => {
  return (
    <>
      {/* 이미지 업로드 영역 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          시작 이미지
          <span className={styles.required}>*</span>
        </label>
        <div
          className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''} ${uploadedImage ? styles.hasImage : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploadedImage && onOpenImagePicker()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileInputChange}
            style={{ display: 'none' }}
          />
          {uploadedImage ? (
            <div className={styles.uploadedPreview}>
              <img src={uploadedImage.preview} alt="Preview" className={styles.previewImage} />
              <button
                type="button"
                className={styles.removeImageBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage();
                }}
              >
                <CloseIcon size={16} />
              </button>
              <span className={styles.uploadedFileName}>{uploadedImage.name}</span>
            </div>
          ) : (
            <div className={styles.uploadPlaceholder}>
              <div className={styles.uploadIconWrapper}>
                <UploadIcon size={32} />
              </div>
              <p className={styles.uploadText}>
                이미지를 드래그하거나 클릭하여 업로드
              </p>
              <p className={styles.uploadHint}>PNG, JPG, WEBP (자동 압축)</p>
            </div>
          )}
        </div>
        {videoAspectRatioMismatch && (
          <p className={styles.ratioMismatchHint}>
            💡 이미지 비율({videoAspectRatioMismatch.original})이 영상 비율({videoAspectRatioMismatch.target})과 다릅니다.
            AI가 자동으로 비율을 맞춰 영상을 생성합니다.
          </p>
        )}
      </div>

      {/* 영상 비율 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          영상 비율
          {videoAspectRatioLocked && (
            <span className={styles.lockedIndicator}>
              <LockIcon size={12} /> 자동 설정됨
            </span>
          )}
        </label>
        <div className={`${styles.qualitySelector} ${videoAspectRatioLocked ? styles.selectorLocked : ''}`}>
          <button
            className={`${styles.qualityBtn} ${videoAspectRatio === '16:9' ? styles.active : ''}`}
            onClick={() => onVideoAspectRatioChange('16:9')}
            disabled={isLoading || videoAspectRatioLocked}
          >
            16:9
          </button>
          <button
            className={`${styles.qualityBtn} ${videoAspectRatio === '9:16' ? styles.active : ''}`}
            onClick={() => onVideoAspectRatioChange('9:16')}
            disabled={isLoading || videoAspectRatioLocked}
          >
            9:16
          </button>
        </div>
      </div>

      {/* 영상 길이 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>영상 길이</label>
        <div className={styles.qualitySelector}>
          <button
            className={`${styles.qualityBtn} ${videoDuration === '4' ? styles.active : ''}`}
            onClick={() => onVideoDurationChange('4')}
            disabled={isLoading}
          >
            4초
          </button>
          <button
            className={`${styles.qualityBtn} ${videoDuration === '6' ? styles.active : ''}`}
            onClick={() => onVideoDurationChange('6')}
            disabled={isLoading}
          >
            6초
          </button>
          <button
            className={`${styles.qualityBtn} ${videoDuration === '8' ? styles.active : ''}`}
            onClick={() => onVideoDurationChange('8')}
            disabled={isLoading}
          >
            8초
          </button>
        </div>
      </div>

      {/* 해상도 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>해상도</label>
        <div className={styles.qualitySelector}>
          <button
            className={`${styles.qualityBtn} ${videoResolution === '720p' ? styles.active : ''}`}
            onClick={() => onVideoResolutionChange('720p')}
            disabled={isLoading}
          >
            720p
          </button>
          <button
            className={`${styles.qualityBtn} ${videoResolution === '1080p' ? styles.active : ''}`}
            onClick={() => onVideoResolutionChange('1080p')}
            disabled={isLoading}
          >
            1080p
          </button>
        </div>
        <p className={styles.hint}>1080p는 처리 시간이 더 걸립니다.</p>
      </div>

      {/* 오디오 생성 */}
      <div className={styles.settingGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={videoGenerateAudio}
            onChange={(e) => onVideoGenerateAudioChange(e.target.checked)}
            disabled={isLoading}
          />
          <span>오디오 자동 생성</span>
        </label>
        <p className={styles.hint}>환경음과 대화를 AI가 생성합니다.</p>
      </div>

      {/* 영상 생성 버튼 */}
      <button
        className={styles.generateBtn}
        onClick={onGenerateVideo}
        disabled={isLoading || !uploadedImage || !videoPrompt.trim()}
      >
        {isLoading ? '영상 생성 중...' : '영상 만들기'}
      </button>

      <p className={styles.hint}>
        처리 시간: 약 1~6분 소요
      </p>

      {/* 생성된 영상 결과 */}
      {generatedVideo && (
        <div className={styles.settingGroup}>
          <label className={styles.label}>생성된 영상</label>
          <video
            src={generatedVideo}
            controls
            autoPlay
            loop
            className={styles.generatedVideo}
          />
          <a
            href={generatedVideo}
            download={`video-${Date.now()}.mp4`}
            className={styles.downloadBtn}
          >
            영상 다운로드
          </a>
        </div>
      )}
    </>
  );
};

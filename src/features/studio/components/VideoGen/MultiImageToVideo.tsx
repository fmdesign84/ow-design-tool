/**
 * MultiImageToVideo 컴포넌트
 * 시작/끝 이미지로 영상을 생성하는 UI
 */
import React from 'react';
import { UploadIcon, CloseIcon, LockIcon } from '../../../../components/common/Icons';
import type { UploadedImage } from '../../types';
import type { VideoAspectRatio, VideoDuration, VideoResolution } from './TextToVideo';
import styles from './MultiImageToVideo.module.css';

interface AspectRatioMismatch {
  original: string;
  target: string;
}

interface MultiImageToVideoProps {
  // 시작 이미지
  uploadedImage: UploadedImage | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveStartImage: () => void;
  onOpenStartImagePicker: () => void;

  // 마지막 이미지
  endImage: UploadedImage | null;
  endImageInputRef: React.RefObject<HTMLInputElement | null>;
  onEndImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveEndImage: () => void;
  onOpenEndImagePicker: () => void;

  // 드래그 앤 드롭
  isStartDragging: boolean;
  isEndDragging: boolean;
  onStartDragEnter: (e: React.DragEvent) => void;
  onStartDragOver: (e: React.DragEvent) => void;
  onStartDragLeave: (e: React.DragEvent) => void;
  onStartDrop: (e: React.DragEvent) => void;
  onEndDragEnter: (e: React.DragEvent) => void;
  onEndDragOver: (e: React.DragEvent) => void;
  onEndDragLeave: (e: React.DragEvent) => void;
  onEndDrop: (e: React.DragEvent) => void;

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

export const MultiImageToVideo: React.FC<MultiImageToVideoProps> = ({
  uploadedImage,
  fileInputRef,
  onFileInputChange,
  onRemoveStartImage,
  onOpenStartImagePicker,
  endImage,
  endImageInputRef,
  onEndImageChange,
  onRemoveEndImage,
  onOpenEndImagePicker,
  isStartDragging,
  isEndDragging,
  onStartDragEnter,
  onStartDragOver,
  onStartDragLeave,
  onStartDrop,
  onEndDragEnter,
  onEndDragOver,
  onEndDragLeave,
  onEndDrop,
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
      {/* 시작 이미지 업로드 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          시작 이미지 (첫 프레임)
          <span className={styles.required}>*</span>
        </label>
        <div
          className={`${styles.uploadArea} ${styles.uploadAreaSmall} ${uploadedImage ? styles.hasImage : ''} ${isStartDragging ? styles.dragging : ''}`}
          onClick={() => !uploadedImage && onOpenStartImagePicker()}
          onDragEnter={onStartDragEnter}
          onDragOver={onStartDragOver}
          onDragLeave={onStartDragLeave}
          onDrop={onStartDrop}
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
              <img src={uploadedImage.preview} alt="Start" className={styles.previewImage} />
              <button
                type="button"
                className={styles.removeImageBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveStartImage();
                }}
              >
                <CloseIcon size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.uploadPlaceholder}>
              <UploadIcon size={24} />
              <p className={styles.uploadHint}>시작 이미지</p>
            </div>
          )}
        </div>
      </div>

      {/* 마지막 이미지 업로드 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          마지막 이미지 (마지막 프레임)
          <span className={styles.required}>*</span>
        </label>
        <div
          className={`${styles.uploadArea} ${styles.uploadAreaSmall} ${endImage ? styles.hasImage : ''} ${isEndDragging ? styles.dragging : ''}`}
          onClick={() => !endImage && onOpenEndImagePicker()}
          onDragEnter={onEndDragEnter}
          onDragOver={onEndDragOver}
          onDragLeave={onEndDragLeave}
          onDrop={onEndDrop}
        >
          <input
            ref={endImageInputRef}
            type="file"
            accept="image/*"
            onChange={onEndImageChange}
            style={{ display: 'none' }}
          />
          {endImage ? (
            <div className={styles.uploadedPreview}>
              <img src={endImage.preview} alt="End" className={styles.previewImage} />
              <button
                type="button"
                className={styles.removeImageBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveEndImage();
                }}
              >
                <CloseIcon size={16} />
              </button>
            </div>
          ) : (
            <div className={styles.uploadPlaceholder}>
              <UploadIcon size={24} />
              <p className={styles.uploadHint}>마지막 이미지</p>
            </div>
          )}
        </div>
      </div>

      {/* 비율 불일치 안내 */}
      {videoAspectRatioMismatch && (
        <p className={styles.ratioMismatchHint}>
          💡 이미지 비율이 영상 비율({videoAspectRatioMismatch.target})과 다릅니다.
          AI가 자동으로 비율을 맞춰 영상을 생성합니다.
        </p>
      )}

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
        disabled={isLoading || !uploadedImage || !endImage || !videoPrompt.trim()}
      >
        {isLoading ? '영상 생성 중...' : '영상 만들기'}
      </button>

      <p className={styles.hint}>
        시작과 마지막 이미지 사이를 AI가 자연스럽게 연결합니다.
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

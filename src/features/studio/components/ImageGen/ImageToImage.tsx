/**
 * ImageToImage 컴포넌트
 * 이미지를 참고하여 새 이미지를 생성하는 UI
 * - 단일 이미지 모드 (기존)
 * - 다중 이미지 모드 (신규)
 */
import React from 'react';
import { UploadIcon, CloseIcon } from '../../../../components/common/Icons';
import { MultiImageUpload } from '../../../../components/genai';
import type { AspectRatioOption, UploadedImage, ReferenceImage } from '../../types';
import styles from './ImageToImage.module.css';

interface ImageToImageProps {
  // 다중 이미지 모드
  multiImageMode?: boolean;
  referenceImages?: ReferenceImage[];
  onReferenceImagesChange?: (images: ReferenceImage[]) => void;
  maxImages?: number;

  // 이미지 업로드 관련 (단일 모드)
  uploadedImage?: UploadedImage | null;
  isDragging?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onFileInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  onOpenImagePicker?: () => void;

  // 비율 관련
  aspectRatios: AspectRatioOption[];
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;

  // 생성 관련
  prompt: string;
  isLoading: boolean;
  onGenerate: () => void;
}

export const ImageToImage: React.FC<ImageToImageProps> = ({
  // 다중 이미지 모드
  multiImageMode = false,
  referenceImages = [],
  onReferenceImagesChange,
  maxImages = 4,
  // 단일 이미지 모드
  uploadedImage,
  isDragging,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onRemoveImage,
  onOpenImagePicker,
  // 공통
  aspectRatios,
  aspectRatio,
  onAspectRatioChange,
  prompt,
  isLoading,
  onGenerate,
}) => {
  // 이미지 유효성 체크
  const hasImage = multiImageMode
    ? referenceImages.length > 0
    : !!uploadedImage;

  return (
    <>
      {/* 이미지 업로드 영역 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          참고 이미지
          <span className={styles.required}>*</span>
          {multiImageMode && (
            <span className={styles.multiHint}> (최대 {maxImages}장)</span>
          )}
        </label>

        {/* 다중 이미지 모드 */}
        {multiImageMode && onReferenceImagesChange ? (
          <MultiImageUpload
            images={referenceImages}
            onChange={onReferenceImagesChange}
            maxImages={maxImages}
            disabled={isLoading}
            showRoles={true}
          />
        ) : (
          /* 단일 이미지 모드 (기존) */
          <div
            className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''} ${uploadedImage ? styles.hasImage : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !uploadedImage && onOpenImagePicker?.()}
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
                    onRemoveImage?.();
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
        )}
      </div>

      {/* 이미지 비율 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>이미지 비율</label>
        <div className={styles.ratioSelector}>
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.key}
              className={`${styles.ratioBtn} ${aspectRatio === ratio.key ? styles.active : ''}`}
              onClick={() => onAspectRatioChange(ratio.key)}
              disabled={isLoading}
              title={ratio.desc}
            >
              <span className={styles.ratioPreview} data-ratio={ratio.key} />
              <span className={styles.ratioLabel}>{ratio.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 생성 버튼 */}
      <div className={styles.buttonGroup}>
        <button
          className={styles.generateBtn}
          onClick={onGenerate}
          disabled={isLoading || !hasImage || !prompt.trim()}
        >
          {isLoading ? '생성 중...' : '이미지 생성'}
        </button>
        <p className={styles.hint}>
          {multiImageMode
            ? '참고 이미지들을 조합하여 새로운 이미지를 생성합니다.'
            : '참고 이미지를 기반으로 새로운 이미지를 생성합니다.'}
        </p>
      </div>
    </>
  );
};

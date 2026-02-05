/**
 * Upscale 컴포넌트
 * 이미지 업스케일 UI
 */
import React from 'react';
import { UploadIcon, CloseIcon } from '../../../../components/common/Icons';
import type { UploadedImage } from '../../types';
import styles from './Upscale.module.css';

export type UpscaleScale = '2x' | '4x';

interface UpscaleProps {
  // 이미지 업로드 관련
  uploadedImage: UploadedImage | null;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onOpenImagePicker: () => void;

  // 배율 관련
  upscaleScale: UpscaleScale;
  onUpscaleScaleChange: (scale: UpscaleScale) => void;

  // 처리 관련
  isLoading: boolean;
  onUpscale: () => void;
}

export const Upscale: React.FC<UpscaleProps> = ({
  uploadedImage,
  isDragging,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onRemoveImage,
  onOpenImagePicker,
  upscaleScale,
  onUpscaleScaleChange,
  isLoading,
  onUpscale,
}) => {
  return (
    <>
      {/* 이미지 업로드 영역 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          이미지 업로드
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
              <p className={styles.uploadHint}>PNG, JPG, WEBP</p>
            </div>
          )}
        </div>
      </div>

      {/* 배율 선택 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>배율</label>
        <div className={styles.qualitySelector}>
          <button
            className={`${styles.qualityBtn} ${upscaleScale === '2x' ? styles.active : ''}`}
            onClick={() => onUpscaleScaleChange('2x')}
            disabled={isLoading}
          >
            2x
          </button>
          <button
            className={`${styles.qualityBtn} ${upscaleScale === '4x' ? styles.active : ''}`}
            onClick={() => onUpscaleScaleChange('4x')}
            disabled={isLoading}
          >
            4x
          </button>
        </div>
        <p className={styles.hint}>4x는 처리 시간이 더 걸립니다.</p>
      </div>

      {/* 업스케일 버튼 + 힌트 */}
      <div className={styles.buttonGroup}>
        <button
          className={styles.generateBtn}
          onClick={onUpscale}
          disabled={isLoading || !uploadedImage}
        >
          {isLoading ? '처리 중...' : '업스케일'}
        </button>
        <p className={styles.hint}>
          이미지 해상도를 높여 더 선명하게 만듭니다.
        </p>
      </div>
    </>
  );
};

/**
 * RemoveBackground 컴포넌트
 * 이미지 배경 제거 UI
 */
import React from 'react';
import { UploadIcon, CloseIcon } from '../../../../components/common/Icons';
import type { UploadedImage } from '../../types';
import styles from './RemoveBackground.module.css';

export type EdgeMode = 'soft' | 'medium' | 'sharp';

interface RemoveBackgroundProps {
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

  // 가장자리 모드
  edgeMode: EdgeMode;
  onEdgeModeChange: (mode: EdgeMode) => void;

  // 처리 관련
  isLoading: boolean;
  onRemoveBackground: () => void;
}

export const RemoveBackground: React.FC<RemoveBackgroundProps> = ({
  uploadedImage,
  isDragging,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onRemoveImage,
  onOpenImagePicker,
  edgeMode,
  onEdgeModeChange,
  isLoading,
  onRemoveBackground,
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
            id="file-input"
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
      </div>

      {/* 가장자리 모드 선택 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>가장자리 처리</label>
        <div className={styles.qualitySelector}>
          <button
            className={`${styles.qualityBtn} ${edgeMode === 'soft' ? styles.active : ''}`}
            onClick={() => onEdgeModeChange('soft')}
            disabled={isLoading}
            title="부드러운 반투명 가장자리"
          >
            부드럽게
          </button>
          <button
            className={`${styles.qualityBtn} ${edgeMode === 'medium' ? styles.active : ''}`}
            onClick={() => onEdgeModeChange('medium')}
            disabled={isLoading}
            title="중간 정도의 가장자리"
          >
            보통
          </button>
          <button
            className={`${styles.qualityBtn} ${edgeMode === 'sharp' ? styles.active : ''}`}
            onClick={() => onEdgeModeChange('sharp')}
            disabled={isLoading}
            title="선명한 가장자리"
          >
            선명하게
          </button>
        </div>
        <p className={styles.hint}>머리카락/손가락은 '부드럽게' 권장</p>
      </div>

      {/* 배경 없애기 버튼 + 힌트 */}
      <div className={styles.buttonGroup}>
        <button
          className={styles.generateBtn}
          onClick={onRemoveBackground}
          disabled={isLoading || !uploadedImage}
        >
          {isLoading ? '처리 중...' : '배경 없애기'}
        </button>
        <p className={styles.hint}>
          PNG 투명배경으로 변환됩니다.
        </p>
      </div>
    </>
  );
};

/**
 * MultiImageUpload 컴포넌트
 * 다중 이미지 업로드 및 역할 지정 UI
 * - 드래그&드롭으로 순서 변경
 * - 이미지별 역할 지정 (스타일/객체/인물/배경)
 * - 모델별 최대 이미지 수 제한
 */
import React, { useCallback, useRef, useState } from 'react';
import styles from './MultiImageUpload.module.css';

// 아이콘 (간단한 SVG)
const UploadIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DragIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="6" r="1.5" />
    <circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" />
    <circle cx="15" cy="18" r="1.5" />
  </svg>
);

// 역할 옵션
const ROLE_OPTIONS = [
  { key: 'style', label: '스타일', desc: '색감, 분위기, 화풍 참조' },
  { key: 'object', label: '객체', desc: '상품, 사물 형태 참조' },
  { key: 'person', label: '인물', desc: '인물 외형 참조' },
  { key: 'background', label: '배경', desc: '배경 장면 참조' },
];

// 고유 ID 생성
const generateId = () => `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * MultiImageUpload 컴포넌트
 */
export function MultiImageUpload({
  images = [],
  onChange,
  maxImages = 4,
  disabled = false,
  compact = false,
  showRoles = true,
  className = '',
}) {
  const fileInputRef = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  // 파일 처리
  const processFiles = useCallback(async (files) => {
    const newImages = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (images.length + newImages.length >= maxImages) break;

      const preview = URL.createObjectURL(file);
      const id = generateId();

      newImages.push({
        id,
        file,
        preview,
        name: file.name,
        role: 'object', // 기본값
        order: images.length + newImages.length,
      });
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
  }, [images, maxImages, onChange]);

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [disabled, processFiles]);

  // 파일 선택
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    // input 초기화 (같은 파일 다시 선택 가능)
    e.target.value = '';
  }, [processFiles]);

  // 이미지 제거
  const handleRemove = useCallback((id) => {
    const newImages = images
      .filter((img) => img.id !== id)
      .map((img, idx) => ({ ...img, order: idx }));
    onChange(newImages);
  }, [images, onChange]);

  // 역할 변경
  const handleRoleChange = useCallback((id, role) => {
    const newImages = images.map((img) =>
      img.id === id ? { ...img, role } : img
    );
    onChange(newImages);
  }, [images, onChange]);

  // 드래그 시작
  const handleDragStart = useCallback((e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  // 드래그 중 (순서 변경)
  const handleItemDragOver = useCallback((e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  // 드롭 (순서 변경)
  const handleItemDrop = useCallback((e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDraggingId(null);

    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId) return;

    const sourceIndex = images.findIndex((img) => img.id === sourceId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    const newImages = [...images];
    const [removed] = newImages.splice(sourceIndex, 1);
    newImages.splice(targetIndex, 0, removed);

    // order 재정렬
    const reordered = newImages.map((img, idx) => ({ ...img, order: idx }));
    onChange(reordered);
  }, [images, onChange]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverIndex(null);
  }, []);

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''} ${className}`}>
      {/* 업로드된 이미지들 */}
      <div className={styles.imageGrid}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`${styles.imageSlot} ${draggingId === image.id ? styles.dragging : ''} ${dragOverIndex === index ? styles.dragOver : ''}`}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, image.id)}
            onDragOver={(e) => handleItemDragOver(e, index)}
            onDrop={(e) => handleItemDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            {/* 드래그 핸들 */}
            <div className={styles.dragHandle}>
              <DragIcon size={14} />
            </div>

            {/* 이미지 미리보기 */}
            <div className={styles.imagePreview}>
              <img src={image.preview} alt={image.name} />
            </div>

            {/* 제거 버튼 */}
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => handleRemove(image.id)}
              disabled={disabled}
              aria-label="이미지 제거"
            >
              <CloseIcon size={12} />
            </button>

            {/* 역할 선택 */}
            {showRoles && (
              <div className={styles.roleSelector}>
                <select
                  value={image.role}
                  onChange={(e) => handleRoleChange(image.id, e.target.value)}
                  disabled={disabled}
                  className={styles.roleSelect}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 순서 번호 */}
            <span className={styles.orderBadge}>{index + 1}</span>
          </div>
        ))}

        {/* 추가 버튼 */}
        {canAddMore && (
          <div
            className={styles.addSlot}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadIcon size={24} />
            <span className={styles.addText}>추가</span>
            <span className={styles.addCount}>
              {images.length}/{maxImages}
            </span>
          </div>
        )}
      </div>

      {/* 빈 상태 */}
      {images.length === 0 && (
        <div
          className={styles.emptyState}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadIcon size={32} />
          <p className={styles.emptyText}>
            이미지를 드래그하거나 클릭하여 업로드
          </p>
          <p className={styles.emptyHint}>
            PNG, JPG, WEBP | 최대 {maxImages}장
          </p>
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* 역할 설명 */}
      {showRoles && images.length > 0 && (
        <div className={styles.roleHint}>
          <span className={styles.roleHintIcon}>💡</span>
          <span>역할을 지정하면 AI가 각 이미지의 용도를 더 정확히 이해합니다.</span>
        </div>
      )}
    </div>
  );
}

export default MultiImageUpload;

/**
 * InpaintingEditor 컴포넌트
 * 부분 편집 (인페인팅) 전용 UI
 * - 이미지 업로드
 * - 마스크 그리기
 * - 프롬프트 입력
 * - 생성 실행
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadIcon, CloseIcon } from '../../../../components/common/Icons';
import { MaskEditor } from '../../../../components/genai';
import { processImage } from '../../../../utils/imageUtils';
import styles from './InpaintingEditor.module.css';

interface InpaintingEditorProps {
  // 모델
  selectedModel?: string;
  onModelChange?: (model: string) => void;

  // 프롬프트
  prompt: string;
  onPromptChange: (prompt: string) => void;

  // 생성
  isLoading: boolean;
  onGenerate: (data: InpaintingData) => void;

  // 초기 이미지 (외부에서 전달)
  initialImage?: string | null;
}

export interface InpaintingData {
  image: string;
  mask: string;
  prompt: string;
  model: string;
}

// 최대 에디터 크기
const MAX_EDITOR_SIZE = 400;

export const InpaintingEditor: React.FC<InpaintingEditorProps> = ({
  selectedModel = 'gpt-image-1.5',
  onModelChange,
  prompt,
  onPromptChange,
  isLoading,
  onGenerate,
  initialImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editorSize, setEditorSize] = useState({ width: MAX_EDITOR_SIZE, height: MAX_EDITOR_SIZE });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });

  // 외부에서 전달된 초기 이미지 처리
  useEffect(() => {
    if (initialImage && !uploadedImage) {
      const img = new Image();
      img.onload = () => {
        const { width: origWidth, height: origHeight } = img;

        // 비율 유지하면서 최대 크기에 맞춤
        let newWidth = origWidth;
        let newHeight = origHeight;

        if (origWidth > origHeight) {
          if (origWidth > MAX_EDITOR_SIZE) {
            newWidth = MAX_EDITOR_SIZE;
            newHeight = Math.round((origHeight / origWidth) * MAX_EDITOR_SIZE);
          }
        } else {
          if (origHeight > MAX_EDITOR_SIZE) {
            newHeight = MAX_EDITOR_SIZE;
            newWidth = Math.round((origWidth / origHeight) * MAX_EDITOR_SIZE);
          }
        }

        setOriginalSize({ width: origWidth, height: origHeight });
        setEditorSize({ width: newWidth, height: newHeight });
        setUploadedImage(initialImage);
        setMaskDataUrl(null);
      };
      img.src = initialImage;
    }
  }, [initialImage, uploadedImage]);

  // 파일 업로드 처리 - 원본 비율 유지하며 에디터 크기 계산
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      // 이미지 로드하여 원본 크기 확인
      const img = new Image();
      img.onload = () => {
        const { width: origWidth, height: origHeight } = img;

        // 비율 유지하면서 최대 크기에 맞춤
        let newWidth = origWidth;
        let newHeight = origHeight;

        if (origWidth > origHeight) {
          // 가로가 더 긴 경우
          if (origWidth > MAX_EDITOR_SIZE) {
            newWidth = MAX_EDITOR_SIZE;
            newHeight = Math.round((origHeight / origWidth) * MAX_EDITOR_SIZE);
          }
        } else {
          // 세로가 더 긴 경우
          if (origHeight > MAX_EDITOR_SIZE) {
            newHeight = MAX_EDITOR_SIZE;
            newWidth = Math.round((origWidth / origHeight) * MAX_EDITOR_SIZE);
          }
        }

        setOriginalSize({ width: origWidth, height: origHeight });
        setEditorSize({ width: newWidth, height: newHeight });
        setUploadedImage(dataUrl);
        setMaskDataUrl(null); // 마스크 초기화
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  // 드래그 앤 드롭
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  // 파일 선택
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  // 이미지 제거
  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    setMaskDataUrl(null);
  }, []);

  // 마스크 변경
  const handleMaskChange = useCallback((mask: string | null) => {
    setMaskDataUrl(mask);
  }, []);

  // 생성 실행 - 이미지 압축 후 전송 (413 에러 방지, 품질 최대화)
  const handleGenerate = useCallback(async () => {
    if (!uploadedImage || !maskDataUrl || !prompt.trim()) return;

    try {
      // 이미지 압축 (최대 2048px, JPEG 92% - 품질과 크기 균형)
      const compressedImage = await processImage(uploadedImage, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.92,
        format: 'jpeg',
      });

      onGenerate({
        image: compressedImage,
        mask: maskDataUrl, // 마스크는 PNG 유지 (투명도 필요)
        prompt: prompt.trim(),
        model: selectedModel,
      });
    } catch (error) {
      console.error('[InpaintingEditor] Image compression failed:', error);
      // 압축 실패 시 원본으로 시도
      onGenerate({
        image: uploadedImage,
        mask: maskDataUrl,
        prompt: prompt.trim(),
        model: selectedModel,
      });
    }
  }, [uploadedImage, maskDataUrl, prompt, selectedModel, onGenerate]);

  const canGenerate = uploadedImage && maskDataUrl && prompt.trim() && !isLoading;

  return (
    <div className={styles.container}>
      {/* 모델 선택 제거 - GPT Image 1.5 고정 (마스크 인페인팅 지원 모델) */}

      {/* 이미지 업로드 또는 에디터 */}
      <div className={styles.section}>
        <label className={styles.label}>
          원본 이미지
          <span className={styles.required}>*</span>
        </label>

        {!uploadedImage ? (
          <div
            className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <UploadIcon size={32} />
            <p className={styles.uploadText}>
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className={styles.uploadHint}>PNG, JPG, WEBP</p>
          </div>
        ) : (
          <div className={styles.editorWrapper}>
            <MaskEditor
              image={uploadedImage}
              width={editorSize.width}
              height={editorSize.height}
              outputWidth={originalSize.width}
              outputHeight={originalSize.height}
              onMaskChange={handleMaskChange}
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.removeImageBtn}
              onClick={handleRemoveImage}
              disabled={isLoading}
              title="이미지 제거"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 프롬프트 */}
      <div className={styles.section}>
        <label className={styles.label}>
          수정 내용
          <span className={styles.required}>*</span>
        </label>
        <textarea
          className={styles.textarea}
          placeholder="예: 이 영역을 꽃으로 바꿔줘, 배경을 제거하고 하늘로 대체해줘"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
        <p className={styles.hint}>
          마스크로 칠한 영역에 적용할 변경 사항을 설명하세요.
        </p>
      </div>

      {/* 생성 버튼 */}
      <div className={styles.buttonGroup}>
        <button
          className={styles.generateBtn}
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {isLoading ? '생성 중...' : '부분 편집 적용'}
        </button>
      </div>
    </div>
  );
};

export default InpaintingEditor;

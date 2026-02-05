/**
 * 파일 업로드 관리 훅
 * - 드래그 & 드롭
 * - 파일 선택
 * - 이미지 압축
 */

import { useState, useCallback, useRef, RefObject } from 'react';
import { UploadedImage } from './types';

interface UseFileUploadOptions {
  onError?: (error: string) => void;
  onFileSelect?: (image: UploadedImage) => void;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

interface UseFileUploadReturn {
  uploadedImage: UploadedImage | null;
  setUploadedImage: React.Dispatch<React.SetStateAction<UploadedImage | null>>;
  isDragging: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileSelect: (file: File) => Promise<void>;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveUploadedImage: () => void;
}

// 이미지 압축 헬퍼 (File → data URL)
const compressImage = (file: File, maxSize = 2048, quality = 0.8): Promise<string> => {
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
};

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { onError, onFileSelect: externalOnFileSelect, maxWidthOrHeight = 2048, quality = 0.85 } = options;

  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 처리 (압축 포함)
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      onError?.('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 체크 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      onError?.('파일 크기는 50MB 이하여야 합니다.');
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file, maxWidthOrHeight, quality);

      const imageData: UploadedImage = {
        preview: compressedDataUrl,
        name: file.name,
        base64: compressedDataUrl,
      };

      // 외부 콜백이 있으면 호출, 없으면 내부 상태 업데이트
      if (externalOnFileSelect) {
        externalOnFileSelect(imageData);
      } else {
        setUploadedImage(imageData);
      }
    } catch (err) {
      console.error('[Upload] Compression error:', err);
      onError?.('이미지 처리 중 오류가 발생했습니다.');
    }
  }, [maxWidthOrHeight, quality, onError, externalOnFileSelect]);

  // 드래그 오버
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // 드래그 리브
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // 드롭
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // 파일 입력 변경
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // 같은 파일을 다시 선택할 수 있도록 value 초기화
    e.target.value = '';
  }, [handleFileSelect]);

  // 업로드된 이미지 제거
  const handleRemoveUploadedImage = useCallback(() => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return {
    uploadedImage,
    setUploadedImage,
    isDragging,
    fileInputRef,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleRemoveUploadedImage,
  };
}

export default useFileUpload;

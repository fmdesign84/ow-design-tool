/**
 * useImageUpload - 이미지 즉시 업로드 훅
 *
 * 파일 선택 → 압축 → temp 업로드 → URL 반환
 * - Replicate API에 URL로 전송하여 33% 대역폭 절감
 * - temp/ 폴더에 저장 (7일 후 자동 삭제)
 * - 재시도 로직 포함
 * - Toast 알림 연동 (선택)
 */

import { useState, useCallback, useMemo } from 'react';
import { processImage, ImageProcessOptions } from '../utils/imageUtils';
import { getApiUrl } from '../utils/apiRoute';

// ===== 타입 정의 =====

export interface UploadedImage {
  id: string;
  url: string;          // Supabase temp URL
  base64: string;       // 로컬 미리보기용 (썸네일)
  originalName: string;
  size: number;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;     // 0-100 (여러 파일 업로드 시)
  error: string | null;
}

export interface UseImageUploadOptions {
  /** 이미지 압축 옵션 */
  compress?: ImageProcessOptions;
  /** 업로드 접두사 (파일명에 사용) */
  prefix?: string;
  /** 최대 파일 개수 */
  maxFiles?: number;
  /** 최대 파일 크기 (bytes) */
  maxFileSize?: number;
  /** 성공 시 콜백 */
  onSuccess?: (images: UploadedImage[]) => void;
  /** 에러 시 콜백 */
  onError?: (error: string) => void;
  /** Toast 훅 (선택) */
  toast?: {
    success: (msg: string) => void;
    error: (msg: string) => void;
  };
}

export interface UseImageUploadReturn {
  /** 업로드된 이미지 목록 */
  images: UploadedImage[];
  /** 업로드 상태 */
  state: UploadState;
  /** 파일 업로드 (File 또는 File[]) */
  upload: (files: File | File[] | FileList) => Promise<UploadedImage[]>;
  /** 특정 이미지 제거 */
  remove: (id: string) => void;
  /** 전체 초기화 */
  clear: () => void;
  /** 실패한 업로드 재시도 */
  retry: () => Promise<void>;
}

// ===== 상수 =====

const DEFAULT_OPTIONS: UseImageUploadOptions = {
  compress: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    format: 'jpeg',
  },
  prefix: 'img',
  maxFiles: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

// ===== 유틸 함수 =====

const generateId = () => `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ===== 훅 =====

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  // useMemo로 감싸서 매 렌더링마다 새 객체 생성 방지
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [
    options.prefix,
    options.maxFiles,
    options.maxFileSize,
    options.compress?.maxWidth,
    options.compress?.maxHeight,
    options.compress?.quality,
    options.compress?.format,
    options.onError,
    options.toast,
  ]);

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // 단일 파일 업로드
  const uploadSingle = useCallback(async (file: File): Promise<UploadedImage> => {
    // 1. 파일 크기 검증
    if (file.size > opts.maxFileSize!) {
      const maxMB = (opts.maxFileSize! / (1024 * 1024)).toFixed(0);
      throw new Error(`파일이 너무 커요 (최대 ${maxMB}MB)`);
    }

    // 2. Base64로 변환
    const originalBase64 = await fileToBase64(file);

    // 3. 압축
    const compressedBase64 = await processImage(originalBase64, opts.compress);

    // 4. temp에 업로드
    const response = await fetch(getApiUrl('/api/upload-temp-image', { method: 'POST' }), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: compressedBase64,
        prefix: opts.prefix,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `업로드 실패 (${response.status})`);
    }

    const data = await response.json();

    if (!data.success || !data.url) {
      throw new Error(data.error || '업로드 실패');
    }

    return {
      id: generateId(),
      url: data.url,
      base64: compressedBase64, // 미리보기용
      originalName: file.name,
      size: data.size,
    };
  }, [opts]);

  // 여러 파일 업로드
  const upload = useCallback(async (files: File | File[] | FileList): Promise<UploadedImage[]> => {
    // FileList → Array 변환
    const fileArray = files instanceof FileList
      ? Array.from(files)
      : Array.isArray(files)
        ? files
        : [files];

    // 최대 개수 제한
    const currentCount = images.length;
    const availableSlots = opts.maxFiles! - currentCount;

    if (availableSlots <= 0) {
      const error = `최대 ${opts.maxFiles}개까지만 업로드할 수 있어요`;
      opts.onError?.(error);
      opts.toast?.error(error);
      setState(prev => ({ ...prev, error }));
      return [];
    }

    const filesToUpload = fileArray.slice(0, availableSlots);
    setPendingFiles(filesToUpload);

    setState({
      isUploading: true,
      progress: 0,
      error: null,
    });

    const uploadedImages: UploadedImage[] = [];
    const errors: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      try {
        const uploaded = await uploadSingle(filesToUpload[i]);
        uploadedImages.push(uploaded);

        // 진행률 업데이트
        setState(prev => ({
          ...prev,
          progress: Math.round(((i + 1) / filesToUpload.length) * 100),
        }));
      } catch (error) {
        const msg = error instanceof Error ? error.message : '업로드 실패';
        errors.push(`${filesToUpload[i].name}: ${msg}`);
      }
    }

    // 결과 처리
    if (uploadedImages.length > 0) {
      setImages(prev => [...prev, ...uploadedImages]);
      opts.onSuccess?.(uploadedImages);

      if (uploadedImages.length === filesToUpload.length) {
        opts.toast?.success(`${uploadedImages.length}개 이미지 업로드 완료`);
      } else {
        opts.toast?.success(`${uploadedImages.length}/${filesToUpload.length}개 업로드 완료`);
      }
    }

    if (errors.length > 0) {
      const errorMsg = errors.length === 1 ? errors[0] : `${errors.length}개 파일 업로드 실패`;
      opts.onError?.(errorMsg);
      opts.toast?.error(errorMsg);
      setState(prev => ({ ...prev, error: errorMsg }));
    }

    setState(prev => ({
      ...prev,
      isUploading: false,
    }));

    setPendingFiles([]);
    return uploadedImages;
  }, [images.length, opts, uploadSingle]);

  // 이미지 제거
  const remove = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // 전체 초기화
  const clear = useCallback(() => {
    setImages([]);
    setState({
      isUploading: false,
      progress: 0,
      error: null,
    });
    setPendingFiles([]);
  }, []);

  // 재시도
  const retry = useCallback(async () => {
    if (pendingFiles.length === 0) return;

    setState(prev => ({ ...prev, error: null }));
    await upload(pendingFiles);
  }, [pendingFiles, upload]);

  return {
    images,
    state,
    upload,
    remove,
    clear,
    retry,
  };
}

export default useImageUpload;

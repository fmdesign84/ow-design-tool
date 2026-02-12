/**
 * 이미지 리사이즈 및 압축 유틸리티
 * Vercel 4.5MB 제한 대응 + Gemini 최적화 (2048px)
 */

import { rlog } from './debug';
import { getApiUrl } from './apiRoute';

export interface ImageProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 (JPEG quality)
  format?: 'jpeg' | 'png' | 'webp';
}

const DEFAULT_OPTIONS: ImageProcessOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85, // 85% quality - 고품질 유지하면서 용량 절감
  format: 'jpeg',
};

/**
 * 이미지를 리사이즈하고 압축합니다.
 * @param base64 원본 이미지 (data URL 또는 순수 base64)
 * @param options 리사이즈 옵션
 * @returns 처리된 이미지 (data URL)
 */
export const processImage = (
  base64: string,
  options: ImageProcessOptions = {}
): Promise<string> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // 원본 크기
        let { width, height } = img;

        // 리사이즈 필요 여부 확인
        const needsResize = width > opts.maxWidth! || height > opts.maxHeight!;

        if (needsResize) {
          // 비율 유지하면서 리사이즈
          const aspectRatio = width / height;

          if (width > height) {
            // 가로가 더 긴 경우
            if (width > opts.maxWidth!) {
              width = opts.maxWidth!;
              height = Math.round(width / aspectRatio);
            }
          } else {
            // 세로가 더 긴 경우
            if (height > opts.maxHeight!) {
              height = opts.maxHeight!;
              width = Math.round(height * aspectRatio);
            }
          }
        }

        // Canvas로 리사이즈 수행
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 고품질 리사이즈 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        // MIME 타입 결정
        const mimeType = `image/${opts.format}`;

        // 압축된 이미지 출력
        const processedBase64 = canvas.toDataURL(mimeType, opts.quality);

        resolve(processedBase64);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // data URL 형식 보장
    if (base64.startsWith('data:')) {
      img.src = base64;
    } else {
      img.src = `data:image/jpeg;base64,${base64}`;
    }
  });
};

/**
 * 여러 이미지를 병렬로 처리합니다.
 */
export const processImages = async (
  base64Array: string[],
  options: ImageProcessOptions = {}
): Promise<string[]> => {
  return Promise.all(base64Array.map(base64 => processImage(base64, options)));
};

/**
 * 이미지 크기 추정 (bytes)
 * base64 문자열에서 대략적인 원본 크기 계산
 */
export const estimateImageSize = (base64: string): number => {
  // data:image/... 헤더 제거
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  // base64는 원본의 약 1.33배 크기
  return Math.round((base64Data.length * 3) / 4);
};

/**
 * 이미지 크기를 사람이 읽기 좋은 형식으로 변환
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * 이미지가 처리 필요한지 확인
 * Vercel 4.5MB 제한 고려 (4장 기준 각 1MB 이하 권장)
 */
export const needsProcessing = (base64: string): boolean => {
  const size = estimateImageSize(base64);
  return size > 1024 * 1024; // 1MB 이상이면 처리 필요
};

/**
 * 이미지 압축 후 Supabase에 업로드하고 URL 반환
 * 413 에러 방지용 - 클라이언트에서 압축 후 업로드
 */
export const compressAndUploadImage = async (
  base64: string,
  options: ImageProcessOptions = {}
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
  try {
    // 1. 이미지 압축 (기존 processImage 활용)
    const compressedBase64 = await processImage(base64, {
      maxWidth: options.maxWidth || 1920, // 배경 생성용 적정 크기
      maxHeight: options.maxHeight || 1920,
      quality: options.quality || 0.8,
      format: options.format || 'jpeg',
    });

    // 압축 후 크기 확인 로그
    const originalSize = estimateImageSize(base64);
    const compressedSize = estimateImageSize(compressedBase64);
    rlog('ImageUtils', 'Compressed image', {
      originalSize: formatFileSize(originalSize),
      compressedSize: formatFileSize(compressedSize),
    });

    // 2. Supabase에 업로드 (기존 API 활용)
    const response = await fetch(getApiUrl('/api/upload-chat-image', { method: 'POST' }), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: compressedBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.imageUrl) {
      rlog('ImageUtils', 'Upload success', { imageUrl: data.imageUrl });
      return { success: true, imageUrl: data.imageUrl };
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error) {
    console.error('[ImageUtils] compressAndUploadImage error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

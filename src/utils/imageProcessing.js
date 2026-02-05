/**
 * 이미지 처리 유틸리티
 * - 업로드 이미지 리사이즈 & 압축
 * - 썸네일 생성
 * - 메모리 관리
 * - Base64 변환
 */

// 이미지 제한 설정
export const IMAGE_LIMITS = {
  maxFileSize: 7 * 1024 * 1024,    // 7MB (Gemini 제한)
  maxTotalSize: 50 * 1024 * 1024,  // 50MB 총합 제한
  maxDimension: 4096,              // 최대 변 길이
  thumbnailSize: 256,              // 미리보기용 썸네일
  compressionQuality: 0.85,        // JPEG 압축률
  maxReferenceImages: {
    'gemini-3-pro': 14,
    'gpt-image-1.5': 4,
    'imagen-4': 0
  }
};

// 지원하는 이미지 타입
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * 파일 유효성 검사
 */
export function validateImageFile(file) {
  if (!file) {
    return { ok: false, error: '파일이 없습니다' };
  }

  if (!SUPPORTED_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: '지원하지 않는 이미지 형식이에요',
      suggestion: 'JPG, PNG, WebP, GIF 파일만 가능해요'
    };
  }

  if (file.size > IMAGE_LIMITS.maxFileSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxMB = (IMAGE_LIMITS.maxFileSize / (1024 * 1024)).toFixed(0);
    return {
      ok: false,
      error: `파일이 너무 커요 (${sizeMB}MB)`,
      suggestion: `${maxMB}MB 이하의 파일을 선택해주세요`
    };
  }

  return { ok: true };
}

/**
 * 여러 이미지의 총 용량 체크
 */
export function checkTotalSize(images) {
  const total = images.reduce((sum, img) => sum + (img.size || 0), 0);

  if (total > IMAGE_LIMITS.maxTotalSize) {
    return {
      ok: false,
      message: `총 용량이 ${formatBytes(IMAGE_LIMITS.maxTotalSize)}를 초과해요`,
      suggestion: '일부 이미지를 제거하거나 압축해주세요',
      currentSize: total,
      maxSize: IMAGE_LIMITS.maxTotalSize
    };
  }

  return { ok: true, currentSize: total };
}

/**
 * 바이트를 읽기 쉬운 형태로 변환
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * 이미지 로드 (File → HTMLImageElement)
 */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url); // 메모리 해제
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 불러올 수 없어요'));
    };

    img.src = url;
  });
}

/**
 * 이미지 리사이즈
 */
export function resizeImage(img, maxDimension = IMAGE_LIMITS.maxDimension) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let { width, height } = img;

  // 리사이즈 필요 여부 체크
  if (width <= maxDimension && height <= maxDimension) {
    canvas.width = width;
    canvas.height = height;
  } else {
    // 비율 유지하며 축소
    const scale = maxDimension / Math.max(width, height);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas;
}

/**
 * 썸네일 생성
 */
export function createThumbnail(img, size = IMAGE_LIMITS.thumbnailSize) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let { width, height } = img;

  // 정사각형 크롭 (중앙 기준)
  const minSide = Math.min(width, height);
  const sx = (width - minSide) / 2;
  const sy = (height - minSide) / 2;

  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

  return canvas.toDataURL('image/jpeg', 0.7);
}

/**
 * Canvas를 Base64로 변환
 */
export function canvasToBase64(canvas, format = 'image/jpeg', quality = IMAGE_LIMITS.compressionQuality) {
  return canvas.toDataURL(format, quality);
}

/**
 * Base64 문자열에서 데이터 부분만 추출
 */
export function extractBase64Data(base64String) {
  return base64String.replace(/^data:image\/\w+;base64,/, '');
}

/**
 * Base64 문자열의 MIME 타입 추출
 */
export function getMimeType(base64String) {
  const match = base64String.match(/^data:(image\/\w+);base64,/);
  return match ? match[1] : 'image/jpeg';
}

/**
 * Base64 문자열의 대략적인 크기 계산 (bytes)
 */
export function estimateBase64Size(base64String) {
  const base64Data = extractBase64Data(base64String);
  // Base64는 원본의 약 4/3 크기
  return Math.round(base64Data.length * 0.75);
}

/**
 * 고유 ID 생성
 */
export function generateImageId() {
  return `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 이미지 파일 처리 (업로드 시 사용)
 * - 유효성 검사
 * - 리사이즈
 * - 썸네일 생성
 * - Base64 변환
 */
export async function processUploadedImage(file) {
  // 1. 유효성 검사
  const validation = validateImageFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  // 2. 이미지 로드
  const img = await loadImage(file);

  // 3. 리사이즈 (필요시)
  const resizedCanvas = resizeImage(img);

  // 4. 썸네일 생성
  const thumbnail = createThumbnail(img);

  // 5. 압축된 Base64 생성
  const compressed = canvasToBase64(resizedCanvas);

  // 6. 결과 반환
  return {
    id: generateImageId(),
    name: file.name,
    originalSize: file.size,
    processedSize: estimateBase64Size(compressed),
    dimensions: {
      original: { width: img.width, height: img.height },
      processed: { width: resizedCanvas.width, height: resizedCanvas.height }
    },
    thumbnail,           // UI 표시용 (작은 사이즈)
    base64: compressed,  // API 전송용
    mimeType: file.type
  };
}

/**
 * 여러 이미지 일괄 처리
 */
export async function processMultipleImages(files, maxCount = 14) {
  const results = [];
  const errors = [];

  // 개수 제한
  const filesToProcess = Array.from(files).slice(0, maxCount);

  for (let i = 0; i < filesToProcess.length; i++) {
    const file = filesToProcess[i];
    try {
      const processed = await processUploadedImage(file);
      results.push(processed);
    } catch (error) {
      errors.push({
        fileName: file.name,
        error: error.message
      });
    }
  }

  // 총 용량 체크
  const sizeCheck = checkTotalSize(results);

  return {
    images: results,
    errors,
    sizeCheck,
    skipped: files.length > maxCount ? files.length - maxCount : 0
  };
}

/**
 * Object URL 해제 (메모리 관리)
 */
export function revokeObjectURL(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * 이미지 배열에서 특정 이미지 제거 및 메모리 해제
 */
export function removeImageAndCleanup(images, imageId) {
  const imageToRemove = images.find(img => img.id === imageId);

  if (imageToRemove?.objectUrl) {
    revokeObjectURL(imageToRemove.objectUrl);
  }

  return images.filter(img => img.id !== imageId);
}

/**
 * 모든 이미지 정리 (컴포넌트 언마운트 시)
 */
export function cleanupAllImages(images) {
  images.forEach(img => {
    if (img.objectUrl) {
      revokeObjectURL(img.objectUrl);
    }
  });
}

/**
 * URL에서 이미지 로드 (외부 이미지)
 */
export async function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('외부 이미지를 불러올 수 없어요'));

    img.src = url;
  });
}

/**
 * URL 이미지를 Base64로 변환
 */
export async function urlToBase64(url) {
  const img = await loadImageFromUrl(url);
  const canvas = resizeImage(img);
  return canvasToBase64(canvas);
}

/**
 * 이미지 비율 계산
 */
export function getAspectRatio(width, height) {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * 미리 정의된 비율에 가장 가까운 것 찾기
 */
export function findClosestAspectRatio(width, height) {
  const RATIOS = {
    '1:1': 1,
    '4:3': 4 / 3,
    '3:4': 3 / 4,
    '16:9': 16 / 9,
    '9:16': 9 / 16,
    '3:2': 3 / 2,
    '2:3': 2 / 3
  };

  const currentRatio = width / height;
  let closest = '1:1';
  let minDiff = Infinity;

  for (const [name, ratio] of Object.entries(RATIOS)) {
    const diff = Math.abs(currentRatio - ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = name;
    }
  }

  return closest;
}

const imageProcessing = {
  IMAGE_LIMITS,
  validateImageFile,
  checkTotalSize,
  formatBytes,
  loadImage,
  resizeImage,
  createThumbnail,
  canvasToBase64,
  extractBase64Data,
  getMimeType,
  estimateBase64Size,
  generateImageId,
  processUploadedImage,
  processMultipleImages,
  revokeObjectURL,
  removeImageAndCleanup,
  cleanupAllImages,
  loadImageFromUrl,
  urlToBase64,
  getAspectRatio,
  findClosestAspectRatio
};

export default imageProcessing;

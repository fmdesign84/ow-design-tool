/**
 * 공통 입력 검증 유틸리티
 * - 프롬프트, 이미지, 모델 등 검증
 * - 에러 메시지 반환 (null이면 유효)
 */

// ===== 상수 정의 =====

export const VALID_IMAGE_MODELS = ['gemini3pro', 'gemini3flash', 'imagen4', 'gptimage15'];
export const VALID_VIDEO_MODELS = ['veo31'];
export const VALID_ASPECT_RATIOS = ['1:1', '3:4', '4:3', '16:9', '9:16'];
export const VALID_VIDEO_ASPECT_RATIOS = ['16:9', '9:16'];
export const VALID_QUALITY_OPTIONS = ['fast', 'standard', 'hd'];
export const VALID_STYLE_PRESETS = ['auto', 'photo', 'illustration', 'oil', 'watercolor', '3d'];
export const VALID_UPSCALE_SCALES = [2, 4];

export const MAX_PROMPT_LENGTH = 2000;
export const MAX_IMAGE_SIZE_MB = 50;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// ===== 검증 함수 =====

/**
 * 프롬프트 검증
 * @param {string} prompt - 프롬프트
 * @param {number} maxLength - 최대 길이 (기본: 2000)
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validatePrompt(prompt, maxLength = MAX_PROMPT_LENGTH) {
  if (!prompt || typeof prompt !== 'string') {
    return '프롬프트를 입력해주세요';
  }

  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    return '프롬프트가 비어있어요';
  }

  if (trimmed.length > maxLength) {
    return `프롬프트가 너무 길어요 (최대 ${maxLength}자)`;
  }

  return null;
}

/**
 * 이미지 모델 검증
 * @param {string} model - 모델 이름
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateImageModel(model) {
  if (!model) return null; // 기본값 사용 가능

  if (!VALID_IMAGE_MODELS.includes(model)) {
    return `지원하지 않는 모델이에요. 사용 가능: ${VALID_IMAGE_MODELS.join(', ')}`;
  }

  return null;
}

/**
 * 영상 모델 검증
 * @param {string} model - 모델 이름
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateVideoModel(model) {
  if (!model) return null;

  if (!VALID_VIDEO_MODELS.includes(model)) {
    return `지원하지 않는 영상 모델이에요. 사용 가능: ${VALID_VIDEO_MODELS.join(', ')}`;
  }

  return null;
}

/**
 * 이미지 비율 검증
 * @param {string} ratio - 비율
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateAspectRatio(ratio) {
  if (!ratio) return null;

  if (!VALID_ASPECT_RATIOS.includes(ratio)) {
    return `지원하지 않는 비율이에요. 사용 가능: ${VALID_ASPECT_RATIOS.join(', ')}`;
  }

  return null;
}

/**
 * 영상 비율 검증 (16:9, 9:16만 지원)
 * @param {string} ratio - 비율
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateVideoAspectRatio(ratio) {
  if (!ratio) return null;

  if (!VALID_VIDEO_ASPECT_RATIOS.includes(ratio)) {
    return `영상 비율은 ${VALID_VIDEO_ASPECT_RATIOS.join(' 또는 ')}만 지원해요`;
  }

  return null;
}

/**
 * 품질 옵션 검증
 * @param {string} quality - 품질
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateQuality(quality) {
  if (!quality) return null;

  if (!VALID_QUALITY_OPTIONS.includes(quality)) {
    return `지원하지 않는 품질 옵션이에요. 사용 가능: ${VALID_QUALITY_OPTIONS.join(', ')}`;
  }

  return null;
}

/**
 * 스타일 프리셋 검증
 * @param {string} style - 스타일
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateStylePreset(style) {
  if (!style) return null;

  if (!VALID_STYLE_PRESETS.includes(style)) {
    return `지원하지 않는 스타일이에요. 사용 가능: ${VALID_STYLE_PRESETS.join(', ')}`;
  }

  return null;
}

/**
 * 업스케일 배율 검증
 * @param {number|string} scale - 배율
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateUpscaleScale(scale) {
  if (!scale) return null;

  const numScale = parseInt(scale, 10);
  if (!VALID_UPSCALE_SCALES.includes(numScale)) {
    return `업스케일 배율은 ${VALID_UPSCALE_SCALES.join('x 또는 ')}x만 가능해요`;
  }

  return null;
}

/**
 * Base64 이미지 검증
 * @param {string} imageData - Base64 이미지 또는 URL
 * @param {boolean} required - 필수 여부
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateImage(imageData, required = true) {
  if (!imageData) {
    return required ? '이미지를 업로드해주세요' : null;
  }

  // URL인 경우 통과
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return null;
  }

  // Data URL 형식 검증
  if (!imageData.startsWith('data:')) {
    return '올바른 이미지 형식이 아니에요';
  }

  const match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) {
    return 'Base64 이미지 형식이 올바르지 않아요';
  }

  // 크기 체크 (Base64는 원본의 약 1.33배)
  const base64Length = match[2].length;
  const estimatedBytes = (base64Length * 3) / 4;

  if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
    return `이미지가 너무 커요 (최대 ${MAX_IMAGE_SIZE_MB}MB)`;
  }

  return null;
}

/**
 * 여러 필드 한번에 검증
 * @param {Object} validations - { fieldName: validationResult } 형태
 * @returns {string|null} - 첫 번째 에러 메시지 (모두 유효하면 null)
 */
export function validateAll(validations) {
  for (const [, error] of Object.entries(validations)) {
    if (error) return error;
  }
  return null;
}

/**
 * 이미지 생성 요청 검증
 * @param {Object} body - 요청 body
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateImageGenRequest(body) {
  const { prompt, model, aspectRatio, quality, stylePreset } = body || {};

  return validateAll({
    prompt: validatePrompt(prompt),
    model: validateImageModel(model),
    aspectRatio: validateAspectRatio(aspectRatio),
    quality: validateQuality(quality),
    stylePreset: validateStylePreset(stylePreset),
  });
}

/**
 * 영상 생성 요청 검증
 * @param {Object} body - 요청 body
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateVideoGenRequest(body) {
  const { prompt, aspectRatio, image } = body || {};

  return validateAll({
    prompt: validatePrompt(prompt),
    aspectRatio: validateVideoAspectRatio(aspectRatio),
    image: validateImage(image, false), // 영상은 이미지 선택사항
  });
}

/**
 * 업스케일 요청 검증
 * @param {Object} body - 요청 body
 * @returns {string|null} - 에러 메시지 (null이면 유효)
 */
export function validateUpscaleRequest(body) {
  const { image, scale } = body || {};

  return validateAll({
    image: validateImage(image, true),
    scale: validateUpscaleScale(scale),
  });
}

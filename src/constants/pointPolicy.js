/**
 * 오렌지웨일 포인트 정책
 * - 기능별 포인트 소비량 정의
 * - 자원/시간 대비 차등 적용
 */

// 기능별 포인트 소비량
export const POINT_COSTS = {
  // 이미지 기능
  'remove-bg': 1,           // 배경 지우기 - 가장 간단
  'upscale': 2,             // 업스케일 - 단순 처리
  'image-gen-standard': 3,  // 일반 이미지 생성
  'image-gen-hd': 4,        // HD 이미지 생성
  'image-gen-4k': 5,        // 4K 이미지 생성
  'inpainting': 3,          // 부분 편집
  'conversational': 4,      // 대화형 편집
  'image-to-image': 3,      // 이미지 참조 생성

  // 영상 기능 - 자원 많이 소모
  'video-5s': 10,           // 5초 영상
  'video-10s': 15,          // 10초 영상

  // 디자인 어시스턴트
  'mockup': 2,              // 목업 생성
  'social-card': 2,         // SNS 카드
  'poster': 3,              // 포스터/배너
};

// 모델별 추가 포인트 (고급 모델은 더 많이 소비)
export const MODEL_MULTIPLIER = {
  'gemini-3-pro': 1.0,      // 기본
  'gpt-image-1.5': 1.2,     // 약간 높음
  'imagen-4': 1.0,          // 기본
};

// 품질별 추가 포인트
export const QUALITY_MULTIPLIER = {
  'low': 0.5,
  'medium': 1.0,
  'high': 1.5,
  'auto': 1.0,
};

// 월간 포인트 한도
export const MONTHLY_POINT_LIMIT = 500;

// 사용자별 기본 포인트
export const DEFAULT_MONTHLY_POINTS = 100;

/**
 * 포인트 계산 함수
 * @param {string} action - 기능 키 (예: 'remove-bg', 'image-gen-standard')
 * @param {object} options - 추가 옵션 { model, quality }
 * @returns {number} 소비할 포인트
 */
export function calculatePoints(action, options = {}) {
  const baseCost = POINT_COSTS[action] || 3;
  const modelMultiplier = MODEL_MULTIPLIER[options.model] || 1.0;
  const qualityMultiplier = QUALITY_MULTIPLIER[options.quality] || 1.0;

  return Math.ceil(baseCost * modelMultiplier * qualityMultiplier);
}

/**
 * 기능 키 매핑 (서브메뉴 → 포인트 액션)
 */
export const ACTION_MAP = {
  'text-to-image': 'image-gen-standard',
  'image-to-image': 'image-to-image',
  'remove-bg': 'remove-bg',
  'upscale': 'upscale',
  'inpainting': 'inpainting',
  'conversational': 'conversational',
  'text-to-video': 'video-5s',
  'image-to-video': 'video-5s',
  'multi-image-to-video': 'video-5s',
  'mockup': 'mockup',
  'social-card': 'social-card',
  'poster-banner': 'poster',
};

/**
 * 품질에 따른 액션 키 반환
 */
export function getActionKey(subMenu, quality = 'medium') {
  const baseAction = ACTION_MAP[subMenu];

  // 이미지 생성은 품질에 따라 다른 키
  if (subMenu === 'text-to-image') {
    if (quality === 'hd' || quality === 'high') return 'image-gen-hd';
    if (quality === '4k') return 'image-gen-4k';
    return 'image-gen-standard';
  }

  return baseAction || 'image-gen-standard';
}

const pointPolicy = {
  POINT_COSTS,
  MODEL_MULTIPLIER,
  QUALITY_MULTIPLIER,
  MONTHLY_POINT_LIMIT,
  calculatePoints,
  getActionKey,
};

export default pointPolicy;

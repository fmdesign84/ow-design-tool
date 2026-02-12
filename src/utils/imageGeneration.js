/**
 * 이미지 생성 유틸리티
 * - 에러 핸들링 & 폴백 전략
 * - 모델 호환성 체크
 * - 비용 추정
 */

// 모델별 폴백 체인
const FALLBACK_CHAIN = {
  'gemini-3-pro': ['imagen-4', 'gpt-image-1.5'],
  'gpt-image-1.5': ['gemini-3-pro', 'imagen-4'],
  'imagen-4': ['gemini-3-pro', null]
};

// 모델별 API 엔드포인트
const MODEL_ENDPOINTS = {
  'gemini-3-pro': '/api/generate-image',
  'gpt-image-1.5': '/api/generate-image-openai',
  'imagen-4': '/api/generate-image'
};

// 내부용 무과금 모드
const POINTS_PER_IMAGE = {
  'gemini-3-pro': {
    fast: 0,
    standard: 0,
    hd: 0,
    '4k': 0
  },
  'gpt-image-1.5': {
    fast: 0,
    standard: 0,
    hd: 0
  },
  'imagen-4': {
    fast: 0,
    standard: 0,
    hd: 0
  }
};

// 모델별 지원 기능
const MODEL_FEATURES = {
  'gemini-3-pro': {
    koreanNative: true,
    maxReferenceImages: 14,
    imageRoles: true,
    inpainting: false,  // 마스크 기반은 불가
    outpainting: false,
    multiTurn: true,
    searchGrounding: true,
    thinking: true,
    maxResolution: 4096,
    outputFormats: ['png']
  },
  'gpt-image-1.5': {
    koreanNative: false,
    maxReferenceImages: 4,
    imageRoles: false,
    inpainting: true,
    outpainting: true,
    multiTurn: false,
    searchGrounding: false,
    thinking: false,
    maxResolution: 4096,
    outputFormats: ['png', 'jpeg', 'webp'],
    styles: ['vivid', 'natural']
  },
  'imagen-4': {
    koreanNative: false,
    maxReferenceImages: 0,
    imageRoles: false,
    inpainting: false,
    outpainting: false,
    multiTurn: false,
    searchGrounding: false,
    thinking: false,
    maxResolution: 2048,
    outputFormats: ['png']
  }
};

// 기능별 필수 모델 요구사항
const FEATURE_REQUIREMENTS = {
  'inpainting': { required: ['gpt-image-1.5'], reason: '마스크 편집' },
  'outpainting': { required: ['gpt-image-1.5'], reason: '캔버스 확장' },
  'multi-reference-5+': { required: ['gemini-3-pro'], reason: '5장 이상 참조' },
  'multi-turn': { required: ['gemini-3-pro'], reason: '대화형 편집' },
  'search-grounding': { required: ['gemini-3-pro'], reason: '실시간 검색' },
  'thinking': { required: ['gemini-3-pro'], reason: '깊이 생각하기' },
  'korean-native': { preferred: ['gemini-3-pro'], reason: '한글 최적화' },
  'text-render': { preferred: ['gpt-image-1.5'], reason: '텍스트 정확도' }
};

/**
 * 에러 유형 분류
 */
export const ERROR_TYPES = {
  RATE_LIMIT: 'RATE_LIMIT',
  CONTENT_POLICY: 'CONTENT_POLICY',
  TIMEOUT: 'TIMEOUT',
  NETWORK: 'NETWORK',
  INVALID_REQUEST: 'INVALID_REQUEST',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN'
};

/**
 * API 에러를 분류하여 타입 반환
 */
export function classifyError(error) {
  if (!navigator.onLine) {
    return ERROR_TYPES.NETWORK;
  }

  const status = error.status || error.response?.status;
  const message = error.message?.toLowerCase() || '';

  if (status === 429) {
    return ERROR_TYPES.RATE_LIMIT;
  }
  if (status === 400) {
    if (message.includes('content') || message.includes('policy') || message.includes('safety')) {
      return ERROR_TYPES.CONTENT_POLICY;
    }
    return ERROR_TYPES.INVALID_REQUEST;
  }
  if (message.includes('timeout') || message.includes('aborted')) {
    return ERROR_TYPES.TIMEOUT;
  }
  if (status >= 500) {
    return ERROR_TYPES.SERVER_ERROR;
  }

  return ERROR_TYPES.UNKNOWN;
}

/**
 * 에러 타입별 사용자 친화적 메시지 반환
 */
export function getErrorMessage(errorType, originalError) {
  const messages = {
    [ERROR_TYPES.RATE_LIMIT]: {
      message: '요청이 많아서 잠시 후 다시 시도해주세요',
      suggestion: '30초 후 자동으로 재시도됩니다',
      retryable: true,
      retryDelay: 30000
    },
    [ERROR_TYPES.CONTENT_POLICY]: {
      message: '요청한 내용을 생성할 수 없어요',
      suggestion: '프롬프트를 수정해보세요',
      retryable: false
    },
    [ERROR_TYPES.TIMEOUT]: {
      message: '생성 시간이 너무 오래 걸렸어요',
      suggestion: '다른 모델로 시도해볼게요',
      retryable: true,
      useFallback: true
    },
    [ERROR_TYPES.NETWORK]: {
      message: '네트워크 연결이 끊어졌어요',
      suggestion: '인터넷 연결을 확인해주세요',
      retryable: true
    },
    [ERROR_TYPES.INVALID_REQUEST]: {
      message: '요청 형식이 올바르지 않아요',
      suggestion: originalError?.message || '설정을 확인해주세요',
      retryable: false
    },
    [ERROR_TYPES.SERVER_ERROR]: {
      message: '서버에 문제가 생겼어요',
      suggestion: '다른 모델로 시도해볼게요',
      retryable: true,
      useFallback: true
    },
    [ERROR_TYPES.UNKNOWN]: {
      message: '알 수 없는 오류가 발생했어요',
      suggestion: '다시 시도해주세요',
      retryable: true
    }
  };

  return messages[errorType] || messages[ERROR_TYPES.UNKNOWN];
}

/**
 * 폴백 모델 가져오기
 */
export function getFallbackModel(currentModel) {
  const chain = FALLBACK_CHAIN[currentModel];
  if (!chain || chain.length === 0) {
    return null;
  }
  return chain[0];
}

/**
 * 폴백 가능한 전체 체인 가져오기
 */
export function getFallbackChain(model) {
  return FALLBACK_CHAIN[model] || [];
}

/**
 * 모델이 특정 기능을 지원하는지 확인
 */
export function isFeatureSupported(model, feature) {
  const features = MODEL_FEATURES[model];
  if (!features) return false;

  switch (feature) {
    case 'inpainting':
      return features.inpainting === true;
    case 'outpainting':
      return features.outpainting === true;
    case 'multi-turn':
      return features.multiTurn === true;
    case 'search-grounding':
      return features.searchGrounding === true;
    case 'thinking':
      return features.thinking === true;
    case 'korean-native':
      return features.koreanNative === true;
    case 'image-roles':
      return features.imageRoles === true;
    default:
      return true;
  }
}

/**
 * 참조 이미지 개수가 모델 제한 내인지 확인
 */
export function checkReferenceImageLimit(model, imageCount) {
  const features = MODEL_FEATURES[model];
  if (!features) return { ok: false, message: '알 수 없는 모델입니다' };

  if (imageCount > features.maxReferenceImages) {
    return {
      ok: false,
      message: `${model}은 최대 ${features.maxReferenceImages}장까지 참조 가능해요`,
      limit: features.maxReferenceImages
    };
  }

  return { ok: true };
}

/**
 * 선택된 기능에 맞는 모델 추천
 */
export function recommendModel(selectedFeatures, currentPrompt) {
  // 1. 필수 요구사항 체크
  for (const feature of selectedFeatures) {
    const req = FEATURE_REQUIREMENTS[feature];
    if (req?.required) {
      return {
        model: req.required[0],
        reason: req.reason,
        forced: true
      };
    }
  }

  // 2. 프롬프트 언어 감지
  const isKorean = /[가-힣]/.test(currentPrompt);
  if (isKorean) {
    return {
      model: 'gemini-3-pro',
      reason: '한글 프롬프트에 최적화',
      forced: false
    };
  }

  // 3. 선호 모델 체크
  for (const feature of selectedFeatures) {
    const req = FEATURE_REQUIREMENTS[feature];
    if (req?.preferred) {
      return {
        model: req.preferred[0],
        reason: req.reason,
        forced: false
      };
    }
  }

  // 4. 기본값
  return { model: 'gemini-3-pro', forced: false };
}

/**
 * 모델 전환 시 호환성 문제 체크
 */
export function checkModelSwitchCompatibility(fromModel, toModel, currentSettings) {
  const issues = [];
  const toFeatures = MODEL_FEATURES[toModel];

  if (!toFeatures) {
    return { compatible: false, issues: ['알 수 없는 모델입니다'] };
  }

  // 참조 이미지 개수 체크
  if (currentSettings.referenceImages?.length > toFeatures.maxReferenceImages) {
    issues.push({
      type: 'referenceImages',
      message: `참조 이미지 ${currentSettings.referenceImages.length}장 → ${toFeatures.maxReferenceImages}장으로 제한`,
      action: 'reduce'
    });
  }

  // 마스크 체크 (인페인팅)
  if (currentSettings.mask && !toFeatures.inpainting) {
    issues.push({
      type: 'mask',
      message: '마스크 편집 → 비활성화됨',
      action: 'clear'
    });
  }

  // 스타일 체크
  if (currentSettings.style && !toFeatures.styles?.includes(currentSettings.style)) {
    issues.push({
      type: 'style',
      message: `${currentSettings.style} 스타일 → 기본 스타일로 변경`,
      action: 'reset'
    });
  }

  // 이미지 역할 체크
  if (currentSettings.imageRoles?.length > 0 && !toFeatures.imageRoles) {
    issues.push({
      type: 'imageRoles',
      message: '이미지 역할 지정 → 비활성화됨',
      action: 'clear'
    });
  }

  return {
    compatible: issues.length === 0,
    issues
  };
}

/**
 * 내부용 비용 추정 (항상 0)
 */
export function estimateCost(model, quality) {
  const points = POINTS_PER_IMAGE[model];
  if (!points) return 0;

  return points[quality] || points.standard || 0;
}

/**
 * 내부용 비용 포맷팅
 */
export function formatCost(points) {
  return {
    points: `${points}`,
    display: `${points}`
  };
}

/**
 * 모델 정보 가져오기
 */
export function getModelInfo(model) {
  return {
    features: MODEL_FEATURES[model] || null,
    points: POINTS_PER_IMAGE[model] || null,
    endpoint: MODEL_ENDPOINTS[model] || null,
    fallbacks: FALLBACK_CHAIN[model] || []
  };
}

/**
 * 폴백과 함께 이미지 생성
 * @param {Object} params - 생성 파라미터
 * @param {Function} generateFn - 실제 생성 함수
 * @param {Function} onFallback - 폴백 시 콜백
 */
export async function generateWithFallback(params, generateFn, onFallback) {
  const { model, ...options } = params;
  const chain = [model, ...getFallbackChain(model)];

  for (let i = 0; i < chain.length; i++) {
    const currentModel = chain[i];
    if (!currentModel) break;

    try {
      const result = await generateFn({ model: currentModel, ...options });

      // 폴백으로 성공한 경우
      if (currentModel !== model) {
        result.fallbackNotice = {
          original: model,
          used: currentModel,
          message: `${model} 대신 ${currentModel}(으)로 생성했어요`
        };
        onFallback?.(result.fallbackNotice);
      }

      return result;

    } catch (error) {
      console.error(`[${currentModel}] Failed:`, error.message);

      const errorType = classifyError(error);
      const errorInfo = getErrorMessage(errorType, error);

      // 재시도 불가능하거나 마지막 모델이면 에러 throw
      if (!errorInfo.retryable || i === chain.length - 1) {
        const enhancedError = new Error(error.message || 'Image generation failed');
        enhancedError.errorType = errorType;
        enhancedError.errorInfo = errorInfo;
        enhancedError.triedModels = chain.slice(0, i + 1);
        throw enhancedError;
      }

      // Rate limit이면 대기
      if (errorType === ERROR_TYPES.RATE_LIMIT && errorInfo.retryDelay) {
        await new Promise(resolve => setTimeout(resolve, errorInfo.retryDelay));
        i--; // 같은 모델로 재시도
        continue;
      }

      // 폴백으로 계속
      continue;
    }
  }
}

const imageGeneration = {
  ERROR_TYPES,
  classifyError,
  getErrorMessage,
  getFallbackModel,
  getFallbackChain,
  isFeatureSupported,
  checkReferenceImageLimit,
  recommendModel,
  checkModelSwitchCompatibility,
  estimateCost,
  formatCost,
  getModelInfo,
  generateWithFallback
};

export default imageGeneration;

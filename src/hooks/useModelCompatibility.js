/**
 * 모델 호환성 체크 훅
 * - 기능별 모델 지원 여부 확인
 * - 자동 모델 추천
 * - 모델 전환 시 호환성 경고
 */

import { useMemo, useCallback } from 'react';

// 모델별 지원 기능
const MODEL_FEATURES = {
  'gemini-3-pro': {
    koreanNative: true,
    maxReferenceImages: 14,
    imageRoles: true,
    inpainting: false,
    outpainting: false,
    multiTurn: true,
    searchGrounding: true,
    thinking: true,
    maxResolution: 4096,
    styles: null  // 스타일 옵션 없음
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
    styles: null
  }
};

// 기능별 필수/선호 모델
const FEATURE_REQUIREMENTS = {
  'inpainting': { required: ['gpt-image-1.5'], reason: '마스크 편집은 GPT만 지원' },
  'outpainting': { required: ['gpt-image-1.5'], reason: '캔버스 확장은 GPT만 지원' },
  'multi-reference-5+': { required: ['gemini-3-pro'], reason: '5장 이상 참조는 Gemini만 지원' },
  'multi-turn': { required: ['gemini-3-pro'], reason: '대화형 편집은 Gemini만 지원' },
  'search-grounding': { required: ['gemini-3-pro'], reason: '실시간 검색은 Gemini만 지원' },
  'thinking': { required: ['gemini-3-pro'], reason: '깊이 생각하기는 Gemini만 지원' },
  'style-options': { required: ['gpt-image-1.5'], reason: '스타일 옵션은 GPT만 지원' }
};

/**
 * 모델 호환성 체크 훅
 */
export function useModelCompatibility(currentModel, options = {}) {
  const {
    prompt = '',
    referenceImages = [],
    selectedFeatures = [],
    mask = null
  } = options;

  // 현재 모델 기능 정보
  const modelFeatures = useMemo(() => {
    return MODEL_FEATURES[currentModel] || MODEL_FEATURES['gemini-3-pro'];
  }, [currentModel]);

  // 특정 기능 지원 여부 확인
  const isFeatureSupported = useCallback((feature) => {
    switch (feature) {
      case 'inpainting':
        return modelFeatures.inpainting;
      case 'outpainting':
        return modelFeatures.outpainting;
      case 'multi-turn':
        return modelFeatures.multiTurn;
      case 'search-grounding':
        return modelFeatures.searchGrounding;
      case 'thinking':
        return modelFeatures.thinking;
      case 'image-roles':
        return modelFeatures.imageRoles;
      case 'korean-native':
        return modelFeatures.koreanNative;
      case 'style-options':
        return !!modelFeatures.styles;
      default:
        return true;
    }
  }, [modelFeatures]);

  // 참조 이미지 개수 체크
  const referenceImageCheck = useMemo(() => {
    const count = referenceImages.length;
    const max = modelFeatures.maxReferenceImages;

    if (count > max) {
      return {
        ok: false,
        message: `${currentModel === 'imagen-4' ? 'Imagen 4는 참조 이미지를 지원하지 않아요' : `최대 ${max}장까지 참조 가능해요`}`,
        excess: count - max
      };
    }
    return { ok: true, remaining: max - count };
  }, [referenceImages.length, modelFeatures.maxReferenceImages, currentModel]);

  // 자동 모델 추천
  const recommendedModel = useMemo(() => {
    // 1. 필수 기능 체크
    for (const feature of selectedFeatures) {
      const req = FEATURE_REQUIREMENTS[feature];
      if (req?.required && !req.required.includes(currentModel)) {
        return {
          model: req.required[0],
          reason: req.reason,
          forced: true
        };
      }
    }

    // 2. 마스크가 있으면 GPT 필요
    if (mask) {
      if (currentModel !== 'gpt-image-1.5') {
        return {
          model: 'gpt-image-1.5',
          reason: '마스크 편집은 GPT만 지원',
          forced: true
        };
      }
    }

    // 3. 참조 이미지 5장 이상이면 Gemini 필요
    if (referenceImages.length > 4) {
      if (currentModel !== 'gemini-3-pro') {
        return {
          model: 'gemini-3-pro',
          reason: '5장 이상 참조는 Gemini만 지원',
          forced: true
        };
      }
    }

    // 4. 한글 프롬프트 감지
    const hasKorean = /[가-힣]/.test(prompt);
    if (hasKorean && currentModel !== 'gemini-3-pro') {
      return {
        model: 'gemini-3-pro',
        reason: '한글 프롬프트에 최적화',
        forced: false
      };
    }

    // 5. 현재 모델 유지
    return null;
  }, [currentModel, selectedFeatures, mask, referenceImages.length, prompt]);

  // 모델 전환 시 호환성 체크
  const checkModelSwitch = useCallback((toModel) => {
    const toFeatures = MODEL_FEATURES[toModel];
    if (!toFeatures) {
      return { compatible: false, issues: [{ message: '알 수 없는 모델' }] };
    }

    const issues = [];

    // 참조 이미지 개수 체크
    if (referenceImages.length > toFeatures.maxReferenceImages) {
      issues.push({
        type: 'referenceImages',
        message: `참조 이미지 ${referenceImages.length}장 → ${toFeatures.maxReferenceImages}장으로 제한`,
        action: 'reduce',
        currentCount: referenceImages.length,
        maxCount: toFeatures.maxReferenceImages
      });
    }

    // 마스크 체크
    if (mask && !toFeatures.inpainting) {
      issues.push({
        type: 'mask',
        message: '마스크 편집 → 비활성화됨',
        action: 'clear'
      });
    }

    return {
      compatible: issues.length === 0,
      issues
    };
  }, [referenceImages.length, mask]);

  // 비활성화해야 할 기능 목록
  const disabledFeatures = useMemo(() => {
    const disabled = [];

    if (!modelFeatures.inpainting) disabled.push('inpainting');
    if (!modelFeatures.outpainting) disabled.push('outpainting');
    if (!modelFeatures.imageRoles) disabled.push('image-roles');
    if (!modelFeatures.multiTurn) disabled.push('multi-turn');
    if (!modelFeatures.searchGrounding) disabled.push('search-grounding');
    if (!modelFeatures.thinking) disabled.push('thinking');
    if (!modelFeatures.styles) disabled.push('style-options');

    return disabled;
  }, [modelFeatures]);

  return {
    // 현재 모델 정보
    modelFeatures,
    maxReferenceImages: modelFeatures.maxReferenceImages,

    // 체크 결과
    isFeatureSupported,
    referenceImageCheck,
    disabledFeatures,

    // 추천
    recommendedModel,
    hasRecommendation: !!recommendedModel,
    isRecommendationForced: recommendedModel?.forced || false,

    // 모델 전환
    checkModelSwitch
  };
}

/**
 * 모델 기능 정보 가져오기 (외부 사용)
 */
export function getModelFeatures(modelId) {
  return MODEL_FEATURES[modelId] || null;
}

export default useModelCompatibility;

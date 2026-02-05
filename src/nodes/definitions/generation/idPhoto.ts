/**
 * ID Photo Node (증명사진)
 * 참조 이미지로 증명사진 생성 - /api/generate-idphoto
 */

import type { NodeDefinition } from '../../types';

export const idPhotoNode: NodeDefinition = {
  id: 'id-photo',
  name: '증명사진',
  category: 'generation',
  icon: 'UserSquare',
  description: '얼굴 사진을 바탕으로 증명사진을 생성합니다.',

  inputs: [
    {
      id: 'referenceImages',
      name: '참조 이미지',
      type: 'images',
      required: true,
      description: '참조할 얼굴 사진 (1-5장)',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '증명사진',
      type: 'image',
      description: '생성된 증명사진 (base64)',
    },
  ],

  config: [
    {
      id: 'purpose',
      name: '용도',
      type: 'select',
      default: 'resume',
      options: [
        { value: 'resume', label: '이력서/취업' },
        { value: 'employee', label: '사원증/명함' },
        { value: 'visa', label: '여권/비자' },
        { value: 'profile', label: 'SNS/프로필' },
      ],
    },
    {
      id: 'background',
      name: '배경색',
      type: 'select',
      default: 'white',
      options: [
        { value: 'white', label: '흰색' },
        { value: 'light-gray', label: '연회색' },
        { value: 'light-blue', label: '연파랑' },
      ],
    },
    {
      id: 'clothingMode',
      name: '복장',
      type: 'select',
      default: 'keep',
      options: [
        { value: 'keep', label: '현재 옷 유지' },
        { value: 'suit-navy', label: '네이비 정장' },
        { value: 'suit-charcoal', label: '차콜 정장' },
        { value: 'suit-black', label: '블랙 정장' },
        { value: 'suit-brown', label: '브라운 정장' },
        { value: 'suit-beige', label: '베이지 정장' },
      ],
    },
    {
      id: 'hairMode',
      name: '머리스타일',
      type: 'select',
      default: 'keep',
      options: [
        { value: 'keep', label: '현재 그대로' },
        { value: 'custom', label: '스타일 지정' },
      ],
    },
    {
      id: 'expression',
      name: '표정',
      type: 'select',
      default: 'neutral',
      options: [
        { value: 'neutral', label: '무표정' },
        { value: 'slight-smile', label: '살짝 미소' },
      ],
    },
  ],

  execute: async (inputs, config) => {
    try {
      const inputImages = inputs.referenceImages;

      // 이미지 검증
      if (!inputImages) {
        return {
          outputs: { image: null },
          error: { message: '참조 이미지가 필요합니다', code: 'MISSING_IMAGES' },
        };
      }

      // 단일 이미지도 배열로 변환
      const referenceImages = Array.isArray(inputImages)
        ? (inputImages as string[])
        : [inputImages as string];

      if (referenceImages.length === 0) {
        return {
          outputs: { image: null },
          error: { message: '참조 이미지가 필요합니다', code: 'MISSING_IMAGES' },
        };
      }

      const response = await fetch('/api/generate-idphoto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceImages,
          purpose: config.purpose,
          background: config.background,
          clothingMode: config.clothingMode,
          clothingStyle: config.clothingMode !== 'keep' ? config.clothingMode : undefined,
          hairMode: config.hairMode,
          expression: config.expression,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          outputs: { image: null },
          error: {
            message: data.error || '증명사진 생성 실패',
            code: 'API_ERROR',
          },
        };
      }

      return {
        outputs: { image: data.image },
      };
    } catch (error) {
      return {
        outputs: { image: null },
        error: {
          message: error instanceof Error ? error.message : '알 수 없는 오류',
          code: 'NETWORK_ERROR',
        },
      };
    }
  },
};

export default idPhotoNode;

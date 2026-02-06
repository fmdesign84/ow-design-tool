/**
 * Virtual Try-On Node (가상 피팅)
 * 인물 사진에 의류 가상 피팅 - /api/virtual-tryon
 */

import type { NodeDefinition } from '../../types';

export const virtualTryonNode: NodeDefinition = {
  id: 'virtual-tryon',
  name: '가상 피팅',
  category: 'generation',
  icon: 'Shirt',
  description: '인물 사진에 의류를 가상으로 피팅합니다.',

  inputs: [
    {
      id: 'humanImage',
      name: '인물 이미지',
      type: 'image',
      required: true,
      description: '의류를 입힐 인물 전신 사진',
    },
    {
      id: 'garmentImage',
      name: '의류 이미지',
      type: 'image',
      required: true,
      description: '피팅할 의류 이미지',
    },
    {
      id: 'garmentDescription',
      name: '의류 설명',
      type: 'text',
      required: false,
      description: '의류에 대한 추가 설명 (선택)',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '피팅 결과',
      type: 'image',
      description: '가상 피팅된 결과 이미지',
    },
  ],

  config: [
    {
      id: 'category',
      name: '의류 카테고리',
      type: 'select',
      default: 'upper_body',
      options: [
        { value: 'upper_body', label: '상의' },
        { value: 'lower_body', label: '하의' },
        { value: 'dresses', label: '드레스/원피스' },
      ],
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.humanImage) {
        return {
          outputs: { image: null },
          error: { message: '인물 이미지가 필요합니다', code: 'MISSING_HUMAN' },
        };
      }

      if (!inputs.garmentImage) {
        return {
          outputs: { image: null },
          error: { message: '의류 이미지가 필요합니다', code: 'MISSING_GARMENT' },
        };
      }

      const response = await fetch('/api/virtual-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          humanImage: inputs.humanImage,
          garmentImage: inputs.garmentImage,
          category: config.category,
          garmentDescription: inputs.garmentDescription || '',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          outputs: { image: null },
          error: {
            message: data.error || data.friendlyMessage?.message || '가상 피팅 실패',
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

export default virtualTryonNode;

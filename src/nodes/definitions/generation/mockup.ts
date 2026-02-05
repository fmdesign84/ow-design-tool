/**
 * Mockup Generation Node
 * 제품 이미지로 목업 생성 - /api/generate-mockup
 */

import type { NodeDefinition } from '../../types';

export const mockupNode: NodeDefinition = {
  id: 'mockup',
  name: '목업 생성',
  category: 'generation',
  icon: 'Layout',
  description: '제품 이미지를 다양한 목업으로 변환합니다.',

  inputs: [
    {
      id: 'productImage',
      name: '제품 이미지',
      type: 'image',
      required: true,
      description: '목업에 적용할 제품/디자인 이미지',
    },
    {
      id: 'customPrompt',
      name: '커스텀 프롬프트',
      type: 'text',
      required: false,
      description: '추가 스타일링 지시 (선택)',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '목업 이미지',
      type: 'image',
      description: '생성된 목업 이미지',
    },
  ],

  config: [
    {
      id: 'mockupType',
      name: '목업 종류',
      type: 'mockup-select', // 커스텀 타입: 이미지 카드 선택 UI
      default: 'social-square',
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.productImage) {
        return {
          outputs: { image: null },
          error: { message: '제품 이미지가 필요합니다', code: 'MISSING_IMAGE' },
        };
      }

      const response = await fetch('/api/generate-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImage: inputs.productImage,
          mockupType: config.mockupType,
          customPrompt: inputs.customPrompt || '',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          outputs: { image: null },
          error: {
            message: data.error || data.friendlyMessage?.message || '목업 생성 실패',
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

export default mockupNode;

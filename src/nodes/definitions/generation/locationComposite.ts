/**
 * Location Composite Node (장소 합성)
 * 배경 + 인물/객체 자연스러운 합성 - /api/composite-inpaint
 */

import type { NodeDefinition } from '../../types';

export const locationCompositeNode: NodeDefinition = {
  id: 'location-composite',
  name: '장소 합성',
  category: 'generation',
  icon: 'Layers',
  description: '배경 이미지에 인물/객체를 자연스럽게 합성합니다.',

  inputs: [
    {
      id: 'backgroundImage',
      name: '배경 이미지',
      type: 'image',
      required: true,
      description: '합성할 배경 이미지',
    },
    {
      id: 'foregroundImage',
      name: '전경 이미지',
      type: 'image',
      required: true,
      description: '배경에 합성할 인물/객체 이미지',
    },
    {
      id: 'prompt',
      name: '프롬프트',
      type: 'text',
      required: false,
      description: '합성 스타일 지시 (선택)',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '합성된 이미지',
      type: 'image',
      description: '합성된 결과 이미지',
    },
  ],

  config: [
    {
      id: 'aspectRatio',
      name: '비율',
      type: 'select',
      default: '1:1',
      options: [
        { value: '1:1', label: '1:1 (정사각형)' },
        { value: '16:9', label: '16:9 (가로)' },
        { value: '9:16', label: '9:16 (세로)' },
        { value: '4:3', label: '4:3' },
        { value: '3:4', label: '3:4' },
      ],
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.backgroundImage) {
        return {
          outputs: { image: null },
          error: { message: '배경 이미지가 필요합니다', code: 'MISSING_BACKGROUND' },
        };
      }

      if (!inputs.foregroundImage) {
        return {
          outputs: { image: null },
          error: { message: '전경 이미지가 필요합니다', code: 'MISSING_FOREGROUND' },
        };
      }

      const response = await fetch('/api/composite-inpaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: inputs.backgroundImage,
          mask: inputs.foregroundImage,
          prompt: inputs.prompt || '자연스럽게 합성해주세요',
          aspectRatio: config.aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          outputs: { image: null },
          error: {
            message: data.error || data.friendlyMessage?.message || '장소 합성 실패',
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

export default locationCompositeNode;

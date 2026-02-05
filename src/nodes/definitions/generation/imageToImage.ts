/**
 * Image to Image Node
 * 참조 이미지 + 프롬프트로 새 이미지 생성 - /api/generate-image (referenceImage 사용)
 */

import type { NodeDefinition } from '../../types';

export const imageToImageNode: NodeDefinition = {
  id: 'image-to-image',
  name: '이미지 → 이미지',
  category: 'generation',
  icon: 'ImagePlus',
  description: '참조 이미지를 기반으로 새로운 이미지를 생성합니다.',

  inputs: [
    {
      id: 'image',
      name: '참조 이미지',
      type: 'image',
      required: true,
      description: '참조할 원본 이미지',
    },
    {
      id: 'prompt',
      name: '프롬프트',
      type: 'text',
      required: true,
      description: '변형 방향 설명',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '생성된 이미지',
      type: 'image',
      description: '생성된 이미지 (base64)',
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
      ],
    },
    {
      id: 'strength',
      name: '변형 강도',
      type: 'slider',
      default: 0.7,
      min: 0.1,
      max: 1.0,
      step: 0.1,
      description: '낮을수록 원본 유지, 높을수록 많이 변형',
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.image) {
        return {
          outputs: { image: null },
          error: { message: '참조 이미지가 필요합니다', code: 'MISSING_IMAGE' },
        };
      }

      if (!inputs.prompt) {
        return {
          outputs: { image: null },
          error: { message: '프롬프트가 필요합니다', code: 'MISSING_PROMPT' },
        };
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputs.prompt,
          referenceImage: inputs.image,
          aspectRatio: config.aspectRatio,
          strength: config.strength,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          outputs: { image: null },
          error: {
            message: data.error || data.friendlyMessage?.message || '이미지 생성 실패',
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

export default imageToImageNode;

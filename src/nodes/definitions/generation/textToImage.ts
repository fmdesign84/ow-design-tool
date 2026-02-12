/**
 * Text to Image Node
 * 텍스트 프롬프트로 이미지 생성 - /api/generate-image
 */

import type { NodeDefinition } from '../../types';
import { getApiUrl } from '../../../utils/apiRoute';

export const textToImageNode: NodeDefinition = {
  id: 'text-to-image',
  name: '텍스트 → 이미지',
  category: 'generation',
  icon: 'Type',
  description: '텍스트 프롬프트로 이미지를 생성합니다.',

  inputs: [
    {
      id: 'prompt',
      name: '프롬프트',
      type: 'text',
      required: true,
      description: '생성할 이미지 설명',
    },
    {
      id: 'negativePrompt',
      name: '네거티브 프롬프트',
      type: 'text',
      required: false,
      description: '제외할 요소',
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
        { value: '4:3', label: '4:3' },
        { value: '3:4', label: '3:4' },
      ],
    },
    {
      id: 'quality',
      name: '품질',
      type: 'select',
      default: 'standard',
      options: [
        { value: 'standard', label: '표준' },
        { value: 'hd', label: 'HD' },
      ],
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.prompt) {
        return {
          outputs: { image: null },
          error: { message: '프롬프트가 필요합니다', code: 'MISSING_PROMPT' },
        };
      }

      const response = await fetch(getApiUrl('/api/generate-image', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputs.prompt,
          negativePrompt: inputs.negativePrompt || '',
          aspectRatio: config.aspectRatio,
          quality: config.quality,
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

export default textToImageNode;

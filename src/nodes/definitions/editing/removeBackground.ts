/**
 * Remove Background Node
 * 배경 제거 노드 - 기존 /api/remove-background 래핑
 */

import type { NodeDefinition } from '../../types';
import { getApiUrl } from '../../../utils/apiRoute';

export const removeBackgroundNode: NodeDefinition = {
  id: 'remove-background',
  name: '배경 제거',
  category: 'editing',
  icon: 'Scissors',
  description: '이미지에서 배경을 제거합니다.',

  inputs: [
    {
      id: 'image',
      name: '입력 이미지',
      type: 'image',
      required: true,
      description: '배경을 제거할 이미지',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '누끼 이미지',
      type: 'image',
      description: '배경이 제거된 이미지 (투명 PNG)',
    },
    {
      id: 'mask',
      name: '마스크',
      type: 'image',
      description: '배경/전경 마스크 이미지',
    },
  ],

  config: [
    {
      id: 'outputFormat',
      name: '출력 형식',
      type: 'select',
      default: 'png',
      options: [
        { value: 'png', label: 'PNG (투명 배경)' },
        { value: 'webp', label: 'WebP (투명 배경)' },
      ],
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.image) {
        return {
          outputs: { image: null, mask: null },
          error: {
            message: '이미지가 필요합니다',
            code: 'MISSING_INPUT',
          },
        };
      }

      const response = await fetch(getApiUrl('/api/remove-background', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: inputs.image,
          outputFormat: config.outputFormat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          outputs: { image: null, mask: null },
          error: {
            message: data.error || '배경 제거 실패',
            code: 'API_ERROR',
          },
        };
      }

      return {
        outputs: {
          image: data.imageUrl,
          mask: data.maskUrl || null,
        },
      };
    } catch (error) {
      return {
        outputs: { image: null, mask: null },
        error: {
          message: error instanceof Error ? error.message : '알 수 없는 오류',
          code: 'NETWORK_ERROR',
        },
      };
    }
  },
};

export default removeBackgroundNode;

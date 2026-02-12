/**
 * Upscale Node
 * 이미지 업스케일 노드 - 기존 /api/upscale-image 래핑
 */

import type { NodeDefinition } from '../../types';
import { getApiUrl } from '../../../utils/apiRoute';

export const upscaleNode: NodeDefinition = {
  id: 'upscale-image',
  name: '업스케일',
  category: 'editing',
  icon: 'Maximize2',
  description: '이미지 해상도를 높입니다.',

  inputs: [
    {
      id: 'image',
      name: '입력 이미지',
      type: 'image',
      required: true,
      description: '업스케일할 이미지',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '고해상도 이미지',
      type: 'image',
      description: '업스케일된 이미지',
    },
    {
      id: 'metadata',
      name: '메타데이터',
      type: 'json',
      description: '결과 정보',
    },
  ],

  config: [
    {
      id: 'scale',
      name: '배율',
      type: 'select',
      default: '2',
      options: [
        { value: '2', label: '2x' },
        { value: '4', label: '4x' },
      ],
    },
    {
      id: 'enhanceFace',
      name: '얼굴 보정',
      type: 'boolean',
      default: false,
      description: '얼굴이 있는 경우 추가 보정',
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.image) {
        return {
          outputs: { image: null, metadata: null },
          error: {
            message: '이미지가 필요합니다',
            code: 'MISSING_INPUT',
          },
        };
      }

      const response = await fetch(getApiUrl('/api/upscale-image', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: inputs.image,
          scale: parseInt(config.scale as string, 10),
          enhanceFace: config.enhanceFace,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          outputs: { image: null, metadata: null },
          error: {
            message: data.error || '업스케일 실패',
            code: 'API_ERROR',
          },
        };
      }

      return {
        outputs: {
          image: data.imageUrl,
          metadata: {
            scale: config.scale,
            originalSize: data.originalSize,
            newSize: data.newSize,
            processedAt: new Date().toISOString(),
          },
        },
      };
    } catch (error) {
      return {
        outputs: { image: null, metadata: null },
        error: {
          message: error instanceof Error ? error.message : '알 수 없는 오류',
          code: 'NETWORK_ERROR',
        },
      };
    }
  },
};

export default upscaleNode;

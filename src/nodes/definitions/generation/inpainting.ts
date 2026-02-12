/**
 * Inpainting Node (부분 편집)
 * 이미지의 특정 영역만 수정 - /api/correct-text
 */

import type { NodeDefinition } from '../../types';
import { getApiUrl } from '../../../utils/apiRoute';

export const inpaintingNode: NodeDefinition = {
  id: 'inpainting',
  name: '부분 편집',
  category: 'generation',
  icon: 'Paintbrush',
  description: '이미지의 특정 영역만 선택하여 수정합니다.',

  inputs: [
    {
      id: 'image',
      name: '원본 이미지',
      type: 'image',
      required: true,
      description: '수정할 이미지',
    },
    {
      id: 'correctionAreas',
      name: '수정 영역',
      type: 'json',
      required: true,
      description: '수정할 영역 정보 (boundingBox, text)',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '수정된 이미지',
      type: 'image',
      description: '수정된 이미지 (base64)',
    },
  ],

  config: [
    {
      id: 'correctText',
      name: '대체 텍스트',
      type: 'text',
      default: '',
      description: '영역을 대체할 텍스트 (선택)',
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.image) {
        return {
          outputs: { image: null },
          error: { message: '원본 이미지가 필요합니다', code: 'MISSING_IMAGE' },
        };
      }

      if (!inputs.correctionAreas) {
        return {
          outputs: { image: null },
          error: { message: '수정 영역 정보가 필요합니다', code: 'MISSING_AREAS' },
        };
      }

      // correctionAreas 파싱
      let correctionAreas = inputs.correctionAreas;
      if (typeof correctionAreas === 'string') {
        try {
          correctionAreas = JSON.parse(correctionAreas);
        } catch {
          return {
            outputs: { image: null },
            error: { message: '수정 영역 JSON 파싱 실패', code: 'INVALID_JSON' },
          };
        }
      }

      const response = await fetch(getApiUrl('/api/correct-text', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: inputs.image,
          correctionAreas: Array.isArray(correctionAreas) ? correctionAreas : [correctionAreas],
          correctText: config.correctText || '',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          outputs: { image: null },
          error: {
            message: data.error || '부분 편집 실패',
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

export default inpaintingNode;

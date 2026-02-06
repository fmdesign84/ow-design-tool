/**
 * Text Correct Node (텍스트 보정)
 * 이미지 내 깨진 텍스트 보정 - /api/correct-text
 */

import type { NodeDefinition } from '../../types';

export const textCorrectNode: NodeDefinition = {
  id: 'text-correct',
  name: '텍스트 보정',
  category: 'editing',
  icon: 'Type',
  description: '이미지 내 깨진/잘못된 텍스트를 보정합니다.',

  inputs: [
    {
      id: 'image',
      name: '원본 이미지',
      type: 'image',
      required: true,
      description: '텍스트를 보정할 이미지',
    },
    {
      id: 'correctionAreas',
      name: '보정 영역',
      type: 'json',
      required: true,
      description: '보정할 텍스트 영역 정보 (boundingBox, detectedText, suggestedText)',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '보정된 이미지',
      type: 'image',
      description: '텍스트가 보정된 이미지',
    },
  ],

  config: [
    {
      id: 'correctText',
      name: '대체 텍스트',
      type: 'text',
      default: '',
      description: '모든 영역에 적용할 대체 텍스트 (선택)',
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
          error: { message: '보정 영역 정보가 필요합니다', code: 'MISSING_AREAS' },
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
            error: { message: '보정 영역 JSON 파싱 실패', code: 'INVALID_JSON' },
          };
        }
      }

      const response = await fetch('/api/correct-text', {
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
            message: data.error || data.friendlyMessage?.message || '텍스트 보정 실패',
            code: 'API_ERROR',
          },
        };
      }

      return {
        outputs: { image: data.correctedImage },
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

export default textCorrectNode;

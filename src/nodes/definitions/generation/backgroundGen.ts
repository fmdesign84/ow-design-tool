/**
 * Background Generation Node (배경 생성)
 * 이미지의 배경을 자동 제거 후 새 배경 생성 - /api/generate-background
 */

import type { NodeDefinition } from '../../types';

export const backgroundGenNode: NodeDefinition = {
  id: 'background-gen',
  name: '배경 생성',
  category: 'generation',
  icon: 'Mountain',
  description: '이미지의 배경을 자동 제거하고 새로운 배경을 생성합니다.',

  inputs: [
    {
      id: 'image',
      name: '원본 이미지',
      type: 'image',
      required: true,
      description: '배경을 변경할 이미지',
    },
    {
      id: 'prompt',
      name: '배경 프롬프트',
      type: 'text',
      required: true,
      description: '생성할 배경 설명 (예: 해변, 오피스, 스튜디오)',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '결과 이미지',
      type: 'image',
      description: '새 배경이 적용된 이미지',
    },
  ],

  config: [
    {
      id: 'refinePrompt',
      name: '프롬프트 개선',
      type: 'boolean',
      default: true,
      description: '프롬프트를 자동으로 개선할지 여부',
    },
    {
      id: 'outputFormat',
      name: '출력 형식',
      type: 'select',
      default: 'png',
      options: [
        { value: 'png', label: 'PNG' },
        { value: 'jpg', label: 'JPG' },
        { value: 'webp', label: 'WebP' },
      ],
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

      if (!inputs.prompt) {
        return {
          outputs: { image: null },
          error: { message: '배경 프롬프트가 필요합니다', code: 'MISSING_PROMPT' },
        };
      }

      const response = await fetch('/api/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: inputs.image,
          refPrompt: inputs.prompt,
          refinePrompt: config.refinePrompt,
          outputFormat: config.outputFormat,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          outputs: { image: null },
          error: {
            message: data.error || data.friendlyMessage?.message || '배경 생성 실패',
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

export default backgroundGenNode;

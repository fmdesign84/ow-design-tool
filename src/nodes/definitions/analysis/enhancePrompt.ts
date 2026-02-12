/**
 * Enhance Prompt Node
 * 프롬프트 확장 노드 - 기존 /api/enhance-prompt 래핑
 */

import type { NodeDefinition } from '../../types';
import { getApiUrl } from '../../../utils/apiRoute';

export const enhancePromptNode: NodeDefinition = {
  id: 'enhance-prompt',
  name: '프롬프트 확장',
  category: 'analysis',
  icon: 'Sparkles',
  description: '간단한 프롬프트를 상세하고 효과적인 프롬프트로 확장합니다.',

  inputs: [
    {
      id: 'prompt',
      name: '프롬프트',
      type: 'text',
      required: true,
      description: '확장할 원본 프롬프트',
    },
  ],

  outputs: [
    {
      id: 'enhancedPrompt',
      name: '확장된 프롬프트',
      type: 'text',
      description: '상세하게 확장된 프롬프트',
    },
    {
      id: 'originalPrompt',
      name: '원본 프롬프트',
      type: 'text',
      description: '입력된 원본 프롬프트',
    },
  ],

  config: [
    {
      id: 'style',
      name: '스타일',
      type: 'select',
      default: 'detailed',
      options: [
        { value: 'detailed', label: '상세 묘사' },
        { value: 'artistic', label: '예술적' },
        { value: 'photographic', label: '사진적' },
        { value: 'minimal', label: '미니멀' },
      ],
    },
    {
      id: 'language',
      name: '출력 언어',
      type: 'select',
      default: 'en',
      options: [
        { value: 'en', label: '영어' },
        { value: 'ko', label: '한국어' },
      ],
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.prompt) {
        return {
          outputs: { enhancedPrompt: '', originalPrompt: '' },
          error: {
            message: '프롬프트가 필요합니다',
            code: 'MISSING_INPUT',
          },
        };
      }

      const response = await fetch(getApiUrl('/api/enhance-prompt', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputs.prompt,
          style: config.style,
          language: config.language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          outputs: { enhancedPrompt: '', originalPrompt: inputs.prompt },
          error: {
            message: data.error || '프롬프트 확장 실패',
            code: 'API_ERROR',
          },
        };
      }

      return {
        outputs: {
          enhancedPrompt: data.enhancedPrompt || data.prompt,
          originalPrompt: inputs.prompt,
        },
      };
    } catch (error) {
      return {
        outputs: { enhancedPrompt: '', originalPrompt: inputs.prompt },
        error: {
          message: error instanceof Error ? error.message : '알 수 없는 오류',
          code: 'NETWORK_ERROR',
        },
      };
    }
  },
};

export default enhancePromptNode;

/**
 * Text Input Node
 * 텍스트 입력 노드
 */

import type { NodeDefinition } from '../../types';

export const textInputNode: NodeDefinition = {
  id: 'text-input',
  name: '텍스트 입력',
  category: 'io',
  icon: 'Type',
  description: '텍스트를 입력합니다. 프롬프트 등에 사용됩니다.',

  inputs: [],

  outputs: [
    {
      id: 'text',
      name: '텍스트',
      type: 'text',
      description: '입력된 텍스트',
    },
  ],

  config: [
    {
      id: 'text',
      name: '텍스트',
      type: 'text',
      default: '',
      description: '출력할 텍스트를 입력하세요',
    },
    {
      id: 'multiline',
      name: '여러 줄',
      type: 'boolean',
      default: true,
      description: '여러 줄 입력 허용',
    },
  ],

  execute: async (inputs, config) => {
    const text = (config.text as string) || '';

    return {
      outputs: {
        text,
      },
    };
  },
};

export default textInputNode;

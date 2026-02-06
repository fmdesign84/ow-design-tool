/**
 * Text Output Node
 * 텍스트 출력 노드 - 텍스트/JSON 결과를 출력
 */

import type { NodeDefinition } from '../../types';

export const textOutputNode: NodeDefinition = {
  id: 'text-output',
  name: '텍스트 출력',
  category: 'io',
  icon: 'FileText',
  description: '텍스트 또는 JSON 결과를 출력합니다.',

  inputs: [
    {
      id: 'text',
      name: '텍스트',
      type: 'text',
      required: true,
      description: '출력할 텍스트',
    },
  ],

  outputs: [], // 출력 노드는 외부로 결과를 내보냄

  config: [
    {
      id: 'label',
      name: '라벨',
      type: 'text',
      default: '텍스트 결과',
      description: 'UI에 표시될 출력 라벨',
    },
    {
      id: 'outputFormat',
      name: '출력 형식',
      type: 'select',
      default: 'text',
      options: [
        { value: 'text', label: '일반 텍스트' },
        { value: 'json', label: 'JSON' },
        { value: 'markdown', label: '마크다운' },
      ],
    },
  ],

  execute: async (inputs) => {
    // 텍스트 출력 노드는 입력 텍스트를 그대로 워크플로우 결과로 반환
    return {
      outputs: {
        _workflowResult: inputs.text,
        _outputType: 'text',
      },
    };
  },
};

export default textOutputNode;

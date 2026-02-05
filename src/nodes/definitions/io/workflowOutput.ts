/**
 * Workflow Output Node
 * 워크플로우 종료점 - 최종 결과를 출력
 */

import type { NodeDefinition } from '../../types';

export const workflowOutputNode: NodeDefinition = {
  id: 'workflow-output',
  name: '워크플로우 출력',
  category: 'io',
  icon: 'ArrowLeftCircle',
  description: '워크플로우의 종료점입니다. 최종 결과를 출력합니다.',

  inputs: [
    {
      id: 'value',
      name: '입력',
      type: 'any',
      required: true,
      description: '워크플로우의 최종 결과',
    },
  ],

  outputs: [],  // 출력 노드는 외부로 결과를 내보냄

  config: [
    {
      id: 'outputType',
      name: '출력 타입',
      type: 'select',
      default: 'image',
      options: [
        { value: 'image', label: '이미지' },
        { value: 'video', label: '비디오' },
        { value: 'text', label: '텍스트' },
        { value: 'json', label: 'JSON' },
      ],
    },
    {
      id: 'label',
      name: '라벨',
      type: 'text',
      default: '결과',
      description: 'UI에 표시될 출력 라벨',
    },
  ],

  execute: async (inputs) => {
    // 출력 노드는 입력값을 그대로 워크플로우 결과로 반환
    return {
      outputs: {
        _workflowResult: inputs.value,
      },
    };
  },
};

export default workflowOutputNode;

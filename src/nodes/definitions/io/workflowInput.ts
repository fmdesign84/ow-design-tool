/**
 * Workflow Input Node
 * 워크플로우 시작점 - 외부 입력을 받아 워크플로우로 전달
 */

import type { NodeDefinition } from '../../types';

export const workflowInputNode: NodeDefinition = {
  id: 'workflow-input',
  name: '워크플로우 입력',
  category: 'io',
  icon: 'ArrowRightCircle',
  description: '워크플로우의 시작점입니다. 외부에서 입력을 받습니다.',

  inputs: [],  // 입력 노드는 외부에서 값을 받음

  outputs: [
    {
      id: 'value',
      name: '출력',
      type: 'any',
      description: '입력받은 값을 출력합니다',
    },
  ],

  config: [
    {
      id: 'inputType',
      name: '입력 타입',
      type: 'select',
      default: 'image',
      options: [
        { value: 'image', label: '이미지' },
        { value: 'text', label: '텍스트' },
        { value: 'number', label: '숫자' },
        { value: 'json', label: 'JSON' },
      ],
    },
    {
      id: 'label',
      name: '라벨',
      type: 'text',
      default: '입력',
      description: 'UI에 표시될 입력 라벨',
    },
  ],

  execute: async (inputs, config) => {
    // 워크플로우 입력 노드는 외부에서 값을 주입받음
    // execute는 런타임에서 주입된 값을 그대로 전달
    const inputValue = inputs._externalValue ?? null;

    return {
      outputs: {
        value: inputValue,
      },
    };
  },
};

export default workflowInputNode;

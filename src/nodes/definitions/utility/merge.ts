/**
 * Merge Node
 * 여러 입력을 하나로 병합하는 유틸리티 노드
 */

import type { NodeDefinition } from '../../types';

export const mergeNode: NodeDefinition = {
  id: 'merge',
  name: '병합',
  category: 'utility',
  icon: 'GitMerge',
  description: '여러 입력을 하나의 배열 또는 객체로 병합합니다.',

  inputs: [
    {
      id: 'input1',
      name: '입력 1',
      type: 'any',
      required: false,
      description: '첫 번째 입력',
    },
    {
      id: 'input2',
      name: '입력 2',
      type: 'any',
      required: false,
      description: '두 번째 입력',
    },
    {
      id: 'input3',
      name: '입력 3',
      type: 'any',
      required: false,
      description: '세 번째 입력 (선택)',
    },
    {
      id: 'input4',
      name: '입력 4',
      type: 'any',
      required: false,
      description: '네 번째 입력 (선택)',
    },
  ],

  outputs: [
    {
      id: 'merged',
      name: '병합 결과',
      type: 'array',
      description: '병합된 배열',
    },
    {
      id: 'count',
      name: '개수',
      type: 'number',
      description: '병합된 항목 수',
    },
  ],

  config: [
    {
      id: 'mode',
      name: '병합 모드',
      type: 'select',
      default: 'array',
      options: [
        { value: 'array', label: '배열로 병합' },
        { value: 'object', label: '객체로 병합' },
        { value: 'first', label: '첫 번째 값만' },
      ],
    },
    {
      id: 'skipNull',
      name: 'null 제외',
      type: 'boolean',
      default: true,
      description: 'null/undefined 값 제외',
    },
  ],

  execute: async (inputs, config) => {
    const mode = config.mode as string;
    const skipNull = config.skipNull as boolean;

    // 입력값들 수집
    const values = [
      inputs.input1,
      inputs.input2,
      inputs.input3,
      inputs.input4,
    ];

    // null/undefined 필터링
    const filtered = skipNull
      ? values.filter(v => v !== null && v !== undefined)
      : values;

    let merged: unknown;

    switch (mode) {
      case 'array':
        merged = filtered;
        break;

      case 'object':
        merged = filtered.reduce<Record<string, unknown>>((acc, val, idx) => {
          if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            return { ...acc, ...(val as Record<string, unknown>) };
          }
          return { ...acc, [`value${idx + 1}`]: val };
        }, {});
        break;

      case 'first':
        merged = filtered[0] ?? null;
        break;

      default:
        merged = filtered;
    }

    return {
      outputs: {
        merged,
        count: Array.isArray(merged) ? merged.length : 1,
      },
    };
  },
};

export default mergeNode;

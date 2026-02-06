/**
 * Image Output Node
 * 이미지 출력 노드 - 이미지 결과를 출력
 */

import type { NodeDefinition } from '../../types';

export const imageOutputNode: NodeDefinition = {
  id: 'image-output',
  name: '이미지 출력',
  category: 'io',
  icon: 'ImageDown',
  description: '이미지 결과를 출력합니다.',

  inputs: [
    {
      id: 'image',
      name: '이미지',
      type: 'image',
      required: true,
      description: '출력할 이미지',
    },
  ],

  outputs: [], // 출력 노드는 외부로 결과를 내보냄

  config: [
    {
      id: 'label',
      name: '라벨',
      type: 'text',
      default: '이미지 결과',
      description: 'UI에 표시될 출력 라벨',
    },
    {
      id: 'format',
      name: '포맷',
      type: 'select',
      default: 'png',
      options: [
        { value: 'png', label: 'PNG' },
        { value: 'jpeg', label: 'JPEG' },
        { value: 'webp', label: 'WebP' },
      ],
    },
  ],

  execute: async (inputs) => {
    // 이미지 출력 노드는 입력 이미지를 그대로 워크플로우 결과로 반환
    // image 키도 추가해서 프리뷰/다운로드 버튼이 표시되도록 함
    return {
      outputs: {
        image: inputs.image,
        _workflowResult: inputs.image,
        _outputType: 'image',
      },
    };
  },
};

export default imageOutputNode;

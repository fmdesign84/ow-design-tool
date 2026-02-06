/**
 * Video Output Node
 * 비디오 출력 노드 - 비디오 결과를 출력
 */

import type { NodeDefinition } from '../../types';

export const videoOutputNode: NodeDefinition = {
  id: 'video-output',
  name: '비디오 출력',
  category: 'io',
  icon: 'VideoOff',
  description: '비디오 결과를 출력합니다.',

  inputs: [
    {
      id: 'video',
      name: '비디오',
      type: 'video',
      required: true,
      description: '출력할 비디오',
    },
  ],

  outputs: [], // 출력 노드는 외부로 결과를 내보냄

  config: [
    {
      id: 'label',
      name: '라벨',
      type: 'text',
      default: '비디오 결과',
      description: 'UI에 표시될 출력 라벨',
    },
    {
      id: 'format',
      name: '포맷',
      type: 'select',
      default: 'mp4',
      options: [
        { value: 'mp4', label: 'MP4' },
        { value: 'webm', label: 'WebM' },
        { value: 'gif', label: 'GIF (애니메이션)' },
      ],
    },
  ],

  execute: async (inputs) => {
    // 비디오 출력 노드는 입력 비디오를 그대로 워크플로우 결과로 반환
    return {
      outputs: {
        _workflowResult: inputs.video,
        _outputType: 'video',
      },
    };
  },
};

export default videoOutputNode;

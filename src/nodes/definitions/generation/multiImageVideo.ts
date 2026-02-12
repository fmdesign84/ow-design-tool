/**
 * Multi-Image to Video Node
 * 시작/끝 이미지로 영상 생성 - /api/generate-video (Veo 3.1)
 */

import type { NodeDefinition } from '../../types';
import { getApiUrl } from '../../../utils/apiRoute';

export const multiImageVideoNode: NodeDefinition = {
  id: 'multi-image-video',
  name: '멀티 이미지 → 영상',
  category: 'generation',
  icon: 'Film',
  description: '시작/끝 이미지 사이를 영상으로 연결합니다.',

  inputs: [
    {
      id: 'startImage',
      name: '시작 이미지',
      type: 'image',
      required: true,
      description: '영상의 시작 프레임',
    },
    {
      id: 'endImage',
      name: '끝 이미지',
      type: 'image',
      required: true,
      description: '영상의 끝 프레임',
    },
    {
      id: 'prompt',
      name: '프롬프트',
      type: 'text',
      required: false,
      description: '중간 움직임 설명 (선택)',
    },
  ],

  outputs: [
    {
      id: 'video',
      name: '생성된 영상',
      type: 'video',
      description: '생성된 영상 URL',
    },
  ],

  config: [
    {
      id: 'aspectRatio',
      name: '비율',
      type: 'select',
      default: '16:9',
      options: [
        { value: '16:9', label: '16:9 (가로)' },
        { value: '9:16', label: '9:16 (세로)' },
      ],
    },
    {
      id: 'duration',
      name: '길이',
      type: 'select',
      default: '4',
      options: [
        { value: '4', label: '4초' },
        { value: '6', label: '6초' },
        { value: '8', label: '8초' },
      ],
    },
    {
      id: 'resolution',
      name: '해상도',
      type: 'select',
      default: '720p',
      options: [
        { value: '720p', label: '720p' },
        { value: '1080p', label: '1080p' },
      ],
    },
    {
      id: 'generateAudio',
      name: '오디오 생성',
      type: 'boolean',
      default: true,
      description: '영상에 오디오 포함',
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.startImage) {
        return {
          outputs: { video: null },
          error: { message: '시작 이미지가 필요합니다', code: 'MISSING_START_IMAGE' },
        };
      }

      if (!inputs.endImage) {
        return {
          outputs: { video: null },
          error: { message: '끝 이미지가 필요합니다', code: 'MISSING_END_IMAGE' },
        };
      }

      const response = await fetch(getApiUrl('/api/generate-video', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: inputs.startImage,
          endImage: inputs.endImage,
          prompt: inputs.prompt || '',
          aspectRatio: config.aspectRatio,
          duration: parseInt(String(config.duration), 10),
          resolution: config.resolution,
          generateAudio: config.generateAudio,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          outputs: { video: null },
          error: {
            message: data.error || data.friendlyMessage?.message || '영상 생성 실패',
            code: 'API_ERROR',
          },
        };
      }

      return {
        outputs: { video: data.videoUrl },
      };
    } catch (error) {
      return {
        outputs: { video: null },
        error: {
          message: error instanceof Error ? error.message : '알 수 없는 오류',
          code: 'NETWORK_ERROR',
        },
      };
    }
  },
};

export default multiImageVideoNode;

/**
 * Image to Video Node
 * 이미지를 영상으로 변환 - /api/generate-video (Veo 3.1)
 */

import type { NodeDefinition } from '../../types';

export const imageToVideoNode: NodeDefinition = {
  id: 'image-to-video',
  name: '이미지 → 영상',
  category: 'generation',
  icon: 'Clapperboard',
  description: '이미지를 움직이는 영상으로 변환합니다.',

  inputs: [
    {
      id: 'image',
      name: '시작 이미지',
      type: 'image',
      required: true,
      description: '영상의 시작 프레임',
    },
    {
      id: 'prompt',
      name: '프롬프트',
      type: 'text',
      required: false,
      description: '움직임/분위기 설명 (선택)',
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
      if (!inputs.image) {
        return {
          outputs: { video: null },
          error: { message: '시작 이미지가 필요합니다', code: 'MISSING_IMAGE' },
        };
      }

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: inputs.image,
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

export default imageToVideoNode;

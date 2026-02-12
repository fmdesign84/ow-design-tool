/**
 * Text to Video Node
 * 텍스트 프롬프트로 영상 생성 - /api/generate-video (Veo 3.1)
 */

import type { NodeDefinition } from '../../types';
import { getApiUrl } from '../../../utils/apiRoute';

export const textToVideoNode: NodeDefinition = {
  id: 'text-to-video',
  name: '텍스트 → 영상',
  category: 'generation',
  icon: 'Video',
  description: '텍스트 프롬프트로 영상을 생성합니다.',

  inputs: [
    {
      id: 'prompt',
      name: '프롬프트',
      type: 'text',
      required: true,
      description: '생성할 영상 설명',
    },
    {
      id: 'negativePrompt',
      name: '네거티브 프롬프트',
      type: 'text',
      required: false,
      description: '제외할 요소',
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
      if (!inputs.prompt) {
        return {
          outputs: { video: null },
          error: { message: '프롬프트가 필요합니다', code: 'MISSING_PROMPT' },
        };
      }

      const response = await fetch(getApiUrl('/api/generate-video', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputs.prompt,
          negativePrompt: inputs.negativePrompt || '',
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

export default textToVideoNode;

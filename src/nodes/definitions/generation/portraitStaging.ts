/**
 * Portrait Staging Node (연출 생성)
 * 인물 사진을 다양한 환경/스타일로 연출 - /api/generate-staging
 */

import type { NodeDefinition } from '../../types';
import { getApiUrl } from '../../../utils/apiRoute';

export const portraitStagingNode: NodeDefinition = {
  id: 'portrait-staging',
  name: '연출 생성',
  category: 'generation',
  icon: 'Camera',
  description: '인물 사진을 다양한 환경과 스타일로 연출합니다.',

  inputs: [
    {
      id: 'portraitImage',
      name: '인물 이미지',
      type: 'image',
      required: true,
      description: '연출할 인물 사진',
    },
    {
      id: 'keyVisualImage',
      name: '키비주얼',
      type: 'image',
      required: false,
      description: '배경에 표시할 로고/키비주얼 (선택)',
    },
  ],

  outputs: [
    {
      id: 'image',
      name: '연출 이미지',
      type: 'image',
      description: '연출된 결과 이미지',
    },
  ],

  config: [
    {
      id: 'presetKey',
      name: '프리셋',
      type: 'select',
      default: 'linkedin-pro',
      options: [
        // Corporate
        { value: 'executive-portrait', label: '임원 프로필' },
        { value: 'linkedin-pro', label: '링크드인 프로필' },
        { value: 'modern-office', label: '모던 오피스' },
        // Editorial
        { value: 'quiet-luxury', label: '콰이어트 럭셔리' },
        { value: 'fashion-editorial', label: '패션 에디토리얼' },
        { value: 'golden-hour', label: '골든아워' },
        // Lifestyle
        { value: 'cafe-moment', label: '카페 모먼트' },
        { value: 'travel-wanderlust', label: '여행 원더러스트' },
        { value: 'urban-casual', label: '어반 캐주얼' },
        // Event
        { value: 'awards-ceremony', label: '시상식' },
        { value: 'gala-night', label: '갈라 나이트' },
        { value: 'launch-event', label: '런칭 이벤트' },
        // Studio
        { value: 'classic-portrait', label: '클래식 포트레이트' },
        { value: 'high-key-white', label: '하이키 화이트' },
        { value: 'low-key-dramatic', label: '로우키 드라마틱' },
        // Creative
        { value: 'neon-cyberpunk', label: '네온 사이버펑크' },
        { value: 'vintage-film', label: '빈티지 필름' },
        { value: 'pop-art', label: '팝아트' },
      ],
    },
    {
      id: 'aspectRatio',
      name: '비율',
      type: 'select',
      default: '',
      options: [
        { value: '', label: '프리셋 기본값' },
        { value: '1:1', label: '1:1 (정사각형)' },
        { value: '3:4', label: '3:4 (세로)' },
        { value: '4:3', label: '4:3 (가로)' },
        { value: '9:16', label: '9:16 (스토리)' },
        { value: '16:9', label: '16:9 (와이드)' },
      ],
    },
  ],

  execute: async (inputs, config) => {
    try {
      if (!inputs.portraitImage) {
        return {
          outputs: { image: null },
          error: { message: '인물 이미지가 필요합니다', code: 'MISSING_PORTRAIT' },
        };
      }

      const response = await fetch(getApiUrl('/api/generate-staging', { method: 'POST' }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portraitImage: inputs.portraitImage,
          keyVisualImage: inputs.keyVisualImage || null,
          presetKey: config.presetKey,
          aspectRatioOverride: config.aspectRatio || null,
          outputCount: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          outputs: { image: null },
          error: {
            message: data.error || data.friendlyMessage?.message || '연출 생성 실패',
            code: 'API_ERROR',
          },
        };
      }

      // 첫 번째 이미지 반환
      const resultImage = data.images?.[0] || null;

      return {
        outputs: { image: resultImage },
      };
    } catch (error) {
      return {
        outputs: { image: null },
        error: {
          message: error instanceof Error ? error.message : '알 수 없는 오류',
          code: 'NETWORK_ERROR',
        },
      };
    }
  },
};

export default portraitStagingNode;

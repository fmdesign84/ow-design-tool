/**
 * Image Upload Node
 * 이미지 파일 업로드 노드
 */

import type { NodeDefinition } from '../../types';

export const imageUploadNode: NodeDefinition = {
  id: 'image-upload',
  name: '이미지 업로드',
  category: 'io',
  icon: 'Upload',
  description: '이미지 파일을 업로드합니다.',

  inputs: [],

  outputs: [
    {
      id: 'image',
      name: '이미지',
      type: 'image',
      description: '업로드된 이미지 URL',
    },
    {
      id: 'metadata',
      name: '메타데이터',
      type: 'json',
      description: '이미지 정보 (크기, 타입 등)',
    },
  ],

  config: [
    {
      id: 'imageUrl',
      name: '이미지',
      type: 'image-upload', // 커스텀 타입: 이미지 업로드 UI
      description: '이미지를 드래그하거나 클릭하여 업로드',
    },
  ],

  execute: async (inputs, config) => {
    const imageUrl = config.imageUrl as string;

    if (!imageUrl) {
      return {
        outputs: {
          image: null,
          metadata: null,
        },
        error: {
          message: '이미지가 업로드되지 않았습니다',
          code: 'NO_IMAGE',
        },
      };
    }

    // 메타데이터 추출 (실제로는 이미지 로드 후 추출)
    const metadata = {
      url: imageUrl,
      uploadedAt: new Date().toISOString(),
    };

    return {
      outputs: {
        image: imageUrl,
        metadata,
      },
    };
  },
};

export default imageUploadNode;

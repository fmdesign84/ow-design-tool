/**
 * Character Generation Node (캐릭터 생성)
 * 이미지를 기반으로 "포레스트런" 스타일 캐릭터 생성 - /api/character-gen
 */

import type { NodeDefinition } from '../../types';

export const characterGenNode: NodeDefinition = {
    id: 'character-gen',
    name: '캐릭터 생성',
    category: 'generation',
    icon: 'UserCircle2',
    description: '사진을 기반으로 포레스트런(현대자동차) 스타일의 3D 캐릭터를 생성합니다.',

    inputs: [
        {
            id: 'referenceImages',
            name: '참조 이미지',
            type: 'images',
            required: true,
            description: '참조할 사람 사진',
        },
    ],

    outputs: [
        {
            id: 'image',
            name: '캐릭터 이미지',
            type: 'image',
            description: '생성된 캐릭터 이미지 (base64)',
        },
    ],

    config: [
        {
            id: 'style',
            name: '스타일',
            type: 'select',
            default: 'namoo',
            options: [
                { value: 'namoo', label: '포레스트런 (현대자동차)' },
            ],
        },
        {
            id: 'expression',
            name: '표정',
            type: 'select',
            default: 'original',
            options: [
                { value: 'original', label: '원본 표정' },
                { value: 'smile', label: '미소' },
                { value: 'big_smile', label: '함박웃음' },
                { value: 'neutral', label: '무표정' },
                { value: 'tired', label: '힘든 (땀)' },
                { value: 'angry', label: '화난' },
            ],
        },
        {
            id: 'faceStrength',
            name: '얼굴 반영도',
            type: 'slider',
            default: 50,
            min: 20,
            max: 80,
            step: 10,
            description: '낮을수록 캐릭터 스타일, 높을수록 원본 얼굴',
        },
    ],

    execute: async (inputs, config) => {
        try {
            const inputImages = inputs.referenceImages;

            if (!inputImages) {
                return {
                    outputs: { image: null },
                    error: { message: '참조 이미지가 필요합니다', code: 'MISSING_IMAGES' },
                };
            }

            const referenceImages = Array.isArray(inputImages)
                ? (inputImages as string[])
                : [inputImages as string];

            if (referenceImages.length === 0) {
                return {
                    outputs: { image: null },
                    error: { message: '참조 이미지가 필요합니다', code: 'MISSING_IMAGES' },
                };
            }

            const response = await fetch('/api/character-gen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    referenceImages,
                    style: config.style,
                    expression: config.expression,
                    faceStrength: config.faceStrength || 50,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    outputs: { image: null },
                    error: {
                        message: data.error || '캐릭터 생성 실패',
                        code: 'API_ERROR',
                    },
                };
            }

            return {
                outputs: { image: data.image },
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

export default characterGenNode;

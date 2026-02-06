/**
 * Character Animation Node (캐릭터 애니메이션)
 * 캐릭터 이미지를 받아서 동작 애니메이션 생성
 */

import type { NodeDefinition } from '../../types';

export const characterAnimationNode: NodeDefinition = {
    id: 'character-animation',
    name: '캐릭터 애니메이션',
    category: 'generation',
    icon: 'Play',
    description: '캐릭터 이미지로 동작 애니메이션을 생성합니다.',

    inputs: [
        {
            id: 'characterImage',
            name: '캐릭터 이미지',
            type: 'image',
            required: true,
            description: '애니메이션할 캐릭터 이미지',
        },
    ],

    outputs: [
        {
            id: 'video',
            name: '애니메이션 영상',
            type: 'video',
            description: '생성된 애니메이션 영상',
        },
    ],

    config: [
        {
            id: 'action',
            name: '동작',
            type: 'select',
            default: 'running',
            options: [
                { value: 'running', label: '달리기' },
                { value: 'victory', label: '승리 브이포즈' },
                { value: 'finish', label: '골인 (양팔 들기)' },
                { value: 'waving', label: '손 흔들기' },
                { value: 'jumping', label: '점프' },
                { value: 'dancing', label: '춤추기' },
                { value: 'walking', label: '걷기' },
                { value: 'cheering', label: '환호하기' },
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
            id: 'loop',
            name: '반복 동작',
            type: 'boolean',
            default: true,
            description: '동작을 반복하도록 생성',
        },
    ],

    execute: async (inputs, config) => {
        try {
            const characterImage = inputs.characterImage as string;

            if (!characterImage) {
                return {
                    outputs: { video: null },
                    error: { message: '캐릭터 이미지가 필요합니다', code: 'MISSING_IMAGE' },
                };
            }

            const response = await fetch('/api/character-animation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterImage,
                    action: config.action || 'running',
                    duration: config.duration || '4',
                    loop: config.loop !== false,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    outputs: { video: null },
                    error: {
                        message: data.error || '애니메이션 생성 실패',
                        code: 'API_ERROR',
                    },
                };
            }

            return {
                outputs: { video: data.video },
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

export default characterAnimationNode;

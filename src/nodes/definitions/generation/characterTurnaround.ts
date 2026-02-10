/**
 * Character Turnaround Sheet Node (캐릭터 턴어라운드 시트)
 * 캐릭터 이미지를 기반으로 다양한 앵글의 그리드 시트 생성
 */

import type { NodeDefinition } from '../../types';

export const characterTurnaroundNode: NodeDefinition = {
    id: 'character-turnaround',
    name: '캐릭터 턴어라운드',
    category: 'generation',
    icon: 'RotateCcw',
    description: '캐릭터의 앞/옆/뒤 등 다양한 앵글을 한 장의 시트로 생성합니다.',

    inputs: [
        {
            id: 'characterImage',
            name: '캐릭터 이미지',
            type: 'image',
            required: true,
            description: '기준이 될 캐릭터 이미지',
        },
    ],

    outputs: [
        {
            id: 'image',
            name: '턴어라운드 시트',
            type: 'image',
            description: '다방향 앵글 그리드 이미지',
        },
    ],

    config: [
        {
            id: 'viewSet',
            name: '앵글 세트',
            type: 'select',
            default: 'standard-5',
            options: [
                { value: 'standard-5', label: '기본 5방향' },
                { value: 'full-8', label: '전체 8방향' },
                { value: 'simple-3', label: '간단 3방향 (앞/옆/뒤)' },
            ],
        },
        {
            id: 'bodyRange',
            name: '범위',
            type: 'select',
            default: 'full',
            options: [
                { value: 'full', label: '전신' },
                { value: 'upper', label: '상반신' },
            ],
        },
    ],

    execute: async (inputs, config) => {
        try {
            const characterImage = inputs.characterImage as string;

            if (!characterImage) {
                return {
                    outputs: { image: null },
                    error: { message: '캐릭터 이미지가 필요합니다', code: 'MISSING_IMAGE' },
                };
            }

            const response = await fetch('/api/character-turnaround', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterImage,
                    viewSet: config.viewSet || 'standard-5',
                    bodyRange: config.bodyRange || 'full',
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    outputs: { image: null },
                    error: {
                        message: data.error || '턴어라운드 시트 생성 실패',
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

export default characterTurnaroundNode;

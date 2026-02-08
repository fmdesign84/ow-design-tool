/**
 * Character Scene Node (캐릭터 씬)
 * 캐릭터 이미지를 실사 배경 씬에 합성
 */

import type { NodeDefinition } from '../../types';

export const characterSceneNode: NodeDefinition = {
    id: 'character-scene',
    name: '캐릭터 씬',
    category: 'generation',
    icon: 'Clapperboard',
    description: '캐릭터를 실사 배경 씬에 합성합니다.',

    inputs: [
        {
            id: 'characterImage',
            name: '캐릭터 이미지',
            type: 'image',
            required: true,
            description: '캐릭터 생성 노드의 결과 이미지',
        },
    ],

    outputs: [
        {
            id: 'image',
            name: '결과 이미지',
            type: 'image',
            description: '씬에 합성된 이미지',
        },
    ],

    config: [
        {
            id: 'scene',
            name: '씬',
            type: 'select',
            default: 'marathon-start',
            options: [
                { value: 'marathon-start', label: '마라톤 출발선' },
                { value: 'running-bridge', label: '다리 위 달리기' },
                { value: 'running-forest', label: '숲속 달리기' },
                { value: 'billboard-cheer', label: '전광판 응원' },
                { value: 'aerial-runners', label: '항공뷰 (위에서)' },
                { value: 'runners-to-forest', label: '러너→숲 트랜지션' },
                { value: 'finish-line', label: '완주 결승선' },
                { value: 'forest-made', label: '숲을 만들었다' },
                { value: 'custom', label: '직접 입력' },
            ],
            description: '실사 배경 + 추천 포즈/의상 자동 적용',
        },
        {
            id: 'billboardName',
            name: '전광판 이름',
            type: 'text',
            default: '지원',
            description: '전광판에 표시될 이름 (예: 지원 → "지원! YOU MADE FOREST!")',
        },
        {
            id: 'customScene',
            name: '씬 설명 (직접입력)',
            type: 'text',
            default: '',
            description: '예: 서강대교 위에서 달리는 장면, 벚꽃 공원',
        },
        {
            id: 'aspectRatio',
            name: '비율',
            type: 'select',
            default: '9:16',
            options: [
                { value: '9:16', label: '세로 (9:16)' },
                { value: '16:9', label: '가로 (16:9)' },
                { value: '1:1', label: '정사각 (1:1)' },
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

            const response = await fetch('/api/character-scene', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterImage,
                    scene: config.scene || 'marathon-start',
                    customScene: config.customScene || '',
                    aspectRatio: config.aspectRatio || '9:16',
                    billboardName: config.billboardName || '지원',
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    outputs: { image: null },
                    error: {
                        message: data.error || '씬 생성 실패',
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

export default characterSceneNode;

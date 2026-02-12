/**
 * Scene Continuation Node (씬 이어가기)
 * 이전 씬 이미지를 기반으로 N초 후 장면 생성
 */

import type { NodeDefinition } from '../../types';
import { getApiUrl } from '../../../utils/apiRoute';

export const sceneContinuationNode: NodeDefinition = {
    id: 'scene-continuation',
    name: '씬 이어가기',
    category: 'generation',
    icon: 'FastForward',
    description: '이전 씬의 N초 후 장면을 생성합니다. 멀티 이미지 영상 노드와 조합하면 전환 영상을 만들 수 있습니다.',

    inputs: [
        {
            id: 'sceneImage',
            name: '이전 씬 이미지',
            type: 'image',
            required: true,
            description: '이어갈 기준이 되는 씬 이미지',
        },
        {
            id: 'characterImage',
            name: '캐릭터 참조',
            type: 'image',
            required: false,
            description: '캐릭터 아이덴티티 보존용 참조 이미지 (선택)',
        },
    ],

    outputs: [
        {
            id: 'image',
            name: '결과 이미지',
            type: 'image',
            description: '이어지는 씬 이미지',
        },
    ],

    config: [
        {
            id: 'timeOffset',
            name: '시간 경과',
            type: 'select',
            default: '5s',
            options: [
                { value: '3s', label: '3초 후' },
                { value: '5s', label: '5초 후' },
                { value: '10s', label: '10초 후' },
                { value: '30s', label: '30초 후' },
            ],
        },
        {
            id: 'change',
            name: '변화 유형',
            type: 'select',
            default: 'action',
            options: [
                { value: 'action', label: '동작 변화' },
                { value: 'mood', label: '분위기 변화' },
                { value: 'position', label: '위치 이동' },
                { value: 'custom', label: '직접 입력' },
            ],
        },
        {
            id: 'customChange',
            name: '변화 설명 (직접입력)',
            type: 'text',
            default: '',
            description: '예: 관중에게 손을 흔들며 걸어가는 모습',
            showWhen: { field: 'change', value: 'custom' },
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
            const sceneImage = inputs.sceneImage as string;

            if (!sceneImage) {
                return {
                    outputs: { image: null },
                    error: { message: '이전 씬 이미지가 필요합니다', code: 'MISSING_IMAGE' },
                };
            }

            const characterImage = inputs.characterImage as string | undefined;

            const response = await fetch(getApiUrl('/api/scene-continuation', { method: 'POST' }), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sceneImage,
                    characterImage: characterImage || '',
                    timeOffset: config.timeOffset || '5s',
                    change: config.change || 'action',
                    customChange: config.customChange || '',
                    aspectRatio: config.aspectRatio || '9:16',
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    outputs: { image: null },
                    error: {
                        message: data.error || '씬 이어가기 실패',
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

export default sceneContinuationNode;

/**
 * Character Pose Node (캐릭터 포즈/전신)
 * 캐릭터 이미지를 기반으로 다양한 방향/범위의 이미지 생성
 */

import type { NodeDefinition } from '../../types';
import { getApiUrl } from '../../../utils/apiRoute';

export const characterPoseNode: NodeDefinition = {
    id: 'character-pose',
    name: '캐릭터 포즈',
    category: 'generation',
    icon: 'Users',
    description: '캐릭터의 전신/방향별 이미지를 생성합니다.',

    inputs: [
        {
            id: 'characterImage',
            name: '캐릭터 이미지',
            type: 'image',
            required: true,
            description: '기준이 될 캐릭터 이미지',
        },
        {
            id: 'backgroundImage',
            name: '배경 이미지',
            type: 'image',
            required: false,
            description: '배경으로 사용할 이미지 (선택)',
        },
    ],

    outputs: [
        {
            id: 'image',
            name: '결과 이미지',
            type: 'image',
            description: '생성된 포즈 이미지',
        },
    ],

    config: [
        {
            id: 'concept',
            name: '컨셉',
            type: 'select',
            default: 'general',
            options: [
                { value: 'general', label: '범용' },
                { value: 'forest-run', label: '포레스트런' },
            ],
        },
        {
            id: 'direction',
            name: '방향',
            type: 'select',
            default: 'front',
            options: [
                { value: 'front', label: '앞' },
                { value: 'side', label: '옆 (3/4)' },
                { value: 'profile', label: '완전 옆 (프로필)' },
                { value: 'back', label: '뒤' },
            ],
        },
        {
            id: 'bodyRange',
            name: '범위',
            type: 'select',
            default: 'full',
            options: [
                { value: 'full', label: '전신 (9:16)' },
                { value: 'upper', label: '상반신 (3:4)' },
                { value: 'bust', label: '가슴 위 (1:1)' },
            ],
        },
        {
            id: 'pose',
            name: '포즈',
            type: 'select',
            default: 'standing',
            options: [
                { value: 'standing', label: '서있기' },
                { value: 'sitting', label: '앉아있기' },
                { value: 'waving', label: '손 흔들기' },
                { value: 'thinking', label: '생각하기' },
            ],
        },
        {
            id: 'outfit',
            name: '옷차림',
            type: 'select',
            default: 'default',
            options: [
                { value: 'default', label: '기본 복장' },
                { value: 'marathon', label: '마라톤 (번호판+운동복)', showWhen: { field: 'concept', value: 'forest-run' } },
                { value: 'suit', label: '정장' },
                { value: 'casual', label: '캐주얼' },
                { value: 'office', label: '사무복' },
                { value: 'custom', label: '직접 입력' },
            ],
        },
        {
            id: 'bibNumber',
            name: '마라톤 번호',
            type: 'text',
            default: '2026',
            description: '번호판에 표시될 번호',
            showWhen: { field: 'outfit', value: 'marathon' },
        },
        {
            id: 'customTop',
            name: '상의 (직접입력)',
            type: 'text',
            default: '',
            description: '예: 빨간 후드티',
            showWhen: { field: 'outfit', value: 'custom' },
        },
        {
            id: 'customBottom',
            name: '하의 (직접입력)',
            type: 'text',
            default: '',
            description: '예: 검은 청바지',
            showWhen: { field: 'outfit', value: 'custom' },
        },
        {
            id: 'customShoes',
            name: '신발 (직접입력)',
            type: 'text',
            default: '',
            description: '예: 흰 운동화',
            showWhen: { field: 'outfit', value: 'custom' },
        },
        {
            id: 'customAccessory',
            name: '기타 (직접입력)',
            type: 'text',
            default: '',
            description: '예: 번호판, 모자',
            showWhen: { field: 'outfit', value: 'custom' },
        },
        {
            id: 'background',
            name: '배경',
            type: 'select',
            default: 'white',
            options: [
                { value: 'white', label: '흰색 배경' },
                { value: 'image', label: '이미지 배경 (입력 연결)' },
                { value: 'custom', label: '직접 입력' },
            ],
        },
        {
            id: 'customBackground',
            name: '배경 설명 (직접입력)',
            type: 'text',
            default: '',
            description: '예: 마라톤 경기장, 도심 거리',
            showWhen: { field: 'background', value: 'custom' },
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

            const backgroundImage = inputs.backgroundImage as string | undefined;

            const response = await fetch(getApiUrl('/api/character-pose', { method: 'POST' }), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterImage,
                    direction: config.direction || 'front',
                    bodyRange: config.bodyRange || 'full',
                    pose: config.pose || 'standing',
                    outfit: config.outfit || 'default',
                    bibNumber: config.bibNumber || '2026',
                    customTop: config.customTop || '',
                    customBottom: config.customBottom || '',
                    customShoes: config.customShoes || '',
                    customAccessory: config.customAccessory || '',
                    background: config.background || 'white',
                    backgroundImage: backgroundImage || '',
                    customBackground: config.customBackground || '',
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    outputs: { image: null },
                    error: {
                        message: data.error || '포즈 생성 실패',
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

export default characterPoseNode;

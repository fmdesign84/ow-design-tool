/**
 * Character Expression Sheet Node (캐릭터 표정 시트)
 * 캐릭터 이미지를 기반으로 다양한 표정의 그리드 시트 생성
 */

import type { NodeDefinition } from '../../types';

export const characterExpressionSheetNode: NodeDefinition = {
    id: 'character-expression-sheet',
    name: '캐릭터 표정 시트',
    category: 'generation',
    icon: 'Smile',
    description: '캐릭터의 다양한 표정을 3x3 그리드 시트로 생성합니다.',

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
            name: '표정 시트',
            type: 'image',
            description: '3x3 표정 그리드 이미지',
        },
    ],

    config: [
        {
            id: 'expressionSet',
            name: '표정 세트',
            type: 'select',
            default: 'basic-9',
            options: [
                { value: 'basic-9', label: '기본 9종' },
                { value: 'emotion-6', label: '감정 6종 (2x3)' },
                { value: 'custom', label: '직접 입력' },
            ],
        },
        {
            id: 'customExpressions',
            name: '표정 목록 (직접입력)',
            type: 'text',
            default: '',
            description: '쉼표로 구분. 예: 웃음, 놀람, 화남, 슬픔',
            showWhen: { field: 'expressionSet', value: 'custom' },
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

            const response = await fetch('/api/character-expression-sheet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterImage,
                    expressionSet: config.expressionSet || 'basic-9',
                    customExpressions: config.customExpressions || '',
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    outputs: { image: null },
                    error: {
                        message: data.error || '표정 시트 생성 실패',
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

export default characterExpressionSheetNode;

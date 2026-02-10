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
            id: 'action',
            name: '동작',
            type: 'select',
            default: 'running',
            options: [
                { value: 'running', label: '달리기' },
                { value: 'victory', label: '승리 브이포즈' },
                { value: 'finish', label: '골인 (양팔 들기)', showWhen: { field: 'concept', value: 'forest-run' } },
                { value: 'waving', label: '손 흔들기' },
                { value: 'jumping', label: '점프' },
                { value: 'dancing', label: '춤추기' },
                { value: 'walking', label: '걷기' },
                { value: 'cheering', label: '환호하기' },
                { value: 'stretching', label: '몸풀기', showWhen: { field: 'concept', value: 'forest-run' } },
                { value: 'aerial-running', label: '항공뷰 달리기', showWhen: { field: 'concept', value: 'forest-run' } },
                { value: 'billboard', label: '전광판 (깜빡임)', showWhen: { field: 'concept', value: 'forest-run' } },
            ],
        },
        {
            id: 'duration',
            name: '길이',
            type: 'select',
            default: '5',
            options: [
                { value: '5', label: '5초' },
                { value: '10', label: '10초' },
            ],
        },
        {
            id: 'loop',
            name: '루프',
            type: 'select',
            default: 'none',
            options: [
                { value: 'none', label: '없음' },
                { value: 'loop', label: '반복 (루프)' },
                { value: 'pingpong', label: '왕복 (핑퐁)' },
            ],
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

            // 이미지 압축 (Vercel 4.5MB body 제한 대응 - 768px, JPEG 0.7)
            const compressImage = (dataUrl: string, maxSize = 768): Promise<string> => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let { width, height } = img;
                        if (width > maxSize || height > maxSize) {
                            const ratio = Math.min(maxSize / width, maxSize / height);
                            width = Math.round(width * ratio);
                            height = Math.round(height * ratio);
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    };
                    img.onerror = () => resolve(dataUrl);
                    img.src = dataUrl;
                });
            };

            // HTTP URL이면 압축 불필요, base64면 압축
            const isUrl = characterImage.startsWith('http');
            const imageToSend = isUrl ? characterImage : await compressImage(characterImage);

            const response = await fetch('/api/character-animation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterImage: imageToSend,
                    action: config.action || 'running',
                    duration: config.duration || '5',
                    loop: config.loop || 'none',
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

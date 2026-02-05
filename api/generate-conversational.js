const { GoogleAuth } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

/**
 * 대화형 AI 이미지 생성 API v2
 *
 * Gemini Flash Function Calling으로 사용자 의도 파악 → 기존 파이프라인 호출
 *
 * 핵심 변경: base64 이미지 대신 URL만 받아 413 에러 방지
 *
 * 입력: { expertId, message, imageUrl?, history? }
 * 출력: { response, imageUrl?, action, suggestions }
 */

// Vercel 설정
module.exports.config = {
    maxDuration: 60,
};

// 전문가별 System Prompt
const EXPERT_PROMPTS = {
    thumbnail: `당신은 유튜브/블로그 썸네일 전문가 "썸네일 마스터"입니다.
사용자가 썸네일을 요청하면 적절한 도구를 선택해 실행하세요.
- 클릭률 높은 구도 제안
- 16:9 비율 권장
- 텍스트 공간 고려
한국어로 친근하게 대화하세요.`,

    presentation: `당신은 PPT 슬라이드 디자이너 "PPT 디자이너"입니다.
사용자가 슬라이드 이미지를 요청하면 적절한 도구를 선택해 실행하세요.
- 깔끔하고 프로페셔널한 스타일
- 16:9 비율
- 텍스트 공간 확보
한국어로 친근하게 대화하세요.`,

    social: `당신은 SNS 콘텐츠 전문가 "SNS 마케터"입니다.
인스타그램, 페이스북 등 소셜미디어용 이미지를 만들어주세요.
- 피드용: 1:1 또는 4:5
- 스토리용: 9:16
- 트렌디한 스타일
한국어로 친근하게 대화하세요.`,

    product: `당신은 제품 사진 전문가 "제품 사진가"입니다.
제품 목업과 광고용 이미지를 만들어주세요.
- 깔끔한 배경
- 제품 강조
- 상업적 품질
한국어로 친근하게 대화하세요.`,

    banner: `당신은 배너 디자이너 "배너 크리에이터"입니다.
웹/앱 배너를 만들어주세요.
- 다양한 사이즈 지원
- 명확한 CTA
- 브랜드 일관성
한국어로 친근하게 대화하세요.`,

    idphoto: `당신은 증명사진 전문가 "증명사진 스튜디오"입니다.
증명사진과 프로필 이미지를 만들어주세요.
- 3:4 비율 (증명사진)
- 배경 정리
- 자연스러운 보정
한국어로 친근하게 대화하세요.`,

    video: `당신은 영상 프로듀서 "영상 프로듀서"입니다.
짧은 홍보 영상을 만들어주세요.
- 16:9 또는 9:16
- 5-10초 추천
- 임팩트 있는 연출
한국어로 친근하게 대화하세요.`,

    brand: `당신은 브랜드 디자이너 "브랜드 가디언"입니다.
브랜드 가이드라인을 준수하는 콘텐츠를 만들어주세요.
- 브랜드 컬러 적용
- 일관된 스타일
- 전문적인 품질
한국어로 친근하게 대화하세요.`,

    free: `당신은 AI 이미지 생성 어시스턴트입니다.
사용자 요청에 맞게 적절한 도구를 선택해 이미지를 생성하세요.
한국어로 친근하게 대화하세요.`
};

// Function Calling Tool 정의
const TOOLS = [
    {
        name: 'generate_image',
        description: '텍스트 설명으로 새 이미지 생성. 이미지가 없거나 새로 만들어야 할 때 사용.',
        parameters: {
            type: 'object',
            properties: {
                prompt: {
                    type: 'string',
                    description: '생성할 이미지에 대한 상세 설명 (영어 권장)'
                },
                aspectRatio: {
                    type: 'string',
                    enum: ['1:1', '16:9', '9:16', '4:3', '3:4'],
                    description: '이미지 비율'
                },
                style: {
                    type: 'string',
                    enum: ['photo', 'illustration', '3d', 'auto'],
                    description: '이미지 스타일'
                }
            },
            required: ['prompt']
        }
    },
    {
        name: 'edit_image',
        description: '기존 이미지 수정 (배경 변경, 부분 수정 등). 사용자가 이미지를 업로드했을 때 사용.',
        parameters: {
            type: 'object',
            properties: {
                editPrompt: {
                    type: 'string',
                    description: '수정할 내용 설명'
                },
                editType: {
                    type: 'string',
                    enum: ['background', 'style', 'partial', 'enhance'],
                    description: '수정 유형'
                }
            },
            required: ['editPrompt']
        }
    },
    {
        name: 'upscale_image',
        description: '이미지 해상도 높이기. 사용자가 업스케일/고해상도를 요청할 때 사용.',
        parameters: {
            type: 'object',
            properties: {
                scale: {
                    type: 'string',
                    enum: ['2', '4'],
                    description: '확대 배율 (2배 또는 4배)'
                }
            }
        }
    },
    {
        name: 'remove_background',
        description: '이미지 배경 제거. 누끼/배경 제거 요청 시 사용.',
        parameters: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'ask_question',
        description: '추가 정보가 필요할 때 질문. 요청이 불명확할 때 사용.',
        parameters: {
            type: 'object',
            properties: {
                question: {
                    type: 'string',
                    description: '사용자에게 할 질문'
                },
                options: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '선택지 (있을 경우)'
                }
            },
            required: ['question']
        }
    }
];

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { expertId = 'free', message, imageUrl, history = [] } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'message is required' });
    }

    const startTime = Date.now();

    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        // ========== Step 1: Gemini Flash로 의도 파악 ==========
        const systemPrompt = EXPERT_PROMPTS[expertId] || EXPERT_PROMPTS.free;

        // 대화 히스토리 구성
        const conversationHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // 현재 메시지 추가
        const currentParts = [{ text: message }];

        // 이미지가 있으면 컨텍스트에 추가
        if (imageUrl) {
            currentParts.unshift({
                text: `[사용자가 이미지를 업로드했습니다: ${imageUrl}]`
            });
        }

        conversationHistory.push({
            role: 'user',
            parts: currentParts
        });

        // Gemini Flash Function Calling 호출
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`;

        const geminiRequest = {
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: conversationHistory,
            tools: [{
                functionDeclarations: TOOLS
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024
            }
        };

        console.log('[Conversational] Calling Gemini Flash...');
        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiRequest)
        });

        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            console.error('[Gemini] Error:', errText);
            throw new Error(`Gemini API failed: ${geminiResponse.status} - ${errText.substring(0, 500)}`);
        }

        const geminiData = await geminiResponse.json();
        const candidate = geminiData.candidates?.[0];
        const content = candidate?.content;

        console.log('[Gemini] Response:', JSON.stringify(content, null, 2));

        // ========== Step 2: Function Call 처리 ==========
        let responseText = '';
        let resultImageUrl = null;
        let actionType = null;
        let suggestions = [];

        // Function call 확인
        const functionCall = content?.parts?.find(p => p.functionCall);

        if (functionCall) {
            const { name, args } = functionCall.functionCall;
            console.log(`[Action] Function: ${name}, Args:`, args);

            actionType = name;

            switch (name) {
                case 'generate_image': {
                    // 이미지 생성 파이프라인 호출
                    const generateUrl = `${getBaseUrl(req)}/api/generate-image`;

                    const genResponse = await fetch(generateUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            prompt: args.prompt || message,
                            aspectRatio: args.aspectRatio || '16:9',
                            model: 'gemini3pro',
                            stylePreset: args.style || 'auto',
                            quality: 'standard'
                        })
                    });

                    if (genResponse.ok) {
                        const genData = await genResponse.json();
                        resultImageUrl = genData.savedImage?.image_url || genData.image;
                        responseText = '이미지를 생성했어요! 어떠세요?';
                        suggestions = ['스타일 변경', '다시 생성', '비율 변경'];
                    } else {
                        const errData = await genResponse.json();
                        responseText = errData.friendlyMessage?.message || '이미지 생성 중 문제가 발생했어요. 다시 시도해주세요.';
                    }
                    break;
                }

                case 'edit_image': {
                    if (!imageUrl) {
                        responseText = '수정할 이미지가 없어요. 먼저 이미지를 업로드해주세요!';
                        suggestions = ['이미지 업로드', '새로 생성하기'];
                    } else {
                        // TODO: inpainting API 연결
                        responseText = `"${args.editPrompt}" 스타일로 수정하려면 인페인팅 기능이 필요해요. 곧 지원 예정이에요!`;
                        suggestions = ['새로 생성하기', '다른 요청하기'];
                    }
                    break;
                }

                case 'upscale_image': {
                    if (!imageUrl) {
                        responseText = '업스케일할 이미지가 없어요. 먼저 이미지를 업로드해주세요!';
                        suggestions = ['이미지 업로드'];
                    } else {
                        // TODO: upscale API 연결
                        responseText = '업스케일 기능은 곧 연결될 예정이에요!';
                        suggestions = ['다른 요청하기'];
                    }
                    break;
                }

                case 'remove_background': {
                    if (!imageUrl) {
                        responseText = '배경을 제거할 이미지가 없어요. 먼저 이미지를 업로드해주세요!';
                        suggestions = ['이미지 업로드'];
                    } else {
                        // TODO: remove-bg API 연결
                        responseText = '배경 제거 기능은 곧 연결될 예정이에요!';
                        suggestions = ['다른 요청하기'];
                    }
                    break;
                }

                case 'ask_question': {
                    responseText = args.question;
                    suggestions = args.options || [];
                    break;
                }

                default:
                    responseText = '이 기능은 아직 준비 중이에요.';
            }
        } else {
            // 일반 텍스트 응답
            const textPart = content?.parts?.find(p => p.text);
            responseText = textPart?.text || '무엇을 도와드릴까요?';

            // 기본 제안
            suggestions = ['이미지 생성', '이미지 편집', '도움말'];
        }

        const totalTime = Date.now() - startTime;
        console.log(`[Conversational] Completed in ${totalTime}ms`);

        return res.status(200).json({
            success: true,
            response: responseText,
            imageUrl: resultImageUrl,
            action: actionType ? {
                type: actionType,
                params: functionCall?.functionCall?.args
            } : null,
            suggestions,
            timing: {
                total: `${totalTime}ms`
            }
        });

    } catch (error) {
        console.error('[Conversational] Error:', error);
        return res.status(500).json({
            error: error.message,
            response: '죄송해요, 문제가 발생했어요. 다시 시도해주세요.',
            suggestions: ['다시 시도', '새 대화 시작']
        });
    }
};

// 요청에서 base URL 추출
function getBaseUrl(req) {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${protocol}://${host}`;
}

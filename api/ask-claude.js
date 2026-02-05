const Anthropic = require('@anthropic-ai/sdk');

/**
 * Claude API 연동
 *
 * 모델: claude-sonnet-4-20250514 (기본)
 * 용도: 텍스트 생성, 코드 분석, 이미지 분석
 */

module.exports.config = {
    maxDuration: 60,
};

// Claude 모델 스펙
const CLAUDE_MODELS = {
    'claude-sonnet-4': {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        maxTokens: 8192,
        contextWindow: 200000,
        bestFor: ['균형잡힌 성능', '코드 생성', '분석'],
        inputPrice: 3,   // $3/1M tokens
        outputPrice: 15  // $15/1M tokens
    },
    'claude-opus-4': {
        id: 'claude-opus-4-20250514',
        name: 'Claude Opus 4',
        maxTokens: 8192,
        contextWindow: 200000,
        bestFor: ['복잡한 추론', '창작', '전문 분석'],
        inputPrice: 15,
        outputPrice: 75
    },
    'claude-haiku-3.5': {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        maxTokens: 8192,
        contextWindow: 200000,
        bestFor: ['빠른 응답', '간단한 작업', '비용 효율'],
        inputPrice: 0.8,
        outputPrice: 4
    }
};

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const {
        prompt,
        systemPrompt = '',
        model = 'claude-sonnet-4',
        maxTokens = 4096,
        temperature = 0.7,
        images = [],  // base64 이미지 배열 (Vision)
        stream = false
    } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const startTime = Date.now();

    try {
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'ANTHROPIC_API_KEY not configured',
                message: 'Claude API 키가 설정되지 않았습니다.'
            });
        }

        const anthropic = new Anthropic({ apiKey });

        // 모델 정보 가져오기
        const modelInfo = CLAUDE_MODELS[model] || CLAUDE_MODELS['claude-sonnet-4'];
        console.log(`[Claude] Using ${modelInfo.name} (${modelInfo.id})`);

        // 메시지 구성
        const content = [];

        // 이미지가 있으면 Vision 모드
        if (images && images.length > 0) {
            for (const img of images) {
                const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
                const mimeType = img.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

                content.push({
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: mimeType,
                        data: base64Data
                    }
                });
            }
            console.log(`[Claude] Vision mode: ${images.length} image(s)`);
        }

        // 텍스트 프롬프트 추가
        content.push({
            type: 'text',
            text: prompt
        });

        const messages = [{
            role: 'user',
            content: content
        }];

        // API 호출
        const response = await anthropic.messages.create({
            model: modelInfo.id,
            max_tokens: Math.min(maxTokens, modelInfo.maxTokens),
            temperature: temperature,
            system: systemPrompt || undefined,
            messages: messages
        });

        const generationTime = Date.now() - startTime;
        console.log(`[Claude] Response in ${generationTime}ms`);

        // 응답 텍스트 추출
        const responseText = response.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('\n');

        // 토큰 사용량
        const usage = {
            inputTokens: response.usage?.input_tokens || 0,
            outputTokens: response.usage?.output_tokens || 0,
            totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
            estimatedCost: (
                ((response.usage?.input_tokens || 0) / 1000000 * modelInfo.inputPrice) +
                ((response.usage?.output_tokens || 0) / 1000000 * modelInfo.outputPrice)
            ).toFixed(6)
        };

        res.status(200).json({
            response: responseText,
            model: modelInfo.name,
            modelId: modelInfo.id,
            usage: usage,
            timing: {
                total: `${generationTime}ms`
            },
            stopReason: response.stop_reason
        });

    } catch (error) {
        console.error('[Claude] Error:', error);

        let errorMessage = error.message || 'Internal Server Error';
        let statusCode = 500;

        if (error.status === 401) {
            statusCode = 401;
            errorMessage = 'Invalid API key';
        } else if (error.status === 429) {
            statusCode = 429;
            errorMessage = 'Rate limit exceeded';
        } else if (error.status === 400) {
            statusCode = 400;
            errorMessage = 'Bad request: ' + errorMessage;
        }

        res.status(statusCode).json({
            error: errorMessage,
            friendlyMessage: {
                message: statusCode === 429
                    ? '요청이 많아서 잠시 후 다시 시도해주세요'
                    : 'Claude 응답 생성 중 문제가 발생했어요',
                suggestion: null
            }
        });
    }
};

// 모델 정보 export (프론트엔드용)
module.exports.CLAUDE_MODELS = CLAUDE_MODELS;

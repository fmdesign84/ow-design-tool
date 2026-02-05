/**
 * Vercel Serverless Function - Composite Image Generation
 *
 * Gemini 3 Pro Image 사용 (멀티모달 합성)
 * - 최대 14장 이미지 입력 지원
 * - 배경 + 전경 자연스러운 합성
 * - 프롬프트 기반 스타일 조정
 */

const { logError } = require('./lib/errorLogger.js');

// Body size limit 설정 (기본 4.5MB → 50MB)
module.exports.config = {
    maxDuration: 60,
    api: {
        bodyParser: {
            sizeLimit: '50mb',
        },
    },
};

module.exports = async (req, res) => {
    // CORS Handling
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const {
        image,      // 배경 이미지 (base64)
        mask,       // 전경 이미지 (base64) - location 모드에서는 합성할 인물/객체
        images,     // 추가 이미지 배열 (최대 14장)
        prompt = '자연스럽게 합성해주세요',
        aspectRatio = '1:1'
    } = req.body;

    if (!image) {
        return res.status(400).json({ error: '배경 이미지가 필요합니다' });
    }

    if (!mask && (!images || images.length === 0)) {
        return res.status(400).json({ error: '합성할 이미지가 필요합니다' });
    }

    console.log('[Composite] Starting Gemini 3 Pro Image composite...');
    console.log('[Composite] Prompt:', prompt);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({
            error: 'Server misconfiguration',
            message: 'GEMINI_API_KEY not configured'
        });
    }

    const startTime = Date.now();

    try {
        // 이미지 배열 구성 (배경 + 전경 + 추가 이미지들)
        const allImages = [];

        // 1. 배경 이미지 추가
        allImages.push(image);

        // 2. 전경(mask) 이미지 추가 (있으면)
        if (mask) {
            allImages.push(mask);
        }

        // 3. 추가 이미지들 추가 (있으면)
        if (images && Array.isArray(images)) {
            allImages.push(...images);
        }

        // 최대 14장으로 제한
        const imagesToProcess = allImages.slice(0, 14);
        console.log(`[Composite] Processing ${imagesToProcess.length} images`);

        // Gemini API 호출을 위한 parts 구성
        const parts = [];

        // 합성 지시 프롬프트 추가
        const compositePrompt = `다음 이미지들을 자연스럽게 합성해주세요.
첫 번째 이미지가 배경이고, 나머지 이미지의 주요 피사체(인물, 물체 등)를 배경에 자연스럽게 배치해주세요.
조명, 그림자, 색감을 통일하여 마치 한 장면에서 촬영한 것처럼 보이게 해주세요.

사용자 요청: ${prompt}

중요: 결과물은 합성된 이미지 한 장만 생성해주세요.`;

        parts.push({ text: compositePrompt });

        // 이미지들 추가
        for (let i = 0; i < imagesToProcess.length; i++) {
            const imgData = imagesToProcess[i];
            let imageData = imgData;
            let mimeType = 'image/png';

            // data:image/... 형식 처리
            if (imgData.startsWith('data:')) {
                const matches = imgData.match(/^data:([^;]+);base64,(.+)$/);
                if (matches) {
                    mimeType = matches[1];
                    imageData = matches[2];
                }
            }

            parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: imageData
                }
            });
        }

        // Gemini 3 Pro Image API 호출
        const gemini3Url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`;

        const requestBody = {
            contents: [{
                parts: parts
            }],
            generationConfig: {
                responseModalities: ['TEXT', 'IMAGE'],
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: '1K'
                }
            }
        };

        console.log(`[Composite] Calling Gemini 3 Pro Image with ${imagesToProcess.length} images...`);

        const response = await fetch(gemini3Url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Composite] Gemini API error:', errText);
            throw new Error(`Gemini API failed (${response.status}): ${errText.substring(0, 200)}`);
        }

        const data = await response.json();
        console.log('[Composite] Gemini response received');

        // 응답에서 이미지 추출
        const candidates = data.candidates || [];
        let resultImageBase64 = null;

        for (const candidate of candidates) {
            const responseParts = candidate.content?.parts || [];
            for (const part of responseParts) {
                if (part.inlineData?.mimeType?.startsWith('image/')) {
                    resultImageBase64 = part.inlineData.data;
                    break;
                }
            }
            if (resultImageBase64) break;
        }

        if (!resultImageBase64) {
            throw new Error('Gemini did not return an image');
        }

        const totalTime = Date.now() - startTime;
        console.log(`[Composite] Completed in ${totalTime}ms`);

        return res.status(200).json({
            success: true,
            image: `data:image/png;base64,${resultImageBase64}`,
            debug: {
                processingTime: totalTime,
                model: 'gemini-3-pro-image-preview',
                imageCount: imagesToProcess.length,
                prompt: prompt
            }
        });

    } catch (err) {
        console.error('[Composite Error]', err);

        await logError(
            'composite-image',
            err.message?.includes('timeout') ? 'TIMEOUT' : 'GENERAL_ERROR',
            err.message,
            { prompt: prompt?.substring(0, 100) },
            { stack: err.stack }
        );

        return res.status(500).json({
            error: 'Image compositing failed',
            message: err.message,
            friendlyMessage: {
                message: err.message?.includes('timeout')
                    ? '이미지 합성에 시간이 오래 걸리고 있어요. 다시 시도해주세요 ⏳'
                    : '이미지 합성 중 문제가 발생했어요. 다시 시도해주세요 🔄'
            }
        });
    }
};

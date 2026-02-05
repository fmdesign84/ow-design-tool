const { GoogleAuth } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

async function logError(errorType, errorMessage, requestData, responseData = null) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('error_logs').insert({
            service: 'edit-image',
            error_type: errorType,
            error_message: errorMessage,
            request_data: requestData,
            response_data: responseData,
            resolved: false
        });
        console.log('[ErrorLog] Logged:', errorType);
    } catch (e) {
        console.error('[ErrorLog] Exception:', e.message);
    }
}

/**
 * Vercel Serverless Function - AI Image Editing (Background Change)
 *
 * Gemini 이미지 편집 기능을 사용하여 배경을 변경합니다.
 * - 이미지 + 텍스트 프롬프트 → 편집된 이미지
 */

module.exports.config = {
    maxDuration: 60,
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

    const { image, backgroundPrompt, editType = 'background' } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Image is required' });
    }

    if (!backgroundPrompt) {
        return res.status(400).json({ error: 'Background prompt is required' });
    }

    const startTime = Date.now();

    try {
        const projectId = process.env.GOOGLE_PROJECT_ID;
        const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        const location = 'us-central1';

        if (!projectId || !credentialsJson) {
            throw new Error('Server misconfiguration: Missing Google Credentials');
        }

        // Authenticate
        const auth = new GoogleAuth({
            credentials: JSON.parse(credentialsJson),
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const token = accessToken.token;

        // Base64 이미지 데이터 추출
        let imageBase64 = image;
        let mimeType = 'image/png';

        if (image.startsWith('data:')) {
            const matches = image.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                mimeType = matches[1];
                imageBase64 = matches[2];
            }
        }

        // Gemini 이미지 편집 프롬프트
        const editPrompt = `Edit this image: Remove the current background completely and replace it with ${backgroundPrompt}.
Keep the main subject (person, object, or item) exactly as it is - do not modify, distort, or change the subject in any way.
Only change the background. The subject should appear naturally placed on the new background with appropriate lighting.`;

        // Gemini 모델 목록 (이미지 생성/편집 지원)
        const geminiModels = [
            'gemini-2.0-flash-exp'  // 이미지 생성 지원 모델 (responseModalities: IMAGE)
        ];

        let editedImageBase64 = null;
        let modelUsed = null;

        for (const model of geminiModels) {
            try {
                console.log(`[Edit] Trying ${model}...`);

                const geminiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

                const requestBody = {
                    contents: [{
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: imageBase64
                                }
                            },
                            {
                                text: editPrompt
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 8192,
                        responseModalities: ['IMAGE', 'TEXT'],
                    }
                };

                const response = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.log(`[Edit] ${model} failed (${response.status}): ${errText.substring(0, 300)}`);
                    continue;
                }

                const data = await response.json();
                console.log(`[Edit] ${model} response received`);

                // 이미지 응답 찾기
                const candidate = data.candidates?.[0];
                if (candidate?.content?.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.inlineData?.data) {
                            editedImageBase64 = part.inlineData.data;
                            modelUsed = model;
                            console.log(`[Edit] Image found in response from ${model}`);
                            break;
                        }
                    }
                }

                if (editedImageBase64) break;

            } catch (err) {
                console.log(`[Edit] ${model} error: ${err.message}`);
                continue;
            }
        }

        if (!editedImageBase64) {
            // Gemini가 이미지 편집을 지원하지 않는 경우 대체 메시지
            return res.status(400).json({
                error: 'Image editing not available',
                message: 'Gemini 이미지 편집 기능이 현재 사용 불가능합니다. 나중에 다시 시도해주세요.',
                suggestion: 'transparent' // 투명 배경이 필요하면 클라이언트 측 처리 권장
            });
        }

        const totalTime = Date.now() - startTime;
        console.log(`[Edit] Completed in ${totalTime}ms using ${modelUsed}`);

        return res.status(200).json({
            success: true,
            image: `data:image/png;base64,${editedImageBase64}`,
            debug: {
                model: modelUsed,
                editType: editType,
                backgroundPrompt: backgroundPrompt,
                processingTime: totalTime
            }
        });

    } catch (err) {
        console.error('[Edit Error]', err);

        await logError(
            err.message?.includes('timeout') ? 'TIMEOUT' : 'GENERAL_ERROR',
            err.message,
            { editType, backgroundPrompt },
            { stack: err.stack }
        );

        return res.status(500).json({
            error: 'Image editing failed',
            message: err.message,
            friendlyMessage: {
                message: err.message?.includes('timeout')
                    ? '이미지 편집에 시간이 걸리고 있어요. 사용자가 많을 수 있으니 잠시 후 다시 시도해주세요 ⏳'
                    : '이미지 편집 중 문제가 발생했어요. 다시 시도해주세요 🔄'
            }
        });
    }
};

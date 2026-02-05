const { GoogleAuth } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

async function logError(errorType, errorMessage, requestData, responseData = null) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('error_logs').insert({
            service: 'analyze-image',
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
 * Vercel Serverless Function - Image Style Analyzer
 *
 * 이미지 생성 후 비동기로 호출되어 실제 이미지의 스타일을 분석합니다.
 * Gemini Vision을 사용해 이미지 기반 스타일 태그를 추출합니다.
 */

module.exports.config = {
    maxDuration: 30,
};

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { imageId, imageUrl } = req.body;

    if (!imageId || !imageUrl) {
        return res.status(400).json({ error: 'imageId and imageUrl are required' });
    }

    console.log(`[Analyze] Starting analysis for image: ${imageId}`);

    try {
        const projectId = process.env.GOOGLE_PROJECT_ID;
        const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        const location = 'us-central1';

        if (!projectId || !credentialsJson) {
            throw new Error('Missing Google Credentials');
        }

        // Authenticate
        const auth = new GoogleAuth({
            credentials: JSON.parse(credentialsJson),
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const token = accessToken.token;

        // 이미지 다운로드 및 base64 변환
        console.log(`[Analyze] Fetching image from: ${imageUrl}`);
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');
        console.log(`[Analyze] Image fetched, size: ${imageBase64.length} chars`);

        // Gemini Vision 프롬프트
        const analysisPrompt = `Analyze this image and extract style tags.

Return a JSON object with these fields:
- styles: array of 2-5 style tags (e.g., "Ghibli", "Anime", "Photorealistic", "Watercolor", "Pixel Art", "3D Render", "Oil Painting", "Minimalist", "Fantasy", "Sci-Fi", "Vintage", "Modern", "Cartoon", "Sketch", "Pop Art")
- mood: single word mood (e.g., "whimsical", "dramatic", "peaceful", "energetic", "melancholic", "mysterious")
- colors: array of 2-3 dominant color descriptions (e.g., "warm pastels", "vibrant", "monochrome", "earth tones")

Focus on visual style, not content. Be specific about art style.

Output JSON only, no explanation.`;

        // Gemini Vision 호출 (최신 모델 우선)
        const geminiModels = [
            'gemini-3-flash-preview', // 최신 모델
            'gemini-2.5-flash-lite'   // 폴백용
        ];

        let analysisResult = null;

        for (const modelId of geminiModels) {
            try {
                const geminiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

                console.log(`[Analyze] Trying ${modelId}...`);

                const response = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            role: 'user',
                            parts: [
                                {
                                    inlineData: {
                                        mimeType: 'image/png',
                                        data: imageBase64
                                    }
                                },
                                { text: analysisPrompt }
                            ]
                        }],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 256,
                            responseMimeType: 'application/json'
                        }
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.log(`[Analyze] ${modelId} failed: ${errText.substring(0, 200)}`);
                    continue;
                }

                const data = await response.json();
                const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

                if (resultText) {
                    console.log(`[Analyze] ${modelId} response: ${resultText}`);
                    analysisResult = JSON.parse(resultText);
                    break;
                }
            } catch (err) {
                console.log(`[Analyze] ${modelId} error: ${err.message}`);
                continue;
            }
        }

        if (!analysisResult) {
            throw new Error('All Gemini models failed');
        }

        // Supabase 업데이트
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { error: updateError } = await supabase
                .from('images')
                .update({
                    detected_styles: analysisResult.styles || [],
                    mood: analysisResult.mood || null,
                    colors: analysisResult.colors || []
                })
                .eq('id', imageId);

            if (updateError) {
                console.error('[Analyze] Supabase update error:', updateError);
            } else {
                console.log(`[Analyze] Updated DB for image: ${imageId}`);
            }
        }

        return res.status(200).json({
            success: true,
            imageId,
            analysis: analysisResult
        });

    } catch (error) {
        console.error('[Analyze] Error:', error);

        await logError(
            error.message?.includes('timeout') ? 'TIMEOUT' : 'GENERAL_ERROR',
            error.message,
            { imageId },
            { stack: error.stack }
        );

        return res.status(500).json({
            error: error.message,
            imageId,
            friendlyMessage: {
                message: error.message?.includes('timeout')
                    ? '스타일 분석에 시간이 걸리고 있어요. 잠시 후 다시 시도해주세요 ⏳'
                    : '이미지 분석 중 문제가 발생했어요 🔄'
            }
        });
    }
};

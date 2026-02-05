const { GoogleAuth } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

async function logError(errorType, errorMessage, requestData, responseData = null) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('error_logs').insert({
            service: 'analyze-all-images',
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
 * 기존 이미지 일괄 분석 API
 * 분석되지 않은 이미지들을 순차적으로 분석합니다.
 */

module.exports.config = {
    maxDuration: 60,
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!supabaseUrl || !supabaseKey || !projectId || !credentialsJson) {
        return res.status(500).json({ error: 'Missing environment variables' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 분석되지 않은 이미지 조회 (detected_styles가 비어있거나 null인 것)
        const { data: images, error: fetchError } = await supabase
            .from('images')
            .select('id, image_url')
            .or('detected_styles.is.null,detected_styles.eq.{}')
            .order('created_at', { ascending: false })
            .limit(10); // 한 번에 10개씩 처리

        if (fetchError) {
            console.error('Fetch error:', fetchError);
            return res.status(500).json({ error: fetchError.message });
        }

        if (!images || images.length === 0) {
            return res.status(200).json({ message: 'No images to analyze', analyzed: 0 });
        }

        console.log(`[Batch] Found ${images.length} images to analyze`);

        // Google Auth
        const auth = new GoogleAuth({
            credentials: JSON.parse(credentialsJson),
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const token = accessToken.token;
        const location = 'us-central1';

        const analysisPrompt = `Analyze this image and extract style tags.

Return a JSON object with these fields:
- styles: array of 2-5 style tags (e.g., "Ghibli", "Anime", "Photorealistic", "Watercolor", "Pixel Art", "3D Render", "Oil Painting", "Minimalist", "Fantasy", "Sci-Fi", "Vintage", "Modern", "Cartoon", "Sketch", "Pop Art")
- mood: single word mood (e.g., "whimsical", "dramatic", "peaceful", "energetic", "melancholic", "mysterious")
- colors: array of 2-3 dominant color descriptions (e.g., "warm pastels", "vibrant", "monochrome", "earth tones")

Focus on visual style, not content. Be specific about art style.

Output JSON only, no explanation.`;

        const results = [];

        for (const img of images) {
            try {
                console.log(`[Batch] Analyzing: ${img.id}`);

                // 이미지 다운로드
                const imageResponse = await fetch(img.image_url);
                if (!imageResponse.ok) {
                    console.log(`[Batch] Failed to fetch image: ${img.id}`);
                    continue;
                }
                const imageBuffer = await imageResponse.arrayBuffer();
                const imageBase64 = Buffer.from(imageBuffer).toString('base64');

                // Gemini Vision 호출
                const geminiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-3-flash-preview:generateContent`;

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
                    console.log(`[Batch] Gemini failed for: ${img.id}`);
                    continue;
                }

                const data = await response.json();
                const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

                if (!resultText) {
                    console.log(`[Batch] No result for: ${img.id}`);
                    continue;
                }

                const analysisResult = JSON.parse(resultText);
                console.log(`[Batch] Result for ${img.id}:`, analysisResult.styles);

                // DB 업데이트
                const { error: updateError } = await supabase
                    .from('images')
                    .update({
                        detected_styles: analysisResult.styles || [],
                        mood: analysisResult.mood || null,
                        colors: analysisResult.colors || []
                    })
                    .eq('id', img.id);

                if (!updateError) {
                    results.push({
                        id: img.id,
                        styles: analysisResult.styles,
                        mood: analysisResult.mood
                    });
                }

            } catch (err) {
                console.error(`[Batch] Error for ${img.id}:`, err.message);
            }
        }

        return res.status(200).json({
            message: `Analyzed ${results.length} images`,
            analyzed: results.length,
            total: images.length,
            results
        });

    } catch (error) {
        console.error('[Batch] Error:', error);

        await logError(
            error.message?.includes('timeout') ? 'TIMEOUT' : 'GENERAL_ERROR',
            error.message,
            {},
            { stack: error.stack }
        );

        return res.status(500).json({
            error: error.message,
            friendlyMessage: {
                message: error.message?.includes('timeout')
                    ? '일괄 분석에 시간이 걸리고 있어요. 잠시 후 다시 시도해주세요 ⏳'
                    : '이미지 일괄 분석 중 문제가 발생했어요 🔄'
            }
        });
    }
};

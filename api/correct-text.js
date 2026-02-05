/**
 * Vercel Serverless Function - Text Correction via Inpainting
 *
 * 깨진 텍스트 영역 보정:
 * - 분석 결과의 바운딩 박스 정보 활용
 * - Gemini로 해당 영역 inpainting
 * - 원본 텍스트로 재생성
 */

const { createClient } = require('@supabase/supabase-js');

// 에러 로깅
async function logError(errorType, errorMessage, requestData, responseData = null) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('error_logs').insert({
            service: 'correct-text',
            error_type: errorType,
            error_message: errorMessage,
            request_data: requestData,
            response_data: responseData,
            resolved: false
        });
    } catch (e) {
        console.error('[ErrorLog] Exception:', e.message);
    }
}

module.exports.config = {
    maxDuration: 60,
};

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { image, correctionAreas, correctText } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Image is required' });
    }

    if (!correctionAreas || correctionAreas.length === 0) {
        return res.status(400).json({ error: 'No correction areas specified' });
    }

    const startTime = Date.now();

    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        // 이미지 데이터 추출
        let imageBase64 = image;
        let imageMimeType = 'image/png';

        if (image.startsWith('data:')) {
            const matches = image.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                imageMimeType = matches[1];
                imageBase64 = matches[2];
            }
        }

        // 보정 영역 정보 구성 (suggestedText 우선 사용)
        const areaDescriptions = correctionAreas.map((area, i) => {
            const { boundingBox, detectedText, suggestedText, expectedText } = area;
            // 우선순위: suggestedText > expectedText > correctText > detectedText
            const targetText = suggestedText || expectedText || correctText || detectedText;
            return `Area ${i + 1}:
- Position: x=${boundingBox.x}%, y=${boundingBox.y}%, width=${boundingBox.width}%, height=${boundingBox.height}%
- Current text (corrupted): "${detectedText}"
- Should display: "${targetText}"`;
        }).join('\n\n');

        // Gemini 3 Pro Image API로 텍스트 보정
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`;

        const correctionPrompt = `Fix the corrupted text in this image. Keep the overall image exactly the same, only correct the text areas specified below.

AREAS TO CORRECT:
${areaDescriptions}

CRITICAL INSTRUCTIONS:
1. Keep the image composition, background, colors, and style EXACTLY the same
2. Only modify the specified text areas
3. Replace corrupted/garbled text with the correct text specified
4. Match the original font style, size, and color as closely as possible
5. The text must be CLEAR, READABLE, and properly rendered
6. For Korean/Chinese text, ensure characters are complete and not broken

OUTPUT: Return the corrected image with readable text in the specified areas.`;

        console.log('[CorrectText] Starting correction with', correctionAreas.length, 'areas');

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: correctionPrompt },
                        {
                            inline_data: {
                                mime_type: imageMimeType,
                                data: imageBase64
                            }
                        }
                    ]
                }],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                    imageConfig: {
                        imageSize: '2K'
                    }
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[CorrectText] Gemini error (${response.status}):`, errText);

            try {
                const errJson = JSON.parse(errText);
                const errMessage = errJson?.error?.message || errText.substring(0, 200);
                throw new Error(`API 오류: ${errMessage}`);
            } catch (parseErr) {
                throw new Error(`Gemini API failed: ${response.status}`);
            }
        }

        const data = await response.json();
        let correctedImageBase64 = null;
        let modelResponse = null;

        // 응답에서 이미지 추출
        for (const candidate of (data.candidates || [])) {
            for (const part of (candidate.content?.parts || [])) {
                if (part.inlineData?.mimeType?.startsWith('image/')) {
                    correctedImageBase64 = part.inlineData.data;
                } else if (part.text) {
                    modelResponse = part.text;
                }
            }
        }

        if (!correctedImageBase64) {
            const responsePreview = JSON.stringify(data).substring(0, 1000);
            console.error('[CorrectText] No image returned:', responsePreview);

            // 차단 원인 분석
            const blockReason = data?.candidates?.[0]?.finishReason;
            if (blockReason === 'SAFETY') {
                throw new Error('안전 필터에 의해 차단되었습니다.');
            }

            throw new Error('텍스트 보정 이미지 생성 실패. 다시 시도해주세요.');
        }

        const totalTime = Date.now() - startTime;
        console.log(`[CorrectText] Success in ${totalTime}ms`);

        // Supabase 저장 (선택적)
        let savedImage = null;
        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );

            const buffer = Buffer.from(correctedImageBase64, 'base64');
            const fileName = `text-corrected-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

            const { error: uploadError } = await supabase.storage
                .from('generated-images')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    cacheControl: '3600'
                });

            if (!uploadError) {
                await new Promise(resolve => setTimeout(resolve, 500));

                const { data: { publicUrl } } = supabase.storage
                    .from('generated-images')
                    .getPublicUrl(fileName);

                const { data: dbData } = await supabase
                    .from('images')
                    .insert({
                        image_url: publicUrl,
                        prompt: '텍스트 보정',
                        model: 'gemini-3-pro-image',
                        style: 'text-correction',
                        quality: 'standard'
                    })
                    .select()
                    .single();

                if (dbData) {
                    savedImage = dbData;
                    console.log('[Supabase] Saved:', savedImage.id);
                }
            }
        } catch (e) {
            console.error('[Supabase] Error:', e.message);
        }

        res.status(200).json({
            success: true,
            correctedImage: savedImage?.image_url || `data:image/png;base64,${correctedImageBase64}`,
            savedImage,
            debug: {
                areasProcessed: correctionAreas.length,
                totalTime: `${totalTime}ms`,
                modelResponse
            }
        });

    } catch (err) {
        console.error('[CorrectText Error]', err);

        await logError('CORRECTION_ERROR', err.message, {
            hasImage: !!image,
            areaCount: correctionAreas?.length
        }, { stack: err.stack });

        res.status(500).json({
            error: 'Text correction failed',
            message: err.message,
            friendlyMessage: {
                message: '텍스트 보정에 실패했어요. 다시 시도해주세요 🔄',
                suggestion: '보정 영역이 정확한지 확인하거나 다시 분석해보세요.'
            }
        });
    }
};

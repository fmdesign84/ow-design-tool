/**
 * Vercel Serverless Function - Image Inpainting v3
 *
 * GPT Image 1.5 기반 부분 편집 (인페인팅)
 * - 마스크 기반 정밀 영역 편집
 * - 원본 영역 보존
 */

const OpenAI = require('openai');
const { toFile } = require('openai');
const { createClient } = require('@supabase/supabase-js');

module.exports.config = {
    maxDuration: 60,
};

// 에러 로깅
async function logError(errorType, errorMessage, requestData) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('error_logs').insert({
            service: 'generate-inpainting',
            error_type: errorType,
            error_message: errorMessage,
            request_data: requestData,
            resolved: false
        });
    } catch (e) {
        console.error('[ErrorLog] Exception:', e.message);
    }
}

module.exports = async (req, res) => {
    // CORS
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

    const { image, mask, prompt, size = '1024x1024' } = req.body;

    if (!image || !mask || !prompt) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['image', 'mask', 'prompt']
        });
    }

    const startTime = Date.now();
    console.log(`[Inpainting v3] Starting with GPT Image 1.5`);
    console.log(`[Inpainting v3] Prompt: "${prompt.substring(0, 100)}..."`);

    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        const openai = new OpenAI({ apiKey });

        // Base64 → Buffer 변환
        const imageBuffer = Buffer.from(
            image.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
        );
        const maskBuffer = Buffer.from(
            mask.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
        );

        console.log(`[Inpainting v3] Image buffer size: ${imageBuffer.length}`);
        console.log(`[Inpainting v3] Mask buffer size: ${maskBuffer.length}`);

        // Buffer → File 객체 변환 (OpenAI SDK 요구사항)
        const imageFile = await toFile(imageBuffer, 'image.png', { type: 'image/png' });
        const maskFile = await toFile(maskBuffer, 'mask.png', { type: 'image/png' });

        console.log(`[Inpainting v3] Files created, calling API...`);

        // GPT Image 1.5 Edit API 호출 (고품질 설정)
        const result = await openai.images.edit({
            model: 'gpt-image-1.5',
            image: imageFile,
            mask: maskFile,
            prompt: prompt,
            n: 1,
            size: size,
            quality: 'high',           // 고품질 출력
        });

        const generationTime = Date.now() - startTime;
        console.log(`[Inpainting v3] Generated in ${generationTime}ms`);

        // 이미지 데이터 추출
        const imageData = result.data[0];
        let imageBase64 = imageData.b64_json;

        // URL 형식으로 반환된 경우 처리
        if (!imageBase64 && imageData.url) {
            console.log('[Inpainting v3] Fetching image from URL...');
            const imageResponse = await fetch(imageData.url);
            const arrayBuffer = await imageResponse.arrayBuffer();
            imageBase64 = Buffer.from(arrayBuffer).toString('base64');
        }

        if (!imageBase64) {
            throw new Error('이미지 생성 결과가 없습니다.');
        }

        // Supabase에 저장
        let savedImage = null;
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;

            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);

                const buffer = Buffer.from(imageBase64, 'base64');
                const fileName = `inpaint-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

                const { error: uploadError } = await supabase.storage
                    .from('generated-images')
                    .upload(fileName, buffer, {
                        contentType: 'image/png',
                        cacheControl: '3600'
                    });

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('generated-images')
                        .getPublicUrl(fileName);

                    const { data: dbData, error: dbError } = await supabase
                        .from('images')
                        .insert({
                            image_url: publicUrl,
                            prompt: `[Inpainting] ${prompt}`,
                            model: 'GPT Image 1.5',
                            style: 'inpainting',
                            aspect_ratio: size,
                            quality: 'high'
                        })
                        .select()
                        .single();

                    if (!dbError) {
                        savedImage = dbData;
                        console.log('[Supabase] Image saved:', savedImage.id);
                    }
                }
            }
        } catch (supabaseErr) {
            console.error('[Supabase] Error:', supabaseErr.message);
        }

        const totalTime = Date.now() - startTime;
        console.log(`[Inpainting v3] Success in ${totalTime}ms`);

        return res.status(200).json({
            success: true,
            image: savedImage ? savedImage.image_url : `data:image/png;base64,${imageBase64}`,
            savedImage: savedImage,
            model: 'gpt-image-1.5',
            totalTime: `${totalTime}ms`
        });

    } catch (error) {
        console.error('[Inpainting v3] Error:', error);

        await logError('INPAINTING_ERROR', error.message, { prompt: prompt?.substring(0, 100) });

        // OpenAI 에러 처리
        let errorMessage = error.message || 'Internal Server Error';
        let statusCode = 500;

        if (error.status === 400) {
            statusCode = 400;
            errorMessage = 'Invalid request: ' + errorMessage;
        } else if (error.status === 401) {
            statusCode = 401;
            errorMessage = 'Invalid API key';
        } else if (error.status === 429) {
            statusCode = 429;
            errorMessage = 'Rate limit exceeded';
        }

        return res.status(statusCode).json({
            error: errorMessage,
            friendlyMessage: statusCode === 429
                ? '요청이 많아서 잠시 후 다시 시도해주세요 ⏳'
                : '부분 편집 중 문제가 발생했어요. 다시 시도해주세요.'
        });
    }
};

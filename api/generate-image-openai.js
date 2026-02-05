const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

/**
 * Vercel Serverless Function - GPT Image 1.5 Generation
 *
 * OpenAI의 GPT Image 1.5 모델을 사용한 이미지 생성
 * - 4배 빠른 속도, 20% 저렴한 비용
 * - Text-to-Image 및 Image Edit 지원
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

    const {
        prompt,
        size = '1024x1024',
        quality = 'high',           // low, medium, high (기본: high)
        style = 'vivid',            // vivid, natural
        output_format = 'png',      // png, jpeg, webp
        moderation = 'auto',        // auto, low
        referenceImage = null,
        mask = null
    } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const startTime = Date.now();

    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error('Server misconfiguration: Missing OpenAI API Key');
        }

        const openai = new OpenAI({ apiKey });

        console.log(`[GPT Image 1.5] Generating: "${prompt.substring(0, 100)}..."`);
        console.log(`[GPT Image 1.5] Size: ${size}, Quality: ${quality}, Style: ${style}`);

        let result;
        let usedMode = 'text-to-image';

        // Image Edit 모드 (참조 이미지 + 마스크가 있는 경우)
        if (referenceImage && mask) {
            console.log('[GPT Image 1.5] Mode: Image Edit (inpainting)');
            usedMode = 'image-edit';

            // Base64 → Buffer
            const imageBuffer = Buffer.from(
                referenceImage.replace(/^data:image\/\w+;base64,/, ''),
                'base64'
            );
            const maskBuffer = Buffer.from(
                mask.replace(/^data:image\/\w+;base64,/, ''),
                'base64'
            );

            result = await openai.images.edit({
                model: 'gpt-image-1.5',
                image: imageBuffer,
                mask: maskBuffer,
                prompt: prompt,
                n: 1,
                size: size
            });
        }
        // Text-to-Image 모드
        else {
            console.log('[GPT Image 1.5] Mode: Text-to-Image');

            result = await openai.images.generate({
                model: 'gpt-image-1.5',
                prompt: prompt,
                n: 1,
                size: size,
                quality: quality,
                style: style,
                output_format: output_format,
                moderation: moderation,
                response_format: 'b64_json'
            });
        }

        const generationTime = Date.now() - startTime;
        console.log(`[GPT Image 1.5] Generated in ${generationTime}ms`);

        // 이미지 데이터 추출
        const imageData = result.data[0];
        let imageBase64 = imageData.b64_json;

        // URL 형식으로 반환된 경우 처리
        if (!imageBase64 && imageData.url) {
            console.log('[GPT Image 1.5] Fetching image from URL...');
            const imageResponse = await fetch(imageData.url);
            const arrayBuffer = await imageResponse.arrayBuffer();
            imageBase64 = Buffer.from(arrayBuffer).toString('base64');
        }

        // Supabase에 저장
        let savedImage = null;
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;

            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);

                const buffer = Buffer.from(imageBase64, 'base64');
                const fileName = `openai-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

                const { data: uploadData, error: uploadError } = await supabase.storage
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
                            prompt: prompt,
                            model: 'GPT Image 1.5',
                            style: style,
                            aspect_ratio: size,
                            quality: quality
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

        res.status(200).json({
            image: savedImage ? savedImage.image_url : `data:image/png;base64,${imageBase64}`,
            savedImage: savedImage,
            debug: {
                originalPrompt: prompt,
                size: size,
                quality: quality,
                style: style,
                mode: usedMode,
                model: 'GPT Image 1.5',
                timing: {
                    total: `${generationTime}ms`
                }
            }
        });

    } catch (error) {
        console.error('[GPT Image 1.5] Error:', error);

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
            errorMessage = 'Rate limit exceeded. Please try again later.';
        }

        res.status(statusCode).json({
            error: errorMessage,
            friendlyMessage: {
                message: statusCode === 429
                    ? '요청이 많아서 잠시 후 다시 시도해주세요 ⏳'
                    : '이미지 생성 중 문제가 발생했어요. 다시 시도해주세요!',
                suggestion: null
            }
        });
    }
};

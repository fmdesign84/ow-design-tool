/**
 * Vercel Serverless Function - Background Generation
 *
 * Replicate API (bria/generate-background 모델) 사용
 * - Model: bria-ai/bria-background-generator (Replicate identifier)
 * - 배경 자동 제거 후 새로운 배경 생성
 * - 프롬프트 기반 배경 생성
 * - 비용: ~$0.04/장
 * - 에러 로깅: Supabase error_logs
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

async function logError(errorType, errorMessage, requestData, responseData = null) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('error_logs').insert({
            service: 'generate-background',
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

// Body size limit 설정 (기본 4.5MB → 50MB)
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb',
        },
    },
};

export default async function handler(req, res) {
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
        image,      // base64 또는 URL
        imageUrl,   // URL (우선)
        refPrompt,
        seed = null,
        refinePrompt = true,
        outputFormat = 'png'
    } = req.body;

    // imageUrl이 있으면 우선 사용, 없으면 image 사용
    const imageInput = imageUrl || image;

    if (!imageInput) {
        return res.status(400).json({ error: 'Image (imageUrl or image) is required' });
    }

    if (!refPrompt) {
        return res.status(400).json({ error: 'Reference prompt (refPrompt) is required' });
    }

    console.log('[GenerateBackground] Prompt:', refPrompt.substring(0, 50) + '...');

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
        return res.status(500).json({
            error: 'Server misconfiguration',
            message: 'REPLICATE_API_TOKEN not configured'
        });
    }

    const startTime = Date.now();

    // Bria 권장 해상도 제한
    const MAX_PIXELS = 2000000;

    try {
        console.log('[GenerateBackground] Starting Replicate Bria Background Generation...');

        // 이미지 전처리 함수
        async function preprocessImage(imageData, label) {
            // URL인 경우 그대로 사용 (http:// 또는 https://)
            if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
                console.log(`[GenerateBackground] ${label} is URL, using directly:`, imageData.substring(0, 50) + '...');
                return imageData;
            }

            // base64가 아니면 그대로 반환
            if (!imageData.startsWith('data:')) {
                return imageData;
            }

            const base64Data = imageData.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // 이미지 메타데이터 확인
            const metadata = await sharp(imageBuffer).metadata();
            const totalPixels = metadata.width * metadata.height;

            console.log(`[GenerateBackground] ${label} size: ${metadata.width}x${metadata.height} = ${totalPixels} pixels`);

            // 이미지가 너무 크면 리사이즈
            if (totalPixels > MAX_PIXELS) {
                console.log(`[GenerateBackground] ${label} too large, resizing...`);

                const ratio = Math.sqrt(MAX_PIXELS / totalPixels);
                const newWidth = Math.floor(metadata.width * ratio);
                const newHeight = Math.floor(metadata.height * ratio);

                console.log(`[GenerateBackground] Resizing to: ${newWidth}x${newHeight}`);

                const resizedBuffer = await sharp(imageBuffer)
                    .resize(newWidth, newHeight, { fit: 'inside' })
                    .png()
                    .toBuffer();

                return `data:image/png;base64,${resizedBuffer.toString('base64')}`;
            }

            return imageData;
        }

        // 이미지 전처리
        const processedImage = await preprocessImage(imageInput, 'Image');

        // Replicate API 호출 - prediction 생성
        // Bria Background Generation 모델: bria-ai/bria-background-generator
        const modelInput = {
            image: processedImage,
            ref_prompt: refPrompt,
            refine_prompt: refinePrompt,
            output_format: outputFormat
        };

        // seed가 있으면 추가 (재현성을 위해)
        if (seed !== null) {
            modelInput.seed = seed;
        }

        const createResponse = await fetch('https://api.replicate.com/v1/models/bria-ai/bria-background-generator/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: modelInput
            })
        });

        if (!createResponse.ok) {
            const errData = await createResponse.json();
            throw new Error(errData.detail || 'Replicate API error');
        }

        let prediction = await createResponse.json();
        console.log('[GenerateBackground] Prediction created:', prediction.id);

        // 결과 폴링 (최대 120초)
        const maxWait = 120000;
        const pollInterval = 2000;
        let waited = 0;

        while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
            if (waited >= maxWait) {
                throw new Error('Timeout waiting for result');
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
            waited += pollInterval;

            const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: {
                    'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
                }
            });

            prediction = await pollResponse.json();
            console.log(`[GenerateBackground] Status: ${prediction.status} (${waited}ms)`);
        }

        if (prediction.status === 'failed') {
            throw new Error(prediction.error || 'Background generation failed');
        }

        // 결과 이미지 URL
        const outputUrl = prediction.output;
        console.log('[GenerateBackground] Output URL:', outputUrl);

        // 이미지 다운로드해서 base64로 변환
        const imageResponse = await fetch(outputUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');

        // 이미지 타입 추론
        const contentType = imageResponse.headers.get('content-type') || 'image/png';

        const totalTime = Date.now() - startTime;
        console.log(`[GenerateBackground] Completed in ${totalTime}ms`);

        return res.status(200).json({
            success: true,
            image: `data:${contentType};base64,${base64}`,
            debug: {
                processingTime: totalTime,
                predictionId: prediction.id,
                model: 'bria-ai/bria-background-generator',
                estimatedCost: '$0.04'
            },
            info: {
                workflow: 'auto-remove-and-generate',
                message: '원본 이미지의 배경을 자동으로 제거하고 프롬프트 기반으로 새 배경을 생성합니다.'
            }
        });

    } catch (err) {
        console.error('[GenerateBackground Error]', err);

        await logError(
            err.message?.includes('timeout') ? 'TIMEOUT' : 'GENERAL_ERROR',
            err.message,
            { refPrompt: refPrompt?.substring(0, 100) },
            { stack: err.stack }
        );

        return res.status(500).json({
            error: 'Background generation failed',
            message: err.message,
            friendlyMessage: {
                message: err.message?.includes('timeout')
                    ? '배경 생성에 시간이 오래 걸리고 있어요. 다시 시도해주세요 ⏳'
                    : '배경 생성 중 문제가 발생했어요. 다시 시도해주세요 🔄'
            }
        });
    }
}

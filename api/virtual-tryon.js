/**
 * Vercel Serverless Function - Virtual Try-On
 *
 * Replicate API (IDM-VTON 모델) 사용
 * - 가상 의류 피팅: 인물 사진에 의류 이미지 합성
 * - 카테고리: upper_body, lower_body, dresses
 * - 비용: ~$0.023/장
 * - 에러 로깅: 공통 errorLogger 사용
 * - 최적화: Base64 → Supabase URL로 Replicate 전송 (33% 대역폭 절감)
 * - 비상업적 용도만 허용 (Non-commercial license)
 */

import sharp from 'sharp';
import { logError } from './lib/errorLogger.js';
import { uploadToTemp } from './lib/tempUploader.js';

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
        humanImage,
        garmentImage,
        category = 'upper_body',
        garmentDescription = ''
    } = req.body;

    if (!humanImage) {
        return res.status(400).json({ error: 'Human image is required' });
    }

    if (!garmentImage) {
        return res.status(400).json({ error: 'Garment image is required' });
    }

    // 유효한 카테고리 확인
    const validCategories = ['upper_body', 'lower_body', 'dresses'];
    if (!validCategories.includes(category)) {
        return res.status(400).json({
            error: 'Invalid category',
            message: `Category must be one of: ${validCategories.join(', ')}`
        });
    }

    console.log('[VirtualTryOn] Category:', category);

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
        return res.status(500).json({
            error: 'Server misconfiguration',
            message: 'REPLICATE_API_TOKEN not configured'
        });
    }

    const startTime = Date.now();

    // IDM-VTON 권장 해상도: 3:4 비율, 최대 약 1024x1024 범위
    const MAX_PIXELS = 1500000;

    try {
        console.log('[VirtualTryOn] Starting Replicate IDM-VTON...');

        // 이미지 전처리 함수
        async function preprocessImage(imageData, label) {
            if (!imageData.startsWith('data:')) {
                return imageData;
            }

            const base64Data = imageData.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // 이미지 메타데이터 확인
            const metadata = await sharp(imageBuffer).metadata();
            const totalPixels = metadata.width * metadata.height;

            console.log(`[VirtualTryOn] ${label} size: ${metadata.width}x${metadata.height} = ${totalPixels} pixels`);

            // 이미지가 너무 크면 리사이즈
            if (totalPixels > MAX_PIXELS) {
                console.log(`[VirtualTryOn] ${label} too large, resizing...`);

                const ratio = Math.sqrt(MAX_PIXELS / totalPixels);
                const newWidth = Math.floor(metadata.width * ratio);
                const newHeight = Math.floor(metadata.height * ratio);

                console.log(`[VirtualTryOn] Resizing to: ${newWidth}x${newHeight}`);

                const resizedBuffer = await sharp(imageBuffer)
                    .resize(newWidth, newHeight, { fit: 'inside' })
                    .png()
                    .toBuffer();

                return `data:image/png;base64,${resizedBuffer.toString('base64')}`;
            }

            return imageData;
        }

        // 인물 이미지와 의류 이미지 전처리
        const processedHumanImage = await preprocessImage(humanImage, 'Human');
        const processedGarmentImage = await preprocessImage(garmentImage, 'Garment');

        // Supabase temp에 업로드하여 URL 획득 (대역폭 최적화)
        console.log('[VirtualTryOn] Uploading to temp storage...');
        const [humanUpload, garmentUpload] = await Promise.all([
            uploadToTemp(processedHumanImage, 'tryon-human'),
            uploadToTemp(processedGarmentImage, 'tryon-garment')
        ]);
        console.log('[VirtualTryOn] Uploaded - Human:', humanUpload.url.substring(0, 50) + '...');

        // Replicate API 호출 - URL로 전송 (Base64 대비 33% 절감)
        const modelInput = {
            human_img: humanUpload.url,
            garm_img: garmentUpload.url,
            category: category
        };

        // dresses 카테고리의 경우 dc (dress-condition) 플래그 활성화
        if (category === 'dresses') {
            modelInput.dc = true;
        }

        // 의류 설명이 있으면 추가
        if (garmentDescription) {
            modelInput.garment_des = garmentDescription;
        }

        const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // cuuupid/idm-vton - Virtual Try-On 모델
                version: 'c871bb9b046c4aafccab0d8a6ec4cc6ebf6b7e3d5e9ea7d71ec5c3ea1bb86edc',
                input: modelInput
            })
        });

        if (!createResponse.ok) {
            const errData = await createResponse.json();
            throw new Error(errData.detail || 'Replicate API error');
        }

        let prediction = await createResponse.json();
        console.log('[VirtualTryOn] Prediction created:', prediction.id);

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
                    'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                }
            });

            prediction = await pollResponse.json();
            console.log(`[VirtualTryOn] Status: ${prediction.status} (${waited}ms)`);
        }

        if (prediction.status === 'failed') {
            throw new Error(prediction.error || 'Virtual try-on failed');
        }

        // 결과 이미지 URL
        const outputUrl = prediction.output;
        console.log('[VirtualTryOn] Output URL:', outputUrl);

        // 이미지 다운로드해서 base64로 변환 (클라이언트 호환성 유지)
        const imageResponse = await fetch(outputUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');

        const contentType = imageResponse.headers.get('content-type') || 'image/png';

        const totalTime = Date.now() - startTime;
        console.log(`[VirtualTryOn] Completed in ${totalTime}ms`);

        return res.status(200).json({
            success: true,
            image: `data:${contentType};base64,${base64}`,
            debug: {
                processingTime: totalTime,
                predictionId: prediction.id,
                model: 'cuuupid/idm-vton',
                category: category,
                estimatedCost: '$0.023',
                optimization: 'URL-based upload (33% bandwidth saved)'
            },
            warning: {
                license: 'non-commercial',
                message: '이 모델은 비상업적 용도로만 사용 가능합니다. (Non-commercial use only)',
                details: 'IDM-VTON is licensed for non-commercial use only. Commercial use requires separate licensing.'
            },
            recommendation: {
                aspectRatio: '3:4',
                message: '최상의 결과를 위해 3:4 비율의 인물 사진을 사용하세요.'
            }
        });

    } catch (err) {
        console.error('[VirtualTryOn Error]', err);

        await logError(
            'virtual-tryon',
            err.message?.includes('timeout') ? 'TIMEOUT' : 'GENERAL_ERROR',
            err.message,
            { category },
            { stack: err.stack }
        );

        return res.status(500).json({
            error: 'Virtual try-on failed',
            message: err.message,
            friendlyMessage: {
                message: err.message?.includes('timeout')
                    ? '가상 피팅에 시간이 오래 걸리고 있어요. 다시 시도해주세요.'
                    : '가상 피팅 중 문제가 발생했어요. 다시 시도해주세요.'
            }
        });
    }
}

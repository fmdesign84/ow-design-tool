/**
 * Vercel Serverless Function - Background Removal (Transparent PNG)
 *
 * Replicate API (rembg 모델) 사용
 * - 서버에서 처리, 유저는 아무것도 다운로드 불필요
 * - 진짜 투명 PNG 생성
 * - 비용: ~$0.005/장
 * - 에러 로깅: 공통 errorLogger 사용
 * - 최적화: Base64 → Supabase URL로 Replicate 전송 (33% 대역폭 절감)
 */

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

    const { image, threshold = 0 } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Image is required' });
    }

    console.log('[RemoveBG] Threshold:', threshold);

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
        return res.status(500).json({
            error: 'Server misconfiguration',
            message: 'REPLICATE_API_TOKEN not configured'
        });
    }

    const startTime = Date.now();

    try {
        console.log('[RemoveBG] Starting Replicate rembg...');

        // Supabase temp에 업로드하여 URL 획득 (대역폭 최적화)
        console.log('[RemoveBG] Uploading to temp storage...');
        const imageUpload = await uploadToTemp(image, 'rembg');
        console.log('[RemoveBG] Uploaded:', imageUpload.url.substring(0, 50) + '...');

        // Replicate API 호출 - URL로 전송 (Base64 대비 33% 절감)
        const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // 851-labs/background-remover - 1200만 실행, soft alpha 지원
                version: 'a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
                input: {
                    image: imageUpload.url,
                    threshold: threshold,
                    background_type: 'rgba',
                    format: 'png'
                }
            })
        });

        if (!createResponse.ok) {
            const errData = await createResponse.json();
            throw new Error(errData.detail || 'Replicate API error');
        }

        let prediction = await createResponse.json();
        console.log('[RemoveBG] Prediction created:', prediction.id);

        // 결과 폴링 (최대 55초)
        const maxWait = 55000;
        const pollInterval = 1000;
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
            console.log(`[RemoveBG] Status: ${prediction.status} (${waited}ms)`);
        }

        if (prediction.status === 'failed') {
            throw new Error(prediction.error || 'Background removal failed');
        }

        // 결과 이미지 URL
        const outputUrl = prediction.output;
        console.log('[RemoveBG] Output URL:', outputUrl);

        // 이미지 다운로드해서 base64로 변환 (클라이언트 호환성 유지)
        const imageResponse = await fetch(outputUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');

        const totalTime = Date.now() - startTime;
        console.log(`[RemoveBG] Completed in ${totalTime}ms`);

        return res.status(200).json({
            success: true,
            image: `data:image/png;base64,${base64}`,
            debug: {
                processingTime: totalTime,
                predictionId: prediction.id,
                model: '851-labs/background-remover',
                optimization: 'URL-based upload (33% bandwidth saved)'
            }
        });

    } catch (err) {
        console.error('[RemoveBG Error]', err);

        await logError(
            'remove-background',
            err.message?.includes('timeout') ? 'TIMEOUT' : 'GENERAL_ERROR',
            err.message,
            { threshold },
            { stack: err.stack }
        );

        return res.status(500).json({
            error: 'Background removal failed',
            message: err.message,
            friendlyMessage: {
                message: err.message?.includes('timeout')
                    ? '배경 제거에 시간이 오래 걸리고 있어요. 다시 시도해주세요.'
                    : '배경 제거 중 문제가 발생했어요. 다시 시도해주세요.'
            }
        });
    }
}

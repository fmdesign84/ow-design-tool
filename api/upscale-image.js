/**
 * Vercel Serverless Function - Image Upscale
 *
 * Replicate API (Real-ESRGAN 모델) 사용
 * - 2x, 4x 업스케일 지원
 * - 고품질 이미지 확대
 * - 비용: ~$0.01/장
 * - 에러 로깅: 공통 errorLogger 사용
 * - 최적화: Base64 → Supabase URL로 Replicate 전송 (33% 대역폭 절감)
 * - 큰 이미지는 자동으로 리사이즈 후 업스케일
 */

import sharp from 'sharp';
import { logError } from './lib/errorLogger.js';
import { uploadToTemp } from './lib/tempUploader.js';
import { setupRequest } from './lib/middleware.js';
import { validateUpscaleRequest } from './lib/validators.js';
import { sendSuccess, sendValidationError, sendServerError, ERROR_TYPES } from './lib/responseFormatter.js';

// Body size limit 설정 (기본 4.5MB → 50MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS + OPTIONS + 메서드 검증
  if (setupRequest(req, res, 'POST')) return;

  const { image, scale = 2, faceEnhance = false } = req.body;

  // 입력 검증
  const validationError = validateUpscaleRequest(req.body);
  if (validationError) {
    return sendValidationError(res, validationError);
  }

  console.log('[Upscale] Scale:', scale);

  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  if (!REPLICATE_API_TOKEN) {
    return sendServerError(res, 'REPLICATE_API_TOKEN이 설정되지 않았습니다');
  }

    const startTime = Date.now();

    // GPU 메모리 한계: 약 2,096,704 픽셀 (약 1448x1448)
    const MAX_PIXELS = 2000000;

    try {
        console.log('[Upscale] Starting Replicate Real-ESRGAN...');

        // 이미지 전처리
        let processedImage = image;

        if (image.startsWith('data:')) {
            const base64Data = image.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // 이미지 메타데이터 확인
            const metadata = await sharp(imageBuffer).metadata();
            const totalPixels = metadata.width * metadata.height;

            console.log(`[Upscale] Original size: ${metadata.width}x${metadata.height} = ${totalPixels} pixels`);

            // 이미지가 너무 크면 리사이즈
            if (totalPixels > MAX_PIXELS) {
                console.log(`[Upscale] Image too large, resizing to fit ${MAX_PIXELS} pixels...`);

                const ratio = Math.sqrt(MAX_PIXELS / totalPixels);
                const newWidth = Math.floor(metadata.width * ratio);
                const newHeight = Math.floor(metadata.height * ratio);

                console.log(`[Upscale] Resizing to: ${newWidth}x${newHeight}`);

                const resizedBuffer = await sharp(imageBuffer)
                    .resize(newWidth, newHeight, { fit: 'inside' })
                    .png()
                    .toBuffer();

                processedImage = `data:image/png;base64,${resizedBuffer.toString('base64')}`;
            }
        }

        // Supabase temp에 업로드하여 URL 획득 (대역폭 최적화)
        console.log('[Upscale] Uploading to temp storage...');
        const imageUpload = await uploadToTemp(processedImage, 'upscale');
        console.log('[Upscale] Uploaded:', imageUpload.url.substring(0, 50) + '...');

        // Replicate API 호출 - URL로 전송 (Base64 대비 33% 절감)
        const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // nightmareai/real-esrgan - 고품질 업스케일러
                version: '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
                input: {
                    image: imageUpload.url,
                    scale: scale,
                    face_enhance: faceEnhance
                }
            })
        });

        if (!createResponse.ok) {
            const errData = await createResponse.json();
            throw new Error(errData.detail || 'Replicate API error');
        }

        let prediction = await createResponse.json();
        console.log('[Upscale] Prediction created:', prediction.id);

        // 결과 폴링 (최대 120초 - 4x 업스케일은 시간이 더 걸림)
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
            console.log(`[Upscale] Status: ${prediction.status} (${waited}ms)`);
        }

        if (prediction.status === 'failed') {
            throw new Error(prediction.error || 'Upscale failed');
        }

        // 결과 이미지 URL
        const outputUrl = prediction.output;
        console.log('[Upscale] Output URL:', outputUrl);

        // 이미지 다운로드해서 base64로 변환 (클라이언트 호환성 유지)
        const imageResponse = await fetch(outputUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');

        const contentType = imageResponse.headers.get('content-type') || 'image/png';

        const totalTime = Date.now() - startTime;
        console.log(`[Upscale] Completed in ${totalTime}ms`);

    return sendSuccess(res, {
      image: `data:${contentType};base64,${base64}`,
      debug: {
        processingTime: totalTime,
        predictionId: prediction.id,
        model: 'nightmareai/real-esrgan',
        scale: scale,
        optimization: 'URL-based upload (33% bandwidth saved)',
      },
    });

  } catch (err) {
    console.error('[Upscale Error]', err);

    const errorType = err.message?.includes('timeout') ? 'TIMEOUT' : 'GENERAL_ERROR';

    await logError(
      'upscale-image',
      errorType,
      err.message,
      { scale },
      { stack: err.stack }
    );

    const friendlyMessage = err.message?.includes('timeout')
      ? '이미지 확대에 시간이 오래 걸리고 있어요. 다시 시도해주세요.'
      : '이미지 확대 중 문제가 발생했어요. 다시 시도해주세요.';

    return sendServerError(res, friendlyMessage, { originalError: err.message });
  }
}

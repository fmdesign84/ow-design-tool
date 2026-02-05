/**
 * Vercel Serverless Function - Image Outpainting
 *
 * Gemini 2.5 Flash Image를 사용해 이미지를 확장 (아웃페인팅)
 * - 비디오용 비율 맞춤 (1:1 → 16:9 등)
 * - 사용자가 원하는 비율로 확장
 */

const { GoogleAuth } = require('google-auth-library');

module.exports.config = {
    maxDuration: 60,
};

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

    const { image, targetRatio = '16:9', prompt = '' } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Image is required' });
    }

    console.log(`[Outpaint] Starting with targetRatio: ${targetRatio}`);

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

        // base64 데이터 추출
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        // MIME 타입 추출
        const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        // 타겟 비율에 따른 프롬프트 생성
        const ratioDesc = targetRatio === '16:9' ? 'wide landscape (16:9)' : 'tall portrait (9:16)';

        const outpaintPrompt = prompt ||
            `Expand this image to ${ratioDesc} aspect ratio. Seamlessly extend the background and scene beyond the original borders while maintaining the same style, lighting, colors, and atmosphere. The extended areas should blend naturally with the original content. Keep the main subject intact in the center.`;

        console.log(`[Outpaint] Prompt: ${outpaintPrompt.substring(0, 100)}...`);

        // Gemini 2.5 Flash Image 모델 호출 (Vertex AI)
        const geminiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.0-flash-exp:generateContent`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Data
                                }
                            },
                            {
                                text: outpaintPrompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                    responseModalities: ['TEXT', 'IMAGE']
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Outpaint] Gemini error:', errText);

            // Imagen 4로 폴백 시도
            console.log('[Outpaint] Trying Imagen 4 fallback...');

            const imagenUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-4.0-generate-001:predict`;

            const imagenResponse = await fetch(imagenUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instances: [
                        {
                            prompt: `Based on this reference image, create a new ${ratioDesc} image that extends the scene naturally. ${prompt || 'Maintain the same style and atmosphere.'}`,
                            referenceImages: [
                                {
                                    referenceType: 1,
                                    referenceId: 0,
                                    referenceImage: {
                                        bytesBase64Encoded: base64Data
                                    }
                                }
                            ]
                        }
                    ],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: targetRatio,
                        outputOptions: {
                            mimeType: 'image/jpeg'
                        }
                    }
                })
            });

            if (!imagenResponse.ok) {
                const imagenErr = await imagenResponse.text();
                console.error('[Outpaint] Imagen fallback error:', imagenErr);
                throw new Error('Both Gemini and Imagen failed');
            }

            const imagenData = await imagenResponse.json();
            const predictions = imagenData.predictions;

            if (!predictions || predictions.length === 0) {
                throw new Error('No image generated from Imagen');
            }

            const generatedImage = predictions[0].bytesBase64Encoded;
            const outputImage = `data:image/jpeg;base64,${generatedImage}`;

            console.log('[Outpaint] Success via Imagen fallback');

            return res.status(200).json({
                success: true,
                image: outputImage,
                method: 'imagen-4',
                targetRatio
            });
        }

        const data = await response.json();
        console.log('[Outpaint] Gemini response received');

        // Gemini 응답에서 이미지 추출
        const candidates = data.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error('No candidates in response');
        }

        const parts = candidates[0].content?.parts;
        if (!parts) {
            throw new Error('No parts in response');
        }

        // 이미지 파트 찾기
        let generatedImage = null;
        for (const part of parts) {
            if (part.inlineData) {
                generatedImage = part.inlineData.data;
                break;
            }
        }

        if (!generatedImage) {
            // 텍스트 응답만 있는 경우 (이미지 생성 실패)
            const textResponse = parts.find(p => p.text)?.text || 'Unknown error';
            console.error('[Outpaint] No image in response:', textResponse);
            throw new Error(`Image generation failed: ${textResponse.substring(0, 100)}`);
        }

        // 응답에서 실제 MIME 타입 추출
        let outputMimeType = 'image/png';
        for (const part of parts) {
            if (part.inlineData && part.inlineData.mimeType) {
                outputMimeType = part.inlineData.mimeType;
                break;
            }
        }
        const outputImage = `data:${outputMimeType};base64,${generatedImage}`;

        console.log('[Outpaint] Success via Gemini');

        return res.status(200).json({
            success: true,
            image: outputImage,
            method: 'gemini-2.0-flash',
            targetRatio
        });

    } catch (error) {
        console.error('[Outpaint] Error:', error);
        return res.status(500).json({
            error: error.message,
            friendlyMessage: '이미지 확장 중 문제가 발생했어요. 다시 시도해주세요.'
        });
    }
};

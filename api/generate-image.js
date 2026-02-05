const { GoogleAuth } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

/**
 * 에러 로깅 함수 - Supabase에 에러 기록
 */
async function logError(errorType, errorMessage, requestData, responseData = null) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('[Error Logger] Supabase credentials missing');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from('error_logs').insert({
            service: 'generate-image',
            error_type: errorType,
            error_message: errorMessage,
            request_data: requestData,
            response_data: responseData,
            resolved: false
        });

        if (error) {
            console.error('[Error Logger] Failed to log:', error.message);
        } else {
            console.log(`[Error Logger] Logged: ${errorType} - ${errorMessage.substring(0, 50)}...`);
        }
    } catch (e) {
        console.error('[Error Logger] Exception:', e.message);
    }
}

/**
 * Vercel Serverless Function - AI Image Generation Pipeline v2
 *
 * 개선된 파이프라인 (v2):
 * - 4개 Gemini 콜 → 1개로 통합 (속도 4배↑)
 * - 한국 문화 맥락 자동 변환 (아이돌→K-pop idol)
 * - 스타일 자동 감지 (Photorealistic vs Digital Art)
 * - Negative prompt 자동 생성
 * - Flash 커뮤니케이터: 에러/폴백 시 친화적 메시지 생성
 */

/**
 * Flash 커뮤니케이터 - 에러/폴백 상황을 사용자 친화적으로 설명
 */
async function generateFriendlyMessage(context, token, projectId) {
    const { errorType, errorMessage, prompt, isFallback, fallbackModel } = context;

    const location = 'us-central1';
    const systemPrompt = `당신은 AI 이미지 생성 서비스의 친절한 안내원입니다.
사용자에게 상황을 부드럽고 이해하기 쉽게 설명해주세요.
응답은 한국어로, 1-2문장으로 간결하게 작성하세요.
이모지를 적절히 사용해도 좋습니다.

상황:
- 에러 유형: ${errorType}
- 에러 메시지: ${errorMessage}
- 사용자 프롬프트: "${prompt}"
- 폴백 여부: ${isFallback ? '예' : '아니오'}
- 폴백 모델: ${fallbackModel || '없음'}

다음 가이드라인을 따르세요:
1. 안전 정책 위반 → "요청하신 이미지가 안전 정책에 맞지 않아 생성이 어려워요. 조금 다른 표현으로 시도해보시겠어요?"
2. 폴백 발생 → "기본 모델이 바빠서 다른 방식으로 생성했어요. 결과가 살짝 다를 수 있어요 ✨"
3. 일시적 오류 → "잠시 서버가 바빴어요. 다시 시도해주세요!"
4. 알 수 없는 오류 → "예상치 못한 문제가 생겼어요. 잠시 후 다시 시도해주세요."

JSON 형식으로 응답: {"message": "친화적 메시지", "suggestion": "추가 제안(선택)"}`;

    try {
        const geminiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-3-flash-preview:generateContent`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                    responseMimeType: 'application/json'
                }
            })
        });

        if (!response.ok) {
            console.log('[Flash Communicator] API failed, using default message');
            return getDefaultMessage(context);
        }

        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (result) {
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log('[Flash Communicator] Generated:', parsed.message);
                return parsed;
            }
        }
    } catch (e) {
        console.log('[Flash Communicator] Error:', e.message);
    }

    return getDefaultMessage(context);
}

/**
 * 기본 메시지 (Flash 실패 시)
 */
function getDefaultMessage(context) {
    const { isFallback, errorType } = context;

    if (isFallback) {
        return {
            message: "기본 모델이 바빠서 다른 방식으로 생성했어요 ✨",
            suggestion: null
        };
    }

    if (errorType?.includes('SAFETY') || errorType?.includes('BLOCKED')) {
        return {
            message: "요청하신 이미지가 안전 정책에 맞지 않아 생성이 어려워요 🙏",
            suggestion: "조금 다른 표현으로 시도해보시겠어요?"
        };
    }

    return {
        message: "잠시 문제가 생겼어요. 다시 시도해주세요!",
        suggestion: null
    };
}

// Vercel Hobby: 최대 60초, Pro: 최대 300초
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

    const { prompt, aspectRatio = '1:1', mode = 'pipeline', negativePrompt: userNegativePrompt, model = 'imagen4', stylePreset = 'auto', quality = 'standard', referenceImage, referenceImages } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const startTime = Date.now();

    try {
        const projectId = process.env.GOOGLE_PROJECT_ID;
        const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        const location = 'us-central1';

        // Debug logging
        console.log('[DEBUG] projectId exists:', !!projectId);
        console.log('[DEBUG] credentialsJson exists:', !!credentialsJson);
        console.log('[DEBUG] projectId value:', projectId ? projectId.substring(0, 20) : 'undefined');

        if (!projectId || !credentialsJson) {
            throw new Error('Server misconfiguration: Missing Google Credentials');
        }

        // Authenticate
        const auth = new GoogleAuth({
            credentials: JSON.parse(credentialsJson),
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const token = accessToken.token;

        // =================================================================
        // FEW-SHOT SYSTEM PROMPT (Flash 최적화 + 품질 유지)
        // =================================================================
        const FEW_SHOT_SYSTEM_PROMPT = `You are an image prompt engineer. Convert Korean/English input into detailed Imagen prompts.

## RULES:
1. Detect style: Photorealistic (people/photos) vs Digital Art (illustrations/fantasy)
2. Korean terms: 아이돌→K-pop idol, 오빠→Korean male, 언니→Korean female, 웹툰→webtoon style
3. K-pop groups/terms: Treat abbreviated names (케데헌, 뉴진스, 에스파, 블핑 etc.) as K-pop idol groups
4. For people: Add "highly detailed skin, visible pores, shot on Sony A7R IV, 85mm lens, 8K"
5. Output JSON only

## EXAMPLES:

Input: "무대 위 아이돌"
Output: {"detected_style":"Photorealistic","reasoning":"아이돌 = K-pop idol photo","positive_prompt":"K-pop idol performing on stage, highly detailed realistic face, korean beauty standards, flawless skin with visible pores, professional stage makeup, vibrant stage lighting, shot on Sony A7R IV, 85mm lens, 8K resolution, sharp focus","negative_prompt":"cartoon, 3d render, CGI, plastic skin, anime, blurry, bad anatomy"}

Input: "오렌지 장미를 든 여자 아이돌"
Output: {"detected_style":"Photorealistic","reasoning":"여자 아이돌 = female K-pop idol","positive_prompt":"Beautiful female K-pop idol holding vibrant orange roses, highly detailed realistic face, korean beauty standards, flawless skin with visible pores, professional makeup, soft studio lighting, bokeh background, shot on Canon EOS R5, 85mm lens, f/1.8, 8K resolution","negative_prompt":"cartoon, 3d render, CGI, plastic skin, doll-like, anime, drawing, illustration, blurry, distorted hands, deformed face"}

Input: "핑크색 바나나"
Output: {"detected_style":"Digital Art","reasoning":"Surreal object, artistic style","positive_prompt":"Vibrant pink banana, surreal artistic style, soft gradient pastel background, centered composition, studio lighting, high detail, clean aesthetic","negative_prompt":"photorealistic, blurry, low quality, watermark, text"}

Input: "웹툰 스타일 고양이"
Output: {"detected_style":"Digital Art","reasoning":"웹툰 = Korean webtoon style","positive_prompt":"Cute cat in Korean webtoon style, clean bold line art, vibrant colors, expressive eyes, simple background, manhwa aesthetic","negative_prompt":"photorealistic, 3d render, blurry, realistic fur texture"}

Input: "우주에서 피자 먹는 우주인"
Output: {"detected_style":"Photorealistic","reasoning":"우주인 = astronaut, real scenario","positive_prompt":"Astronaut eating pizza in space, detailed spacesuit, Earth visible through window, floating pizza slices, cinematic lighting, NASA style photography, highly detailed, 8K resolution","negative_prompt":"cartoon, anime, low quality, blurry"}

Input: "케데헌 컨셉의 여자 아이돌"
Output: {"detected_style":"Photorealistic","reasoning":"케데헌 = K-pop Demon Hunters concept, dark fantasy idol aesthetic","positive_prompt":"Female K-pop idol in dark fantasy demon hunter concept, gothic black and red outfit, dramatic makeup with smoky eyes, mystical atmosphere, professional K-pop photoshoot, highly detailed realistic face, korean beauty standards, cinematic lighting, shot on Sony A7R IV, 85mm lens, 8K resolution","negative_prompt":"cartoon, 3d render, CGI, plastic skin, anime, blurry, bad anatomy"}`;

        // =================================================================
        // STEP 1: Gemini Flash 프롬프트 변환 (Gemini 3 Pro 직접 모드일 때는 스킵)
        // =================================================================
        console.log(`[Pipeline v2] Processing: "${prompt}"`);

        let geminiModelUsed = 'unknown';
        let geminiTime = 0;
        let parsedResult;

        // 스타일 프리셋 → 표시명 & 프롬프트 힌트 매핑
        const STYLE_MAP = {
            auto: { display: 'Auto', hint: '' },
            photo: { display: 'Photorealistic', hint: 'photorealistic style, highly detailed, sharp focus, ' },
            illustration: { display: 'Digital Art', hint: 'digital illustration style, clean vector art, ' },
            oil: { display: 'Oil Painting', hint: 'oil painting style, visible brush strokes, classical art, ' },
            watercolor: { display: 'Watercolor', hint: 'watercolor painting style, soft edges, fluid colors, ' },
            '3d': { display: '3D Render', hint: '3D rendered style, cinematic lighting, octane render, ' }
        };

        // 품질 설정 매핑
        const QUALITY_MAP = {
            fast: {
                display: '빠르게',
                imagenHint: '',
                geminiImageSize: '1K'
            },
            standard: {
                display: '표준',
                imagenHint: 'high quality, detailed, ',
                geminiImageSize: '1K' // 2K→1K (타임아웃 방지)
            },
            hd: {
                display: '고품질',
                imagenHint: '8K resolution, ultra high quality, extremely detailed, masterpiece, ',
                geminiImageSize: '2K' // 4K→2K (타임아웃 방지)
            }
        };

        const qualityInfo = QUALITY_MAP[quality] || QUALITY_MAP.standard;
        console.log(`[Quality] ${qualityInfo.display} (${quality})`);

        // Gemini 3 Pro 직접 모드: 한글 프롬프트를 바로 사용 (2-3초 절약)
        // Gemini 3 Flash: 오케스트레이션 모드 (Flash 변환 후 Pro로 그림)
        if (model === 'gemini3pro') {
            const styleInfo = STYLE_MAP[stylePreset] || STYLE_MAP.auto;
            console.log(`[Direct Mode] Gemini 3 Pro에 직접 전송, 스타일: ${styleInfo.display}, 품질: ${qualityInfo.display}`);
            geminiModelUsed = 'direct (skipped)';

            // 품질 + 스타일 힌트를 프롬프트 앞에 추가
            const qualityHint = qualityInfo.imagenHint || '';
            const styleHint = stylePreset !== 'auto' ? styleInfo.hint : '';
            const enhancedPrompt = `${qualityHint}${styleHint}${prompt}`;

            parsedResult = {
                detected_style: styleInfo.display,
                reasoning: `Gemini 3 Pro 직접 모드 - 스타일: ${styleInfo.display}, 품질: ${qualityInfo.display}`,
                positive_prompt: enhancedPrompt,
                negative_prompt: userNegativePrompt || ''
            };
        } else {
            // Imagen 모델용: Gemini Flash로 프롬프트 변환
            async function callGeminiOneShot(userInput) {
                const geminiModels = [
                    { id: 'gemini-2.5-flash' },        // 최신 GA
                    { id: 'gemini-2.5-flash-lite' }    // 빠른 대안
                ];

                const body = {
                    contents: [{
                        role: 'user',
                        parts: [{ text: `${FEW_SHOT_SYSTEM_PROMPT}\n\nInput: "${userInput}"\nOutput:` }]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 512,
                        responseMimeType: 'application/json'
                    }
                };

                for (const m of geminiModels) {
                    try {
                        const geminiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${m.id}:generateContent`;
                        console.log(`[Gemini] Trying ${m.id}...`);

                        const response = await fetch(geminiUrl, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        });

                        if (!response.ok) {
                            const errText = await response.text();
                            console.log(`[Gemini] ${m.id} failed (${response.status}): ${errText.substring(0, 200)}`);
                            continue;
                        }

                        const data = await response.json();
                        const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
                        console.log(`[Gemini] ${m.id} response: ${result.substring(0, 200)}`);

                        if (result) {
                            geminiModelUsed = m.id;
                            console.log(`[Gemini] Success with ${m.id}`);
                            return result;
                        }
                    } catch (err) {
                        console.log(`[Gemini] ${m.id} error: ${err.message}`);
                        continue;
                    }
                }
                throw new Error('All Gemini models failed');
            }

            const geminiStartTime = Date.now();
            const geminiResponse = await callGeminiOneShot(prompt);
            geminiTime = Date.now() - geminiStartTime;
            console.log(`[Gemini] Completed in ${geminiTime}ms`);

            // Parse Gemini JSON response
            try {
                const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
                parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
            } catch (e) {
                console.error('[Parse Error]', e.message);
                parsedResult = null;
            }
        }

        // 키워드 기반 스타일 감지 (폴백용)
        function detectStyleByKeywords(text) {
            const digitalArtKeywords = ['웹툰', '만화', '일러스트', '애니', '캐릭터', '그림', '카툰', '픽셀', '게임', '판타지'];
            const photoKeywords = ['아이돌', '사진', '인물', '실사', '포토', '셀카', '모델', '연예인', '배우', '가수', '케데헌', '뉴진스', '에스파', '블핑'];

            const lowerText = text.toLowerCase();

            for (const keyword of photoKeywords) {
                if (text.includes(keyword) || lowerText.includes(keyword.toLowerCase())) {
                    return 'Photorealistic';
                }
            }
            for (const keyword of digitalArtKeywords) {
                if (text.includes(keyword) || lowerText.includes(keyword.toLowerCase())) {
                    return 'Digital Art';
                }
            }
            return 'Digital Art'; // 기본값
        }

        if (!parsedResult || !parsedResult.positive_prompt) {
            // Fallback: Use original prompt with keyword-based style
            const fallbackStyle = detectStyleByKeywords(prompt);
            console.log(`[Fallback] Using original prompt, detected style: ${fallbackStyle}`);
            parsedResult = {
                detected_style: fallbackStyle,
                reasoning: `Keyword-based detection from: "${prompt}"`,
                positive_prompt: prompt,
                negative_prompt: fallbackStyle === 'Photorealistic'
                    ? 'cartoon, 3d render, CGI, plastic skin, anime, blurry, bad anatomy'
                    : 'photorealistic, blurry, low quality, watermark, text'
            };
        }

        // 사용자 네거티브 프롬프트가 있으면 병합
        const finalNegativePrompt = userNegativePrompt
            ? `${userNegativePrompt}, ${parsedResult.negative_prompt}`
            : parsedResult.negative_prompt;

        console.log(`[Result] Style: ${parsedResult.detected_style}`);
        console.log(`[Result] Prompt: ${parsedResult.positive_prompt.substring(0, 100)}...`);
        console.log(`[Result] Negative: ${finalNegativePrompt}`);

        // =================================================================
        // STEP 2: Image Generation
        // =================================================================
        // Gemini 3 Flash: 오케스트레이션 결과 사용
        // Gemini 3 Pro: 직접 모드 결과 사용
        const isGeminiFamily = model === 'gemini3pro' || model === 'gemini3flash';

        let imageBase64;
        let usedImagenModel;
        let geminiError = null;  // Gemini 3 Pro 실패 시 에러 저장
        let tokenUsage = null;   // Gemini API 토큰 사용량
        let friendlyMessage = null; // Flash 커뮤니케이터 메시지
        const imagenStartTime = Date.now();

        // 타임아웃 헬퍼 함수
        function fetchWithTimeout(url, options, timeoutMs = 50000) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            return fetch(url, { ...options, signal: controller.signal })
                .finally(() => clearTimeout(timeoutId));
        }

        // Imagen 모델 호출 함수 (공통)
        async function callImagen(modelId, imagePromptText, negativePrompt, ratio, options = {}) {
            const predictUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`;

            // Imagen 4 최적 파라미터
            const parameters = {
                sampleCount: options.sampleCount || 1,
                aspectRatio: ratio,
                negativePrompt: negativePrompt || undefined,
                // 프롬프트 자동 개선 (Imagen 4)
                enhancePrompt: options.enhancePrompt !== false,
                // SynthID 워터마크 (Imagen 4)
                addWatermark: options.addWatermark !== false,
                // 안전 필터 (block_some = 균형)
                safetySettings: options.safetySettings || 'block_some'
            };

            // seed가 있으면 재현 가능한 결과
            if (options.seed) {
                parameters.seed = options.seed;
            }

            const requestBody = {
                instances: [{ prompt: imagePromptText }],
                parameters
            };

            const response = await fetchWithTimeout(predictUrl, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }, 50000);

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`${modelId} failed (${response.status}): ${errText}`);
            }

            const data = await response.json();
            if (!data.predictions || data.predictions.length === 0) {
                throw new Error(`${modelId} returned no predictions`);
            }

            return data.predictions[0].bytesBase64Encoded || data.predictions[0];
        }

        // Gemini 3 Pro Image 모델 사용 (Flash 오케스트레이션 포함)
        if (isGeminiFamily) {
            console.log(`[Gemini 3 Pro Image] Generating image...`);

            async function callGemini3ProImage(imagePromptText, ratio, imageSize, refImages = []) {
                // Gemini API 엔드포인트 (Vertex AI 대신 더 안정적)
                const geminiApiKey = process.env.GEMINI_API_KEY;

                console.log(`[Gemini API] API Key exists: ${!!geminiApiKey}, Key preview: ${geminiApiKey ? geminiApiKey.substring(0, 10) + '...' : 'undefined'}`);

                if (!geminiApiKey) {
                    throw new Error('GEMINI_API_KEY environment variable is not set');
                }

                // Gemini 3 Pro Image (Nano Banana Pro)
                const gemini3Url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`;

                const refCount = refImages.length;
                console.log(`[Gemini 3 Pro] Ratio: ${ratio}, Size: ${imageSize}, RefImages: ${refCount}, Prompt: ${imagePromptText.substring(0, 100)}...`);

                // parts 배열 구성 - 참고 이미지들이 있으면 포함 (최대 5장)
                const parts = [{ text: imagePromptText }];

                // 다중 이미지 지원 (최대 5장 - Gemini 3 Pro 제한)
                const imagesToProcess = refImages.slice(0, 5);
                for (let i = 0; i < imagesToProcess.length; i++) {
                    const refImage = imagesToProcess[i];
                    // data:image/png;base64,... 형식에서 base64 데이터만 추출
                    let imageData = refImage;
                    let mimeType = 'image/png';

                    if (refImage.startsWith('data:')) {
                        const matches = refImage.match(/^data:([^;]+);base64,(.+)$/);
                        if (matches) {
                            mimeType = matches[1];
                            imageData = matches[2];
                        }
                    }

                    parts.push({
                        inline_data: {
                            mime_type: mimeType,
                            data: imageData
                        }
                    });
                }

                if (refCount > 0) {
                    console.log(`[Gemini 3 Pro] ${imagesToProcess.length} reference image(s) added for identity preservation`);
                }

                // Gemini 3 Pro API 구조 (aspectRatio, imageSize 지원)
                const requestBody = {
                    contents: [{
                        parts: parts
                    }],
                    generationConfig: {
                        responseModalities: ['TEXT', 'IMAGE'],
                        imageConfig: {
                            aspectRatio: ratio,
                            imageSize: imageSize
                        }
                    }
                };

                console.log('[Gemini API] Request:', JSON.stringify(requestBody, null, 2));
                const response = await fetchWithTimeout(gemini3Url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                }, 45000); // 45초 타임아웃 (더 여유있게)

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`Gemini API failed (${response.status}): ${errText}`);
                }

                // Rate limit 헤더 추출
                const rateLimitHeaders = {
                    remainingTokens: response.headers.get('x-ratelimit-remaining-tokens'),
                    remainingRequests: response.headers.get('x-ratelimit-remaining-requests'),
                    limitTokens: response.headers.get('x-ratelimit-limit-tokens'),
                    limitRequests: response.headers.get('x-ratelimit-limit-requests'),
                };
                console.log('[Gemini API] Rate limit headers:', rateLimitHeaders);

                const data = await response.json();
                console.log('[Gemini Image] Response received');

                // usageMetadata 추출
                const usageMetadata = data.usageMetadata || null;
                console.log('[Gemini API] Usage metadata:', usageMetadata);

                // 응답에서 이미지 추출
                const candidates = data.candidates || [];
                for (const candidate of candidates) {
                    const parts = candidate.content?.parts || [];
                    for (const part of parts) {
                        if (part.inlineData?.mimeType?.startsWith('image/')) {
                            return {
                                imageData: part.inlineData.data,
                                usageMetadata,
                                rateLimitHeaders
                            };
                        }
                    }
                }
                throw new Error('No image found in Gemini response');
            }

            // 재시도 없이 1회 시도 후 즉시 폴백 (서비스 안정성)
            let geminiApiKeyExists = false;

            // 다중 이미지 지원: referenceImages가 있으면 사용, 없으면 referenceImage를 배열로 변환
            const refImageList = referenceImages || (referenceImage ? [referenceImage] : []);
            const hasReferenceImages = refImageList.length > 0;

            try {
                geminiApiKeyExists = !!process.env.GEMINI_API_KEY;
                console.log(`[Gemini 3 Pro Image] Trying once (45s timeout)... API key exists: ${geminiApiKeyExists}, RefImages: ${refImageList.length}`);
                const geminiResult = await callGemini3ProImage(parsedResult.positive_prompt, aspectRatio, qualityInfo.geminiImageSize, refImageList);
                imageBase64 = geminiResult.imageData;
                tokenUsage = {
                    ...geminiResult.usageMetadata,
                    ...geminiResult.rateLimitHeaders
                };
                const modelName = model === 'gemini3flash' ? 'Gemini 3 Flash (Orchestrated)' : 'Gemini 3 Pro Image';
                const modeStr = refImageList.length > 1 ? `multi-ref(${refImageList.length})` : (hasReferenceImages ? 'img2img' : 'text2img');
                usedImagenModel = hasReferenceImages ? `${modelName} (${modeStr})` : modelName;
                console.log(`[Gemini 3 Pro Image] SUCCESS! Image generated. Mode: ${modeStr}`);
                console.log(`[Token Usage]`, tokenUsage);
            } catch (err) {
                geminiError = err;
                geminiError.apiKeyExists = geminiApiKeyExists;
                console.error(`[Gemini 3 Pro Image] FAILED: ${err.message}`);
                console.error(`[Gemini 3 Pro Image] API Key exists: ${geminiApiKeyExists}, RefImages: ${refImageList.length}`);

                // 에러 로깅
                await logError(
                    'GEMINI_API_ERROR',
                    err.message,
                    { prompt, aspectRatio, quality, model: 'gemini3pro', apiKeyExists: geminiApiKeyExists, refImageCount: refImageList.length },
                    { stack: err.stack }
                );
            }

            // Gemini 실패 시 즉시 Imagen 4로 폴백
            if (geminiError) {
                console.log(`[Failover] Switching to Imagen 4 immediately...`);
                // Gemini 3 Pro 실패 시 Imagen 4로 폴백 (프롬프트 변환 필요)
                console.log(`[Fallback] Converting prompt with Gemini Flash then trying Imagen 4...`);

                // 폴백용 Gemini Flash 프롬프트 변환
                async function convertPromptForImagen(userInput) {
                    const geminiModels = [
                        { id: 'gemini-2.5-flash' },        // 최신 GA
                        { id: 'gemini-2.5-flash-lite' }    // 빠른 대안
                    ];

                    const body = {
                        contents: [{
                            role: 'user',
                            parts: [{ text: `${FEW_SHOT_SYSTEM_PROMPT}\n\nInput: "${userInput}"\nOutput:` }]
                        }],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 512,
                            responseMimeType: 'application/json'
                        }
                    };

                    for (const m of geminiModels) {
                        try {
                            const geminiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${m.id}:generateContent`;
                            const response = await fetch(geminiUrl, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify(body)
                            });

                            if (!response.ok) continue;

                            const data = await response.json();
                            const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
                            if (result) {
                                const jsonMatch = result.match(/\{[\s\S]*\}/);
                                if (jsonMatch) {
                                    const parsed = JSON.parse(jsonMatch[0]);
                                    console.log(`[Fallback] Prompt converted: ${parsed.positive_prompt?.substring(0, 80)}...`);
                                    return parsed;
                                }
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    // 변환 실패 시 원본 사용
                    return { positive_prompt: userInput, negative_prompt: '' };
                }

                try {
                    const convertedPrompt = await convertPromptForImagen(prompt);
                    imageBase64 = await callImagen(
                        'imagen-4.0-generate-001',
                        convertedPrompt.positive_prompt,
                        convertedPrompt.negative_prompt || finalNegativePrompt,
                        aspectRatio
                    );
                    usedImagenModel = 'Imagen 4 (Fallback)';
                    geminiModelUsed = 'gemini-2.5-flash (fallback conversion)';

                    // Flash 커뮤니케이터: 폴백 상황 설명 메시지 생성
                    friendlyMessage = await generateFriendlyMessage({
                        errorType: 'FALLBACK',
                        errorMessage: geminiError?.message || 'Gemini model unavailable',
                        prompt,
                        isFallback: true,
                        fallbackModel: 'Imagen 4'
                    }, token, projectId);
                } catch (fallbackErr) {
                    console.log(`[Imagen 4 Fallback] Failed: ${fallbackErr.message}`);

                    // 폴백 실패도 로깅
                    await logError(
                        'IMAGEN_FALLBACK_ERROR',
                        fallbackErr.message,
                        { prompt, aspectRatio, quality, originalError: geminiError.message },
                        { stack: fallbackErr.stack }
                    );

                    throw new Error(`All models failed. Gemini: ${geminiError.message}, Imagen: ${fallbackErr.message}`);
                }
            }
        } else {
            // Imagen 4 사용 (기본)
            console.log(`[Imagen] Generating image...`);

            // Imagen 4 → Imagen 3 폴백
            const imagenModels = [
                { id: 'imagen-4.0-generate-001', name: 'Imagen 4' },
                { id: 'imagen-3.0-generate-001', name: 'Imagen 3' }
            ];

            // 품질 힌트를 프롬프트에 추가
            const imagenPrompt = qualityInfo.imagenHint
                ? `${qualityInfo.imagenHint}${parsedResult.positive_prompt}`
                : parsedResult.positive_prompt;

            for (const m of imagenModels) {
                try {
                    console.log(`[Imagen] Trying ${m.name} with ratio ${aspectRatio}, quality: ${qualityInfo.display}...`);
                    imageBase64 = await callImagen(
                        m.id,
                        imagenPrompt,
                        finalNegativePrompt,
                        aspectRatio
                    );
                    usedImagenModel = m.name;
                    break;
                } catch (err) {
                    console.log(`[Imagen] ${m.name} failed: ${err.message}`);
                    // Imagen 개별 모델 실패 로깅
                    await logError(
                        'IMAGEN_MODEL_ERROR',
                        `${m.name}: ${err.message}`,
                        { prompt, aspectRatio, quality, model: m.id },
                        { stack: err.stack }
                    );
                    continue;
                }
            }

            if (!imageBase64) {
                await logError(
                    'ALL_IMAGEN_FAILED',
                    'All Imagen models failed',
                    { prompt, aspectRatio, quality },
                    null
                );
                throw new Error('All Imagen models failed');
            }
        }

        const imagenTime = Date.now() - imagenStartTime;
        console.log(`[Image Gen] Completed in ${imagenTime}ms using ${usedImagenModel}`);

        const totalTime = Date.now() - startTime;
        console.log(`[Pipeline v2] Total time: ${totalTime}ms (Gemini: ${geminiTime}ms, Imagen: ${imagenTime}ms)`);

        // =================================================================
        // Response
        // =================================================================
        // Gemini 3 Pro 선택 시 폴백 에러 정보 포함
        // 다중 이미지 카운트 계산
        const totalRefImages = referenceImages?.length || (referenceImage ? 1 : 0);

        const debugInfo = {
            originalPrompt: prompt,
            aspectRatio: aspectRatio,
            quality: qualityInfo.display,
            detectedStyle: parsedResult.detected_style,
            reasoning: parsedResult.reasoning,
            finalPrompt: parsedResult.positive_prompt,
            negativePrompt: finalNegativePrompt,
            geminiModel: geminiModelUsed,
            imagenModel: usedImagenModel,
            mode: totalRefImages > 1 ? 'multi-reference' : (totalRefImages === 1 ? 'image-to-image' : 'text-to-image'),
            referenceImageCount: totalRefImages,
            timing: {
                gemini: `${geminiTime}ms`,
                imagen: `${imagenTime}ms`,
                total: `${totalTime}ms`
            }
        };

        // Gemini 3 Pro / Flash 선택 시 폴백 에러 정보 포함
        if (isGeminiFamily && usedImagenModel && usedImagenModel.includes('Fallback')) {
            debugInfo.geminiError = geminiError ? {
                message: geminiError.message,
                apiKeyExists: geminiError.apiKeyExists
            } : null;
        }

        // ========== Supabase에 직접 저장 (4.5MB 제한 우회) ==========
        let savedImage = null;
        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );

            // Base64 → Buffer
            const buffer = Buffer.from(imageBase64, 'base64');
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

            // Storage에 업로드
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('generated-images')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    cacheControl: '3600'
                });

            if (uploadError) {
                console.error('[Supabase] Storage upload error:', uploadError);
            } else {
                // Public URL 가져오기
                const { data: { publicUrl } } = supabase.storage
                    .from('generated-images')
                    .getPublicUrl(fileName);

                // DB에 메타데이터 저장
                const { data: dbData, error: dbError } = await supabase
                    .from('images')
                    .insert({
                        image_url: publicUrl,
                        prompt: prompt,
                        model: usedImagenModel || model,
                        style: debugInfo.detectedStyle || stylePreset,
                        aspect_ratio: aspectRatio,
                        quality: quality
                    })
                    .select()
                    .single();

                if (dbError) {
                    console.error('[Supabase] DB insert error:', dbError);
                } else {
                    savedImage = dbData;
                    console.log('[Supabase] Image saved successfully:', savedImage.id);
                }
            }
        } catch (supabaseErr) {
            console.error('[Supabase] Error:', supabaseErr);
        }

        res.status(200).json({
            image: savedImage ? savedImage.image_url : `data:image/png;base64,${imageBase64}`,
            savedImage: savedImage,
            debug: debugInfo,
            tokenUsage: tokenUsage,
            friendlyMessage: friendlyMessage // 폴백 시에만 값이 있음
        });

    } catch (error) {
        console.error('Generate Image Error:', error);

        // 일반 에러 로깅
        await logError(
            'GENERAL_ERROR',
            error.message || 'Unknown error',
            { prompt: req.body?.prompt, aspectRatio: req.body?.aspectRatio, quality: req.body?.quality, model: req.body?.model },
            { stack: error.stack }
        );

        // 에러 유형에 따른 친화적 메시지
        const errorMessage = error.message || '';
        const friendlyError = getDefaultMessage({
            errorType: errorMessage.includes('SAFETY') || errorMessage.includes('blocked') ? 'SAFETY_BLOCKED' : 'GENERAL_ERROR',
            isFallback: false
        });

        res.status(500).json({
            error: error.message || 'Internal Server Error',
            friendlyMessage: friendlyError
        });
    }
};

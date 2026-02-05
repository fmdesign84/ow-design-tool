/**
 * Vercel Serverless Function - Video Generation (Veo 3.1)
 *
 * Image-to-Video generation using Google Veo 3.1
 * - Long-running operation with polling
 * - Supports audio generation
 * - 4/6/8 second durations
 * - Error logging to Supabase
 * - Friendly error messages via Gemini Flash
 */

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
            console.log('[ErrorLog] Supabase not configured, skipping log');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from('error_logs').insert({
            service: 'generate-video',
            error_type: errorType,
            error_message: errorMessage,
            request_data: requestData,
            response_data: responseData,
            resolved: false
        });

        if (error) {
            console.error('[ErrorLog] Failed to log error:', error);
        } else {
            console.log('[ErrorLog] Error logged successfully:', errorType);
        }
    } catch (e) {
        console.error('[ErrorLog] Exception:', e.message);
    }
}

/**
 * Gemini Flash로 친근한 에러 메시지 생성
 */
async function generateFriendlyMessage(context, accessToken, projectId) {
    const { errorType, errorMessage, prompt } = context;

    const location = 'us-central1';
    const systemPrompt = `당신은 AI 영상 생성 서비스의 친절한 안내원입니다.
사용자에게 상황을 부드럽고 이해하기 쉽게 설명해주세요.
응답은 한국어로, 1-2문장으로 간결하게 작성하세요.
이모지를 적절히 사용해도 좋습니다.

상황:
- 에러 유형: ${errorType}
- 에러 메시지: ${errorMessage}
- 사용자 프롬프트: "${prompt?.substring(0, 100) || '(없음)'}"

다음 가이드라인을 따르세요:
1. 안전 정책 위반 (usage guidelines, violate, blocked) → message: "요청하신 영상이 안전 정책에 맞지 않아 생성이 어려워요. 조금 다른 표현으로 시도해보시겠어요? 🎬", detail: 왜 이런 에러가 났는지 구체적 설명과 해결 예시 (예: 실존 인물+저작권 캐릭터 조합은 거부될 수 있으니 일반적 표현 사용 권장)
2. 타임아웃 → message: "영상 생성에 시간이 오래 걸리고 있어요. 사용자가 많을 수 있으니 잠시 후 다시 시도해주세요! ⏳", detail: null
3. 일시적 오류 → message: "잠시 서버가 바빴어요. 다시 시도해주세요! 🔄", detail: null
4. 필터링 (RAI, filtered) → message: "콘텐츠 정책으로 인해 영상이 필터링되었어요. 다른 프롬프트로 시도해보세요 ✨", detail: 원인 설명
5. 알 수 없는 오류 → message: "예상치 못한 문제가 생겼어요. 잠시 후 다시 시도해주세요 🙏", detail: null

JSON 형식으로 응답: {"message": "친화적 메시지", "suggestion": "추가 제안(선택)", "detail": "원인 설명(안전 정책 위반시만)"}`;

    try {
        const geminiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-3-flash-preview:generateContent`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
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
    const { errorMessage } = context;
    const msg = errorMessage?.toLowerCase() || '';
    const msgKr = errorMessage || ''; // 한국어 원본 유지

    if (msg.includes('usage guidelines') || msg.includes('violate') || msg.includes('blocked')) {
        return {
            message: "요청하신 영상이 안전 정책에 맞지 않아 생성이 어려워요. 조금 다른 표현으로 시도해보시겠어요? 🎬",
            suggestion: "프롬프트를 수정해보세요",
            detail: "💡 실존 인물(스티브 잡스, 일론 머스크 등)이나 저작권 캐릭터(아이언맨, 스파이더맨 등)는 개별로는 생성되어도, 조합하면 거부될 수 있어요. '검은 터틀넥의 CEO', '빨간 금속 슈트 히어로' 처럼 일반적인 표현을 사용해보세요."
        };
    }

    if (msg.includes('timeout')) {
        return {
            message: "영상 생성에 시간이 오래 걸리고 있어요. 잠시 후 다시 시도해주세요! ⏳",
            suggestion: null
        };
    }

    // 영어 + 한국어 키워드 모두 체크
    if (msg.includes('rai') || msg.includes('filter') ||
        msgKr.includes('필터링') || msgKr.includes('콘텐츠 정책')) {
        return {
            message: "콘텐츠 정책으로 인해 영상이 필터링되었어요. 다른 프롬프트로 시도해보세요 ✨",
            suggestion: "다른 프롬프트를 사용해보세요"
        };
    }

    return {
        message: "예상치 못한 문제가 생겼어요. 잠시 후 다시 시도해주세요 🙏",
        suggestion: null
    };
}

/**
 * Gemini 3 Pro로 사용자 프롬프트를 Veo 최적화 프롬프트로 변환
 */
async function optimizePromptForVeo(userPrompt, mode, accessToken, projectId, imageData = null, endImageData = null) {
    const location = 'us-central1';

    // 모드별 시스템 프롬프트
    const systemPrompts = {
        'text-to-video': `You are a video generation prompt optimizer for Google Veo 3.1.
Transform the user's simple prompt into a cinematic, detailed video prompt.

Rules:
1. Add camera movements (dolly, pan, tracking shot, arc shot, etc.)
2. Add lighting descriptions (golden hour, dramatic lighting, soft ambient light)
3. Add motion details (smooth, dynamic, slow-motion, time-lapse)
4. Keep it concise but descriptive (2-3 sentences max)
5. Output ONLY the optimized prompt in English, nothing else
6. Do NOT add any explanation or notes

Example:
User: "고양이가 뛰어다녀"
Output: "Smooth tracking shot following a playful cat running across a sunlit room. Camera follows with fluid motion, soft natural lighting creating warm shadows. Dynamic movement with subtle slow-motion moments."`,

        'image-to-video': `You are a video generation prompt optimizer for Google Veo 3.1 image-to-video.
Transform the user's prompt into an animation prompt that brings the image to life.

Rules:
1. Focus on natural motion that fits the image content
2. Add subtle camera movements (slow zoom, gentle pan, parallax)
3. Describe environmental motion (wind, particles, atmosphere)
4. Keep it concise (2-3 sentences max)
5. Output ONLY the optimized prompt in English, nothing else
6. Do NOT describe what's in the image - focus on HOW it moves

Example:
User: "영상으로 만들어줘"
Output: "Gentle camera push-in with subtle parallax effect. Soft ambient motion with floating particles and gentle wind movement. Cinematic atmosphere with smooth, dreamy quality."`,

        'multi-image': `You are a video generation prompt optimizer for Google Veo 3.1 first-to-last frame interpolation.
This is CRITICAL: The user provided TWO images (first frame and last frame). You must describe the TRANSITION between them.

Rules:
1. DO NOT describe the images themselves
2. Describe the CAMERA MOVEMENT between the two frames (arc shot, dolly, pan, etc.)
3. Describe the TRANSFORMATION/TRANSITION (morph, smooth transition, dissolve)
4. Add timing cues (smooth, gradual, dynamic)
5. Keep it concise (2-3 sentences max)
6. Output ONLY the optimized transition prompt in English, nothing else

Example transitions:
- "Smooth 180-degree arc shot circling around the subject, maintaining focus while the background seamlessly transforms."
- "Gradual morph transition with gentle camera push-in, elements smoothly blending from first to last state."
- "Dynamic tracking shot following the transformation, camera fluid motion bridging both scenes naturally."`
    };

    const systemPrompt = systemPrompts[mode] || systemPrompts['text-to-video'];

    try {
        const geminiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-3-flash-preview:generateContent`;

        // 요청 구성
        const parts = [{ text: `User prompt: "${userPrompt}"\n\nOptimize this for Veo 3.1 video generation:` }];

        // 이미지가 있으면 분석에 포함 (image-to-video, multi-image 모드)
        if (imageData && mode !== 'text-to-video') {
            parts.unshift({
                inlineData: {
                    mimeType: imageData.mime,
                    data: imageData.base64
                }
            });
        }

        // multi-image 모드에서 마지막 프레임도 포함
        if (endImageData && mode === 'multi-image') {
            parts.push({
                inlineData: {
                    mimeType: endImageData.mime,
                    data: endImageData.base64
                }
            });
            parts.push({ text: "(Above are the first and last frame images. Describe the transition between them.)" });
        }

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ role: 'user', parts }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 256,
                }
            })
        });

        if (!response.ok) {
            console.error('[PromptOptimizer] Gemini API error:', response.status);
            return userPrompt; // 실패시 원본 반환
        }

        const data = await response.json();
        const optimizedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (optimizedPrompt && optimizedPrompt.length > 10) {
            console.log('[PromptOptimizer] Original:', userPrompt);
            console.log('[PromptOptimizer] Optimized:', optimizedPrompt);
            return optimizedPrompt;
        }

        return userPrompt;
    } catch (error) {
        console.error('[PromptOptimizer] Error:', error.message);
        return userPrompt; // 에러시 원본 반환
    }
}

// Vercel Pro: 최대 300초 (5분)
module.exports.config = {
    maxDuration: 300,
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
        image,
        endImage,
        aspectRatio = '16:9',
        duration = 4,
        resolution = '720p',
        generateAudio = true,
        negativePrompt
    } = req.body;

    // 디버깅: 받은 데이터 로깅
    console.log('[VideoGen] ========== REQUEST RECEIVED ==========');
    console.log('[VideoGen] Prompt:', prompt?.substring(0, 50));
    console.log('[VideoGen] Image exists:', !!image);
    console.log('[VideoGen] Image type:', typeof image);
    console.log('[VideoGen] Image starts with:', image?.substring(0, 30));
    console.log('[VideoGen] Image length:', image?.length);

    // 이미지가 있으면 프롬프트 없이도 가능 (image-to-video 모드)
    if (!prompt && !image) {
        return res.status(400).json({ error: 'Prompt or image is required' });
    }

    // 빈 프롬프트일 때 기본값 설정 (image-to-video 모드용)
    const finalPrompt = prompt || 'Bring this image to life with natural motion and cinematic quality';

    // Veo 3.1은 16:9, 9:16만 지원 - 다른 비율은 16:9로 변환
    const supportedRatios = ['16:9', '9:16'];
    const finalAspectRatio = supportedRatios.includes(aspectRatio) ? aspectRatio : '16:9';
    if (aspectRatio !== finalAspectRatio) {
        console.log(`[VideoGen] Unsupported aspect ratio ${aspectRatio} → converted to ${finalAspectRatio}`);
    }

    // 모드 결정: text-to-video, image-to-video, multi-image-to-video
    const mode = endImage ? 'multi-image' : (image ? 'image-to-video' : 'text-to-video');
    console.log('[VideoGen] Mode:', mode);

    const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
    if (!PROJECT_ID) {
        return res.status(500).json({
            error: 'Server misconfiguration',
            message: 'GOOGLE_PROJECT_ID not configured'
        });
    }

    const startTime = Date.now();

    try {
        console.log('[VideoGen] Starting Veo 3.1 video generation');
        console.log('[VideoGen] Mode:', mode);
        console.log('[VideoGen] Prompt:', finalPrompt.substring(0, 100));
        console.log('[VideoGen] Duration:', duration, 'seconds');
        console.log('[VideoGen] Resolution:', resolution);
        console.log('[VideoGen] Aspect Ratio:', aspectRatio);
        console.log('[VideoGen] Generate Audio:', generateAudio);

        // Authenticate with Google Cloud
        const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        if (!credentialsJson) {
            throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON not configured');
        }
        const auth = new GoogleAuth({
            credentials: JSON.parse(credentialsJson),
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse.token;

        // Helper: Extract base64 from data URL
        const extractBase64 = (dataUrl) => {
            if (!dataUrl) {
                console.error('[VideoGen] extractBase64: No data provided');
                return null;
            }

            // 반드시 data URL 형식이어야 함
            if (!dataUrl.startsWith('data:')) {
                console.error('[VideoGen] extractBase64: Invalid format - not a data URL');
                console.error('[VideoGen] extractBase64: Data starts with:', dataUrl.substring(0, 50));
                throw new Error('이미지 형식이 올바르지 않습니다. 다시 시도해주세요.');
            }

            const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (!matches) {
                console.error('[VideoGen] extractBase64: Failed to parse data URL');
                throw new Error('이미지 데이터 파싱 실패');
            }

            const mime = matches[1];
            const base64 = matches[2];
            console.log('[VideoGen] extractBase64: Success -', mime, 'length:', base64.length);
            return { base64, mime };
        };

        // Resolution is used directly (no restrictions)
        const finalResolution = resolution;

        // 이미지 데이터 미리 추출 (프롬프트 최적화에 필요)
        let startImgData = null;
        let endImgData = null;

        if (image) {
            startImgData = extractBase64(image);
        }
        if (endImage) {
            endImgData = extractBase64(endImage);
        }

        // Gemini로 프롬프트 최적화 (사용자 프롬프트를 Veo에 최적화된 영문 프롬프트로 변환)
        console.log('[VideoGen] Optimizing prompt with Gemini...');
        const optimizedPrompt = await optimizePromptForVeo(
            finalPrompt,
            mode,
            accessToken,
            PROJECT_ID,
            startImgData,
            endImgData
        );
        console.log('[VideoGen] Optimized prompt:', optimizedPrompt.substring(0, 100));

        // 모델 선택 (quality 파라미터로 제어, 기본값: fast)
        const qualityMode = req.body.quality || 'fast'; // 'fast' | 'standard'
        const MODEL_ID = qualityMode === 'standard'
            ? 'veo-3.1-generate-preview'  // 표준 품질 (더 느리지만 고품질)
            : 'veo-3.1-fast-generate-preview'; // 빠른 생성
        const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:predictLongRunning`;

        // 공식 문서 기반 요청 구조 (최적화된 프롬프트 사용)
        const requestBody = {
            instances: [
                {
                    prompt: optimizedPrompt
                }
            ],
            parameters: {
                aspectRatio: finalAspectRatio,
                sampleCount: 1,
                personGeneration: 'allow_adult' // 성인 사람 생성 허용
            }
        };

        // 모드별 이미지 추가 (이미 추출한 데이터 사용)
        if (mode === 'image-to-video' && startImgData) {
            requestBody.instances[0].image = {
                bytesBase64Encoded: startImgData.base64,
                mimeType: startImgData.mime
            };
        } else if (mode === 'multi-image' && startImgData && endImgData) {
            // 시작 + 끝 이미지 (첫 프레임, 마지막 프레임)
            requestBody.instances[0].image = {
                bytesBase64Encoded: startImgData.base64,
                mimeType: startImgData.mime
            };
            // Veo 3.1 last frame interpolation (올바른 파라미터명: lastFrame)
            requestBody.instances[0].lastFrame = {
                bytesBase64Encoded: endImgData.base64,
                mimeType: endImgData.mime
            };
        }
        // text-to-video: 이미지 없음

        // Veo 3.x 전용 파라미터
        if (MODEL_ID.includes('veo-3')) {
            requestBody.parameters.durationSeconds = parseInt(duration);
            requestBody.parameters.resolution = finalResolution;
            requestBody.parameters.generateAudio = generateAudio;
        }

        // Add negative prompt if provided
        if (negativePrompt) {
            requestBody.parameters.negativePrompt = negativePrompt;
        }

        console.log('[VideoGen] Sending request to Veo 3.1...');
        console.log('[VideoGen] Endpoint:', endpoint);
        console.log('[VideoGen] Request body:', JSON.stringify(requestBody, null, 2).substring(0, 500));

        // Start video generation (long-running operation)
        const createResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        const createResponseText = await createResponse.text();
        console.log('[VideoGen] Create response status:', createResponse.status);
        console.log('[VideoGen] Create response:', createResponseText.substring(0, 500));

        if (!createResponse.ok) {
            let errMsg = 'Veo API error';
            try {
                const errData = JSON.parse(createResponseText);
                errMsg = errData.error?.message || errData.error?.status || createResponseText;
            } catch (e) {
                errMsg = createResponseText;
            }
            throw new Error(errMsg);
        }

        const operation = JSON.parse(createResponseText);
        const operationName = operation.name;
        console.log('[VideoGen] Operation started:', operationName);

        // 공식 문서: fetchPredictOperation으로 폴링
        const fetchEndpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:fetchPredictOperation`;

        // Poll for completion (max 4 minutes)
        const maxWait = 240000;
        const pollInterval = 5000;
        let waited = 0;
        let result = null;

        while (waited < maxWait) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            waited += pollInterval;

            const pollResponse = await fetch(fetchEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ operationName: operationName })
            });

            const pollText = await pollResponse.text();
            console.log(`[VideoGen] Poll status (${waited / 1000}s):`, pollText.substring(0, 200));

            let pollData;
            try {
                pollData = JSON.parse(pollText);
            } catch (e) {
                console.error('[VideoGen] Poll parse error:', pollText);
                continue;
            }

            if (pollData.done) {
                if (pollData.error) {
                    throw new Error(pollData.error.message || 'Video generation failed');
                }
                result = pollData;
                break;
            }
        }

        if (!result) {
            throw new Error('Video generation timeout - please try again');
        }

        // 전체 응답 구조 로깅
        console.log('[VideoGen] Full result:', JSON.stringify(result, null, 2).substring(0, 3000));

        // RAI 필터 체크
        const raiFilteredCount = result.response?.raiMediaFilteredCount || 0;
        if (raiFilteredCount > 0) {
            console.log('[VideoGen] RAI filtered count:', raiFilteredCount);
            throw new Error(`콘텐츠 정책으로 ${raiFilteredCount}개 영상이 필터링되었습니다. 다른 프롬프트를 시도해주세요.`);
        }

        // 공식 문서 기준: result.response.videos
        const videos = result.response?.videos || [];
        console.log('[VideoGen] Videos array length:', videos.length);

        if (videos.length === 0) {
            // 다른 구조 시도
            const altVideos = result.videos || result.predictions || result.response?.predictions || [];
            console.log('[VideoGen] Alt videos length:', altVideos.length);
            if (altVideos.length === 0) {
                throw new Error('영상이 생성되지 않았습니다. 다른 프롬프트를 시도해주세요.');
            }
            videos.push(...altVideos);
        }

        const video = videos[0];
        console.log('[VideoGen] First video object:', JSON.stringify(video).substring(0, 500));

        let videoData = null;

        if (video.bytesBase64Encoded) {
            // Base64로 직접 반환된 경우
            const mimeType = video.mimeType || 'video/mp4';
            videoData = `data:${mimeType};base64,${video.bytesBase64Encoded}`;
            console.log('[VideoGen] Got base64 video');
        } else if (video.gcsUri) {
            // GCS URI인 경우 - 다운로드 시도
            console.log('[VideoGen] Got GCS URI:', video.gcsUri);

            // GCS에서 다운로드 (서비스 계정 권한 필요)
            try {
                const gcsResponse = await fetch(video.gcsUri.replace('gs://', 'https://storage.googleapis.com/'), {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (gcsResponse.ok) {
                    const buffer = await gcsResponse.arrayBuffer();
                    const base64 = Buffer.from(buffer).toString('base64');
                    videoData = `data:video/mp4;base64,${base64}`;
                    console.log('[VideoGen] Downloaded from GCS successfully');
                } else {
                    // 공개 URL로 반환
                    videoData = video.gcsUri.replace('gs://', 'https://storage.googleapis.com/');
                    console.log('[VideoGen] Returning public GCS URL');
                }
            } catch (gcsErr) {
                console.error('[VideoGen] GCS download error:', gcsErr);
                videoData = video.gcsUri.replace('gs://', 'https://storage.googleapis.com/');
            }
        } else if (video.uri) {
            videoData = video.uri;
            console.log('[VideoGen] Got direct URI');
        }

        if (!videoData) {
            console.error('[VideoGen] Could not extract video data');
            throw new Error('영상 데이터를 추출할 수 없습니다.');
        }

        const totalTime = Date.now() - startTime;
        console.log(`[VideoGen] Completed in ${totalTime}ms`);

        // ========== Supabase에 직접 저장 (413 에러 방지) ==========
        let savedVideo = null;
        let finalVideoUrl = videoData;

        // base64 데이터인 경우에만 Supabase에 저장
        if (videoData.startsWith('data:video/')) {
            try {
                const supabase = createClient(
                    process.env.SUPABASE_URL,
                    process.env.SUPABASE_ANON_KEY
                );

                // Base64 → Buffer
                const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;

                console.log(`[VideoGen] Uploading to Supabase Storage... (${Math.round(buffer.length / 1024 / 1024 * 100) / 100}MB)`);

                // Storage에 업로드
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('generated-videos')
                    .upload(fileName, buffer, {
                        contentType: 'video/mp4',
                        cacheControl: '3600'
                    });

                if (uploadError) {
                    console.error('[VideoGen] Storage upload error:', uploadError);
                    // 업로드 실패해도 base64로 반환
                } else {
                    // Public URL 가져오기
                    const { data: { publicUrl } } = supabase.storage
                        .from('generated-videos')
                        .getPublicUrl(fileName);

                    finalVideoUrl = publicUrl;
                    console.log('[VideoGen] Uploaded to Supabase:', publicUrl);

                    // DB에 메타데이터 저장 (videos 테이블이 있다면)
                    try {
                        const { data: dbData, error: dbError } = await supabase
                            .from('videos')
                            .insert({
                                video_url: publicUrl,
                                prompt: prompt,
                                model: MODEL_ID,
                                duration: duration,
                                resolution: finalResolution,
                                aspect_ratio: finalAspectRatio,
                                has_audio: generateAudio,
                                mode: mode
                            })
                            .select()
                            .single();

                        if (!dbError && dbData) {
                            savedVideo = dbData;
                            console.log('[VideoGen] Saved to DB:', savedVideo.id);
                        }
                    } catch (dbErr) {
                        console.log('[VideoGen] DB save skipped (table may not exist)');
                    }
                }
            } catch (supabaseErr) {
                console.error('[VideoGen] Supabase error:', supabaseErr);
                // Supabase 실패해도 base64로 반환
            }
        }

        return res.status(200).json({
            success: true,
            video: finalVideoUrl,
            savedVideo: savedVideo,
            debug: {
                processingTime: totalTime,
                model: MODEL_ID,
                duration: duration,
                resolution: finalResolution,
                aspectRatio: finalAspectRatio,
                hasAudio: generateAudio,
                originalPrompt: prompt,
                optimizedPrompt: optimizedPrompt
            }
        });

    } catch (err) {
        console.error('[VideoGen Error]', err);

        // 에러 로깅 - 영어 + 한국어 키워드 모두 체크
        const errMsgLower = err.message?.toLowerCase() || '';
        const errMsg = err.message || '';
        const errorType = (errMsgLower.includes('usage guidelines') || errMsgLower.includes('violate'))
            ? 'SAFETY_VIOLATION'
            : errMsgLower.includes('timeout')
                ? 'TIMEOUT'
                : (errMsgLower.includes('rai') || errMsgLower.includes('filter') ||
                   errMsg.includes('필터링') || errMsg.includes('콘텐츠 정책'))
                    ? 'CONTENT_FILTERED'
                    : 'GENERAL_ERROR';

        await logError(
            errorType,
            err.message,
            { prompt, aspectRatio, duration, resolution, generateAudio },
            { stack: err.stack }
        );

        // 콘텐츠 필터링 에러는 바로 사용자에게 명확히 전달 (Gemini Flash 스킵)
        if (errorType === 'CONTENT_FILTERED') {
            console.log('[VideoGen] Content filtered - returning direct message');
            return res.status(400).json({
                error: 'Content filtered',
                message: err.message,
                friendlyMessage: {
                    message: "콘텐츠 정책으로 인해 영상이 필터링되었어요 🚫",
                    suggestion: "다른 이미지나 프롬프트로 시도해보세요",
                    detail: "💡 Google Veo는 상업 광고, 브랜드 로고, 제품 목업 등의 콘텐츠를 영상으로 만드는 것을 제한할 수 있어요. 일반 풍경이나 추상적인 이미지로 시도해보세요."
                }
            });
        }

        // 다른 에러는 Gemini Flash로 친근한 메시지 생성
        let friendlyMessage = null;
        try {
            const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
            if (credentialsJson && PROJECT_ID) {
                const auth = new GoogleAuth({
                    credentials: JSON.parse(credentialsJson),
                    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
                });
                const client = await auth.getClient();
                const tokenResponse = await client.getAccessToken();

                friendlyMessage = await generateFriendlyMessage({
                    errorType,
                    errorMessage: err.message,
                    prompt
                }, tokenResponse.token, PROJECT_ID);
            }
        } catch (flashErr) {
            console.log('[Flash Communicator] Failed to generate friendly message:', flashErr.message);
            friendlyMessage = getDefaultMessage({ errorMessage: err.message });
        }

        return res.status(500).json({
            error: 'Video generation failed',
            message: err.message,
            friendlyMessage
        });
    }
}

const { createClient } = require('@supabase/supabase-js');

/**
 * Vercel Serverless Function - Scene Continuation
 * 이전 씬 이미지를 기반으로 N초 후 장면 생성
 */

// Supabase 이미지 저장
async function saveToSupabase(imageBase64, metadata) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('[Supabase] Credentials missing, skipping save');
        return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const buffer = Buffer.from(imageBase64, 'base64');
        const fileName = `continuation-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

        const { error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(fileName, buffer, { contentType: 'image/png', cacheControl: '3600' });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(fileName);

        return { image_url: publicUrl };
    } catch (error) {
        console.error('[Supabase] Save error:', error.message);
        return null;
    }
}

// 타임아웃 fetch
async function fetchWithTimeout(url, options, timeout = 50000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}

// 이미지 데이터 추출 헬퍼
function extractImageData(imageInput) {
    if (!imageInput) return null;

    let imageData = imageInput;
    let mimeType = 'image/png';

    if (imageInput.startsWith('data:')) {
        const matches = imageInput.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
            mimeType = matches[1];
            imageData = matches[2];
        }
    }

    return { data: imageData, mime_type: mimeType };
}

// 시간 경과 라벨
const TIME_LABELS = {
    '3s': '3 seconds',
    '5s': '5 seconds',
    '10s': '10 seconds',
    '30s': '30 seconds',
};

// 변화 유형별 프롬프트
const CHANGE_PROMPTS = {
    'action': `The character's pose and action have naturally progressed to the NEXT moment:
- If the character was running, they are now a few steps further in their stride
- If the character was celebrating, they have transitioned to a slightly different celebratory gesture
- If the character was still, they have begun a natural next movement
- Body weight has shifted, arms/legs are in a different phase of motion
- The movement feels like a natural continuation, not a completely different action`,

    'mood': `The overall mood and atmosphere have subtly shifted:
- Lighting may have changed slightly (e.g., sun angle, cloud movement)
- The character's facial expression has evolved (e.g., from intense focus to relief, from surprise to joy)
- The emotional tone of the scene has progressed naturally
- Environmental mood cues have changed (e.g., crowd energy, wind, light quality)
- The pose remains similar but the feeling is different`,

    'position': `The character has moved slightly within the scene:
- The character is now a bit closer or further from the camera
- They may have moved laterally within the frame
- The background perspective has shifted accordingly to match the new position
- The overall scene composition has adjusted naturally
- It feels like the camera stayed still but the character moved`,
};

// 이어가기 프롬프트 생성
function buildContinuationPrompt(timeOffset, change, customChange) {
    const timeLabel = TIME_LABELS[timeOffset] || '5 seconds';
    const changePrompt = change === 'custom' && customChange
        ? `Custom change description: ${customChange}`
        : CHANGE_PROMPTS[change] || CHANGE_PROMPTS['action'];

    return `Look at this image carefully. This is a SPECIFIC MOMENT in a scene.

Generate what this EXACT SAME scene looks like ${timeLabel} LATER.

WHAT MUST STAY THE SAME (CRITICAL):
- The EXACT same location and background environment
- The EXACT same lighting conditions (time of day, weather, light direction)
- The EXACT same art style (3D cartoon character in photorealistic environment)
- The EXACT same camera angle and framing (minor natural camera movement is OK)
- The EXACT same character appearance:
  * Same face features
  * Same mint green hair color and hairstyle
  * Same blue/white striped headband
  * Same leaf pair accessories near the headband
  * Same outfit and clothing details
  * Same race bib number if visible
- ALL background elements (buildings, trees, signs, structures) stay in the same position
- The ground, sky, and environment are identical

WHAT CHANGES (${timeLabel} have passed):
${changePrompt}

WHAT MUST NEVER HAPPEN:
- Do NOT change the character's identity (hair color, accessories, face)
- Do NOT change the location to a different place
- Do NOT change the art style
- Do NOT add or remove major scene elements
- Do NOT dramatically change the lighting or time of day
- The result must feel like a NATURAL continuation, like the next frame in a movie

QUALITY:
- Photorealistic environment with 3D cartoon character (Pixar/Disney quality)
- Cinematic composition
- Character naturally composited (proper shadows, lighting match, no hard edges)
- Same level of detail and quality as the reference image`;
}

// Gemini 이미지 생성
async function generateWithGemini(prompt, images, aspectRatio) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`;

    const parts = [{ text: prompt }];

    // 씬 이미지 (필수)
    for (const img of images) {
        const imgData = extractImageData(img);
        if (imgData) {
            parts.push({ inline_data: imgData });
        }
    }

    const requestBody = {
        contents: [{ parts }],
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: '2K'
            }
        }
    };

    const response = await fetchWithTimeout(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    }, 50000);

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API failed (${response.status}): ${errText}`);
    }

    const data = await response.json();

    const candidates = data.candidates || [];
    for (const candidate of candidates) {
        const candidateParts = candidate.content?.parts || [];
        for (const part of candidateParts) {
            if (part.inlineData?.mimeType?.startsWith('image/')) {
                return {
                    imageData: part.inlineData.data,
                    usageMetadata: data.usageMetadata
                };
            }
        }
    }

    // 안전 필터 차단 여부 확인
    const blockReason = data.candidates?.[0]?.finishReason;
    if (blockReason === 'SAFETY' || blockReason === 'BLOCKED') {
        throw new Error('SAFETY_BLOCKED');
    }
    throw new Error('No image in Gemini response');
}

// 안전 필터 재시도
async function generateWithRetry(prompt, images, aspectRatio) {
    try {
        return await generateWithGemini(prompt, images, aspectRatio);
    } catch (error) {
        if (error.message === 'SAFETY_BLOCKED') {
            console.log('[SceneContinuation] Safety blocked, retrying with softer prompt...');
            const saferPrompt = prompt.replace(/sprint|crouch|low stance|intense|break|smash/gi, 'move')
                + '\n\nIMPORTANT: Keep the image safe, family-friendly, and appropriate for all audiences.';
            return await generateWithGemini(saferPrompt, images, aspectRatio);
        }
        throw error;
    }
}

// 메인 핸들러
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const startTime = Date.now();

    try {
        const {
            sceneImage,
            characterImage = '',
            timeOffset = '5s',
            change = 'action',
            customChange = '',
            aspectRatio = '9:16',
        } = req.body;

        if (!sceneImage) {
            return res.status(400).json({ error: 'Scene image is required' });
        }

        console.log('[SceneContinuation] Starting generation...', {
            timeOffset,
            change,
            hasCharacterRef: !!characterImage,
            aspectRatio
        });

        const prompt = buildContinuationPrompt(timeOffset, change, customChange);

        // 이미지 배열: 씬 이미지 + (선택) 캐릭터 참조
        const images = [sceneImage];
        if (characterImage) {
            images.push(characterImage);
        }

        const result = await generateWithRetry(prompt, images, aspectRatio);

        const generationTime = Date.now() - startTime;

        // Supabase 저장
        const savedImage = await saveToSupabase(result.imageData, {
            timeOffset,
            change,
            aspectRatio
        });

        return res.status(200).json({
            success: true,
            image: `data:image/png;base64,${result.imageData}`,
            savedImage,
            timeOffset,
            change,
            model: 'gemini-3-pro-image-preview',
            generationTime,
            usageMetadata: result.usageMetadata
        });

    } catch (error) {
        const generationTime = Date.now() - startTime;
        console.error('[SceneContinuation] Error:', error.message);

        return res.status(500).json({
            error: error.message,
            generationTime
        });
    }
};

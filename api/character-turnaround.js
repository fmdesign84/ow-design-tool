const { createClient } = require('@supabase/supabase-js');

/**
 * Vercel Serverless Function - Character Turnaround Sheet
 * 캐릭터 이미지를 기반으로 다방향 앵글 그리드 시트 생성
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
        const fileName = `turnaround-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

        const { error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(fileName, buffer, { contentType: 'image/png', cacheControl: '3600' });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(fileName);

        // DB에 레코드 삽입 (라이브러리에 표시되도록)
        const { data: dbData, error: dbError } = await supabase
            .from('images')
            .insert({
                image_url: publicUrl,
                prompt: `캐릭터 턴어라운드 (${metadata?.viewSet || 'default'}, ${metadata?.bodyRange || 'full'})`,
                model: 'gemini-3-pro-image-preview',
                style: 'character-turnaround',
                aspect_ratio: '1:1',
                quality: 'standard'
            })
            .select()
            .single();

        if (dbError) {
            console.error('[Supabase] DB insert error:', dbError.message);
            return { image_url: publicUrl };
        }

        console.log('[Supabase] Turnaround saved:', dbData.id);
        return dbData;
    } catch (error) {
        console.error('[Supabase] Save error:', error.message);
        return null;
    }
}

// 타임아웃 fetch
async function fetchWithTimeout(url, options, timeout = 60000) {
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

// 뷰 세트 정의
const VIEW_SETS = {
    'simple-3': {
        layout: '1x3',
        aspectRatio: '16:9',
        views: [
            { angle: 'FRONT VIEW (0°)', description: 'facing directly toward the camera' },
            { angle: 'SIDE VIEW (90°)', description: 'facing to the right, profile view' },
            { angle: 'BACK VIEW (180°)', description: 'facing away from camera, showing the back' },
        ],
    },
    'standard-5': {
        layout: '1x5',
        aspectRatio: '16:9',
        views: [
            { angle: 'FRONT (0°)', description: 'facing directly toward the camera' },
            { angle: 'FRONT 3/4 (45°)', description: 'turned slightly to the right, 3/4 front view' },
            { angle: 'SIDE (90°)', description: 'profile view, facing right' },
            { angle: 'BACK 3/4 (135°)', description: 'turned mostly away, 3/4 back view' },
            { angle: 'BACK (180°)', description: 'facing completely away from camera' },
        ],
    },
    'full-8': {
        layout: '2x4',
        aspectRatio: '16:9',
        views: [
            { angle: 'FRONT (0°)', description: 'facing directly toward the camera' },
            { angle: 'FRONT-RIGHT (45°)', description: '3/4 front view, turned slightly right' },
            { angle: 'RIGHT SIDE (90°)', description: 'full profile, facing right' },
            { angle: 'BACK-RIGHT (135°)', description: '3/4 back view from right side' },
            { angle: 'BACK (180°)', description: 'facing completely away' },
            { angle: 'BACK-LEFT (225°)', description: '3/4 back view from left side' },
            { angle: 'LEFT SIDE (270°)', description: 'full profile, facing left' },
            { angle: 'FRONT-LEFT (315°)', description: '3/4 front view, turned slightly left' },
        ],
    },
};

// 턴어라운드 프롬프트 생성
function buildTurnaroundPrompt(viewSet, bodyRange) {
    const preset = VIEW_SETS[viewSet] || VIEW_SETS['standard-5'];
    const isFullBody = bodyRange === 'full';

    const viewList = preset.views
        .map((v, i) => `${i + 1}. ${v.angle}: Character ${v.description}`)
        .join('\n');

    const bodyDesc = isFullBody
        ? 'FULL BODY from head to feet, standing in a neutral T-pose or relaxed standing pose'
        : 'UPPER BODY from head to waist, showing torso and arms';

    return `Create a CHARACTER TURNAROUND SHEET for this 3D cartoon character.

REFERENCE CHARACTER (from provided image):
- Keep EXACTLY the same character: same face, same mint green hair, same hairstyle, same headband, same leaf accessories
- Keep the EXACT same 3D cartoon art style (Pixar/Disney quality)
- Every angle must show CLEARLY the same character

LAYOUT:
- Arrange in a clean ${preset.layout} GRID (horizontal strip${preset.layout.startsWith('2') ? ' in 2 rows' : ''})
- Each cell shows the character's ${bodyDesc}
- Each cell is the SAME SIZE, evenly spaced
- Clean white or very light gray background
- Thin light gray dividing lines between cells
- Each view should be LABELED below with the angle name in small clean text

VIEWS (${preset.views.length} angles):
${viewList}

CHARACTER POSE:
- ${bodyDesc}
- Same NEUTRAL EXPRESSION in every view (calm, resting face)
- Arms slightly away from body so silhouette is clearly visible from all angles
- Same standing pose in EVERY view - only the camera angle changes

CRITICAL RULES:
- The character must look IDENTICAL from every angle (same clothes, same accessories, same proportions)
- ONLY the viewing angle changes between cells
- Same lighting for every cell (soft, even studio lighting from slightly above)
- The character should appear to be ROTATING in place on a turntable
- Clean, professional character sheet look - like an animation production turnaround
- NO background elements, NO props, NO ground plane shadows
- Consistent scale across all cells
- High quality, crisp, detailed rendering

IDENTITY MARKERS (must be visible from ALL angles):
- Mint green hair color
- Blue/white striped headband
- Small leaf pair accessories near headband
- Same outfit details visible from every angle

HAIR WARNING:
- Do NOT add bumpy/puffy volume on top of head
- Keep the EXACT hair shape from the reference in ALL views
- Hair should look consistent and natural from every angle`;
}

// Gemini 이미지 생성
async function generateWithGemini(prompt, characterImage, aspectRatio) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`;

    const parts = [{ text: prompt }];

    const charImgData = extractImageData(characterImage);
    if (charImgData) {
        parts.push({ inline_data: charImgData });
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
    }, 60000);

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

    const blockReason = data.candidates?.[0]?.finishReason;
    if (blockReason === 'SAFETY' || blockReason === 'BLOCKED') {
        throw new Error('SAFETY_BLOCKED');
    }
    throw new Error('No image in Gemini response');
}

// 안전 필터 재시도
async function generateWithRetry(prompt, characterImage, aspectRatio) {
    try {
        return await generateWithGemini(prompt, characterImage, aspectRatio);
    } catch (error) {
        if (error.message === 'SAFETY_BLOCKED') {
            console.log('[Turnaround] Safety blocked, retrying with softer prompt...');
            const saferPrompt = prompt
                + '\n\nIMPORTANT: Keep the image safe, family-friendly, and appropriate for all audiences.';
            return await generateWithGemini(saferPrompt, characterImage, aspectRatio);
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
            characterImage,
            viewSet = 'standard-5',
            bodyRange = 'full',
        } = req.body;

        if (!characterImage) {
            return res.status(400).json({ error: 'Character image is required' });
        }

        const preset = VIEW_SETS[viewSet] || VIEW_SETS['standard-5'];

        console.log('[Turnaround] Starting generation...', {
            viewSet,
            bodyRange,
            layout: preset.layout,
        });

        const prompt = buildTurnaroundPrompt(viewSet, bodyRange);
        const result = await generateWithRetry(prompt, characterImage, preset.aspectRatio);

        const generationTime = Date.now() - startTime;

        const savedImage = await saveToSupabase(result.imageData, {
            viewSet,
            bodyRange,
        });

        return res.status(200).json({
            success: true,
            image: `data:image/png;base64,${result.imageData}`,
            savedImage,
            viewSet,
            bodyRange,
            model: 'gemini-3-pro-image-preview',
            generationTime,
            usageMetadata: result.usageMetadata
        });

    } catch (error) {
        const generationTime = Date.now() - startTime;
        console.error('[Turnaround] Error:', error.message);

        return res.status(500).json({
            error: error.message,
            generationTime
        });
    }
};

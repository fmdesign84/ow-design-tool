const { createClient } = require('@supabase/supabase-js');

/**
 * Vercel Serverless Function - Character Pose Generation
 * 캐릭터 이미지를 기반으로 다양한 방향/범위의 이미지 생성
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
        const fileName = `pose-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

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

// 옷차림 프리셋
const OUTFIT_PRESETS = {
    'default': {
        top: 'Blue t-shirt (same blue as headband)',
        bottom: 'Blue pants',
        shoes: 'White sneakers',
        accessory: ''
    },
    'marathon': {
        top: 'Blue athletic vest/singlet over white short-sleeve t-shirt underneath, with rectangular race number bib showing "4-digit number" pinned on blue vest',
        bottom: 'Blue running shorts',
        shoes: 'Running shoes',
        accessory: 'Race number bib clearly visible on chest showing the number, white inner shirt visible at sleeves'
    },
    'suit': {
        top: 'White dress shirt with blue necktie',
        bottom: 'Navy blue suit pants',
        shoes: 'Black dress shoes',
        accessory: ''
    },
    'casual': {
        top: 'Blue hoodie',
        bottom: 'Blue jeans',
        shoes: 'White sneakers',
        accessory: ''
    },
    'office': {
        top: 'Light blue button-up shirt',
        bottom: 'Gray slacks',
        shoes: 'Brown loafers',
        accessory: ''
    }
};

// 옷차림 설명 생성
function buildOutfitDescription(outfit, customTop, customBottom, customShoes, customAccessory, bibNumber = '2026') {
    if (outfit === 'custom') {
        const parts = [];
        if (customTop) parts.push(`Top: ${customTop}`);
        if (customBottom) parts.push(`Bottom: ${customBottom}`);
        if (customShoes) parts.push(`Shoes: ${customShoes}`);
        if (customAccessory) parts.push(`Accessory: ${customAccessory}`);
        return parts.length > 0 ? parts.join('\n') : 'Default blue t-shirt and pants';
    }

    const preset = OUTFIT_PRESETS[outfit] || OUTFIT_PRESETS['default'];
    const parts = [];
    // marathon 프리셋: bib number 동적 치환
    if (outfit === 'marathon') {
        parts.push(`Top: ${preset.top.replace('4-digit number', bibNumber)}`);
    } else if (preset.top) {
        parts.push(`Top: ${preset.top}`);
    }
    if (preset.bottom) parts.push(`Bottom: ${preset.bottom}`);
    if (preset.shoes) parts.push(`Shoes: ${preset.shoes}`);
    if (preset.accessory) parts.push(`Accessory: ${preset.accessory}`);
    return parts.join('\n');
}

// 배경 설명 생성
function buildBackgroundDescription(background, customBackground, hasBackgroundImage) {
    if (hasBackgroundImage) {
        return 'Use the provided background image as the scene background. Place the character naturally in this environment.';
    }
    if (background === 'custom' && customBackground) {
        return `Background: ${customBackground}. Place the character naturally in this environment.`;
    }
    return 'Clean white background';
}

// 프롬프트 생성
function buildPosePrompt(direction, bodyRange, pose, outfitDescription, backgroundDescription) {
    // 방향 설명
    const directionMap = {
        'front': 'facing directly toward the camera (front view)',
        'side': 'turned 3/4 to the side (three-quarter view)',
        'profile': 'EXACT 90-DEGREE SIDE PROFILE VIEW. The character faces PERFECTLY to the left or right. The camera is positioned EXACTLY perpendicular to the character body. You should see ONLY ONE EYE, ONE EAR, and the nose pointing sideways like a coin or medallion profile. The body is turned completely sideways - you see only one arm, one leg from the side. Think of how a person looks on a coin, passport photo side view, or Egyptian hieroglyph - a PURE flat side silhouette angle. NOT 3/4 view, NOT slightly turned - absolutely 90 degrees sideways.',
        'back': 'facing away from camera (back view)'
    };

    // 범위 설명
    const bodyRangeMap = {
        'full': 'full body from head to feet',
        'upper': 'upper body from waist up',
        'bust': 'chest and head only (portrait crop)'
    };

    // 포즈 설명
    const poseMap = {
        'standing': 'standing naturally with relaxed posture',
        'sitting': 'sitting on a simple chair or stool',
        'waving': 'waving hello with one hand raised',
        'thinking': 'thinking pose with hand on chin'
    };

    const directionText = directionMap[direction] || directionMap['front'];
    const bodyRangeText = bodyRangeMap[bodyRange] || bodyRangeMap['full'];
    const poseText = poseMap[pose] || poseMap['standing'];

    return `Generate this character in a new pose with specific clothing.

CHARACTER REFERENCE:
- This is the character to recreate (the provided image)
- Keep EXACTLY the same: face, hair color (mint green), hair style, headband, leaf accessories
- Maintain the same art style and 3D cartoon rendering quality

NEW POSE:
- Direction: ${directionText}
- Body range: ${bodyRangeText}
- Pose: ${poseText}${direction === 'profile' ? '\n\nCRITICAL DIRECTION: This MUST be a PERFECT 90-degree side profile. The nose points completely left or right. Both shoulders overlap into one silhouette line. This is the #1 priority of this image.' : ''}

CLOTHING (IMPORTANT - follow exactly):
${outfitDescription}

MUST KEEP FROM REFERENCE:
- EXACT hair color from reference image
- EXACT hair style, length, and shape from reference image
- All head accessories (headband, hair clips, etc.) from reference
- Face features and expression style
- Eyes with visible white sclera

HAIR STYLE (CRITICAL - #1 IDENTITY FEATURE):
- The character's HAIR is their most recognizable feature
- Study the reference image hair CAREFULLY: color, length, volume, parting, bangs, texture
- Reproduce the EXACT same hair when viewed from the ${direction} angle
- Do NOT simplify, shorten, or change the hair style in any way
- Do NOT add bumpy/puffy/cabbage-like volume that doesn't exist in the reference
- Do NOT replace the hairstyle with a generic one${direction === 'side' || direction === 'profile' || direction === 'back' ? `
- IMPORTANT FOR ${direction.toUpperCase()} VIEW: Even though the reference shows the front, you must imagine how THIS EXACT hair would look from the ${direction}. The hair volume, length, and flow must be CONSISTENT with the front reference. Do NOT default to a generic hairstyle.` : ''}

BACKGROUND: ${backgroundDescription}

STYLE: High quality 3D cartoon rendering (Pixar-like)`;
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

// Gemini 이미지 생성 (gemini-3-pro-image-preview 사용)
async function generateWithGemini(prompt, characterImage, aspectRatio, backgroundImage = null) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`;

    const parts = [{ text: prompt }];

    // 캐릭터 이미지 추가
    const charImgData = extractImageData(characterImage);
    if (charImgData) {
        parts.push({ inline_data: charImgData });
    }

    // 배경 이미지 추가 (있는 경우)
    if (backgroundImage) {
        const bgImgData = extractImageData(backgroundImage);
        if (bgImgData) {
            parts.push({ inline_data: bgImgData });
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
        if (response.status === 429) {
            throw new Error('Gemini API 일일 사용량 초과 - 잠시 후 다시 시도해주세요');
        }
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

    throw new Error('No image in Gemini response');
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
            direction = 'front',
            bodyRange = 'full',
            pose = 'standing',
            outfit = 'default',
            customTop = '',
            customBottom = '',
            customShoes = '',
            customAccessory = '',
            bibNumber = '2026',
            background = 'white',
            backgroundImage = '',
            customBackground = ''
        } = req.body;

        if (!characterImage) {
            return res.status(400).json({ error: 'Character image is required' });
        }

        // 범위에 따른 비율 설정
        const aspectRatioMap = {
            'full': '9:16',
            'upper': '3:4',
            'bust': '1:1'
        };
        const aspectRatio = aspectRatioMap[bodyRange] || '9:16';

        // 옷차림 설명 생성
        const outfitDescription = buildOutfitDescription(outfit, customTop, customBottom, customShoes, customAccessory, bibNumber);

        // 배경 설명 생성
        const hasBackgroundImage = background === 'image' && backgroundImage;
        const backgroundDescription = buildBackgroundDescription(background, customBackground, hasBackgroundImage);

        console.log('[CharacterPose] Starting generation...', {
            direction,
            bodyRange,
            pose,
            outfit,
            background,
            hasBackgroundImage: !!hasBackgroundImage,
            aspectRatio
        });

        const prompt = buildPosePrompt(direction, bodyRange, pose, outfitDescription, backgroundDescription);
        const result = await generateWithGemini(prompt, characterImage, aspectRatio, hasBackgroundImage ? backgroundImage : null);

        const generationTime = Date.now() - startTime;

        // Supabase 저장
        const savedImage = await saveToSupabase(result.imageData, {
            prompt,
            direction,
            bodyRange,
            pose
        });

        return res.status(200).json({
            success: true,
            image: `data:image/png;base64,${result.imageData}`,
            savedImage,
            model: 'gemini-3-pro-image-preview',
            generationTime,
            usageMetadata: result.usageMetadata
        });

    } catch (error) {
        const generationTime = Date.now() - startTime;
        console.error('[CharacterPose] Error:', error.message);

        return res.status(500).json({
            error: error.message,
            generationTime
        });
    }
};

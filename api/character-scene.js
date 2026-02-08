const { createClient } = require('@supabase/supabase-js');

/**
 * Vercel Serverless Function - Character Scene Generation
 * 캐릭터 이미지를 실사 배경 씬에 합성
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
        const fileName = `scene-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

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

// 씬 프리셋
const SCENE_PRESETS = {
    'marathon-start': {
        background: 'A wide city road at the starting line of a marathon race. A large inflatable start arch gate with sponsor banners spans across the road. Early morning golden hour sunlight. Crowds of runners gathered behind the starting line. Urban cityscape in the background with buildings and trees lining the street.',
        pose: 'standing with arms stretched up in pre-race warm-up, excited expression',
        outfit: 'marathon'
    },
    'running-bridge': {
        background: 'Running on a large modern bridge over a river (like Seogang Bridge in Seoul). Wide lanes with city skyline visible in the background. Clear blue sky, morning sunlight reflecting on the river water below. Other runners visible in the distance.',
        pose: 'running dynamically with arms swinging, mid-stride',
        outfit: 'marathon'
    },
    'running-forest': {
        background: 'A beautiful forest trail path surrounded by tall green trees. Dappled sunlight filtering through the leaves creating light and shadow patterns on the path. Lush green vegetation on both sides. A winding dirt trail disappearing into the forest.',
        pose: 'running dynamically with arms swinging through the forest trail',
        outfit: 'marathon'
    },
    'billboard-cheer': {
        background: 'A large LED electronic billboard/jumbotron screen on the side of a city road displaying cheering messages. The screen glows brightly with colorful graphics. Urban setting with buildings, spectators watching from the sidewalk.',
        pose: 'running past the billboard, looking up at it with a happy smile, one arm pointing at the screen',
        outfit: 'marathon'
    },
    'aerial-runners': {
        background: 'Aerial top-down view of a wide city marathon road. Crowds of tiny runners visible below on the asphalt road. Road markings and distance markers visible. Trees lining both sides of the road from above.',
        pose: 'running forward, seen from a high angle above, full body visible',
        outfit: 'marathon'
    },
    'tree-planting': {
        background: 'A sunny green meadow with rich brown soil. A small tree sapling with visible root ball ready to be planted. A small mound of fresh dirt and a shovel nearby. Green grass field stretching to gentle hills in the background. Warm afternoon sunlight.',
        pose: 'kneeling on one knee, hands reaching toward the ground as if carefully planting a small tree sapling',
        outfit: 'casual'
    },
    'finish-line': {
        background: 'A marathon finish line with a large overhead banner reading "FINISH". Confetti and streamers in the air. Cheering crowds on both sides behind barriers. Timing clock display visible. Urban road setting with buildings in the background. Celebration atmosphere.',
        pose: 'running through the finish line with both arms raised high in triumph and celebration',
        outfit: 'marathon'
    },
    'forest-made': {
        background: 'A beautiful newly planted young forest with rows of small trees growing in rich soil. Green meadow landscape stretching into the distance. Sunlight streaming through with a warm, hopeful atmosphere. A wooden sign reading "WE MADE FOREST" in the foreground.',
        pose: 'standing proudly with hands on hips, looking at the forest they helped create, slight smile',
        outfit: 'casual'
    }
};

// 의상 프리셋
const OUTFIT_PRESETS = {
    'marathon': 'Blue athletic vest/singlet over white short-sleeve t-shirt, with rectangular race number bib (4-digit number) pinned on chest, blue running shorts, running shoes',
    'casual': 'Blue hoodie, blue jeans, white sneakers',
    'default': 'Blue t-shirt (same blue as headband), blue pants, white sneakers'
};

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

// 씬 프롬프트 생성
function buildScenePrompt(sceneDescription, poseDescription, outfitDescription, aspectRatio) {
    const cameraAngle = aspectRatio === '16:9'
        ? 'Wide cinematic shot'
        : aspectRatio === '1:1'
            ? 'Medium shot'
            : 'Full body portrait shot';

    return `Place this 3D cartoon character into a photorealistic scene.

CHARACTER REFERENCE:
- This is the character to place in the scene (the provided image)
- Keep EXACTLY the same: face, hair color (mint green), hair style, headband, leaf accessories
- Maintain the 3D cartoon art style for the character

SCENE/ENVIRONMENT (PHOTOREALISTIC):
${sceneDescription}

CHARACTER IN SCENE:
- Pose: ${poseDescription}
- Outfit: ${outfitDescription}
- Camera: ${cameraAngle}

MUST KEEP FROM REFERENCE:
- Mint green hair color and EXACT hair style from reference
- Blue/white striped headband
- Leaf pair (same mint green as hair)
- Face features and expression style
- Eyes with visible white sclera

HAIR STYLE WARNING:
- Do NOT add bumpy/puffy/cabbage-like volume on top of head
- Keep the EXACT hair shape from the reference image

STYLE (CRITICAL):
- CHARACTER: High quality 3D cartoon rendering (Pixar/Disney-like) - keep stylized and cartoon
- BACKGROUND/ENVIRONMENT: Photorealistic, high resolution photography quality
- COMPOSITING: The 3D cartoon character is naturally placed into the photorealistic environment
- LIGHTING: Character lighting matches the environment lighting direction and color temperature
- SHADOWS: Character casts realistic shadow on the ground matching the environment
- SCALE: Character proportions are natural relative to the environment
- DEPTH: Proper depth of field, character is in focus`;
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
    }, 50000);

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API failed (${response.status}): ${errText}`);
    }

    const data = await response.json();

    const candidates = data.candidates || [];
    for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
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
            scene = 'marathon-start',
            customScene = '',
            aspectRatio = '9:16'
        } = req.body;

        if (!characterImage) {
            return res.status(400).json({ error: 'Character image is required' });
        }

        // 씬 프리셋 또는 커스텀 씬 결정
        const scenePreset = SCENE_PRESETS[scene];
        let sceneDescription, poseDescription, outfitDescription;

        if (scene === 'custom' && customScene) {
            sceneDescription = `${customScene}. Photorealistic environment, cinematic lighting, high resolution photography.`;
            poseDescription = 'natural pose appropriate for the scene';
            outfitDescription = OUTFIT_PRESETS['default'];
        } else if (scenePreset) {
            sceneDescription = scenePreset.background;
            poseDescription = scenePreset.pose;
            outfitDescription = OUTFIT_PRESETS[scenePreset.outfit] || OUTFIT_PRESETS['default'];
        } else {
            return res.status(400).json({ error: `Unknown scene: ${scene}` });
        }

        console.log('[CharacterScene] Starting generation...', {
            scene,
            hasCustomScene: !!customScene,
            aspectRatio
        });

        const prompt = buildScenePrompt(sceneDescription, poseDescription, outfitDescription, aspectRatio);
        const result = await generateWithGemini(prompt, characterImage, aspectRatio);

        const generationTime = Date.now() - startTime;

        // Supabase 저장
        const savedImage = await saveToSupabase(result.imageData, {
            scene,
            customScene,
            aspectRatio
        });

        return res.status(200).json({
            success: true,
            image: `data:image/png;base64,${result.imageData}`,
            savedImage,
            scene,
            model: 'gemini-3-pro-image-preview',
            generationTime,
            usageMetadata: result.usageMetadata
        });

    } catch (error) {
        const generationTime = Date.now() - startTime;
        console.error('[CharacterScene] Error:', error.message);

        return res.status(500).json({
            error: error.message,
            generationTime
        });
    }
};

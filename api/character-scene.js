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

// 씬 프리셋 (카메라 앵글/방향/동행 캐릭터 포함)
// 공통: 낮 시간대, 주인공과 동일 스케일
// 다른 캐릭터: 같은 3D 카툰 스타일이지만 각자 다른 외모/복장 (주인공만 민트그린 머리+머리띠+나뭇잎+2026번호)
const OTHER_CHARS = 'OTHER 3D cartoon characters (same Pixar/Disney art style) with DIFFERENT appearances: various hair colors (brown, black, blonde, red - NOT mint green), different hairstyles, different body types, wearing various marathon running outfits (different colored singlets, shorts, shoes - NOT all blue vests). Each has their own unique race bib number (NOT 2026). They do NOT have headbands or leaf accessories.';

const SCENE_PRESETS = {
    'marathon-start': {
        scene: `A wide city road at the starting line of a marathon race. A large inflatable start arch gate spans across the road. Bright daytime, clear blue sky with warm sunlight. Urban cityscape with buildings and trees lining the street.`,
        camera: 'front wide shot, eye level',
        direction: 'facing camera (front view)',
        pose: 'standing with arms stretched up in pre-race warm-up, excited expression',
        crowd: `Many ${OTHER_CHARS} gathered behind the starting line, all warming up. The main character (mint green hair, race bib #2026) is among them at EXACTLY the same human scale, NOT larger than others.`,
        outfit: 'marathon'
    },
    'running-bridge': {
        scene: `Running on Seogang Bridge (서강대교) in Seoul - a distinctive bridge with a large RED painted steel arch structure spanning over the Han River. The bridge has wide road lanes with metal guardrails on the sides. Seoul city skyline with apartment buildings visible in the background. Bright daytime, clear blue sky, sunlight reflecting on the Han River water below.`,
        camera: 'side tracking shot (3/4 angle), slightly low angle',
        direction: 'running from left to right (side/3/4 view)',
        pose: 'running dynamically, mid-stride, arms swinging, determined expression',
        crowd: `Several ${OTHER_CHARS} running alongside in a group on the bridge. CRITICAL: ALL characters including the main character MUST be the EXACT SAME height and scale. The main character must NOT be larger or taller than any other runner.`,
        outfit: 'marathon'
    },
    'running-forest': {
        scene: `A wide paved road with a lush green forest on one side. The road runs alongside the forest edge - tall green trees, dense foliage visible on the LEFT side of the road. The runners are on the paved road to the RIGHT of the forest. Bright daytime, clear sky, sunlight filtering through the tree canopy. Beautiful nature scenery alongside the marathon route.`,
        camera: 'front tracking shot, eye level',
        direction: 'running toward camera (front view)',
        pose: 'running joyfully along the road beside the forest, smile on face',
        crowd: `A few ${OTHER_CHARS} running behind on the road beside the forest, slightly out of focus. Natural spacing between runners. All at the SAME scale as main character.`,
        outfit: 'marathon'
    },
    'billboard-cheer': {
        scene: null, // 동적으로 생성 (billboardName 사용)
        camera: 'side shot from the left, capturing both the running character AND the billboard in frame',
        direction: 'running from left to right (side view), head turned slightly to look up at the billboard',
        pose: 'running past the billboard, looking up at it with a happy surprised expression, fist pumping with one hand while running',
        crowd: `${OTHER_CHARS} running ahead and behind on the road, some also looking up at the billboard. Spectators (also cartoon style) cheering from the sidewalk behind barriers. All runners at the SAME scale.`,
        outfit: 'marathon'
    },
    'aerial-runners': {
        scene: `Aerial bird's-eye view looking straight down at a wide marathon road from very high above (like a drone at 200m altitude). Bright daytime, clear weather. Road markings and distance markers visible on the asphalt. Trees lining both sides of the road from above. The road curves gently.`,
        camera: 'extreme high angle (top-down aerial/drone view), very far away',
        direction: 'all runners seen from directly above as tiny dots, running upward in frame',
        pose: 'one of many tiny identical-sized dots running on the road, absolutely NO close-up, NO enlarged character',
        crowd: `Dozens of VERY tiny 3D cartoon characters seen from extremely far above, appearing as small colorful dots on the road. ALL characters are the EXACT SAME tiny size - there is NO main character that stands out or is larger. The mint-green-haired character is just ONE of many tiny dots, completely blending in with the crowd at the same miniature scale. Do NOT feature, enlarge, or highlight any single character. This is a crowd scene from far above where individual details are barely visible. The runners form a flowing river-like stream of tiny colorful dots on the road.`,
        outfit: 'marathon'
    },
    'runners-to-forest': {
        scene: `A magical aerial/high-angle view of a single 3D cartoon character running ALONE on a road. The image is split into two contrasting halves: AHEAD of the character (bottom/forward) is a gray urban city road with buildings and asphalt. BEHIND the character (top/back), the road has magically TRANSFORMED into a lush green forest with tall trees. The character is at the exact boundary between city and forest. The concept: "where I ran, a forest grew behind me". Bright daytime, warm golden sunlight. Magical golden sparkle particles at the transition line between road and forest. Dreamy, hopeful atmosphere.`,
        camera: 'high aerial view, looking down at an angle',
        direction: 'character running forward (downward in frame) from forest into city road',
        pose: 'running forward alone, mid-stride, determined expression',
        crowd: 'NO other characters. The main character runs ALONE. This is a solo scene showing the magical transformation of road into forest behind the character.',
        outfit: 'marathon'
    },
    'finish-line': {
        scene: `A marathon finish line with a large overhead banner reading "FINISH". Confetti and streamers in the air. Bright daytime, urban road setting with buildings and blue sky in the background. Grand celebration atmosphere. Timing clock display visible showing a time.`,
        camera: 'front wide shot, slightly low angle (heroic)',
        direction: 'running toward camera through the finish line (front view)',
        pose: 'breaking through the finish line ALONE with both arms raised HIGH in triumph, huge celebratory smile, eyes closed with joy',
        crowd: 'NO other runners in this scene. The main character crosses the finish line ALONE as the hero moment. Confetti and streamers falling. Empty road behind the character.',
        outfit: 'marathon'
    },
    'forest-made': {
        scene: `A beautiful panoramic view of a lush young forest stretching across rolling green hills. Bright daytime, warm golden hour sunlight streaming through the trees. A rustic wooden sign in the foreground reads "WE MADE FOREST". Hopeful, proud atmosphere. Clear blue sky.`,
        camera: 'wide establishing shot, eye level',
        direction: 'facing camera (front view)',
        pose: 'standing proudly with hands on hips, looking out at the vast forest, content smile, wind slightly moving hair',
        crowd: `A few ${OTHER_CHARS} standing nearby (no longer in marathon outfits - wearing casual clothes), also admiring the forest they helped create. Some have arms around each other, celebrating. All at the SAME scale.`,
        outfit: 'casual'
    }
};

// 의상 프리셋
const OUTFIT_PRESETS = {
    'marathon': 'Blue athletic vest/singlet over white short-sleeve t-shirt, with rectangular race number bib showing "2026" pinned on chest, blue running shorts, running shoes',
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
function buildScenePrompt(preset, outfitDescription) {
    return `Place this 3D cartoon character into a scene.

MAIN CHARACTER (from provided image):
- This is the MAIN character - keep EXACTLY: face, mint green hair, hair style, headband, leaf pair accessories
- Keep the same 3D cartoon art style (Pixar/Disney quality)
- The character is already in full body form in the provided image - match this appearance
- Race bib number: 2026 (this number is UNIQUE to the main character only)

SCENE:
${preset.scene}

CAMERA:
${preset.camera}

MAIN CHARACTER POSE & DIRECTION:
- Direction: ${preset.direction}
- Pose: ${preset.pose}
- Outfit: ${outfitDescription}

OTHER CHARACTERS IN SCENE:
${preset.crowd}

MAIN CHARACTER IDENTITY (only the main character has ALL of these):
- Mint green hair color and EXACT hair style from reference
- Blue/white striped headband
- Leaf pair accessories (small leaves near the headband)
- Race bib number "2026"
- Face features from reference image
- Do NOT enlarge the main character - SAME scale as others

OTHER CHARACTERS MUST BE DIFFERENT FROM MAIN:
- Different hair colors (brown, black, blonde, red, etc. - NOT mint green)
- NO headbands, NO leaf accessories
- Different race bib numbers (NOT 2026)
- Different outfits/colors (various running gear, not all identical blue vests)
- Same 3D cartoon art style quality

HAIR WARNING:
- Do NOT add bumpy/puffy volume on top of head
- Keep the EXACT hair shape from the reference

STYLE (CRITICAL):
- ALL characters (main + others): Same 3D cartoon style (Pixar/Disney-like)
- BACKGROUND/ENVIRONMENT: Photorealistic, cinematic photography quality
- ALL cartoon characters naturally composited into the photorealistic environment
- Lighting on characters matches environment lighting
- Characters cast realistic shadows
- SCALE: Main character is the SAME size as other characters, NOT bigger
- Cinematic composition, professional quality`;
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
            aspectRatio = '9:16',
            billboardName = '지원'
        } = req.body;

        if (!characterImage) {
            return res.status(400).json({ error: 'Character image is required' });
        }

        // 씬 프리셋 또는 커스텀 씬 결정
        const scenePreset = SCENE_PRESETS[scene];
        let preset, outfitDescription;

        // 전광판 씬: 동적 텍스트 생성
        if (scene === 'billboard-cheer' && scenePreset) {
            const nameText = billboardName || '지원';
            preset = {
                ...scenePreset,
                scene: `A city marathon road in bright daytime with a MASSIVE LED electronic billboard/jumbotron screen on the right side. The billboard screen shows the same mint-green-haired 3D cartoon character running energetically with a fist pump, cheering pose. Large bold text on the billboard reads "${nameText}! YOU MADE FOREST!" in bright glowing letters. Clear blue sky, urban atmosphere, sunlight.`,
            };
            outfitDescription = OUTFIT_PRESETS[scenePreset.outfit] || OUTFIT_PRESETS['default'];
        } else if (scene === 'custom' && customScene) {
            preset = {
                scene: `${customScene}. Photorealistic environment, cinematic lighting.`,
                camera: 'cinematic wide shot',
                direction: 'natural direction for the scene',
                pose: 'natural pose appropriate for the scene',
                crowd: 'If there are other people, they should be the SAME 3D cartoon art style as the main character, with various appearances.',
            };
            outfitDescription = OUTFIT_PRESETS['default'];
        } else if (scenePreset) {
            preset = scenePreset;
            outfitDescription = OUTFIT_PRESETS[scenePreset.outfit] || OUTFIT_PRESETS['default'];
        } else {
            return res.status(400).json({ error: `Unknown scene: ${scene}` });
        }

        console.log('[CharacterScene] Starting generation...', {
            scene,
            hasCustomScene: !!customScene,
            aspectRatio
        });

        const prompt = buildScenePrompt(preset, outfitDescription);
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

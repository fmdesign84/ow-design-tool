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
        scene: null, // 동적으로 생성 (startBannerText 사용)
        camera: 'front wide shot, eye level, shallow depth of field (background runners out of focus)',
        direction: 'facing camera (front view)',
        pose: 'standing with arms stretched up in pre-race warm-up, excited expression, in sharp focus',
        crowd: `Many ${OTHER_CHARS} gathered behind the starting line - but they are OUT OF FOCUS (bokeh/blur effect). Only the main character and the start arch gate are IN SHARP FOCUS. The blurred runners create atmosphere without competing for attention.`,
        outfit: 'marathon'
    },
    'running-bridge': {
        scene: `A pedestrian/running path ON Seogang Bridge (서강대교) in Seoul. The character is running on the bridge's sidewalk/pedestrian lane. The distinctive RED painted steel arch structure of the bridge is visible overhead/beside the runner. Metal guardrails line the path. The Han River is visible below/beside. Seoul city skyline with apartment buildings in the background. Bright daytime, clear blue sky.`,
        camera: 'side tracking shot (3/4 angle), slightly low angle',
        direction: 'running from left to right (side/3/4 view)',
        pose: 'running dynamically on the bridge pedestrian path, mid-stride, arms swinging, determined expression',
        crowd: 'NO other characters. The main character runs ALONE on the bridge path. This is a solo running scene on Seogang Bridge.',
        outfit: 'marathon'
    },
    'running-forest': {
        scene: `A wide paved road with a lush green forest on one side. The road runs alongside the forest edge - tall green trees, dense foliage visible on the LEFT side of the road. The runners are on the paved road to the RIGHT of the forest. Bright daytime, clear sky, sunlight filtering through the tree canopy. Beautiful nature scenery alongside the marathon route.`,
        camera: 'front tracking shot, eye level',
        direction: 'running toward camera (front view)',
        pose: 'running joyfully along the road beside the forest, smile on face',
        crowd: `A few blurred runners visible far behind on the road, heavily OUT OF FOCUS (strong bokeh blur). Only partial bodies visible (legs, arms at frame edges). The main character is the ONLY character in sharp focus. Other runners are just soft blurry shapes in the background creating atmosphere.`,
        outfit: 'marathon'
    },
    'billboard-cheer': {
        scene: null, // 동적으로 생성 (billboardName 사용)
        camera: 'side shot from the left, capturing both the running character AND the billboard in frame',
        direction: 'running from left to right (side view), head turned slightly to look up at the billboard',
        pose: 'running past the billboard, looking up at it with a happy surprised expression, fist pumping with one hand while running',
        crowd: `A few blurred runners visible ahead and behind, heavily OUT OF FOCUS (bokeh blur). Only partial bodies/silhouettes visible. Blurry spectator shapes on the sidewalk behind barriers. The main character is the ONLY character in sharp focus - all others are just soft blurry atmosphere.`,
        outfit: 'marathon'
    },
    'aerial-runners': {
        scene: `Aerial bird's-eye view looking straight down from very high above (drone at 200m altitude). A narrow pedestrian walking/running path winds through the scene. On the LEFT side of the path is a lush dense green forest seen from above (tree canopy). On the RIGHT side of the path is a wide blue river reflecting sunlight. The path runs between the forest and the river. Bright daytime, clear weather.`,
        camera: 'extreme high angle (top-down aerial/drone view), very far away',
        direction: 'all runners seen from directly above as tiny dots, running along the path',
        pose: 'one of many tiny identical-sized dots on the pedestrian path, absolutely NO close-up, NO enlarged character',
        crowd: `Dozens of VERY tiny 3D cartoon characters seen from extremely far above, appearing as small colorful dots on the narrow pedestrian path between the forest and the river. ALL characters are the EXACT SAME tiny size - there is NO main character that stands out or is larger. Do NOT feature, enlarge, or highlight any single character. Individual details are barely visible. The runners form a flowing stream of tiny colorful dots along the path.`,
        outfit: 'marathon'
    },
    'runners-to-forest': {
        scene: `A stunning top-down aerial view of a long straight road. The image shows a smooth GRADIENT transition from LEFT to RIGHT (or BOTTOM to TOP): On the LEFT/BOTTOM side is a gray concrete urban city with buildings, roads, and asphalt. This gradually transitions through a gradient zone where pavement cracks and grass/saplings start appearing, then small bushes, then young trees, until the RIGHT/TOP side is a completely lush dense green forest. A single tiny 3D cartoon character is running at the CENTER of this gradient transition point - the boundary between city and nature. The character is small (seen from high above). Bright daytime, warm golden sunlight illuminating the scene. The gradient from gray city to green forest is smooth and visually striking, like a before/after split image.`,
        camera: 'high aerial/bird-eye view, looking straight down',
        direction: 'character at the center of the city-to-forest gradient, running from city side toward forest side',
        pose: 'tiny figure running at the transition point between city and forest',
        crowd: 'NO other characters. The main character runs ALONE at the boundary between city and forest. This is a solo conceptual scene.',
        outfit: 'marathon'
    },
    'finish-line': {
        scene: null, // 동적으로 생성 (finishTime 사용)
        camera: 'front wide shot, slightly low angle (heroic)',
        direction: 'running toward camera, breaking through the finish tape (front view)',
        pose: 'breaking through the BLUE "YOU MADE FOREST" finish tape ALONE with both arms raised HIGH in triumph, huge celebratory smile, eyes closed with joy, the blue tape stretching across the chest',
        crowd: 'NO other characters in this scene. The main character crosses the finish line COMPLETELY ALONE as the hero moment. Confetti and streamers falling. Empty road behind.',
        outfit: 'marathon'
    },
    'forest-made': {
        scene: `A beautiful panoramic view of a lush young forest stretching across rolling green hills. Bright daytime, warm golden hour sunlight streaming through the trees. A rustic wooden sign in the foreground reads "WE MADE FOREST". Hopeful, proud atmosphere. Clear blue sky.`,
        camera: 'wide establishing shot, eye level',
        direction: 'facing camera (front view)',
        pose: 'standing proudly with hands on hips, looking out at the vast forest, content smile, wind slightly moving hair',
        crowd: 'NO other characters. The main character stands ALONE, admiring the vast forest. A peaceful, contemplative solo moment.',
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

FOCUS PRIORITY:
- The MAIN CHARACTER must ALWAYS be the focal point, in sharp focus
- Any other characters should be OUT OF FOCUS (bokeh blur) or only partially visible (cropped at frame edges)
- The main character is the HERO of every scene

STYLE (CRITICAL):
- ALL characters (main + others): Same 3D cartoon style (Pixar/Disney-like)
- BACKGROUND/ENVIRONMENT: Photorealistic, cinematic photography quality
- ALL cartoon characters naturally composited into the photorealistic environment
- Lighting on characters matches environment lighting
- Characters cast realistic shadows
- SCALE: When other characters are present, main character is the SAME size, NOT bigger
- Cinematic composition, shallow depth of field where appropriate, professional quality`;
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
            billboardName = '지원',
            startBannerText = 'FOREST RUN',
            finishTime = '4:32:10'
        } = req.body;

        if (!characterImage) {
            return res.status(400).json({ error: 'Character image is required' });
        }

        // 씬 프리셋 또는 커스텀 씬 결정
        const scenePreset = SCENE_PRESETS[scene];
        let preset, outfitDescription;

        // 마라톤 출발선: 동적 풍선 문구
        if (scene === 'marathon-start' && scenePreset) {
            const bannerText = startBannerText || 'FOREST RUN';
            preset = {
                ...scenePreset,
                scene: `A wide city road at the starting line of a marathon race. A large inflatable start arch gate spans across the road with bold text "${bannerText}" written on it. Bright daytime, clear blue sky with warm sunlight. Urban cityscape with buildings and trees lining the street. The main character in the foreground and the start arch gate are BOTH in sharp focus. Background runners are blurred (bokeh depth of field effect).`,
            };
            outfitDescription = OUTFIT_PRESETS[scenePreset.outfit] || OUTFIT_PRESETS['default'];
        }
        // 결승선: 동적 골인 시간
        else if (scene === 'finish-line' && scenePreset) {
            const timeText = finishTime || '4:32:10';
            preset = {
                ...scenePreset,
                scene: `A REAL outdoor marathon finish line area - photorealistic environment with real asphalt road, real buildings, real sky (NOT computer-generated looking). A large overhead finish banner structure. A BLUE colored finish line tape/ribbon stretched across the road has "YOU MADE FOREST" printed on it in white bold letters. A large digital timing clock display prominently shows "${timeText}" in bright red LED digits. Confetti and blue streamers in the air. Bright daytime, real urban road with actual buildings and blue sky with clouds in the background. The environment must look like a REAL PHOTOGRAPH of a marathon finish area, not a 3D rendered background.`,
            };
            outfitDescription = OUTFIT_PRESETS[scenePreset.outfit] || OUTFIT_PRESETS['default'];
        }
        // 전광판 씬: 동적 텍스트 생성
        else if (scene === 'billboard-cheer' && scenePreset) {
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

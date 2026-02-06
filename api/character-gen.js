const { createClient } = require('@supabase/supabase-js');

/**
 * Vercel Serverless Function - Character Generation (Gemini 3 Pro Image)
 *
 * "포레스트런" (현대자동차) 캐릭터 스타일 변환
 *
 * 핵심 전략: "블렌딩"이 아닌 "변환(Transform)"
 * - Gemini Flash로 얼굴 분석 (성별, 안경, 얼굴형)
 * - 분석 결과를 프롬프트에 반영
 * - 이미지 순서: [스타일 참조, 얼굴 사진] - 마지막이 더 중요
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
        const fileName = `char-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

        const { error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(fileName, buffer, { contentType: 'image/png', cacheControl: '3600' });

        if (uploadError) throw uploadError;

        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(fileName);

        const { data: dbData, error: dbError } = await supabase.from('images').insert({
            image_url: publicUrl,
            prompt: metadata.prompt || '',
            model: 'gemini-3-pro-image',
            style: 'character',
            aspect_ratio: '1:1',
            quality: 'hd'
        }).select().single();

        if (dbError) console.error('[Supabase] DB insert error:', dbError.message);

        return {
            image_url: publicUrl,
            id: dbData?.id
        };
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

// Gemini 3 Pro Image 호출
async function generateWithGemini3Pro(prompt, referenceImages = [], aspectRatio = '1:1') {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`;

    const parts = [{ text: prompt }];

    const imagesToProcess = referenceImages.slice(0, 5);
    for (const refImage of imagesToProcess) {
        let imageData = refImage;
        let mimeType = 'image/jpeg';

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

// 스타일별 참조 이미지 URL (GitHub raw URL - public 접근 가능)
const STYLE_REFERENCE_IMAGES = {
    namoo: 'https://raw.githubusercontent.com/fmdesign84/ow-design-tool/main/public/images/styles/namoo-sample.png'
};

// 스타일 참조 이미지를 base64로 로드
async function loadStyleReferenceImage(imageUrl) {
    console.log('[CharacterGen] Loading style image from:', imageUrl);

    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to load style reference image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    console.log('[CharacterGen] Style image loaded, size:', base64.length);
    return base64;
}

// Gemini Flash로 얼굴 분석 (성별, 안경, 얼굴형)
async function analyzeFaceWithGeminiFlash(imageBase64) {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const geminiFlashUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    let imageData = imageBase64;
    let mimeType = 'image/jpeg';

    if (imageBase64.startsWith('data:')) {
        const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
            mimeType = matches[1];
            imageData = matches[2];
        }
    }

    const analysisPrompt = `Analyze this face photo and return ONLY a JSON object with these fields:
{
  "gender": "male" or "female",
  "hasGlasses": true or false,
  "faceShape": "round", "oval", "square", "heart", or "long",
  "hairLength": "very short", "short", "medium", "long", or "very long",
  "distinctiveFeatures": ["list of notable features like moles, dimples, freckles"]
}

Respond with ONLY the JSON, no other text.`;

    const requestBody = {
        contents: [{
            parts: [
                { text: analysisPrompt },
                { inline_data: { mime_type: mimeType, data: imageData } }
            ]
        }],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256
        }
    };

    try {
        const response = await fetchWithTimeout(geminiFlashUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        }, 15000);

        if (!response.ok) {
            console.warn('[CharacterGen] Face analysis failed, using defaults');
            return { gender: 'unknown', hasGlasses: false, faceShape: 'oval', hairLength: 'medium', distinctiveFeatures: [] };
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // JSON 추출 (```json 블록 또는 순수 JSON)
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('[CharacterGen] Face analysis result:', parsed);
            return parsed;
        }

        return { gender: 'unknown', hasGlasses: false, faceShape: 'oval', hairLength: 'medium', distinctiveFeatures: [] };
    } catch (error) {
        console.warn('[CharacterGen] Face analysis error:', error.message);
        return { gender: 'unknown', hasGlasses: false, faceShape: 'oval', hairLength: 'medium', distinctiveFeatures: [] };
    }
}

// 변환 프롬프트 생성
function buildTransformPrompt(faceAnalysis, expression = 'original', faceStrength = 50) {
    const { hasGlasses } = faceAnalysis;

    const glassesText = hasGlasses ? '- Glasses (keep exactly as in photo)\n' : '';

    // 표정 매핑
    const expressionMap = {
        'original': 'Keep the same facial expression as in the original photo',
        'smile': 'Gentle smile, friendly look',
        'big_smile': 'Big happy smile, laughing, very cheerful',
        'neutral': 'Neutral expression, calm face',
        'tired': 'Tired expression with sweat drops on forehead',
        'angry': 'Angry expression, frowning'
    };
    const expressionText = expressionMap[expression] || expressionMap['original'];

    // 얼굴 반영도에 따른 프롬프트 변경
    let faceInstruction;
    if (faceStrength <= 30) {
        faceInstruction = `STYLE PRIORITY: Focus on Forest Run character style.
- Simplify facial features into cute cartoon style
- Face shape can be more rounded/stylized
- Eyes bigger and more cartoon-like`;
    } else if (faceStrength <= 50) {
        faceInstruction = `BALANCED: Mix character style with original face.
- Keep basic face proportions from photo
- Apply cartoon rendering but maintain recognizable features`;
    } else if (faceStrength <= 70) {
        faceInstruction = `FACE PRIORITY: Preserve original face more.
- Keep detailed facial features from photo
- Face shape, eyes, nose should closely match original
- Apply lighter cartoon stylization`;
    } else {
        faceInstruction = `MAXIMUM FACE DETAIL: Original face is priority.
- Preserve exact facial features, proportions, details
- Minimal cartoon stylization on face
- Person must be immediately recognizable`;
    }

    return `Create a "Forest Run" style 3D character from this photo.

${faceInstruction}

CRITICAL - HAIR RULES:
- Hair SHAPE: MUST follow the person's original photo exactly (short, long, curly, straight, parted, etc.)
- Hair VOLUME: Keep the same volume as original photo - do NOT add bumpy/puffy/cabbage-like top
- Hair RENDERING: Simplified, rounded, smooth cartoon style (not realistic strands)
- Hair COLOR: Change to MINT GREEN only
- IMPORTANT: The hair silhouette should match the original person, NOT the style reference
- Do NOT add any bumps or protrusions on top of head that weren't in original photo

FIXED ELEMENTS (ALWAYS PRESENT - copy EXACTLY from style reference):
1. Blue/white striped HEADBAND - exact design from style reference
2. Pair of LEAVES (나뭇잎 쌍) - SAME MINT GREEN as hair color, exact shape from style reference
3. Blue T-SHIRT - same blue as headband stripes
4. WHITE background

FROM STYLE REFERENCE (copy these EXACTLY):
- 3D cartoon rendering quality (Pixar-like)
- Headband: blue/white striped design
- Leaf pair: shape, position, and style (color = same mint green as hair)
- T-shirt: blue color matching headband
- EYES: Must have visible WHITE sclera (eye whites) - this is key character identity
- Overall cute character aesthetic

FROM ORIGINAL PHOTO (preserve these):
- Face shape and proportions
- Eyebrow shape
- HAIRSTYLE SHAPE (length, volume, style - NOT from style reference!)
${glassesText}
EXPRESSION: ${expressionText}

IMPORTANT:
- The hair shape must match the ORIGINAL PHOTO, not the style reference
- Only change hair COLOR to mint green
- T-shirt color = headband blue color`;
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
            referenceImages,    // base64 배열 (얼굴 사진)
            style = 'namoo',    // 'namoo' 스타일 고정 (확장 가능)
            expression = 'original',
            faceStrength = 50   // 20~80, 낮을수록 캐릭터 스타일 강조
        } = req.body;

        if (!referenceImages || referenceImages.length === 0) {
            return res.status(400).json({ error: 'Reference image is required' });
        }

        // 1단계: 스타일 참조 이미지 로드
        let styleReferenceBase64 = null;
        if (STYLE_REFERENCE_IMAGES[style]) {
            try {
                styleReferenceBase64 = await loadStyleReferenceImage(STYLE_REFERENCE_IMAGES[style]);
                console.log('[CharacterGen] Style reference image loaded');
            } catch (e) {
                console.warn('[CharacterGen] Failed to load style reference:', e.message);
            }
        }

        // 2단계: Gemini Flash로 얼굴 분석 (성별, 안경, 얼굴형)
        console.log('[CharacterGen] Analyzing face...');
        const faceAnalysis = await analyzeFaceWithGeminiFlash(referenceImages[0]);
        console.log('[CharacterGen] Face analysis:', faceAnalysis);

        // 3단계: 변환 프롬프트 생성
        const prompt = buildTransformPrompt(faceAnalysis, expression, faceStrength);

        // 4단계: 이미지 배열 구성
        // 핵심: [스타일 참조, 얼굴 사진] - 마지막 이미지가 더 중요하게 처리됨
        const allImages = [];
        if (styleReferenceBase64) {
            allImages.push(styleReferenceBase64);  // 스타일 먼저
        }
        allImages.push(...referenceImages);  // 얼굴 나중 (더 중요)

        console.log('[CharacterGen] Starting generation...', {
            style,
            expression,
            faceRefCount: referenceImages.length,
            hasStyleRef: !!styleReferenceBase64,
            faceAnalysis
        });

        const result = await generateWithGemini3Pro(prompt, allImages, '1:1');

        const generationTime = Date.now() - startTime;

        // Supabase 저장
        const savedImage = await saveToSupabase(result.imageData, {
            prompt,
            style,
            expression,
            generationTime,
            referenceCount: referenceImages.length
        });

        return res.status(200).json({
            success: true,
            image: `data:image/png;base64,${result.imageData}`,
            savedImage,
            model: 'gemini-3-pro-image',
            generationTime,
            usageMetadata: result.usageMetadata
        });

    } catch (error) {
        const generationTime = Date.now() - startTime;
        console.error('[CharacterGen] Error:', error.message);

        return res.status(500).json({
            error: error.message,
            generationTime
        });
    }
};

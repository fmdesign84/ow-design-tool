const { createClient } = require('@supabase/supabase-js');

/**
 * Vercel Serverless Function - Character Generation (Gemini 3 Pro Image)
 * 
 * Specifically tuned for the "Namoo" (Tree) character style.
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

// 스타일별 참조 이미지 URL (Vercel에서 접근 가능한 public 경로)
const STYLE_REFERENCE_IMAGES = {
    namoo: '/images/styles/namoo-sample.png'
};

// 스타일 참조 이미지를 base64로 로드
async function loadStyleReferenceImage(styleImagePath) {
    // Vercel 환경에서는 외부 URL로 접근해야 함
    // 로컬/빌드 시에는 fs로 직접 읽기 시도
    try {
        const fs = require('fs');
        const path = require('path');

        // public 폴더 경로
        const publicPath = path.join(process.cwd(), 'public', styleImagePath);

        if (fs.existsSync(publicPath)) {
            const imageBuffer = fs.readFileSync(publicPath);
            return imageBuffer.toString('base64');
        }
    } catch (e) {
        // fs 사용 불가 시 (Vercel Edge 등) 무시
    }

    // Vercel 배포 환경에서는 fetch로 가져오기
    const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}${styleImagePath}`);
    if (!response.ok) {
        throw new Error(`Failed to load style reference image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
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
            expression = 'happy'
        } = req.body;

        if (!referenceImages || referenceImages.length === 0) {
            return res.status(400).json({ error: 'Reference image is required' });
        }

        // 스타일 참조 이미지 로드
        let styleReferenceBase64 = null;
        if (STYLE_REFERENCE_IMAGES[style]) {
            try {
                styleReferenceBase64 = await loadStyleReferenceImage(STYLE_REFERENCE_IMAGES[style]);
                console.log('[CharacterGen] Style reference image loaded');
            } catch (e) {
                console.warn('[CharacterGen] Failed to load style reference:', e.message);
            }
        }

        // 스타일 참조 이미지를 포함한 프롬프트
        const prompt = styleReferenceBase64
            ? `Transform the person in the FIRST image into a 3D character that matches EXACTLY the style shown in the SECOND image.

CRITICAL INSTRUCTIONS:
1. The FIRST image is the person's face photo - preserve their EXACT facial features, face shape, eye shape, and identity.
2. The SECOND image is the style reference - match this EXACT 3D rendering style, including:
   - The same mint green fluffy hair texture and shape
   - The same blue and white striped headband
   - The same blue t-shirt
   - The same 3D rendering quality, lighting, and shading
   - The same cartoon proportions (large round eyes, round face)
   - Clean white background

The person in the output MUST be clearly recognizable as the person from the first image, but rendered in the EXACT same style as the second image.
Expression: ${expression === 'happy' ? 'smiling happily' : 'neutral expression'}

Output a single high-quality 3D character portrait.`
            : `Create a cute 3D stylized character portrait of the EXACT same person shown in the reference image.

STYLE REQUIREMENTS (Namoo Style):
- Cute 3D rendering style, similar to Pixar or Toy Story
- Hair color: Vibrant Mint or Light Green
- Hair texture: Fluffy, cloud-like shape resembling tree foliage
- Headband: Wearing a blue and white striped headband
- Clothing: Wearing a simple blue t-shirt
- Background: Clean, solid white background
- Composition: Close-up portrait (head and shoulders)
- Lighting: Bright, soft 3D studio lighting with subtle shadows

CRITICAL IDENTITY PRESERVATION:
- Maintain the EXACT facial features, face shape, and eye shape of the person in the reference photo.
- The character must be clearly recognizable as the person in the reference photo.
- Expression: ${expression === 'happy' ? 'smiling happily' : 'neutral professional expression'}

Final output should be a single, high-quality 3D rendered image on a white background.`;

        // 이미지 배열 구성: [얼굴 사진들..., 스타일 참조 이미지]
        const allImages = [...referenceImages];
        if (styleReferenceBase64) {
            allImages.push(styleReferenceBase64);
        }

        console.log('[CharacterGen] Starting generation...', {
            style,
            expression,
            faceRefCount: referenceImages.length,
            hasStyleRef: !!styleReferenceBase64
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

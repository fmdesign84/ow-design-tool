const { GoogleAuth } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

/**
 * Vercel Serverless Function - ID Photo Generation (Gemini 3 Pro Image)
 *
 * 심플한 파이프라인:
 * 1. 참조 이미지 1-2장 받기
 * 2. 바로 Gemini 3 Pro Image에 전달 (분석 단계 없음)
 * 3. 결과 반환
 *
 * Gemini 3 Pro Image는 최대 5장 참조 + 캐릭터 일관성 지원
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
        const fileName = `idphoto-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

        const { error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(fileName, buffer, { contentType: 'image/png', cacheControl: '3600' });

        if (uploadError) throw uploadError;

        // 업로드 후 잠시 대기 (스토리지 동기화)
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(fileName);

        const { data: dbData, error: dbError } = await supabase.from('images').insert({
            image_url: publicUrl,
            prompt: metadata.prompt || '',
            model: 'gemini-3-pro-image',
            style: 'idphoto',
            aspect_ratio: '3:4',
            quality: 'hd'
        }).select().single();

        if (dbError) console.error('[Supabase] DB insert error:', dbError.message);

        console.log('[Supabase] ID Photo saved:', dbData?.id);

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

// Gemini 3 Pro Image 호출 (다중 참조 이미지 지원)
async function generateWithGemini3Pro(prompt, referenceImages = [], aspectRatio = '3:4') {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    console.log(`[Gemini 3 Pro] Starting... RefImages: ${referenceImages.length}`);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`;

    // parts 구성: 텍스트 + 참조 이미지들 (최대 5장)
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

    console.log(`[Gemini 3 Pro] ${imagesToProcess.length} reference image(s) added`);

    const requestBody = {
        contents: [{ parts }],
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: '2K'  // 1K(기본), 2K, 4K 지원 - 2K = 약 1536x2048
            }
        }
    };

    const response = await fetchWithTimeout(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    }, 50000); // 50초 타임아웃

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API failed (${response.status}): ${errText}`);
    }

    const data = await response.json();

    // 이미지 추출
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
            referenceImages,    // base64 배열 (1-5장)
            purpose,            // 'resume' | 'visa' | 'profile' | 'employee-card'
            background,         // 'white' | 'light-gray' | 'light-blue'
            // 복장 계층
            clothingMode,       // 'keep' | 'warm' | 'cool'
            clothingStyle,      // 웜톤/쿨톤별 하위 옵션
            // 머리스타일 계층
            hairMode,           // 'keep' | 'custom'
            hairGender,         // 'female' | 'male'
            hairStyle,          // 여성: pixie/bob/shoulder/mid-long/long, 남성: two-block/dandy/pomade/side-part/natural
            hairWave,           // 'straight' | 'wave'
            earVisibility,      // 'any' | 'visible'
            bangs,              // 'keep' | 'with' | 'without'
            // 화장 계층
            makeupMode,         // 'none' | 'warm' | 'cool'
            makeupIntensity,    // 10-100
            // 보정
            retouch,            // { blemish, wrinkle, darkCircle, slimFace, brightEyes, brightness }
        } = req.body;

        if (!referenceImages || referenceImages.length === 0) {
            return res.status(400).json({
                error: 'At least one reference image is required',
                friendlyMessage: { message: '얼굴 사진을 최소 1장 업로드해주세요.' }
            });
        }

        // 보정 옵션 기본값
        const retouchOptions = {
            blemish: retouch?.blemish ?? 50,
            wrinkle: retouch?.wrinkle ?? 30,
            darkCircle: retouch?.darkCircle ?? 40,
            slimFace: retouch?.slimFace ?? 20,
            brightEyes: retouch?.brightEyes ?? 30,
            brightness: retouch?.brightness ?? 50,
        };

        // 배경 프롬프트
        const backgroundDesc = {
            'white': 'pure white studio background',
            'light-gray': 'light gray studio background',
            'light-blue': 'light blue studio background',
        }[background] || 'pure white studio background';

        // 복장 프롬프트 (계층 구조)
        let clothingDesc = 'keeping the same clothing from the reference photo';
        if (clothingMode !== 'keep') {
            const clothingStyleDescMap = {
                // 웜톤
                'suit-brown': 'wearing a warm-toned professional brown suit with ivory dress shirt',
                'suit-beige': 'wearing a warm-toned elegant beige suit with cream dress shirt',
                'suit-camel': 'wearing a warm-toned camel colored suit with light tan dress shirt',
                'casual-warm': 'wearing warm-toned smart casual attire with earthy colors',
                // 쿨톤
                'suit-navy': 'wearing a cool-toned professional navy blue suit with white dress shirt',
                'suit-charcoal': 'wearing a cool-toned professional charcoal gray suit with white dress shirt',
                'suit-black': 'wearing a cool-toned classic black suit with crisp white dress shirt',
                'casual-cool': 'wearing cool-toned smart casual attire with blue or gray tones',
            };
            clothingDesc = clothingStyleDescMap[clothingStyle] ||
                (clothingMode === 'warm' ? 'wearing warm-toned professional attire with earth tones' :
                'wearing cool-toned professional attire with blue or gray tones');
        }

        // 머리스타일 프롬프트 (계층 구조)
        const hairPrompts = [];

        if (hairMode === 'keep') {
            hairPrompts.push('EXACTLY the same hairstyle, length, and texture as reference photo');
        } else {
            // 여성 스타일
            const femaleStyleMap = {
                'pixie': 'very short pixie cut hairstyle above the ears',
                'bob': 'short bob cut hairstyle at jaw level',
                'shoulder': 'medium shoulder-length hair at collarbone level',
                'mid-long': 'long hair above chest level',
                'long': 'very long hair below chest level',
            };

            // 남성 스타일
            const maleStyleMap = {
                'two-block': 'modern two-block undercut with volume on top, short sides',
                'dandy': 'classic dandy cut professional business hairstyle',
                'pomade': 'slicked back pomade style with neat finish',
                'side-part': 'clean side part 7:3 ratio professional look',
                'natural': 'natural down perm with soft casual texture',
            };

            // 성별에 따른 스타일 적용
            if (hairGender === 'female' && femaleStyleMap[hairStyle]) {
                hairPrompts.push(femaleStyleMap[hairStyle]);
            } else if (hairGender === 'male' && maleStyleMap[hairStyle]) {
                hairPrompts.push(maleStyleMap[hairStyle]);
            }

            // 웨이브 옵션
            if (hairWave === 'wave') {
                hairPrompts.push('with soft natural waves');
            } else {
                hairPrompts.push('with straight sleek texture');
            }

            // 귀 노출
            if (earVisibility === 'visible') {
                hairPrompts.push('hair tucked behind ears with both ears clearly visible');
            }

            // 앞머리
            if (bangs === 'with') {
                hairPrompts.push('with bangs/fringe covering forehead');
            } else if (bangs === 'without') {
                hairPrompts.push('without bangs, forehead visible');
            }
        }

        const hairDesc = hairPrompts.length > 0
            ? `Hair: ${hairPrompts.join(', ')}`
            : 'Hair: EXACTLY preserved from reference - same color, length, style, texture';

        // 화장 프롬프트 (계층 구조)
        let makeupDesc = '';
        if (makeupMode && makeupMode !== 'none') {
            const intensity = makeupIntensity || 50;
            const intensityLevel = intensity > 70 ? 'bold and glamorous' :
                                   intensity > 40 ? 'natural and polished' : 'subtle and minimal';

            if (makeupMode === 'warm') {
                makeupDesc = `with ${intensityLevel} warm-toned makeup featuring peach, coral, and bronze shades`;
            } else {
                makeupDesc = `with ${intensityLevel} cool-toned makeup featuring pink, mauve, and berry shades`;
            }
        }

        // 보정 프롬프트 생성
        const retouchPrompts = [];

        // 잡티/기미 제거
        if (retouchOptions.blemish > 30) {
            const level = retouchOptions.blemish > 70 ? 'completely clear' : 'subtly retouched';
            retouchPrompts.push(`skin with ${level} removal of blemishes, acne marks, spots, and freckles`);
        }

        // 주름/모공 완화 (목주름 포함)
        if (retouchOptions.wrinkle > 20) {
            const level = retouchOptions.wrinkle > 60 ? 'smoothed' : 'slightly softened';
            retouchPrompts.push(`${level} wrinkles (including eye area, smile lines, forehead, and neck wrinkles) and minimized pores`);
        }

        // 다크서클 제거
        if (retouchOptions.darkCircle > 30) {
            const level = retouchOptions.darkCircle > 60 ? 'bright and clear' : 'subtly brightened';
            retouchPrompts.push(`${level} under-eye area with reduced dark circles`);
        }

        // 얼굴 갸름하게
        if (retouchOptions.slimFace > 20) {
            const level = retouchOptions.slimFace > 50 ? 'noticeably slimmer' : 'slightly refined';
            retouchPrompts.push(`${level} face shape with refined jawline`);
        }

        // 눈 생기있게
        if (retouchOptions.brightEyes > 20) {
            const level = retouchOptions.brightEyes > 50 ? 'bright and vibrant' : 'subtly enhanced';
            retouchPrompts.push(`${level} eyes with natural sparkle`);
        }

        // 전체 밝기
        let brightnessDesc = 'balanced studio lighting';
        if (retouchOptions.brightness > 60) {
            brightnessDesc = 'bright and luminous lighting';
        } else if (retouchOptions.brightness < 40) {
            brightnessDesc = 'soft and natural lighting';
        }

        const retouchDesc = retouchPrompts.length > 0
            ? `Professional retouching with: ${retouchPrompts.join(', ')}`
            : 'with natural skin texture preserved';

        // 증명사진 전용 프롬프트 (캐릭터 일관성 강조)
        const prompt = `Create a professional Korean ID photo portrait of EXACTLY the same person shown in the reference image(s).

CRITICAL IDENTITY PRESERVATION:
- Face must be IDENTICAL to the reference - same facial features, bone structure, eyes, nose, mouth, skin tone
- This is for official ID photo use where the person must be recognizable

Style requirements:
- ${backgroundDesc}
- ${clothingDesc}
- ${hairDesc}${makeupDesc ? `\n- ${makeupDesc}` : ''}
- Facing camera directly with neutral professional expression
- ${brightnessDesc}
- Sharp focus on face
- ${retouchDesc}
- Standard passport/ID photo composition (head and shoulders)
- High resolution, 8K quality

IMPORTANT: Keep the person's identity and face EXACTLY the same as the reference photo(s). Follow the hair and style instructions above precisely.`;

        console.log('[IDPhoto] Request:', { purpose, clothingMode, clothingStyle, background, hairMode, makeupMode, refCount: referenceImages.length });

        // Gemini 3 Pro Image로 생성
        const result = await generateWithGemini3Pro(prompt, referenceImages, '3:4');

        const generationTime = Date.now() - startTime;
        console.log(`[IDPhoto] Generated in ${generationTime}ms`);

        // Supabase 저장
        const savedImage = await saveToSupabase(result.imageData, {
            prompt,
            purpose,
            clothing: clothingStyle || clothingMode,
            background,
            hairMode,
            makeupMode,
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
        console.error('[IDPhoto] Error:', error.message);

        let friendlyMessage = { message: '증명사진 생성 중 문제가 발생했어요. 다시 시도해주세요.' };

        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
            friendlyMessage.message = '서버가 바빠서 시간이 오래 걸리고 있어요. 이미지 크기를 줄이거나 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('SAFETY') || error.message.includes('safety')) {
            friendlyMessage.message = '안전 정책에 맞지 않는 이미지가 감지되었어요. 다른 사진으로 시도해주세요.';
        } else if (error.message.includes('GEMINI_API_KEY')) {
            friendlyMessage.message = '서비스 설정에 문제가 있어요. 관리자에게 문의해주세요.';
        }

        return res.status(500).json({
            error: error.message,
            friendlyMessage,
            generationTime
        });
    }
};

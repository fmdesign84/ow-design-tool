const { createClient } = require('@supabase/supabase-js');

/**
 * Vercel Serverless Function - Character Expression Sheet
 * 캐릭터 이미지를 기반으로 다양한 표정의 그리드 시트 생성
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
        const fileName = `expression-sheet-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

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
                prompt: `캐릭터 표정 시트 (${metadata?.expressionSet || 'default'})`,
                model: 'gemini-3-pro-image-preview',
                style: 'expression-sheet',
                aspect_ratio: '1:1',
                quality: 'standard'
            })
            .select()
            .single();

        if (dbError) {
            console.error('[Supabase] DB insert error:', dbError.message);
            return { image_url: publicUrl };
        }

        console.log('[Supabase] Expression sheet saved:', dbData.id);
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

// 표정 세트 정의
const EXPRESSION_SETS = {
    'basic-9': {
        grid: '3x3',
        expressions: [
            'neutral (default, calm, resting face)',
            'happy smile (gentle, warm smile with eyes slightly squinted)',
            'big laugh (mouth wide open, eyes closed with joy, very happy)',
            'surprised (eyes wide open, mouth slightly open, raised eyebrows)',
            'sad (downturned mouth, slightly droopy eyes, melancholy)',
            'angry (furrowed brows, tight mouth, intense eyes)',
            'tired/exhausted (half-closed eyes, slight sweat drops, weary)',
            'winking (one eye closed playfully, slight smile)',
            'determined (focused eyes, slight frown, confident jaw)',
        ],
    },
    'emotion-6': {
        grid: '2x3',
        expressions: [
            'happy (bright smile, sparkling eyes)',
            'sad (teary eyes, downturned mouth)',
            'angry (furrowed brows, gritted teeth)',
            'surprised (wide eyes, open mouth)',
            'scared (trembling, wide eyes, pale)',
            'disgusted (scrunched nose, tongue out slightly)',
        ],
    },
};

// 표정 시트 프롬프트 생성
function buildExpressionSheetPrompt(expressionSet, customExpressions) {
    let expressions;
    let gridLayout;

    if (expressionSet === 'custom' && customExpressions) {
        const customList = customExpressions.split(',').map(e => e.trim()).filter(Boolean);
        expressions = customList;
        // 그리드 자동 결정
        const count = customList.length;
        if (count <= 4) gridLayout = '2x2';
        else if (count <= 6) gridLayout = '2x3';
        else gridLayout = '3x3';
    } else {
        const preset = EXPRESSION_SETS[expressionSet] || EXPRESSION_SETS['basic-9'];
        expressions = preset.expressions;
        gridLayout = preset.grid;
    }

    const rows = parseInt(gridLayout.split('x')[0]);
    const cols = parseInt(gridLayout.split('x')[1]);

    const expressionList = expressions
        .map((expr, i) => `${i + 1}. ${expr}`)
        .join('\n');

    return `Create a CHARACTER EXPRESSION SHEET for this 3D cartoon character.

REFERENCE CHARACTER (from provided image):
- Keep EXACTLY the same character: same face shape, same mint green hair, same hairstyle, same headband, same leaf accessories
- Keep the EXACT same 3D cartoon art style (Pixar/Disney quality)
- Every expression must be CLEARLY the same character, just with different facial expressions

LAYOUT:
- Arrange in a clean ${gridLayout} GRID (${rows} rows, ${cols} columns)
- Each cell shows the character's HEAD and UPPER SHOULDERS only (bust shot)
- Each cell is the SAME SIZE, evenly spaced
- Clean white or very light gray background for the entire sheet
- Thin light gray dividing lines between cells (optional but helpful)
- Each expression should be LABELED below the portrait with small clean text

EXPRESSIONS (${expressions.length} total, fill the ${gridLayout} grid):
${expressionList}

CRITICAL RULES:
- The character must look IDENTICAL in every cell (same hair, same accessories, same art style)
- ONLY the facial expression changes between cells
- Same camera angle for every cell (front-facing, slight 3/4 angle)
- Same lighting for every cell (soft, even studio lighting)
- Clean, professional character sheet look - like a production reference sheet
- NO background elements, NO props - just the character portraits
- High quality, crisp, detailed rendering

HAIR WARNING:
- Do NOT add bumpy/puffy volume on top of head
- Keep the EXACT hair shape from the reference in ALL cells`;
}

// Gemini 이미지 생성
async function generateWithGemini(prompt, characterImage) {
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
                aspectRatio: '1:1',
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
async function generateWithRetry(prompt, characterImage) {
    try {
        return await generateWithGemini(prompt, characterImage);
    } catch (error) {
        if (error.message === 'SAFETY_BLOCKED') {
            console.log('[ExpressionSheet] Safety blocked, retrying with softer prompt...');
            const saferPrompt = prompt.replace(/angry|scared|disgusted|gritted teeth/gi, 'serious')
                + '\n\nIMPORTANT: Keep all expressions family-friendly and appropriate for all audiences.';
            return await generateWithGemini(saferPrompt, characterImage);
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
            expressionSet = 'basic-9',
            customExpressions = '',
        } = req.body;

        if (!characterImage) {
            return res.status(400).json({ error: 'Character image is required' });
        }

        console.log('[ExpressionSheet] Starting generation...', {
            expressionSet,
            hasCustom: !!customExpressions,
        });

        const prompt = buildExpressionSheetPrompt(expressionSet, customExpressions);
        const result = await generateWithRetry(prompt, characterImage);

        const generationTime = Date.now() - startTime;

        const savedImage = await saveToSupabase(result.imageData, {
            expressionSet,
        });

        return res.status(200).json({
            success: true,
            image: `data:image/png;base64,${result.imageData}`,
            savedImage,
            expressionSet,
            model: 'gemini-3-pro-image-preview',
            generationTime,
            usageMetadata: result.usageMetadata
        });

    } catch (error) {
        const generationTime = Date.now() - startTime;
        console.error('[ExpressionSheet] Error:', error.message);

        return res.status(500).json({
            error: error.message,
            generationTime
        });
    }
};

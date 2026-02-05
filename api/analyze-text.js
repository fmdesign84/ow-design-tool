/**
 * Vercel Serverless Function - Text Analysis for Mockup Images
 *
 * 목업 이미지 내 텍스트 분석:
 * - Gemini Vision으로 텍스트 영역 감지
 * - 각 텍스트의 품질(가독성) 평가
 * - 깨진 텍스트 영역의 바운딩 박스 좌표 반환
 */

const { createClient } = require('@supabase/supabase-js');

// 에러 로깅
async function logError(errorType, errorMessage, requestData, responseData = null) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('error_logs').insert({
            service: 'analyze-text',
            error_type: errorType,
            error_message: errorMessage,
            request_data: requestData,
            response_data: responseData,
            resolved: false
        });
    } catch (e) {
        console.error('[ErrorLog] Exception:', e.message);
    }
}

module.exports.config = {
    maxDuration: 30,
};

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { image, originalText } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Image is required' });
    }

    const startTime = Date.now();

    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        // 이미지 데이터 추출
        let imageBase64 = image;
        let imageMimeType = 'image/png';

        if (image.startsWith('data:')) {
            const matches = image.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                imageMimeType = matches[1];
                imageBase64 = matches[2];
            }
        }

        // Gemini Vision API로 텍스트 분석
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

        // AI 생성 이미지의 텍스트 품질 분석 프롬프트
        // 핵심: 맥락 기반 판단 - "이 장면에서 이 위치에 맞는 텍스트인가?"
        const analysisPrompt = `You are analyzing an AI-generated image for TEXT QUALITY.

STEP 1: UNDERSTAND THE CONTEXT
First, identify what this image shows:
- Is it a subway station? A cafe? A billboard? A product mockup?
- What kind of text SHOULD appear in this context?

STEP 2: ANALYZE EACH TEXT AREA
For each text area:
1. What characters do you see?
2. Does it make sense IN THIS CONTEXT?
   - Subway station sign → should be a real station name (강남, 홍대입구, etc.)
   - Cafe menu → should be real drink/food names
   - Store sign → should be a plausible business name
3. Is it gibberish or corrupted?
   - "ㄷㄴㅇㄹ" = gibberish consonants
   - "카ㅍ레" = broken Korean
   - Random symbols = corrupted

STEP 3: SUGGEST CORRECTIONS
If text is broken/gibberish, suggest what it SHOULD say based on context.
- Subway sign with "강ㄴㅁ" → suggest "강남"
- Cafe sign with "COfF33" → suggest "COFFEE"

${originalText ? `HINT: The intended text was: "${originalText}"` : ''}

Return JSON:
{
  "imageContext": "brief description (e.g., 'subway station mockup', 'cafe interior')",
  "textAreas": [
    {
      "detectedText": "exactly what you see",
      "isValidText": true/false,
      "contextAppropriate": true/false,
      "suggestedText": "what it should say (if needs correction)",
      "quality": 1-10,
      "issues": [],
      "boundingBox": {"x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100},
      "needsCorrection": true/false
    }
  ],
  "overallQuality": 1-10,
  "hasCorruptedText": true/false,
  "summary": "한글 요약"
}

EXAMPLES:
1. Subway mockup with "강ㄴㅁ역" → needsCorrection: true, suggestedText: "강남역"
2. Cafe with "아메리카노" → needsCorrection: false (valid text)
3. Billboard with "ㅎㄱㅂㄷ" → needsCorrection: true, suggestedText: (infer from image context)
4. Store sign "OPEN" → needsCorrection: false (valid English)

Be STRICT about gibberish. If it's not a real word, mark needsCorrection: true.`;

        console.log('[AnalyzeText] Starting analysis...');

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: analysisPrompt },
                        {
                            inline_data: {
                                mime_type: imageMimeType,
                                data: imageBase64
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 2048,
                    responseMimeType: 'application/json'
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[AnalyzeText] Gemini error (${response.status}):`, errText);
            throw new Error(`Gemini API failed: ${response.status}`);
        }

        const data = await response.json();
        let analysisResult = null;

        // 응답에서 텍스트 추출
        for (const candidate of (data.candidates || [])) {
            for (const part of (candidate.content?.parts || [])) {
                if (part.text) {
                    try {
                        // JSON 파싱 시도
                        analysisResult = JSON.parse(part.text);
                    } catch (e) {
                        // JSON이 아니면 텍스트 그대로 반환
                        console.log('[AnalyzeText] Response is not JSON, returning raw text');
                        analysisResult = { rawResponse: part.text };
                    }
                }
            }
        }

        if (!analysisResult) {
            throw new Error('No analysis result from Gemini');
        }

        const totalTime = Date.now() - startTime;
        console.log(`[AnalyzeText] Complete in ${totalTime}ms, hasCorrupted: ${analysisResult.hasCorruptedText}`);

        // 보정이 필요한 영역 필터링
        const areasNeedingCorrection = analysisResult.textAreas?.filter(area => area.needsCorrection) || [];

        res.status(200).json({
            success: true,
            analysis: analysisResult,
            needsCorrection: areasNeedingCorrection.length > 0,
            correctionAreas: areasNeedingCorrection,
            debug: {
                totalTime: `${totalTime}ms`,
                textAreasFound: analysisResult.textAreas?.length || 0,
                areasNeedingCorrection: areasNeedingCorrection.length
            }
        });

    } catch (err) {
        console.error('[AnalyzeText Error]', err);

        await logError('ANALYSIS_ERROR', err.message, { hasImage: !!image }, { stack: err.stack });

        res.status(500).json({
            error: 'Text analysis failed',
            message: err.message,
            friendlyMessage: {
                message: '텍스트 분석에 실패했어요. 다시 시도해주세요 🔄',
                suggestion: '이미지 품질을 확인하거나 다시 업로드해보세요.'
            }
        });
    }
};

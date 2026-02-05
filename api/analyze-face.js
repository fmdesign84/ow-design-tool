/**
 * 증명사진용 얼굴 분석 API
 *
 * Gemini Vision으로 얼굴/조명/각도/배경 분석
 * 다중 이미지 지원: 최대 6장을 병렬로 분석하여 최적의 이미지 선별
 *
 * 입력: { image: base64 } 또는 { images: base64[] }
 * 출력: { faceDetected, lighting, angle, background, glasses, ..., selectedImages, allResults }
 */

module.exports.config = {
    maxDuration: 45, // 다중 이미지 분석을 위해 시간 증가
};

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { image, images } = req.body;

    // 단일 이미지 또는 다중 이미지 지원
    const imageList = images || (image ? [image] : []);

    if (imageList.length === 0) {
        return res.status(400).json({ error: 'image or images is required' });
    }

    const startTime = Date.now();

    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        // 단일 이미지 분석 함수
        async function analyzeOneImage(imageData, index) {
            // base64 데이터 정리
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            const mimeMatch = imageData.match(/^data:(image\/\w+);base64,/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

            // 분석 프롬프트
            const analysisPrompt = `You are an ID photo quality analyzer. Analyze this image for ID photo suitability.

Evaluate these criteria and respond in JSON format only:

1. **Face Detection**: Is there exactly one face clearly visible?
2. **Lighting**:
   - good (80-100%): Even lighting, no harsh shadows on face
   - warning (50-79%): Slight shadows or uneven lighting
   - bad (0-49%): Dark, backlit, or very uneven lighting
3. **Angle**:
   - good (0-5°): Looking straight at camera
   - warning (6-15°): Slight tilt or turn
   - bad (16°+): Significant tilt or profile view
4. **Background**:
   - good: Solid color, clean
   - warning: Slightly busy or textured
   - bad: Complex, cluttered, or distracting
5. **Glasses**: Does the person wear glasses? If yes, is there reflection/glare?

Respond with this exact JSON structure:
{
  "faceDetected": boolean,
  "lighting": "good" | "warning" | "bad",
  "lightingScore": number (0-100),
  "angle": "good" | "warning" | "bad",
  "angleOffset": number (estimated degrees from frontal),
  "background": "good" | "warning" | "bad",
  "backgroundType": string (e.g., "단색 배경", "복잡한 배경", "야외 배경"),
  "glasses": boolean,
  "glassesReflection": boolean
}

Output JSON only, no explanation.`;

            // Gemini Vision API 호출 (API 키 방식)
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [
                            {
                                inlineData: {
                                    mimeType,
                                    data: base64Data,
                                },
                            },
                            { text: analysisPrompt },
                        ],
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 500,
                        responseMimeType: 'application/json',
                    },
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`[AnalyzeFace] Image ${index} - Gemini Error:`, errText);
                throw new Error(`Gemini API failed: ${response.status}`);
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textContent) {
                throw new Error('No analysis result from Gemini');
            }

            // JSON 파싱
            let analysisResult;
            try {
                const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                                  textContent.match(/```\s*([\s\S]*?)\s*```/);
                const jsonStr = jsonMatch ? jsonMatch[1] : textContent;
                analysisResult = JSON.parse(jsonStr.trim());
            } catch (parseError) {
                console.error(`[AnalyzeFace] Image ${index} - JSON parse error:`, parseError);
                analysisResult = {
                    faceDetected: true,
                    lighting: 'warning',
                    lightingScore: 70,
                    angle: 'good',
                    angleOffset: 5,
                    background: 'warning',
                    backgroundType: '분석 실패',
                    glasses: false,
                    glassesReflection: false,
                };
            }

            // backgroundType 한글화
            const bgTypeMap = {
                'solid color': '단색 배경',
                'plain': '단색 배경',
                'white': '흰색 배경',
                'clean': '깔끔한 배경',
                'busy': '복잡한 배경',
                'complex': '복잡한 배경',
                'cluttered': '어수선한 배경',
                'outdoor': '야외 배경',
                'textured': '질감 있는 배경',
            };

            if (analysisResult.backgroundType) {
                const lowerBg = analysisResult.backgroundType.toLowerCase();
                for (const [eng, kor] of Object.entries(bgTypeMap)) {
                    if (lowerBg.includes(eng)) {
                        analysisResult.backgroundType = kor;
                        break;
                    }
                }
            }

            return {
                index,
                ...analysisResult,
            };
        }

        // 모든 이미지 병렬 분석
        console.log(`[AnalyzeFace] Analyzing ${imageList.length} image(s) in parallel...`);

        const analysisPromises = imageList.map((img, idx) =>
            analyzeOneImage(img, idx).catch(err => ({
                index: idx,
                error: err.message,
                faceDetected: false,
                lighting: 'bad',
                lightingScore: 0,
                angle: 'bad',
                angleOffset: 90,
                background: 'bad',
                backgroundType: '분석 실패',
                glasses: false,
                glassesReflection: false,
            }))
        );

        const allResults = await Promise.all(analysisPromises);

        // 점수 계산 함수 (높을수록 좋음)
        function calculateScore(result) {
            if (!result.faceDetected) return -1000;

            let score = 0;

            // 조명 점수 (최대 40점)
            score += result.lightingScore * 0.4;

            // 각도 점수 (최대 30점)
            const angleScore = Math.max(0, 30 - result.angleOffset * 2);
            score += angleScore;

            // 조명/각도/배경 상태 보너스
            if (result.lighting === 'good') score += 10;
            else if (result.lighting === 'warning') score += 5;

            if (result.angle === 'good') score += 10;
            else if (result.angle === 'warning') score += 5;

            if (result.background === 'good') score += 10;
            else if (result.background === 'warning') score += 5;

            // 안경 반사 페널티
            if (result.glassesReflection) score -= 10;

            return score;
        }

        // 점수 계산 및 정렬
        const scoredResults = allResults.map(result => ({
            ...result,
            score: calculateScore(result),
        }));

        // 점수 높은 순으로 정렬
        scoredResults.sort((a, b) => b.score - a.score);

        // 상위 5개 선택 (Gemini 3 Pro 최대 참조 이미지 수)
        const selectedIndices = scoredResults
            .filter(r => r.faceDetected && r.score > 0)
            .slice(0, 5)
            .map(r => r.index);

        // 메인 결과 (가장 좋은 이미지)
        const mainResult = scoredResults[0];

        const totalTime = Date.now() - startTime;
        console.log(`[AnalyzeFace] Completed ${imageList.length} images in ${totalTime}ms`);
        console.log(`[AnalyzeFace] Selected indices: [${selectedIndices.join(', ')}], scores: [${scoredResults.map(r => r.score.toFixed(1)).join(', ')}]`);

        return res.status(200).json({
            success: true,
            // 메인 결과 (기존 호환)
            ...mainResult,
            // 다중 이미지 결과
            multiImage: imageList.length > 1,
            allResults: scoredResults,
            selectedIndices, // 선별된 이미지 인덱스 (최대 5개)
            timing: `${totalTime}ms`,
        });

    } catch (error) {
        console.error('[AnalyzeFace] Error:', error);
        return res.status(500).json({
            error: error.message,
            // 에러 시에도 기본 분석 결과 반환 (UX 유지)
            faceDetected: true,
            lighting: 'warning',
            lightingScore: 70,
            angle: 'good',
            angleOffset: 5,
            background: 'warning',
            backgroundType: '분석 실패',
            glasses: false,
            glassesReflection: false,
        });
    }
};

/**
 * Vercel Serverless Function - Prompt Enhancer
 *
 * Gemini Flash를 사용해 간단한 프롬프트를 상세하고 멋진 프롬프트로 변환
 * - 이미지/영상 생성에 최적화된 프롬프트 생성
 * - 스타일, 조명, 분위기 등 자동 추가
 */

import { setupRequest } from './lib/middleware.js';
import { validatePrompt } from './lib/validators.js';
import { sendSuccess, sendValidationError, sendServerError } from './lib/responseFormatter.js';
import { getGoogleAccessToken, getGeminiUrl } from './lib/googleAuth.js';

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // CORS + OPTIONS + 메서드 검증
  if (setupRequest(req, res, 'POST')) return;

  const { prompt, type = 'image', language = 'ko', image = null } = req.body;

  // 입력 검증
  const validationError = validatePrompt(prompt);
  if (validationError) {
    return sendValidationError(res, validationError);
  }

  const hasImage = !!image;
  console.log(`[Enhance] Input: "${prompt}" (${type}, hasImage: ${hasImage})`);

  try {
    // Google 인증 (공통 유틸 사용)
    const token = await getGoogleAccessToken();
    const geminiUrl = getGeminiUrl('gemini-3-flash-preview');

        // 타입별 시스템 프롬프트 (이미지 유무에 따라 다름)
        const systemPrompts = {
            // 텍스트만 있을 때 - 간결하고 의도에 충실하게
            image: `당신은 AI 이미지 생성 프롬프트 전문가입니다.

핵심 규칙:
1. 사용자 의도에 충실 - 과잉 해석 금지, 없는 감정/의미 추가하지 않기
2. 톤 유지 - 가벼운 입력은 가볍게, 진지한 입력은 진지하게
3. 핵심 요소만 확장 - 시각적 디테일(색감, 조명, 스타일)만 추가
4. 영어로 출력
5. 1-2문장으로 간결하게

예시:
입력: "바다 위 고래" → "A humpback whale breaching the ocean surface, water droplets in sunlight, wide shot, photorealistic"
입력: "귀여운 고양이" → "A cute fluffy cat with big eyes, soft pastel colors, gentle lighting, illustration style"`,

            video: `당신은 AI 영상 생성 프롬프트 전문가입니다.

핵심 규칙:
1. 사용자 의도에 충실 - 과잉 해석 금지, 드라마틱한 감정 추가하지 않기
2. 톤 유지 - 가벼운/재미있는 입력은 가볍게, 진지한 입력은 진지하게
3. 동작 중심 - 핵심 움직임만 명확하게 묘사
4. 간단한 카메라워크만 추가 (필요시)
5. 영어로 출력
6. 1-2문장으로 간결하게

예시:
입력: "달리는 치타" → "A cheetah running across savanna, muscles moving under fur, tracking shot, slow motion"
입력: "눈이 내리는 마을" → "Snow gently falling on a quiet village, soft white flakes, peaceful atmosphere"`,

            // 이미지가 첨부됐을 때 - 이미지 분석 기반
            imageWithRef: `당신은 AI 이미지 생성 프롬프트 전문가입니다.
첨부된 참고 이미지를 분석하고, 사용자의 요청을 반영한 프롬프트를 만들어주세요.

규칙:
1. 이미지 분석 - 스타일, 색감, 구도, 주요 요소 파악
2. 사용자 요청 반영 - 사용자가 원하는 변화/추가 사항 적용
3. 과잉 해석 금지 - 이미지와 요청에 없는 요소 추가하지 않기
4. 영어로 출력
5. 1-2문장으로 간결하게`,

            videoWithRef: `당신은 AI 영상 생성 프롬프트 전문가입니다.
첨부된 이미지를 분석하고, 사용자가 원하는 동작/변화를 적용한 영상 프롬프트를 만들어주세요.

규칙:
1. 이미지 분석 - 현재 장면의 요소들 파악
2. 사용자 요청 반영 - 원하는 동작/변화를 자연스럽게 적용
3. 과잉 해석 금지 - 요청에 없는 드라마틱한 요소 추가하지 않기
4. 톤 유지 - 가벼운 요청은 가볍게
5. 영어로 출력
6. 1-2문장으로 간결하게

예시:
이미지: 북극곰이 얼음 위에 있는 사진
요청: "얼음이 녹게 해줘"
출력: "The ice slowly melts beneath the polar bear, the bear slips into the water, gentle and playful mood"`
        };

        // 이미지 유무에 따라 프롬프트 선택
        let systemPrompt;
        if (hasImage) {
            systemPrompt = type === 'video' ? systemPrompts.videoWithRef : systemPrompts.imageWithRef;
        } else {
            systemPrompt = systemPrompts[type] || systemPrompts.image;
        }

    // 요청 파츠 구성 (이미지 유무에 따라)
        const parts = [];

        // 이미지가 있으면 먼저 추가
        if (hasImage && image) {
            // MIME 타입 추출 및 base64 데이터 분리
            const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
            const imageMimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            parts.push({
                inlineData: {
                    mimeType: imageMimeType,
                    data: base64Data
                }
            });
        }

        // 텍스트 프롬프트 추가
        const userPromptText = hasImage
            ? `${systemPrompt}\n\n사용자 요청: "${prompt}"\n\n확장된 프롬프트:`
            : `${systemPrompt}\n\n사용자 입력: "${prompt}"\n\n확장된 프롬프트:`;
        parts.push({ text: userPromptText });

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: parts
                    }
                ],
                generationConfig: {
                    temperature: 0.5,  // 0.8 → 0.5로 낮춤 (과잉 해석 방지)
                    maxOutputTokens: 300,  // 간결하게
                    topP: 0.9,
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Enhance] Gemini error:', errText);
            throw new Error('Prompt enhancement failed');
        }

        const data = await response.json();
        const enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!enhancedPrompt) {
            throw new Error('No enhanced prompt generated');
        }

        // 불필요한 따옴표나 접두사 제거
        let cleanPrompt = enhancedPrompt
            .replace(/^["']|["']$/g, '')  // 앞뒤 따옴표 제거
            .replace(/^(Enhanced prompt:|확장된 프롬프트:)\s*/i, '')  // 접두사 제거
            .trim();

    console.log(`[Enhance] Output: "${cleanPrompt.substring(0, 100)}..."`);

    return sendSuccess(res, {
      original: prompt,
      enhanced: cleanPrompt,
      type,
    });

  } catch (error) {
    console.error('[Enhance] Error:', error);
    return sendServerError(res, '프롬프트 확장 중 문제가 발생했어요. 다시 시도해주세요.');
  }
}

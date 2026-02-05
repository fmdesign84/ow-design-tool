const { createClient } = require('@supabase/supabase-js');

/**
 * Vercel Serverless Function - Portrait Staging Generation (Gemini 3 Pro Image)
 *
 * 파이프라인:
 * 1. 참조 이미지 최대 14장 받기
 * 2. 프리셋 키로 promptConfig 조회
 * 3. Gemini 3 Pro Image에 전달 (다중 참조 이미지 + 프롬프트)
 * 4. 결과 반환 및 저장
 */

// Vercel Serverless Function 타임아웃 설정 (60초)
module.exports.config = {
  maxDuration: 60,
};

// 프리셋 데이터 (서버사이드용 - 클라이언트와 동기화 필요)
const STAGING_PRESETS = {
  // Corporate
  'executive-portrait': {
    label: '임원 프로필',
    category: 'corporate',
    aspectRatio: '3:4',
    style: 'executive corporate portrait, Fortune 500 annual report quality, cinematic lighting',
    environment: 'executive office or professional studio with dark backdrop, deep charcoal or navy gradient background',
    wardrobe: 'perfectly tailored navy or charcoal wool suit jacket, crisp white dress shirt with subtle texture',
    lighting: 'classic Rembrandt lighting with fill, key light at 45 degrees creating subtle shadow',
    quality: 'Fortune 500 annual report, professional corporate photography',
  },
  'linkedin-pro': {
    label: '링크드인 프로필',
    category: 'corporate',
    aspectRatio: '1:1',
    style: 'professional headshot, LinkedIn profile optimized, approachable business portrait',
    environment: 'soft gradient background in light gray or soft blue, or subtly blurred modern office',
    wardrobe: 'business casual - solid color blazer or smart cardigan over collared shirt',
    lighting: 'soft, even beauty lighting, large softbox or ring light',
    quality: 'professional headshot photographer quality, suitable for corporate LinkedIn',
  },
  'modern-office': {
    label: '모던 오피스',
    category: 'corporate',
    aspectRatio: '4:3',
    style: 'environmental business portrait, modern workplace, natural light photography',
    environment: 'contemporary open-plan office or co-working space, large windows with natural light',
    wardrobe: 'smart casual - well-fitted blazer without tie, quality sweater',
    lighting: 'natural window light with ambient fill',
    quality: 'corporate website about page, company culture photography',
  },
  // Editorial
  'quiet-luxury': {
    label: '콰이어트 럭셔리',
    category: 'editorial',
    aspectRatio: '3:4',
    style: 'high-end editorial portrait, quiet luxury aesthetic, cinematic realism, understated elegance',
    environment: 'refined minimalist interior, clean architectural lines, neutral palette',
    wardrobe: 'premium cashmere crew-neck sweater in muted tone, luxury materials',
    lighting: 'soft directional natural light with architectural shadows',
    quality: 'The Row lookbook, Loro Piana campaign, WSJ Magazine editorial',
  },
  'fashion-editorial': {
    label: '패션 에디토리얼',
    category: 'editorial',
    aspectRatio: '3:4',
    style: 'high fashion editorial, Vogue/GQ aesthetic, dramatic studio lighting',
    environment: 'fashion studio, clean backdrop - seamless paper or stark architectural environment',
    wardrobe: 'designer fashion piece - structured blazer, luxury silk blouse, or architectural top',
    lighting: 'dramatic fashion lighting, strong key light creating defined shadows',
    quality: 'Vogue, GQ, Harper\'s Bazaar editorial spread',
  },
  'golden-hour': {
    label: '골든아워',
    category: 'editorial',
    aspectRatio: '16:9',
    style: 'golden hour portrait, magic hour cinematography, warm natural light editorial',
    environment: 'outdoor location during golden hour, natural setting with warm ambient glow',
    wardrobe: 'flowy natural fabrics that catch light - linen, cotton, silk in earth tones',
    lighting: 'natural golden hour backlighting with fill, warm rim light',
    quality: 'lifestyle campaign, fragrance advertisement, film still',
  },
  // Lifestyle
  'cafe-moment': {
    label: '카페 모먼트',
    category: 'lifestyle',
    aspectRatio: '4:3',
    style: 'lifestyle portrait, cozy cafe aesthetic, authentic moment',
    environment: 'stylish Korean/Japanese influenced cafe interior, warm wood surfaces',
    wardrobe: 'cozy knit sweater, casual blazer, warm colors',
    lighting: 'natural window light with cafe ambiance',
    quality: 'lifestyle blog, brand ambassador content, premium coffee brand campaign',
  },
  'travel-wanderlust': {
    label: '여행 원더러스트',
    category: 'lifestyle',
    aspectRatio: '16:9',
    style: 'travel portrait, wanderlust aesthetic, cinematic travel photography',
    environment: 'stunning travel destination - overlook, ancient street, coastal cliff',
    wardrobe: 'practical but stylish travel wear, linen shirt, light jacket',
    lighting: 'natural outdoor light, preferably golden hour',
    quality: 'National Geographic Traveler, Condé Nast Traveller',
  },
  'urban-casual': {
    label: '어반 캐주얼',
    category: 'lifestyle',
    aspectRatio: '9:16',
    style: 'urban lifestyle portrait, street style aesthetic, city cool',
    environment: 'stylish urban setting, modern city street, hip neighborhood',
    wardrobe: 'elevated casual - quality leather jacket, oversized blazer',
    lighting: 'natural urban daylight with city shadows',
    quality: 'street style blog, fashion brand lookbook',
  },
  // Event
  'awards-ceremony': {
    label: '시상식',
    category: 'event',
    aspectRatio: '3:4',
    style: 'red carpet portrait, awards ceremony photography, glamorous formal',
    environment: 'awards show step-and-repeat or red carpet, press wall background',
    wardrobe: 'formal evening wear - tuxedo or elegant gown',
    lighting: 'multi-flash event photography setup',
    quality: 'Getty Images red carpet, celebrity event coverage',
  },
  'gala-night': {
    label: '갈라 나이트',
    category: 'event',
    aspectRatio: '3:4',
    style: 'gala event portrait, sophisticated party photography, elegant evening',
    environment: 'upscale gala venue - ballroom, museum, crystal chandeliers',
    wardrobe: 'formal evening attire - dark suit or evening gown',
    lighting: 'ambient event lighting with subtle fill, warm chandeliers',
    quality: 'charity gala coverage, society page photography',
  },
  'launch-event': {
    label: '런칭 이벤트',
    category: 'event',
    aspectRatio: '16:9',
    style: 'FULL BODY product launch keynote, tech CEO presenting in large auditorium, wide environmental shot',
    environment: 'large auditorium stage, LARGE LED BACK SCREEN displaying KEY VISUAL/colorful brand graphics prominently visible, audience silhouettes in foreground, modern minimal stage',
    wardrobe: 'polished casual - quality dark sweater or blazer, dark pants, shoes visible. NO microphone, NO remote control, NO clicker. Hands in explaining gesture only',
    lighting: 'professional stage lighting, colorful LED accent lights, back screen glow, dramatic auditorium atmosphere',
    quality: 'Apple keynote photography showing full stage setup, wide shot capturing entire scene with back screen graphics',
  },
  // Studio
  'classic-portrait': {
    label: '클래식 포트레이트',
    category: 'studio',
    aspectRatio: '3:4',
    style: 'classic studio portrait, timeless photography, traditional portraiture',
    environment: 'professional portrait studio, seamless backdrop in neutral gray',
    wardrobe: 'simple, elegant, timeless - solid color top in black, navy, or cream',
    lighting: 'classic portrait lighting - loop or Rembrandt',
    quality: 'museum portrait, legacy photography, Yousuf Karsh style',
  },
  'high-key-white': {
    label: '하이키 화이트',
    category: 'studio',
    aspectRatio: '3:4',
    style: 'high-key studio portrait, pure white background, bright and clean',
    environment: 'high-key white studio, pure blown-out white background',
    wardrobe: 'clean, simple top - can be white, soft pastels, or any color that pops',
    lighting: 'high-key lighting setup, background lit to pure white',
    quality: 'Apple-style product shot, commercial headshot, app interface',
  },
  'low-key-dramatic': {
    label: '로우키 드라마틱',
    category: 'studio',
    aspectRatio: '3:4',
    style: 'low-key dramatic portrait, Rembrandt lighting, fine art photography',
    environment: 'low-key studio, deep black or very dark gray background',
    wardrobe: 'dark, textured clothing - black sweater, dark jacket',
    lighting: 'classic Rembrandt or split lighting, single strong light source',
    quality: 'fine art portrait, Peter Lindbergh, Irving Penn style',
  },
  // Creative
  'neon-cyberpunk': {
    label: '네온 사이버펑크',
    category: 'creative',
    aspectRatio: '9:16',
    style: 'cyberpunk portrait, neon-lit urban futurism, Blade Runner aesthetic',
    environment: 'neon-lit urban environment - Tokyo/Seoul inspired, rain-wet streets',
    wardrobe: 'tech-wear or cyber-fashion - sleek black jacket, technical fabrics',
    lighting: 'multi-color neon lighting - magenta/pink and cyan/blue',
    quality: 'Blade Runner 2049, Ghost in the Shell, cyberpunk game cinematic',
  },
  'vintage-film': {
    label: '빈티지 필름',
    category: 'creative',
    aspectRatio: '4:3',
    style: 'vintage film photography, 80s-90s aesthetic, nostalgic analog',
    environment: 'timeless setting that could exist in any decade',
    wardrobe: 'timeless casual or slightly vintage-inspired',
    lighting: 'natural or simple artificial light, available light aesthetic',
    quality: 'found photo from the 80s-90s, vintage family album, Nan Goldin style',
  },
  'pop-art': {
    label: '팝아트',
    category: 'creative',
    aspectRatio: '1:1',
    style: 'pop art portrait, Andy Warhol inspired, bold graphic treatment',
    environment: 'studio or graphic background, single bold color or Ben-Day dots',
    wardrobe: 'simple, solid colors that become bold graphic elements',
    lighting: 'flat, even lighting for graphic treatment',
    quality: 'Andy Warhol Marilyn series, contemporary pop art, gallery print',
  },
};

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
    const fileName = `staging-${metadata.presetKey}-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

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
      style: metadata.presetKey,
      aspect_ratio: metadata.aspectRatio || '3:4',
      quality: 'hd',
      type: 'staging'
    }).select().single();

    if (dbError) console.error('[Supabase] DB insert error:', dbError.message);

    console.log('[Supabase] Staging image saved:', dbData?.id);

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

// 프리셋별 키비주얼 활용 방식 정의
const KEY_VISUAL_INSTRUCTIONS = {
  // 이벤트 - 키비주얼 활용도 높음
  'launch-event': `
KEY VISUAL INTEGRATION (CRITICAL):
- The SECOND image is a KEY VISUAL/LOGO that MUST appear on the LARGE LED BACK SCREEN behind the presenter
- Display this exact key visual prominently on the auditorium's main screen/display
- The key visual should be clearly visible and recognizable on the back screen
- Back screen should show this provided image as if it's the presentation slide
- Make the key visual the focal point of the stage backdrop`,

  'awards-ceremony': `
KEY VISUAL INTEGRATION:
- The SECOND image is a LOGO/KEY VISUAL for the step-and-repeat press wall
- Display this logo/key visual repeated on the backdrop behind the subject
- Integrate it as part of the sponsor/brand wall pattern
- Keep logos slightly blurred but recognizable as typical press wall backdrop`,

  'gala-night': `
KEY VISUAL INTEGRATION:
- The SECOND image is a KEY VISUAL/LOGO to integrate into the gala environment
- Can appear on event signage, projection screens, or decorative elements
- Integrate naturally into the sophisticated venue setting
- Keep subtle but visible - this is an elegant event`,

  // 비즈니스/라이프스타일 - 환경에 자연스럽게
  'modern-office': `
KEY VISUAL INTEGRATION:
- The SECOND image can appear on computer screens, wall displays, or presentation materials
- Integrate naturally as if it's part of the office environment
- Keep subtle and professional`,

  'cafe-moment': `
KEY VISUAL INTEGRATION:
- The SECOND image can appear as subtle branding on cups, signage, or decor
- Keep very subtle - this is a lifestyle shot, not advertising`,

  // 스튜디오/에디토리얼 - 키비주얼 무시 (순수 포트레이트)
  'studio_default': `
Note: Key visual provided but this is a pure portrait style - focus on the subject only.
No external branding or key visual integration needed for studio portraits.`,

  // 기본값
  'default': `
KEY VISUAL INTEGRATION:
- The SECOND image is a KEY VISUAL/LOGO to incorporate into the scene
- Display prominently in the environment where appropriate (screens, walls, backdrop)
- Keep clearly visible and recognizable
- Integrate naturally into the scene context`
};

// 프리셋별 키비주얼 활용 방식 결정
function getKeyVisualInstruction(presetKey, hasKeyVisual) {
  if (!hasKeyVisual) return '';

  // 스튜디오 프리셋은 키비주얼 사용 안함
  const studioPresets = ['classic-portrait', 'high-key-white', 'low-key-dramatic'];
  if (studioPresets.includes(presetKey)) {
    return KEY_VISUAL_INSTRUCTIONS['studio_default'];
  }

  // 프리셋별 지시 또는 기본값
  return KEY_VISUAL_INSTRUCTIONS[presetKey] || KEY_VISUAL_INSTRUCTIONS['default'];
}

// 프롬프트 생성 (인물 + 키비주얼 구분)
function buildPrompt(preset, presetKey, aspectRatioOverride, hasKeyVisual = false) {
  const aspectRatio = aspectRatioOverride || preset.aspectRatio;
  const keyVisualInstruction = getKeyVisualInstruction(presetKey, hasKeyVisual);

  // Gemini 3 Pro Image에 명시적으로 이미지 생성 요청
  const prompt = `Generate a photorealistic image: ${preset.style}

Use the provided reference image(s) to create a professional photograph.

REFERENCE IMAGES:
- First image: Person's portrait (preserve their exact facial identity)
${hasKeyVisual ? '- Second image: Key visual/logo to incorporate into the scene' : ''}

REQUIREMENTS:
- Preserve 100% of the person's facial identity from the reference
- Do NOT alter facial features, bone structure, or proportions
- The person must be immediately recognizable

SCENE:
- Environment: ${preset.environment}
- Wardrobe: ${preset.wardrobe}
- Lighting: ${preset.lighting}
- Quality: ${preset.quality}
${keyVisualInstruction}
OUTPUT: Photorealistic ${aspectRatio} professional photograph.`;

  return prompt;
}

// Gemini 3 Pro Image 호출
async function generateWithGemini3Pro(prompt, referenceImages = [], aspectRatio = '3:4') {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log(`[Gemini 3 Pro Staging] Starting... RefImages: ${referenceImages.length}`);

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`;

  // parts 구성: 텍스트 + 참조 이미지들 (최대 5장 - Gemini 제한)
  const parts = [{ text: prompt }];

  // 최대 5장만 사용 (Gemini 제한)
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

  console.log(`[Gemini 3 Pro Staging] ${imagesToProcess.length} reference image(s) added`);

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

  console.log('[Gemini 3 Pro Staging] Request body:', JSON.stringify({
    ...requestBody,
    contents: [{ parts: `${parts.length} parts (text + ${imagesToProcess.length} images)` }]
  }));

  const response = await fetchWithTimeout(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  }, 60000);

  console.log('[Gemini 3 Pro Staging] Response status:', response.status);

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Gemini 3 Pro Staging] API Error:', errText.substring(0, 500));
    throw new Error(`Gemini API failed (${response.status}): ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log('[Gemini 3 Pro Staging] Response data keys:', Object.keys(data));
  console.log('[Gemini 3 Pro Staging] Full response:', JSON.stringify(data).substring(0, 1500));

  // promptFeedback 확인 (안전 필터 등)
  if (data.promptFeedback) {
    console.log('[Gemini 3 Pro Staging] Prompt feedback:', JSON.stringify(data.promptFeedback));
    if (data.promptFeedback.blockReason) {
      throw new Error(`Blocked by safety filter: ${data.promptFeedback.blockReason}`);
    }
  }

  // 이미지 추출
  const candidates = data.candidates || [];
  console.log('[Gemini 3 Pro Staging] Candidates count:', candidates.length);

  if (candidates.length === 0) {
    // 응답에 후보가 없는 경우 상세 로그
    console.error('[Gemini 3 Pro Staging] No candidates! Full data:', JSON.stringify(data));
    throw new Error('No candidates in Gemini response - check safety filters or prompt');
  }

  const firstCandidate = candidates[0];

  // finishReason 확인
  if (firstCandidate.finishReason && firstCandidate.finishReason !== 'STOP') {
    console.log('[Gemini 3 Pro Staging] Finish reason:', firstCandidate.finishReason);
    if (firstCandidate.finishReason === 'SAFETY') {
      throw new Error('Image blocked by SAFETY filter');
    }
  }

  const content = firstCandidate?.content;
  const candidateParts = content?.parts || [];
  console.log('[Gemini 3 Pro Staging] Parts count:', candidateParts.length);
  console.log('[Gemini 3 Pro Staging] Parts types:', candidateParts.map(p => Object.keys(p)));

  for (const part of candidateParts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      console.log('[Gemini 3 Pro Staging] Image generated successfully, size:', part.inlineData.data?.length || 0);
      return part.inlineData.data;
    }
    if (part.text) {
      console.log('[Gemini 3 Pro Staging] Text part:', part.text.substring(0, 500));
    }
  }

  console.error('[Gemini 3 Pro Staging] No image in parts. Parts detail:', JSON.stringify(candidateParts).substring(0, 500));
  throw new Error('No image in Gemini response - parts: ' + candidateParts.length);
}

// API Handler
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    const {
      // 새로운 형식 (인물/키비 구분)
      portraitImage = null,
      keyVisualImage = null,
      // 이전 호환성 유지
      images = [],
      mainImageIndex = 0,
      presetKey,
      outputCount = 1,
      aspectRatioOverride = null
    } = req.body;

    // 새 형식과 이전 형식 모두 지원
    let portrait = portraitImage;
    let keyVisual = keyVisualImage;

    // 이전 형식으로 들어온 경우 변환
    if (!portrait && images.length > 0) {
      portrait = images[mainImageIndex] || images[0];
      keyVisual = images.length > 1 ? images.find((_, i) => i !== mainImageIndex) : null;
    }

    // 검증
    if (!portrait) {
      return res.status(400).json({
        success: false,
        error: 'No portrait image provided',
        friendlyMessage: { message: '인물 사진을 업로드해주세요.' }
      });
    }

    if (!presetKey) {
      return res.status(400).json({
        success: false,
        error: 'No preset selected',
        friendlyMessage: { message: '프리셋을 선택해주세요.' }
      });
    }

    const preset = STAGING_PRESETS[presetKey];
    if (!preset) {
      return res.status(400).json({
        success: false,
        error: 'Invalid preset key',
        friendlyMessage: { message: '유효하지 않은 프리셋입니다.' }
      });
    }

    const hasKeyVisual = !!keyVisual;
    console.log(`[Staging] Preset: ${presetKey}, HasPortrait: true, HasKeyVisual: ${hasKeyVisual}, OutputCount: ${outputCount}`);

    // 이미지 배열 구성 (인물 먼저, 키비주얼 두 번째)
    const imagesToProcess = [portrait];
    if (keyVisual) {
      imagesToProcess.push(keyVisual);
    }

    // 프롬프트 생성 (프리셋 키와 키비주얼 여부 전달)
    const aspectRatio = aspectRatioOverride || preset.aspectRatio;
    const prompt = buildPrompt(preset, presetKey, aspectRatioOverride, hasKeyVisual);

    console.log(`[Staging] Prompt preview: ${prompt.substring(0, 300)}...`);

    // 생성 (outputCount 만큼 반복)
    const generatedImages = [];
    const actualOutputCount = Math.min(outputCount, 4); // 최대 4장

    for (let i = 0; i < actualOutputCount; i++) {
      console.log(`[Staging] Generating image ${i + 1}/${actualOutputCount}...`);

      const imageBase64 = await generateWithGemini3Pro(prompt, imagesToProcess, aspectRatio);

      // Supabase 저장
      const saved = await saveToSupabase(imageBase64, {
        presetKey,
        prompt,
        aspectRatio
      });

      if (saved?.image_url) {
        generatedImages.push(saved.image_url);
      } else {
        // Supabase 저장 실패 시 base64로 반환
        generatedImages.push(`data:image/png;base64,${imageBase64}`);
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`[Staging] Complete in ${processingTime}ms, Generated: ${generatedImages.length}`);

    return res.status(200).json({
      success: true,
      images: generatedImages,
      presetUsed: presetKey,
      presetLabel: preset.label,
      processingTime
    });

  } catch (error) {
    console.error('[Staging] Error:', error.message);

    // 사용자 친화적 에러 메시지
    let friendlyMessage = { message: '이미지 생성 중 오류가 발생했습니다.' };

    if (error.message.includes('timeout')) {
      friendlyMessage.message = '생성 시간이 초과되었습니다. 다시 시도해주세요.';
    } else if (error.message.includes('SAFETY')) {
      friendlyMessage.message = '안전 가이드라인에 위배되는 콘텐츠입니다. 다른 이미지를 시도해주세요.';
    } else if (error.message.includes('API')) {
      friendlyMessage.message = 'AI 서비스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.';
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      friendlyMessage
    });
  }
};

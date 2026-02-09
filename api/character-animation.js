/**
 * Vercel Serverless Function - Character Animation
 * 캐릭터 이미지를 받아서 동작 애니메이션 생성 (Replicate Kling v2.1)
 */

const { createClient } = require('@supabase/supabase-js');

// Vercel Pro: 최대 300초
module.exports.config = {
    maxDuration: 300,
};

// 동작별 프롬프트 매핑
const ACTION_PROMPTS = {
    'running': {
        prompt: 'A 3D Pixar-style animated cartoon character running in place with dynamic motion. Arms swinging naturally, legs in full stride, smooth running cycle animation. Character stays in the CENTER of frame. Fixed camera, no camera movement. IMPORTANT: Maintain consistent body proportions throughout - legs, arms, and torso must keep their original shape and length. No stretching, warping, or morphing of limbs.',
        negativePrompt: 'real person, photorealistic, live action, blurry, distorted, camera pan, scene change, body deformation, limb stretching, morphing legs',
    },
    'victory': {
        prompt: 'A 3D Pixar-style animated cartoon character making a V-sign peace pose. Both hands raised showing V-sign with fingers, arms held up proudly. Confident happy smile. Upper body gently swaying with pride. Feet planted on the ground, NOT jumping, NOT jogging. Character stays centered. Fixed camera.',
        negativePrompt: 'real person, photorealistic, live action, blurry, camera movement, running, jogging',
    },
    'finish': {
        prompt: 'A 3D Pixar-style animated cartoon character runs forward and crosses a finish line tape. The character bursts through the tape with chest forward, arms spread wide in triumph. The broken tape flutters and falls down to the ground. After breaking through, the character slows down and celebrates with both arms raised. Character stays centered. Fixed camera.',
        negativePrompt: 'real person, photorealistic, live action, blurry, camera pan, scene transition, tape disappearing, tape floating',
    },
    'waving': {
        prompt: 'A 3D Pixar-style animated cartoon character waving hello. One hand raised and moving side to side in a friendly greeting gesture. Warm smile, head slightly tilted. The waving arm moves naturally left-right. Other arm relaxed at side. Feet stay on the ground, NOT jumping, NOT jogging. Character stays centered. Fixed camera.',
        negativePrompt: 'real person, photorealistic, live action, blurry, camera movement, running, jogging, jumping',
    },
    'jumping': {
        prompt: 'A 3D Pixar-style animated cartoon character doing a big celebratory jump. Character crouches slightly, then leaps HIGH into the air with both arms raised above head, then lands softly back down. One single big dramatic jump, NOT repeated small hops. Character stays centered. Fixed camera.',
        negativePrompt: 'real person, photorealistic, live action, blurry, camera movement, running, jogging',
    },
    'dancing': {
        prompt: 'A 3D Pixar-style animated cartoon character doing a fun dance. Rhythmic side-to-side body movement, arms swinging with the beat, hips swaying, head bobbing. Fun groovy dance moves like a celebration dance. Feet shuffling on the ground with rhythm, NOT running or jogging motions. Character stays centered. Fixed camera.',
        negativePrompt: 'real person, photorealistic, live action, blurry, camera movement, running, jogging',
    },
    'walking': {
        prompt: 'A 3D Pixar-style animated cartoon character walking forward slowly and casually. Relaxed posture, arms swinging gently at sides, natural walking stride. Calm and leisurely pace, NOT running, NOT jogging. Character stays centered in frame. Fixed camera.',
        negativePrompt: 'real person, photorealistic, live action, blurry, camera pan, scene change, running, jogging',
    },
    'cheering': {
        prompt: 'A 3D Pixar-style animated cartoon character cheering with excitement. Both fists pumping up in the air repeatedly, head tilted back with joy. Energetic upper body motion - arms going up and down in triumph. Feet stay planted on ground, body bouncing slightly with each cheer. NOT running or jogging. Character stays centered. Fixed camera.',
        negativePrompt: 'real person, photorealistic, live action, blurry, camera movement, running, jogging',
    },
    'stretching': {
        prompt: 'A 3D Pixar-style animated cartoon character does typical RUNNER warm-up stretches STANDING IN PLACE. Quad stretch (pulling foot behind), hamstring stretch (bending to touch toes), calf stretch, ankle rotations. Classic pre-marathon runner stretching routine. NOT running or walking. Stays in one spot. Focused determined expression. Fixed camera.',
        negativePrompt: 'real person, photorealistic, live action, blurry, running, walking, moving forward, camera movement',
    },
    'billboard': {
        prompt: 'A subtle LED display animation effect. The image stays almost completely STILL. Only very subtle changes: slight LED screen flicker/glow pulsing effect on any display/billboard/screen areas, very gentle ambient light shifts. The character on the screen is a STILL IMAGE - absolutely NO body movement, NO jumping, NO running, NO arm waving. The character must remain FROZEN like a photograph. Only the LED screen surface has subtle electronic glow/flicker/scan-line effects. Everything else remains completely static. Absolutely fixed camera.',
        negativePrompt: 'running, walking, jumping, jogging, bouncing, movement, motion, camera pan, camera movement, scene change, character moving, dynamic motion, exercise, dancing',
    }
};

// Supabase temp 업로드 (기존 패턴 재사용)
async function uploadToTemp(base64Image, prefix = 'anim') {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let buffer;
    let mimeType = 'image/png';
    let extension = 'png';

    if (base64Image.startsWith('data:')) {
        const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
            mimeType = matches[1];
            extension = mimeType.split('/')[1] || 'png';
            buffer = Buffer.from(matches[2], 'base64');
        } else {
            throw new Error('Invalid Base64 image format');
        }
    } else {
        buffer = Buffer.from(base64Image, 'base64');
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `${prefix}_${timestamp}_${random}.${extension}`;
    const filePath = `temp/${fileName}`;

    const { error } = await supabase.storage
        .from('generated-images')
        .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: false
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from('generated-images')
        .getPublicUrl(filePath);

    return { url: urlData.publicUrl, path: filePath };
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const startTime = Date.now();

    try {
        const {
            characterImage,
            action = 'running',
            duration = '5',
            loop = 'none',
            batch = false,
        } = req.body;

        if (!characterImage) {
            return res.status(400).json({ error: 'Character image is required' });
        }

        const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
        if (!REPLICATE_API_TOKEN) {
            return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
        }

        // 동작 프롬프트 가져오기
        const actionConfig = ACTION_PROMPTS[action] || ACTION_PROMPTS['running'];

        // 표정 고정 + 위치 유지 지시
        const FACE_LOCK = ' IMPORTANT: Keep the character facial expression CONSISTENT and STABLE throughout the entire video. The face must look almost identical in every frame - same mouth shape, same eye shape, same eyebrow position. Do NOT morph, distort, exaggerate, or dramatically change the facial expression. No wide-open mouth screaming, no extreme squinting, no face stretching. Only very subtle natural micro-expressions are allowed. The face from the first frame and the last frame should be nearly indistinguishable.';
        const STAY_IN_FRAME = ' The character must stay WITHIN the frame at all times. Do NOT let the character move out of the image boundaries. Keep the character centered and visible throughout the entire video. If the character is inside a frame, sign, or display in the image, they must stay INSIDE it. BACKGROUND RULE: The background can have subtle natural motion (gentle tree sway, light flicker, soft wind effects, slight ambient movement) to feel alive and natural. However, the background must NOT rapidly scroll, pan far, or completely transition to a different scene. The overall composition and environment must remain recognizable from start to end. BRIGHTNESS RULE: Maintain CONSISTENT brightness and lighting throughout the ENTIRE video from first frame to last frame. Do NOT darken, fade to black, dim, or reduce brightness at any point, especially near the end. The final frames must be just as bright and vivid as the first frames.';

        // 루프 프롬프트
        let LOOP_INSTRUCTION = '';
        if (loop === 'loop') {
            LOOP_INSTRUCTION = ' CRITICAL LOOP REQUIREMENT: The animation must be a PERFECT LOOP. The last frame must seamlessly connect back to the first frame. The character pose, position, and movement at the end must exactly match the beginning so the video can repeat infinitely without any visible jump or cut.';
        } else if (loop === 'pingpong') {
            LOOP_INSTRUCTION = ' CRITICAL SMOOTH MOTION: The animation should have smooth, reversible motion. The character movement should be symmetrical so that when played forward and then backward, it creates a natural continuous ping-pong loop. Avoid any sudden starts or stops.';
        }

        // duration 정규화 (Kling은 5 또는 10만 지원)
        const videoDuration = parseInt(duration, 10) >= 8 ? 10 : 5;

        console.log('[CharacterAnimation] Starting Replicate Kling generation...');
        console.log('[CharacterAnimation] Action:', action);
        console.log('[CharacterAnimation] Duration:', videoDuration, 's');

        // 병렬 호출 시에만 rate limit 방지 지터 적용 (단일 실행은 즉시 시작)
        if (batch) {
            const jitter = Math.floor(Math.random() * 90000);
            console.log(`[CharacterAnimation] Batch mode - stagger delay: ${jitter}ms`);
            await new Promise(resolve => setTimeout(resolve, jitter));
        } else {
            console.log('[CharacterAnimation] Single mode - no stagger delay');
        }

        // 이미지 URL 확보 (Replicate는 URL 필요)
        let imageUrl;
        if (characterImage.startsWith('http')) {
            // 이미 URL이면 그대로 사용
            imageUrl = characterImage;
            console.log('[CharacterAnimation] Using existing URL:', imageUrl.substring(0, 60) + '...');
        } else {
            // base64면 Supabase temp에 업로드
            console.log('[CharacterAnimation] Uploading image to temp storage...');
            const imageUpload = await uploadToTemp(characterImage, 'char-anim');
            imageUrl = imageUpload.url;
            console.log('[CharacterAnimation] Image uploaded:', imageUrl.substring(0, 60) + '...');
        }

        // Replicate API - Kling v2.1 image-to-video (재시도 포함)
        const maxRetries = 8;
        let prediction = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            if (attempt > 0) {
                // 지수 백오프: 15s, 30s, 45s, 60s... + 랜덤
                const backoff = (attempt * 15000) + Math.floor(Math.random() * 10000);
                console.log(`[CharacterAnimation] Retry ${attempt}/${maxRetries} after ${backoff}ms`);
                await new Promise(resolve => setTimeout(resolve, backoff));
            }

            const createResponse = await fetch('https://api.replicate.com/v1/models/kwaivgi/kling-v2.1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: {
                        prompt: actionConfig.prompt + FACE_LOCK + STAY_IN_FRAME + LOOP_INSTRUCTION,
                        start_image: imageUrl,
                        duration: videoDuration,
                        mode: 'standard',
                        negative_prompt: actionConfig.negativePrompt || '',
                    }
                })
            });

            if (createResponse.ok) {
                prediction = await createResponse.json();
                console.log('[CharacterAnimation] Prediction created:', prediction.id);
                break;
            }

            const errData = await createResponse.json().catch(() => ({}));
            console.error(`[CharacterAnimation] Attempt ${attempt + 1} failed:`, createResponse.status, errData.detail || '');

            // 429 (rate limit) 또는 5xx는 재시도, 그 외는 즉시 실패
            if (createResponse.status !== 429 && createResponse.status < 500) {
                throw new Error(errData.detail || `Replicate API error: ${createResponse.status}`);
            }
        }

        if (!prediction) {
            throw new Error('Replicate API rate limit - 잠시 후 다시 시도해주세요');
        }

        // 결과 폴링 (최대 240초 - 비디오 생성은 시간이 오래 걸림)
        const maxWait = 240000;
        const pollInterval = 3000;
        let waited = 0;

        while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && prediction.status !== 'canceled') {
            if (waited >= maxWait) {
                throw new Error('Timeout waiting for video generation');
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
            waited += pollInterval;

            const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: {
                    'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                }
            });

            prediction = await pollResponse.json();
            console.log(`[CharacterAnimation] Status: ${prediction.status} (${waited / 1000}s)`);
        }

        if (prediction.status === 'failed') {
            throw new Error(prediction.error || 'Video generation failed');
        }

        if (prediction.status === 'canceled') {
            throw new Error('Video generation was canceled');
        }

        // 결과 비디오 URL
        const outputUrl = prediction.output;
        if (!outputUrl) {
            throw new Error('No video URL in response');
        }

        console.log('[CharacterAnimation] Video URL:', outputUrl);

        // 비디오 다운로드해서 base64 변환 (클라이언트 호환성 유지)
        const videoResponse = await fetch(outputUrl);
        if (!videoResponse.ok) {
            throw new Error('Failed to download generated video');
        }

        const videoBuffer = await videoResponse.arrayBuffer();
        const videoBase64 = Buffer.from(videoBuffer).toString('base64');

        const generationTime = Date.now() - startTime;
        console.log('[CharacterAnimation] Success! Time:', generationTime, 'ms');

        // Supabase에 비디오 저장 (아카이브)
        let savedVideoUrl = null;
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;
            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                const fileName = `char-anim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.mp4`;
                const buffer = Buffer.from(videoBase64, 'base64');

                const { error: uploadError } = await supabase.storage
                    .from('generated-videos')
                    .upload(fileName, buffer, {
                        contentType: 'video/mp4',
                        cacheControl: '3600'
                    });

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('generated-videos')
                        .getPublicUrl(fileName);
                    savedVideoUrl = publicUrl;
                    console.log('[CharacterAnimation] Saved to Supabase:', publicUrl);
                }
            }
        } catch (saveErr) {
            console.error('[CharacterAnimation] Supabase save error:', saveErr.message);
        }

        return res.status(200).json({
            success: true,
            video: `data:video/mp4;base64,${videoBase64}`,
            savedVideoUrl,
            action,
            loop,
            duration: videoDuration,
            generationTime,
            model: 'kling-v2.1',
            predictionId: prediction.id,
        });

    } catch (error) {
        const generationTime = Date.now() - startTime;
        console.error('[CharacterAnimation] Error:', error.message);

        return res.status(500).json({
            success: false,
            error: error.message,
            generationTime
        });
    }
};

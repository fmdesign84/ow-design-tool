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
        prompt: 'A 3D Pixar-style animated cartoon character running forward with dynamic motion. Arms swinging naturally, legs in full stride, smooth running animation. Camera follows from a slight side angle. Clean white background.',
        negativePrompt: 'real person, photorealistic, live action, blurry, distorted',
    },
    'victory': {
        prompt: 'A 3D Pixar-style animated cartoon character celebrates victory, making a V-sign peace pose with both hands raised high. Happy expression, slight bounce in place. Camera slowly zooms in. Clean white background.',
        negativePrompt: 'real person, photorealistic, live action, blurry',
    },
    'finish': {
        prompt: 'A 3D Pixar-style animated cartoon character crosses the finish line, both arms raised high in triumph, running through with victorious celebration. Dynamic forward motion. Clean white background.',
        negativePrompt: 'real person, photorealistic, live action, blurry',
    },
    'waving': {
        prompt: 'A 3D Pixar-style animated cartoon character waves hello, one hand raised and moving side to side in a friendly greeting. Warm smile, gentle body sway. Clean white background.',
        negativePrompt: 'real person, photorealistic, live action, blurry',
    },
    'jumping': {
        prompt: 'A 3D Pixar-style animated cartoon character jumps up with joy, arms raised, body lifting off the ground and landing softly. Dynamic up and down motion. Clean white background.',
        negativePrompt: 'real person, photorealistic, live action, blurry',
    },
    'dancing': {
        prompt: 'A 3D Pixar-style animated cartoon character dances happily with rhythmic body movement, arms moving side to side, slight hip sway. Fun and energetic dance. Clean white background.',
        negativePrompt: 'real person, photorealistic, live action, blurry',
    },
    'walking': {
        prompt: 'A 3D Pixar-style animated cartoon character walks forward naturally with relaxed posture. Arms swinging gently, smooth walking cycle. Camera follows from the side. Clean white background.',
        negativePrompt: 'real person, photorealistic, live action, blurry',
    },
    'cheering': {
        prompt: 'A 3D Pixar-style animated cartoon character cheers enthusiastically, jumping up with fists pumping in the air, expressing excitement and joy. Dynamic celebration movements. Clean white background.',
        negativePrompt: 'real person, photorealistic, live action, blurry',
    },
    'stretching': {
        prompt: 'A 3D Pixar-style animated cartoon character does pre-race warm-up stretching exercises. Alternating between leg lunges, arm circles, and torso twists. Athletic preparation movements, focused determined expression. Clean white background.',
        negativePrompt: 'real person, photorealistic, live action, blurry',
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

        // duration 정규화 (Kling은 5 또는 10만 지원)
        const videoDuration = parseInt(duration, 10) >= 8 ? 10 : 5;

        console.log('[CharacterAnimation] Starting Replicate Kling generation...');
        console.log('[CharacterAnimation] Action:', action);
        console.log('[CharacterAnimation] Duration:', videoDuration, 's');

        // 이미지를 Supabase temp에 업로드 (Replicate는 URL 필요)
        console.log('[CharacterAnimation] Uploading image to temp storage...');
        const imageUpload = await uploadToTemp(characterImage, 'char-anim');
        console.log('[CharacterAnimation] Image uploaded:', imageUpload.url.substring(0, 60) + '...');

        // Replicate API - Kling v2.1 image-to-video
        const createResponse = await fetch('https://api.replicate.com/v1/models/kwaivgi/kling-v2.1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: {
                    prompt: actionConfig.prompt,
                    start_image: imageUpload.url,
                    duration: videoDuration,
                    mode: 'standard',
                    negative_prompt: actionConfig.negativePrompt || '',
                }
            })
        });

        if (!createResponse.ok) {
            const errData = await createResponse.json().catch(() => ({}));
            throw new Error(errData.detail || `Replicate API error: ${createResponse.status}`);
        }

        let prediction = await createResponse.json();
        console.log('[CharacterAnimation] Prediction created:', prediction.id);

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

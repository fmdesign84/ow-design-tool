/**
 * Vercel Serverless Function - Character Animation
 * 캐릭터 이미지를 받아서 동작 애니메이션 생성 (Veo 3.1)
 */

const { GoogleAuth } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

// Vercel Pro: 최대 300초
module.exports.config = {
    maxDuration: 300,
};

// 동작별 프롬프트 매핑
const ACTION_PROMPTS = {
    'running': {
        prompt: 'This 3D cartoon character is running forward with dynamic motion. Arms swinging naturally, legs in full stride, smooth running animation loop. Camera follows the character from a slight side angle. Clean white background.',
        loop: true
    },
    'victory': {
        prompt: 'This 3D cartoon character celebrates victory, making a V-sign peace pose with both hands raised high. Happy expression, slight bounce in place. Camera slowly zooms in on the joyful character. Clean white background.',
        loop: false
    },
    'finish': {
        prompt: 'This 3D cartoon character crosses the finish line, both arms raised high in triumph, running through with victorious celebration. Dynamic forward motion with arms going up in celebration. Clean white background.',
        loop: false
    },
    'waving': {
        prompt: 'This 3D cartoon character waves hello, one hand raised and moving side to side in a friendly greeting. Warm smile, gentle body sway. Smooth looping wave animation. Clean white background.',
        loop: true
    },
    'jumping': {
        prompt: 'This 3D cartoon character jumps up with joy, arms raised, body lifting off the ground and landing softly. Dynamic up and down motion with natural bounce. Clean white background.',
        loop: true
    },
    'dancing': {
        prompt: 'This 3D cartoon character dances happily with rhythmic body movement, arms moving side to side, slight hip sway. Fun and energetic dance loop. Clean white background.',
        loop: true
    },
    'walking': {
        prompt: 'This 3D cartoon character walks forward naturally with relaxed posture. Arms swinging gently, smooth walking cycle. Camera follows from the side. Clean white background.',
        loop: true
    },
    'cheering': {
        prompt: 'This 3D cartoon character cheers enthusiastically, jumping up with fists pumping in the air, expressing excitement and joy. Dynamic celebration movements. Clean white background.',
        loop: true
    }
};

// base64 추출 헬퍼
function extractBase64(dataUrl) {
    if (!dataUrl) return null;

    if (!dataUrl.startsWith('data:')) {
        // 이미 base64만 있는 경우
        return { base64: dataUrl, mime: 'image/png' };
    }

    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;

    return { base64: matches[2], mime: matches[1] };
}

// 폴링으로 결과 확인 (fetchPredictOperation 사용)
async function pollForResult(fetchEndpoint, operationName, accessToken, maxWaitMs = 240000, intervalMs = 5000) {
    let waited = 0;

    while (waited < maxWaitMs) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        waited += intervalMs;

        console.log(`[CharacterAnimation] Polling (${waited / 1000}s)...`);

        const response = await fetch(fetchEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operationName: operationName })
        });

        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('[CharacterAnimation] Poll parse error:', responseText.substring(0, 200));
            continue;
        }

        if (data.done) {
            if (data.error) {
                throw new Error(data.error.message || 'Generation failed');
            }
            return data;
        }
    }

    throw new Error('Generation timed out');
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
            duration = '4',
            loop = true
        } = req.body;

        if (!characterImage) {
            return res.status(400).json({ error: 'Character image is required' });
        }

        const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
        if (!PROJECT_ID) {
            return res.status(500).json({ error: 'GOOGLE_PROJECT_ID not configured' });
        }

        // 동작 프롬프트 가져오기
        const actionConfig = ACTION_PROMPTS[action] || ACTION_PROMPTS['running'];
        let prompt = actionConfig.prompt;

        // 반복 동작 설정 반영
        if (loop && actionConfig.loop) {
            prompt += ' Seamless loop animation.';
        }

        console.log('[CharacterAnimation] Starting generation...');
        console.log('[CharacterAnimation] Action:', action);
        console.log('[CharacterAnimation] Duration:', duration);
        console.log('[CharacterAnimation] Prompt:', prompt.substring(0, 100));

        // Google Auth
        const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
        if (!credentialsJson) {
            throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON not configured');
        }

        const auth = new GoogleAuth({
            credentials: JSON.parse(credentialsJson),
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse.token;

        // 이미지 추출
        const imgData = extractBase64(characterImage);
        if (!imgData) {
            return res.status(400).json({ error: 'Invalid image format' });
        }

        // Veo 3.1 요청
        const MODEL_ID = 'veo-3.1-fast-generate-preview';
        const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:predictLongRunning`;

        const requestBody = {
            instances: [{
                prompt: prompt,
                image: {
                    bytesBase64Encoded: imgData.base64,
                    mimeType: imgData.mime
                }
            }],
            parameters: {
                aspectRatio: '9:16', // 캐릭터는 세로형이 자연스러움
                sampleCount: 1,
                durationSeconds: parseInt(duration, 10),
                personGeneration: 'allow_adult'
            }
        };

        console.log('[CharacterAnimation] Sending request to Veo...');

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[CharacterAnimation] Veo error:', errText);
            throw new Error(`Veo API failed: ${response.status}`);
        }

        const operationData = await response.json();
        const operationName = operationData.name;

        if (!operationName) {
            throw new Error('No operation name returned');
        }

        console.log('[CharacterAnimation] Operation started:', operationName);

        // 결과 폴링 (fetchPredictOperation 엔드포인트 사용)
        const fetchEndpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:fetchPredictOperation`;
        const result = await pollForResult(fetchEndpoint, operationName, accessToken);

        // 비디오 추출 (여러 구조 시도)
        let videos = result.response?.videos || [];
        if (videos.length === 0) {
            videos = result.videos || result.predictions || result.response?.predictions || [];
        }

        if (videos.length === 0) {
            throw new Error('No video generated');
        }

        const video = videos[0];
        let videoBase64 = video.bytesBase64Encoded;

        // GCS URI인 경우 다운로드
        if (!videoBase64 && video.gcsUri) {
            console.log('[CharacterAnimation] Downloading from GCS:', video.gcsUri);
            const gcsResponse = await fetch(video.gcsUri.replace('gs://', 'https://storage.googleapis.com/'), {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (gcsResponse.ok) {
                const buffer = await gcsResponse.arrayBuffer();
                videoBase64 = Buffer.from(buffer).toString('base64');
            }
        }

        if (!videoBase64) {
            throw new Error('No video data in response');
        }

        const generationTime = Date.now() - startTime;
        console.log('[CharacterAnimation] Success! Time:', generationTime, 'ms');

        return res.status(200).json({
            success: true,
            video: `data:video/mp4;base64,${videoBase64}`,
            action,
            duration,
            generationTime,
            model: 'veo-3.1-fast'
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

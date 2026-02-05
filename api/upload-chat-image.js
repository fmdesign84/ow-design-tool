const { createClient } = require('@supabase/supabase-js');

/**
 * 대화형 챗봇용 이미지 업로드 API
 *
 * 413 에러 방지를 위해 이미지를 먼저 업로드하고 URL만 반환
 * multipart/form-data 또는 JSON base64 지원
 */

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Vercel Serverless 설정: body parser 비활성화 (multipart 처리용)
module.exports.config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
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

    try {
        let imageBuffer;
        let mimeType = 'image/png';
        let extension = 'png';

        // JSON body (base64) 처리
        const { image, imageBase64 } = req.body || {};
        const mediaData = image || imageBase64;

        if (!mediaData) {
            return res.status(400).json({
                error: 'image or imageBase64 is required',
                hint: 'Send base64 encoded image data'
            });
        }

        // MIME 타입 감지
        const mimeMatch = mediaData.match(/^data:([^;]+);base64,/);
        if (mimeMatch) {
            mimeType = mimeMatch[1];
            if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
                extension = 'jpg';
            } else if (mimeType.includes('webp')) {
                extension = 'webp';
            } else if (mimeType.includes('gif')) {
                extension = 'gif';
            }
        }

        // Base64 → Buffer
        const base64Data = mediaData.replace(/^data:[^;]+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');

        // 파일명 생성 (chat-images 전용)
        const fileName = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;

        // Supabase Storage 업로드 (generated-images 버킷 재사용)
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(`chat/${fileName}`, imageBuffer, {
                contentType: mimeType,
                cacheControl: '86400' // 24시간 캐시
            });

        if (uploadError) {
            console.error('[Upload] Storage error:', uploadError);
            throw uploadError;
        }

        // Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(`chat/${fileName}`);

        console.log('[Upload] Success:', publicUrl);

        return res.status(200).json({
            success: true,
            imageUrl: publicUrl,
            imageId: fileName.replace(`.${extension}`, ''),
            mimeType,
            size: imageBuffer.length
        });

    } catch (error) {
        console.error('[Upload] Error:', error);
        return res.status(500).json({
            error: error.message || 'Upload failed',
            hint: 'Check image format and size'
        });
    }
};

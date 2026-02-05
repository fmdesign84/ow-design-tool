/**
 * 임시 이미지 업로드 API
 *
 * 프론트엔드에서 이미지 선택 시 즉시 업로드하여 URL 반환
 * - temp/ 폴더에 저장 (7일 후 자동 삭제)
 * - Replicate API 등에서 URL로 접근 가능
 *
 * 효과: Base64 전송 대비 33% 대역폭 절감
 */
import { createClient } from '@supabase/supabase-js';
import { logError } from './lib/errorLogger.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
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
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // JSON body에서 이미지 추출
    const { image, prefix = 'img' } = req.body || {};

    if (!image) {
      return res.status(400).json({
        error: 'image is required',
        hint: 'Send base64 encoded image data'
      });
    }

    // MIME 타입 감지
    let mimeType = 'image/png';
    let extension = 'png';

    const mimeMatch = image.match(/^data:([^;]+);base64,/);
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
    const base64Data = image.replace(/^data:[^;]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // 고유 파일명 생성
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `${prefix}_${timestamp}_${random}.${extension}`;
    const filePath = `temp/${fileName}`;

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filePath, imageBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (uploadError) {
      console.error('[UploadTemp] Storage error:', uploadError);
      throw uploadError;
    }

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filePath);

    console.log('[UploadTemp] Success:', publicUrl);

    return res.status(200).json({
      success: true,
      url: publicUrl,
      path: filePath,
      size: imageBuffer.length,
      mimeType
    });

  } catch (error) {
    console.error('[UploadTemp] Error:', error);

    await logError(
      'upload-temp-image',
      'UPLOAD_ERROR',
      error.message,
      { hasImage: !!req.body?.image },
      { stack: error.stack }
    );

    return res.status(500).json({
      error: error.message || 'Upload failed',
      hint: 'Check image format and size (max 10MB)'
    });
  }
}

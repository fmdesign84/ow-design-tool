/**
 * Supabase temp 폴더 업로드 유틸리티
 * Base64 이미지를 temp/ 폴더에 업로드하고 공개 URL 반환
 *
 * 용도: Replicate API에 URL로 전송하여 대역폭 33% 절감
 * 정리: cleanup-temp-files.js Cron Job이 7일 후 자동 삭제
 */
import { createClient } from '@supabase/supabase-js';

/**
 * Base64 이미지를 Supabase temp/ 폴더에 업로드
 * @param {string} base64Image - data:image/... 형식의 Base64 이미지
 * @param {string} prefix - 파일명 접두사 (예: 'inpaint', 'upscale')
 * @returns {Promise<{url: string, path: string}>} - 공개 URL과 저장 경로
 */
export async function uploadToTemp(base64Image, prefix = 'img') {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials missing');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Base64에서 버퍼로 변환
  let buffer;
  let mimeType = 'image/png';
  let extension = 'png';

  if (base64Image.startsWith('data:')) {
    // data:image/png;base64,... 형식 파싱
    const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      extension = mimeType.split('/')[1] || 'png';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      throw new Error('Invalid Base64 image format');
    }
  } else {
    // 순수 Base64 문자열
    buffer = Buffer.from(base64Image, 'base64');
  }

  // 고유 파일명 생성
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const fileName = `${prefix}_${timestamp}_${random}.${extension}`;
  const filePath = `temp/${fileName}`;

  // Supabase Storage에 업로드
  const { data, error } = await supabase.storage
    .from('generated-images')
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // 공개 URL 생성
  const { data: urlData } = supabase.storage
    .from('generated-images')
    .getPublicUrl(filePath);

  console.log(`[TempUploader] Uploaded: ${filePath}`);

  return {
    url: urlData.publicUrl,
    path: filePath
  };
}

/**
 * 여러 Base64 이미지를 병렬로 업로드
 * @param {Array<{image: string, prefix: string}>} images - 업로드할 이미지 배열
 * @returns {Promise<Array<{url: string, path: string}>>}
 */
export async function uploadMultipleToTemp(images) {
  return Promise.all(
    images.map(({ image, prefix }) => uploadToTemp(image, prefix))
  );
}

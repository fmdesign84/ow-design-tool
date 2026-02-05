/**
 * 공통 에러 로깅 유틸리티
 * 모든 API에서 사용하는 에러 로깅 함수
 */
import { createClient } from '@supabase/supabase-js';

/**
 * 민감 정보 필터링
 * @param {Object} data - 요청 데이터
 * @returns {Object} - 필터링된 데이터
 */
export function sanitizeRequestData(data) {
  if (!data) return null;

  const sanitized = { ...data };

  // API 키 필터링
  if (sanitized.apiKey) sanitized.apiKey = '[REDACTED]';

  // Base64 이미지 필터링 (크기 때문에)
  if (sanitized.image) sanitized.image = '[BASE64_REDACTED]';
  if (sanitized.imageBase64) sanitized.imageBase64 = '[BASE64_REDACTED]';
  if (sanitized.mask) sanitized.mask = '[BASE64_REDACTED]';

  // 배열 형태 이미지 필터링
  if (sanitized.referenceImages) {
    sanitized.referenceImages = `[${sanitized.referenceImages.length} IMAGES_REDACTED]`;
  }
  if (sanitized.images) {
    sanitized.images = `[${sanitized.images.length} IMAGES_REDACTED]`;
  }

  return sanitized;
}

/**
 * 에러 로깅 함수
 * @param {string} service - 서비스 이름 (예: 'generate-image', 'cleanup-temp-files')
 * @param {string} errorType - 에러 타입 (예: 'TIMEOUT', 'SAFETY_BLOCKED', 'GENERAL_ERROR')
 * @param {string} errorMessage - 에러 메시지
 * @param {Object} requestData - 요청 데이터 (민감 정보 자동 필터링)
 * @param {Object|null} responseData - 응답 데이터 (선택)
 */
export async function logError(service, errorType, errorMessage, requestData, responseData = null) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[ErrorLogger] Supabase credentials missing');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('error_logs').insert({
      service,
      error_type: errorType,
      error_message: typeof errorMessage === 'string'
        ? errorMessage.substring(0, 5000)  // 메시지 길이 제한
        : JSON.stringify(errorMessage).substring(0, 5000),
      request_data: sanitizeRequestData(requestData),
      response_data: responseData,
      resolved: false
    });

    if (error) {
      console.error('[ErrorLogger] Failed to log:', error.message);
    } else {
      console.log(`[ErrorLogger] Logged: ${service} - ${errorType}`);
    }
  } catch (e) {
    console.error('[ErrorLogger] Exception:', e.message);
  }
}

/**
 * 공통 응답 포맷 유틸리티
 * - 일관된 API 응답 형식
 * - 에러 타입별 메시지
 */

// ===== 에러 타입 상수 =====

export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  SAFETY_BLOCKED: 'SAFETY_BLOCKED',
  TIMEOUT: 'TIMEOUT',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  GENERAL_ERROR: 'GENERAL_ERROR',
};

// ===== 기본 에러 메시지 =====

const DEFAULT_ERROR_MESSAGES = {
  [ERROR_TYPES.VALIDATION_ERROR]: '입력값이 올바르지 않아요',
  [ERROR_TYPES.AUTH_ERROR]: '인증이 필요해요',
  [ERROR_TYPES.NOT_FOUND]: '찾을 수 없어요',
  [ERROR_TYPES.RATE_LIMIT]: '요청이 너무 많아요. 잠시 후 다시 시도해주세요',
  [ERROR_TYPES.QUOTA_EXCEEDED]: '사용량을 초과했어요',
  [ERROR_TYPES.SAFETY_BLOCKED]: '안전 정책에 맞지 않아 처리할 수 없어요',
  [ERROR_TYPES.TIMEOUT]: '처리 시간이 초과됐어요. 다시 시도해주세요',
  [ERROR_TYPES.EXTERNAL_API_ERROR]: '외부 서비스에 문제가 생겼어요',
  [ERROR_TYPES.GENERAL_ERROR]: '문제가 발생했어요. 다시 시도해주세요',
};

// ===== HTTP 상태 코드 매핑 =====

const ERROR_STATUS_CODES = {
  [ERROR_TYPES.VALIDATION_ERROR]: 400,
  [ERROR_TYPES.AUTH_ERROR]: 401,
  [ERROR_TYPES.NOT_FOUND]: 404,
  [ERROR_TYPES.RATE_LIMIT]: 429,
  [ERROR_TYPES.QUOTA_EXCEEDED]: 403,
  [ERROR_TYPES.SAFETY_BLOCKED]: 422,
  [ERROR_TYPES.TIMEOUT]: 504,
  [ERROR_TYPES.EXTERNAL_API_ERROR]: 502,
  [ERROR_TYPES.GENERAL_ERROR]: 500,
};

// ===== 응답 헬퍼 함수 =====

/**
 * 성공 응답 생성
 * @param {Object} data - 응답 데이터
 * @param {Object} meta - 메타 정보 (선택)
 * @returns {Object} - 포맷된 응답
 */
export function successResponse(data, meta = null) {
  const response = {
    success: true,
    ...data,
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
}

/**
 * 에러 응답 생성
 * @param {string} errorType - ERROR_TYPES 중 하나
 * @param {string} message - 상세 에러 메시지 (선택)
 * @param {Object} details - 추가 정보 (선택)
 * @returns {Object} - 포맷된 에러 응답
 */
export function errorResponse(errorType, message = null, details = null) {
  const response = {
    success: false,
    error: {
      type: errorType,
      message: message || DEFAULT_ERROR_MESSAGES[errorType] || DEFAULT_ERROR_MESSAGES[ERROR_TYPES.GENERAL_ERROR],
    },
  };

  if (details) {
    response.error.details = details;
  }

  return response;
}

/**
 * 성공 응답 전송
 * @param {Object} res - Vercel Response 객체
 * @param {Object} data - 응답 데이터
 * @param {number} statusCode - HTTP 상태 코드 (기본: 200)
 */
export function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json(successResponse(data));
}

/**
 * 에러 응답 전송
 * @param {Object} res - Vercel Response 객체
 * @param {string} errorType - ERROR_TYPES 중 하나
 * @param {string} message - 상세 에러 메시지 (선택)
 * @param {Object} details - 추가 정보 (선택)
 */
export function sendError(res, errorType, message = null, details = null) {
  const statusCode = ERROR_STATUS_CODES[errorType] || 500;
  return res.status(statusCode).json(errorResponse(errorType, message, details));
}

/**
 * 검증 에러 응답 전송 (400)
 * @param {Object} res - Vercel Response 객체
 * @param {string} message - 에러 메시지
 */
export function sendValidationError(res, message) {
  return sendError(res, ERROR_TYPES.VALIDATION_ERROR, message);
}

/**
 * 일반 에러 응답 전송 (500)
 * @param {Object} res - Vercel Response 객체
 * @param {string} message - 에러 메시지
 * @param {Object} details - 추가 정보
 */
export function sendServerError(res, message, details = null) {
  return sendError(res, ERROR_TYPES.GENERAL_ERROR, message, details);
}

/**
 * 안전 정책 위반 에러 전송 (422)
 * @param {Object} res - Vercel Response 객체
 * @param {string} message - 에러 메시지
 */
export function sendSafetyError(res, message = null) {
  return sendError(res, ERROR_TYPES.SAFETY_BLOCKED, message);
}

/**
 * 타임아웃 에러 전송 (504)
 * @param {Object} res - Vercel Response 객체
 * @param {string} message - 에러 메시지
 */
export function sendTimeoutError(res, message = null) {
  return sendError(res, ERROR_TYPES.TIMEOUT, message);
}

/**
 * 외부 API 에러 전송 (502)
 * @param {Object} res - Vercel Response 객체
 * @param {string} service - 외부 서비스 이름
 * @param {string} message - 에러 메시지
 */
export function sendExternalError(res, service, message = null) {
  return sendError(
    res,
    ERROR_TYPES.EXTERNAL_API_ERROR,
    message || `${service} 서비스에 문제가 생겼어요`,
    { service }
  );
}

/**
 * 사용량 초과 에러 전송 (403)
 * @param {Object} res - Vercel Response 객체
 * @param {Object} quotaInfo - 사용량 정보
 */
export function sendQuotaError(res, quotaInfo = null) {
  return sendError(
    res,
    ERROR_TYPES.QUOTA_EXCEEDED,
    '이번 달 사용량을 초과했어요',
    quotaInfo
  );
}

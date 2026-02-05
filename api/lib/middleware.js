/**
 * 공통 미들웨어 유틸리티
 * - CORS 헤더 설정
 * - 요청 메서드 검증
 */

/**
 * CORS 헤더 설정
 * @param {Object} res - Vercel Response 객체
 * @param {string} allowedOrigin - 허용할 Origin (기본: '*')
 */
export function applyCORS(res, allowedOrigin = '*') {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

/**
 * OPTIONS 요청 처리
 * @param {Object} req - Vercel Request 객체
 * @param {Object} res - Vercel Response 객체
 * @returns {boolean} - OPTIONS 요청이면 true
 */
export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * 메서드 검증
 * @param {Object} req - Vercel Request 객체
 * @param {Object} res - Vercel Response 객체
 * @param {string|string[]} allowedMethods - 허용할 메서드
 * @returns {boolean} - 허용되지 않은 메서드면 true (에러 응답 전송됨)
 */
export function checkMethod(req, res, allowedMethods = 'POST') {
  const methods = Array.isArray(allowedMethods) ? allowedMethods : [allowedMethods];

  if (!methods.includes(req.method)) {
    res.status(405).json({
      error: 'Method Not Allowed',
      allowed: methods.join(', ')
    });
    return true;
  }
  return false;
}

/**
 * 공통 핸들러 래퍼 - CORS + OPTIONS + 메서드 검증
 * @param {Object} req - Vercel Request 객체
 * @param {Object} res - Vercel Response 객체
 * @param {string|string[]} allowedMethods - 허용할 메서드
 * @returns {boolean} - 진행 불가능하면 true
 */
export function setupRequest(req, res, allowedMethods = 'POST') {
  applyCORS(res);

  if (handleOptions(req, res)) return true;
  if (checkMethod(req, res, allowedMethods)) return true;

  return false;
}

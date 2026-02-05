/**
 * 환경변수 검증 및 접근 유틸리티
 * - 필수 환경변수 검증
 * - 안전한 환경변수 접근
 * - Supabase 설정 헬퍼
 */

// 필수 환경변수 (없으면 API 동작 불가)
const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

// 선택 환경변수 (특정 기능에만 필요)
const OPTIONAL_ENV_VARS = [
  'GEMINI_API_KEY',
  'GOOGLE_PROJECT_ID',
  'REPLICATE_API_TOKEN',
];

let validated = false;
let missingVars = [];

/**
 * 환경변수 검증 (서버 시작 시 1회 호출)
 * @returns {boolean} 모든 필수 환경변수가 있으면 true
 */
export const validateEnv = () => {
  if (validated) return missingVars.length === 0;

  missingVars = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

  if (missingVars.length > 0) {
    console.error(`[ENV] Missing required: ${missingVars.join(', ')}`);
  }

  // 선택 환경변수 경고 (에러 아님)
  const missingOptional = OPTIONAL_ENV_VARS.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(`[ENV] Missing optional: ${missingOptional.join(', ')}`);
  }

  validated = true;
  return missingVars.length === 0;
};

/**
 * 환경변수 가져오기
 * @param {string} key 환경변수 이름
 * @param {string} [defaultValue] 기본값 (없으면 undefined)
 * @returns {string|undefined}
 */
export const getEnv = (key, defaultValue = undefined) => {
  const value = process.env[key];
  return value || defaultValue;
};

/**
 * 필수 환경변수 가져오기 (없으면 에러)
 * @param {string} key 환경변수 이름
 * @returns {string}
 * @throws {Error} 환경변수가 없으면 에러
 */
export const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not defined`);
  }
  return value;
};

/**
 * Supabase 설정 가져오기
 * @returns {{ url: string, key: string } | null} 설정이 없으면 null
 */
export const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
};

/**
 * Gemini API 설정 가져오기
 * @returns {{ apiKey: string, projectId: string } | null}
 */
export const getGeminiConfig = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  const projectId = process.env.GOOGLE_PROJECT_ID;

  if (!apiKey) {
    return null;
  }

  return { apiKey, projectId: projectId || '' };
};

/**
 * Replicate API 설정 가져오기
 * @returns {{ token: string } | null}
 */
export const getReplicateConfig = () => {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return null;
  }

  return { token };
};

/**
 * 환경 확인
 * @returns {'development' | 'production' | 'test'}
 */
export const getNodeEnv = () => {
  return process.env.NODE_ENV || 'development';
};

/**
 * 개발 환경인지 확인
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return getNodeEnv() === 'development';
};

/**
 * 프로덕션 환경인지 확인
 * @returns {boolean}
 */
export const isProduction = () => {
  return getNodeEnv() === 'production';
};

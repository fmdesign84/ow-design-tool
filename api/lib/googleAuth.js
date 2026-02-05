/**
 * Google Cloud 인증 유틸리티
 * - Google Auth Library를 사용한 토큰 발급
 * - Gemini, Imagen, Veo API 호출에 사용
 */

import { GoogleAuth } from 'google-auth-library';

// 인증 클라이언트 캐시 (콜드 스타트 최소화)
let cachedAuth = null;
let cachedToken = null;
let tokenExpiry = 0;

/**
 * Google Cloud 인증 정보 가져오기
 * @returns {Object} - { projectId, location, credentials }
 * @throws {Error} - 환경 변수 누락 시
 */
export function getGoogleConfig() {
  const projectId = process.env.GOOGLE_PROJECT_ID;
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!projectId) {
    throw new Error('GOOGLE_PROJECT_ID 환경 변수가 설정되지 않았습니다');
  }

  if (!credentialsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON 환경 변수가 설정되지 않았습니다');
  }

  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch (e) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON 파싱 실패');
  }

  return {
    projectId,
    location: 'us-central1',
    credentials,
  };
}

/**
 * Google Cloud 액세스 토큰 발급
 * - 토큰 캐싱으로 불필요한 재발급 방지
 * @returns {Promise<string>} - 액세스 토큰
 */
export async function getGoogleAccessToken() {
  // 캐시된 토큰이 유효하면 재사용
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const { credentials } = getGoogleConfig();

  if (!cachedAuth) {
    cachedAuth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  const client = await cachedAuth.getClient();
  const tokenResponse = await client.getAccessToken();

  cachedToken = tokenResponse.token;
  // 토큰은 보통 1시간 유효, 5분 전에 갱신
  tokenExpiry = Date.now() + 55 * 60 * 1000;

  return cachedToken;
}

/**
 * Google Cloud API URL 생성
 * @param {string} service - 서비스 이름 ('gemini', 'imagen', 'veo')
 * @param {string} model - 모델 이름
 * @param {string} action - API 액션 (기본: 'generateContent')
 * @returns {string} - API URL
 */
export function getGoogleApiUrl(service, model, action = 'generateContent') {
  const { projectId, location } = getGoogleConfig();

  const serviceMap = {
    gemini: 'publishers/google/models',
    imagen: 'publishers/google/models',
    veo: 'publishers/google/models',
  };

  const publisher = serviceMap[service] || 'publishers/google/models';

  return `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/${publisher}/${model}:${action}`;
}

/**
 * Gemini API URL 생성 (자주 사용되므로 단축 함수)
 * @param {string} model - 모델 이름 (기본: 'gemini-3-flash-preview')
 * @returns {string} - API URL
 */
export function getGeminiUrl(model = 'gemini-3-flash-preview') {
  return getGoogleApiUrl('gemini', model, 'generateContent');
}

/**
 * Imagen API URL 생성
 * @param {string} model - 모델 이름 (기본: 'imagen-4.0-generate-preview-05-20')
 * @param {string} action - API 액션 (기본: 'predict')
 * @returns {string} - API URL
 */
export function getImagenUrl(model = 'imagen-4.0-generate-preview-05-20', action = 'predict') {
  return getGoogleApiUrl('imagen', model, action);
}

/**
 * Veo API URL 생성
 * @param {string} model - 모델 이름 (기본: 'veo-3.1-generate-preview')
 * @param {string} action - API 액션 (기본: 'generateContent')
 * @returns {string} - API URL
 */
export function getVeoUrl(model = 'veo-3.1-generate-preview', action = 'generateContent') {
  return getGoogleApiUrl('veo', model, action);
}

/**
 * 인증된 fetch 요청
 * @param {string} url - API URL
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Response>} - fetch 응답
 */
export async function authenticatedFetch(url, options = {}) {
  const token = await getGoogleAccessToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * 타임아웃이 있는 fetch 요청
 * @param {string} url - API URL
 * @param {Object} options - fetch 옵션
 * @param {number} timeoutMs - 타임아웃 (기본: 50초)
 * @returns {Promise<Response>} - fetch 응답
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 50000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 인증 + 타임아웃이 있는 fetch 요청
 * @param {string} url - API URL
 * @param {Object} options - fetch 옵션
 * @param {number} timeoutMs - 타임아웃 (기본: 50초)
 * @returns {Promise<Response>} - fetch 응답
 */
export async function authenticatedFetchWithTimeout(url, options = {}, timeoutMs = 50000) {
  const token = await getGoogleAccessToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetchWithTimeout(url, { ...options, headers }, timeoutMs);
}

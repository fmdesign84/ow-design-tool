/**
 * 개발 환경 전용 API 라우팅 유틸
 * - GET 요청만 원격 Read-Only API로 우회
 * - 쓰기 요청(POST/PATCH/DELETE)은 기존 로컬 /api 유지
 */

import { getPublicEnv, isDevelopmentEnv } from './env';

const RAW_READONLY_BASE = getPublicEnv('READONLY_API_BASE');
const READONLY_BASE = RAW_READONLY_BASE.replace(/\/$/, '');

export const isReadOnlyMode =
  isDevelopmentEnv && Boolean(READONLY_BASE);

interface ApiRouteOptions {
  method?: string;
}

export const getApiUrl = (path: string, options: ApiRouteOptions = {}): string => {
  if (!path.startsWith('/api/')) return path;

  const method = (options.method || 'GET').toUpperCase();
  if (isReadOnlyMode && method === 'GET') {
    return `${READONLY_BASE}${path}`;
  }

  return path;
};

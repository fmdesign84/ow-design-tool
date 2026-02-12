/**
 * 클라이언트 공개 환경변수 조회 유틸
 * - Next.js: NEXT_PUBLIC_*
 * - CRA: REACT_APP_*
 */

export const getPublicEnv = (name: string): string => {
  const nextValue = process.env[`NEXT_PUBLIC_${name}`];
  if (nextValue) return nextValue;

  const craValue = process.env[`REACT_APP_${name}`];
  if (craValue) return craValue;

  return '';
};

export const isDevelopmentEnv = process.env.NODE_ENV === 'development';


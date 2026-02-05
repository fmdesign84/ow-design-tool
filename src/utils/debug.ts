/**
 * Remote Debug Utility
 * Supabase에 로그 저장 → API로 조회 가능
 */

const API_ENDPOINT = '/api/debug-logs';

/**
 * 서버에 로그 전송 (비동기, 실패해도 무시)
 */
const sendToServer = async (tag: string, message: string, data?: unknown): Promise<void> => {
  try {
    await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag, message, data }),
    });
  } catch {
    // 로그 전송 실패는 무시 (앱 동작에 영향 없도록)
  }
};

/**
 * 원격 로그 (console + 서버 저장)
 */
export const rlog = (tag: string, message: string, data?: unknown): void => {
  const fullMessage = `[${tag}] ${message}`;
  if (data !== undefined) {
    console.log(fullMessage, data);
  } else {
    console.log(fullMessage);
  }
  sendToServer(tag, message, data);
};

export const rwarn = (tag: string, message: string, data?: unknown): void => {
  const fullMessage = `[${tag}][WARN] ${message}`;
  if (data !== undefined) {
    console.warn(fullMessage, data);
  } else {
    console.warn(fullMessage);
  }
  sendToServer(`${tag}:WARN`, message, data);
};

export const rerror = (tag: string, message: string, data?: unknown): void => {
  const fullMessage = `[${tag}][ERROR] ${message}`;
  if (data !== undefined) {
    console.error(fullMessage, data);
  } else {
    console.error(fullMessage);
  }
  sendToServer(`${tag}:ERROR`, message, data);
};

const debugUtils = { rlog, rwarn, rerror };
export default debugUtils;

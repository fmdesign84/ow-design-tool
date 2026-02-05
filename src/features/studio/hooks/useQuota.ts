/**
 * 사용량/할당량 관리 훅
 * - 현재 사용량 조회
 * - 사용량 증가 (이미지 생성 시)
 * - 한도 체크
 */

import { useState, useEffect, useCallback } from 'react';

interface QuotaInfo {
  used: number;
  max: number;
  bonus: number;
  remaining: number;
  tokens_used?: number;
}

interface UseQuotaOptions {
  userId?: string;
  autoFetch?: boolean;
}

interface UseQuotaReturn {
  quota: QuotaInfo | null;
  isLoading: boolean;
  error: string | null;
  month: string;
  canGenerate: boolean;
  usagePercent: number;
  refetch: () => Promise<void>;
  incrementUsage: (count?: number, tokens?: number) => Promise<boolean>;
  checkQuota: (requiredCount?: number) => boolean;
}

export function useQuota(options: UseQuotaOptions = {}): UseQuotaReturn {
  const { userId, autoFetch = true } = options;

  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [month, setMonth] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 할당량 조회
  const fetchQuota = useCallback(async () => {
    if (!userId) {
      setQuota(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/user-quota?user_id=${userId}`);

      if (!response.ok) {
        throw new Error('할당량 정보를 불러오지 못했습니다.');
      }

      const data = await response.json();
      setQuota(data.quota);
      setMonth(data.month);
    } catch (err) {
      console.error('[useQuota] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 사용량 증가
  const incrementUsage = useCallback(async (count: number = 1, tokens: number = 0): Promise<boolean> => {
    if (!userId) {
      throw new Error('사용자 정보가 없습니다.');
    }

    try {
      const response = await fetch('/api/user-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          count,
          tokens,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          setError('사용량 한도를 초과했습니다.');
          return false;
        }
        throw new Error(data.error || '사용량 업데이트에 실패했습니다.');
      }

      const data = await response.json();
      setQuota(data.quota);

      return true;
    } catch (err) {
      console.error('[useQuota] Increment error:', err);
      throw err;
    }
  }, [userId]);

  // 한도 체크 (로컬)
  const checkQuota = useCallback((requiredCount: number = 1): boolean => {
    if (!quota) return false;
    return quota.remaining >= requiredCount;
  }, [quota]);

  // 생성 가능 여부
  const canGenerate = quota ? quota.remaining > 0 : false;

  // 사용량 퍼센트
  const usagePercent = quota
    ? Math.min(100, Math.round((quota.used / (quota.max + quota.bonus)) * 100))
    : 0;

  // 초기 로드
  useEffect(() => {
    if (autoFetch) {
      fetchQuota();
    }
  }, [autoFetch, fetchQuota]);

  return {
    quota,
    isLoading,
    error,
    month,
    canGenerate,
    usagePercent,
    refetch: fetchQuota,
    incrementUsage,
    checkQuota,
  };
}

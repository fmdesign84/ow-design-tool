/**
 * 관리자 통계 훅
 * - 대시보드 요약 조회
 * - 사용자 목록 조회
 * - 사용자 관리 (권한, 할당량)
 */

import { useState, useEffect, useCallback } from 'react';
import type { AdminDashboardSummary, UserWithQuota } from '../types';
import { getApiUrl } from '../../../utils/apiRoute';

interface UseAdminStatsOptions {
  period?: number; // 조회 기간 (일)
  autoFetch?: boolean;
}

interface UseAdminStatsReturn {
  summary: AdminDashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminStats(options: UseAdminStatsOptions = {}): UseAdminStatsReturn {
  const { period = 30, autoFetch = true } = options;

  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 통계 조회
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(getApiUrl(`/api/admin/stats?period=${period}`));

      if (!response.ok) {
        throw new Error('통계 정보를 불러오지 못했습니다.');
      }

      const data = await response.json();

      setSummary({
        total_users: data.summary.total_users,
        active_users_today: data.summary.active_users_today,
        total_generations_today: data.summary.generations_today,
        total_generations_month: data.summary.generations_month,
        top_users: data.top_users,
        daily_stats: data.daily_stats,
      });
    } catch (err) {
      console.error('[useAdminStats] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  // 초기 로드
  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [autoFetch, fetchStats]);

  return {
    summary,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

// 사용자 관리 훅 (별도)
interface UseAdminUsersOptions {
  search?: string;
  role?: 'user' | 'admin';
  autoFetch?: boolean;
}

interface UseAdminUsersReturn {
  users: UserWithQuota[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUser: (id: string, updates: Partial<UserWithQuota>) => Promise<void>;
  adjustQuota: (userId: string, maxCount?: number, bonusCount?: number) => Promise<void>;
  addUser: (email: string, name: string, role?: 'user' | 'admin') => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}): UseAdminUsersReturn {
  const { search, role, autoFetch = true } = options;

  const [users, setUsers] = useState<UserWithQuota[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 사용자 목록 조회
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role) params.set('role', role);

      const response = await fetch(getApiUrl(`/api/admin/users?${params}`));

      if (!response.ok) {
        throw new Error('사용자 목록을 불러오지 못했습니다.');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error('[useAdminUsers] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [search, role]);

  // 사용자 정보 수정
  const updateUser = useCallback(async (id: string, updates: Partial<UserWithQuota>) => {
    const response = await fetch(getApiUrl('/api/admin/users', { method: 'PATCH' }), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '사용자 수정에 실패했습니다.');
    }

    // 로컬 상태 업데이트
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  // 할당량 조정
  const adjustQuota = useCallback(async (userId: string, maxCount?: number, bonusCount?: number) => {
    const response = await fetch(getApiUrl('/api/user-quota', { method: 'PATCH' }), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        max_count: maxCount,
        bonus_count: bonusCount,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '할당량 조정에 실패했습니다.');
    }

    const data = await response.json();

    // 로컬 상태 업데이트
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          quota: data.quota,
        };
      }
      return u;
    }));
  }, []);

  // 사용자 추가
  const addUser = useCallback(async (email: string, name: string, userRole: 'user' | 'admin' = 'user') => {
    const response = await fetch(getApiUrl('/api/admin/users', { method: 'POST' }), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role: userRole }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '사용자 추가에 실패했습니다.');
    }

    const data = await response.json();
    setUsers(prev => [data.user, ...prev]);
    setTotal(prev => prev + 1);
  }, []);

  // 사용자 비활성화
  const deactivateUser = useCallback(async (id: string) => {
    const response = await fetch(getApiUrl('/api/admin/users', { method: 'DELETE' }), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '사용자 비활성화에 실패했습니다.');
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    setTotal(prev => prev - 1);
  }, []);

  // 초기 로드
  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [autoFetch, fetchUsers]);

  return {
    users,
    total,
    isLoading,
    error,
    refetch: fetchUsers,
    updateUser,
    adjustQuota,
    addUser,
    deactivateUser,
  };
}

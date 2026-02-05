/**
 * 사용자 상태 관리 (Zustand)
 * - 현재 사용자 정보
 * - 역할 전환 (개발용)
 * - 할당량 정보
 */

import { create } from 'zustand';
import type { User } from '../types';

interface QuotaInfo {
  used: number;
  max: number;
  bonus: number;
  remaining: number;
}

interface UserState {
  currentUser: User | null;
  quota: QuotaInfo | null;
  isDevMode: boolean;
  viewAsRole: 'user' | 'admin';
  setUser: (user: User | null) => void;
  setQuota: (quota: QuotaInfo | null) => void;
  toggleDevMode: () => void;
  setViewAsRole: (role: 'user' | 'admin') => void;
  isAdmin: () => boolean;
  canAccessAdmin: () => boolean;
}

const DEFAULT_USER: User = {
  id: 'dev-user-001',
  email: 'developer@company.com',
  name: '개발자',
  role: 'admin',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: DEFAULT_USER,
  quota: { used: 12, max: 100, bonus: 50, remaining: 138 },
  isDevMode: true,
  viewAsRole: 'admin',

  setUser: (user: User | null) => set({ currentUser: user }),
  setQuota: (quota: QuotaInfo | null) => set({ quota }),
  toggleDevMode: () => set((s: UserState) => ({ isDevMode: !s.isDevMode })),
  setViewAsRole: (role: 'user' | 'admin') => set({ viewAsRole: role }),

  isAdmin: () => get().currentUser?.role === 'admin',
  canAccessAdmin: () => {
    const { currentUser, isDevMode, viewAsRole } = get();
    return isDevMode ? viewAsRole === 'admin' : currentUser?.role === 'admin';
  },
}));

export default useUserStore;

/**
 * 프로필 메뉴 컴포넌트
 * - 사용자 정보 표시
 * - 역할 전환 (개발용)
 * - 관리자 대시보드 접근
 * - 사용량 표시
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAppNavigate } from '../../../../hooks/useAppRouter';
import {
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Zap,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';

interface ProfileMenuProps {
  transparent?: boolean;
  className?: string;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  transparent = false,
  className = '',
}) => {
  const navigate = useAppNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    currentUser,
    quota,
    isDevMode,
    viewAsRole,
    setViewAsRole,
    canAccessAdmin,
  } = useUserStore();

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdminClick = () => {
    navigate('/admin');
    setIsOpen(false);
  };

  const handleRoleToggle = () => {
    setViewAsRole(viewAsRole === 'admin' ? 'user' : 'admin');
  };

  const usagePercent = quota
    ? Math.round((quota.used / (quota.max + quota.bonus)) * 100)
    : 0;

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
          ${transparent
            ? 'hover:bg-white/10'
            : 'hover:bg-neutral-800'
          }
        `}
      >
        {/* 사용자 정보 */}
        <div className="text-right hidden sm:block">
          <div className={`text-sm font-medium ${transparent ? 'text-white' : 'text-neutral-200'}`}>
            {currentUser?.name || '사용자'}
          </div>
          <div className={`text-xs ${transparent ? 'text-white/70' : 'text-neutral-500'}`}>
            {canAccessAdmin() ? '관리자' : '사용자'}
            {isDevMode && <span className="text-yellow-500 ml-1">(DEV)</span>}
          </div>
        </div>

        {/* 아바타 */}
        <div
          className={`
            w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold
            ${canAccessAdmin()
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            }
            ${transparent ? 'ring-2 ring-white/30' : ''}
          `}
        >
          {currentUser?.name?.charAt(0) || 'U'}
        </div>

        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${transparent ? 'text-white' : 'text-neutral-400'}`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800 overflow-hidden z-50">
          {/* 사용자 정보 헤더 */}
          <div className="p-4 bg-neutral-800/50 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold
                  ${canAccessAdmin()
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }
                `}
              >
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-100">{currentUser?.name}</p>
                <p className="text-sm text-neutral-500">{currentUser?.email}</p>
              </div>
            </div>

            {/* 사용량 바 */}
            {quota && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-neutral-400">이번 달 사용량</span>
                  <span className="text-neutral-300">
                    {quota.used} / {quota.max + quota.bonus}
                  </span>
                </div>
                <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      usagePercent >= 100 ? 'bg-red-500' :
                      usagePercent >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 메뉴 아이템들 */}
          <div className="py-2">
            {/* 관리자 대시보드 (관리자만) */}
            {canAccessAdmin() && (
              <button
                onClick={handleAdminClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors"
              >
                <LayoutDashboard size={18} className="text-purple-400" />
                <div>
                  <p className="text-sm text-neutral-200">관리자 대시보드</p>
                  <p className="text-xs text-neutral-500">사용 통계 및 사용자 관리</p>
                </div>
              </button>
            )}

            {/* 내 사용량 */}
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors"
            >
              <Zap size={18} className="text-yellow-400" />
              <div>
                <p className="text-sm text-neutral-200">내 사용량</p>
                <p className="text-xs text-neutral-500">
                  남은 횟수: {quota?.remaining || 0}회
                </p>
              </div>
            </button>

            {/* 설정 */}
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors"
            >
              <Settings size={18} className="text-neutral-400" />
              <span className="text-sm text-neutral-200">설정</span>
            </button>
          </div>

          {/* 개발자 모드 섹션 */}
          {isDevMode && (
            <div className="border-t border-neutral-800 py-2 bg-yellow-500/5">
              <div className="px-4 py-1">
                <p className="text-xs text-yellow-500 font-medium">개발자 모드</p>
              </div>

              {/* 역할 전환 */}
              <button
                onClick={handleRoleToggle}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield size={18} className={viewAsRole === 'admin' ? 'text-purple-400' : 'text-neutral-400'} />
                  <div>
                    <p className="text-sm text-neutral-200">역할 전환</p>
                    <p className="text-xs text-neutral-500">
                      현재: {viewAsRole === 'admin' ? '관리자' : '일반 사용자'}
                    </p>
                  </div>
                </div>
                {viewAsRole === 'admin' ? (
                  <ToggleRight size={24} className="text-purple-400" />
                ) : (
                  <ToggleLeft size={24} className="text-neutral-500" />
                )}
              </button>
            </div>
          )}

          {/* 로그아웃 */}
          <div className="border-t border-neutral-800 py-2">
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors text-red-400"
            >
              <LogOut size={18} />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

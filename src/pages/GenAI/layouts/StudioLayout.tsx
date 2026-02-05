/**
 * 스튜디오 공통 레이아웃
 * - 모바일 GNB
 * - 좌측 사이드바 (데스크탑)
 * - 서브 사이드바
 * - 메인 컨텐츠 영역
 */

import React from 'react';
import useIsMobile from '../../../hooks/useIsMobile';
import { MobileGNB } from '../../../components/layout/MobileGNB';
import { OrangeWhaleIcon, LockIcon } from '../../../components/common/Icons';
import {
  SIDEBAR_MENUS,
  IMAGE_SUB_MENUS,
  TOOLS_SUB_MENUS,
  VIDEO_SUB_MENUS,
  DESIGN_SUB_MENUS,
  LIBRARY_SUB_MENUS,
} from '../constants';
import styles from '../ImageGenPage.module.css';

// 메뉴 아이템 타입 (JS 상수와 호환)
interface MenuItem {
  key?: string;
  label?: string;
  Icon?: React.ComponentType<{ size?: number }>;
  locked?: boolean;
  isNew?: boolean;
  comingSoon?: boolean;
  divider?: boolean;
}

// 메뉴 타입
export type MenuKey = 'home' | 'image' | 'tools' | 'video' | 'design' | 'library' | 'wave' | 'swimming';
export type SubMenuKey = string;

interface StudioLayoutProps {
  activeMenu: MenuKey;
  activeSubMenu: SubMenuKey;
  onMenuChange: (menu: MenuKey) => void;
  onSubMenuChange: (subMenu: SubMenuKey) => void;
  pointUsage: { used: number; limit: number };
  children: React.ReactNode;
  // 라이브러리용 샘플 이미지 getter (옵션)
  getLibrarySampleImage?: (key: string) => string | null;
}

// 메뉴별 타이틀
const getMenuTitle = (menu: MenuKey): string => {
  switch (menu) {
    case 'image': return '이미지 생성';
    case 'tools': return '편집';
    case 'video': return '영상 생성';
    case 'library': return '내 라이브러리';
    case 'design': return '템플릿';
    default: return '';
  }
};

// 메뉴별 서브메뉴 목록
const getSubMenus = (menu: MenuKey): MenuItem[] => {
  switch (menu) {
    case 'image': return IMAGE_SUB_MENUS as MenuItem[];
    case 'tools': return TOOLS_SUB_MENUS as MenuItem[];
    case 'video': return VIDEO_SUB_MENUS as MenuItem[];
    case 'design': return DESIGN_SUB_MENUS as MenuItem[];
    case 'library': return LIBRARY_SUB_MENUS as MenuItem[];
    default: return [];
  }
};

// 서브사이드바가 필요없는 메뉴
const NO_SUBSIDEBAR_MENUS: MenuKey[] = ['home', 'wave', 'swimming'];

export const StudioLayout: React.FC<StudioLayoutProps> = ({
  activeMenu,
  activeSubMenu,
  onMenuChange,
  onSubMenuChange,
  pointUsage,
  children,
  getLibrarySampleImage,
}) => {
  const isMobile = useIsMobile();
  const showSubSidebar = !isMobile && !NO_SUBSIDEBAR_MENUS.includes(activeMenu);
  const subMenus = getSubMenus(activeMenu);
  const menuTitle = getMenuTitle(activeMenu);

  return (
    <div className={`${styles.studioWrapper} ${isMobile ? styles.mobileWrapper : ''}`}>
      {/* 모바일 GNB */}
      {isMobile && (
        <MobileGNB
          pageTitle="Orange Whale Studio"
          userName="윤국현"
          userRole="BM Leader"
        />
      )}

      {/* 좌측 사이드바 (데스크탑) */}
      {!isMobile && (
        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            {/* 로고 */}
            <div
              className={styles.sidebarLogo}
              onClick={() => onMenuChange('home')}
              title="Orange Whale Studio"
            >
              <OrangeWhaleIcon size={36} />
            </div>

            {/* 네비게이션 */}
            <nav className={styles.sidebarNav}>
              {SIDEBAR_MENUS.map((menu) => (
                <button
                  key={menu.key}
                  className={`${styles.sidebarItem} ${activeMenu === menu.key ? styles.active : ''}`}
                  onClick={() => onMenuChange(menu.key as MenuKey)}
                  title={menu.label}
                >
                  <menu.Icon size={20} />
                  <span className={styles.sidebarItemLabel}>{menu.label}</span>
                </button>
              ))}
            </nav>

            {/* 사용자 프로필 */}
            <div className={styles.sidebarBottom}>
              <div className={styles.tokenSlider}>
                <div className={styles.tokenProgress}>
                  <div
                    className={styles.tokenProgressFill}
                    style={{ height: `${Math.min((pointUsage.used / pointUsage.limit) * 100, 100)}%` }}
                  />
                </div>
                <span className={styles.tokenValue}>
                  <span className={styles.tokenUsed}>{pointUsage.used}</span>
                  <span className={styles.tokenDivider}></span>
                  <span className={styles.tokenLimit}>{pointUsage.limit}P</span>
                </span>
              </div>
              <div className={styles.sidebarProfile}>
                <div className={styles.sidebarUserInfo}>
                  <span className={styles.sidebarUserName}>윤국현</span>
                  <span className={styles.sidebarUserTitle}>BM Leader</span>
                </div>
                <div className={styles.sidebarAvatar}>
                  <img src="/images/profile-avatar.png" alt="윤국현" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 서브 사이드바 */}
      {showSubSidebar && (
        <div className={styles.subSidebar}>
          <div className={styles.subSidebarCard}>
            <div className={styles.subSidebarTitle}>{menuTitle}</div>
            <nav className={`${styles.subSidebarNav} ${activeMenu === 'library' ? styles.libraryNav : ''}`}>
              {activeMenu === 'library' ? (
                // 라이브러리: 이미지 버튼 스타일
                subMenus.filter(menu => menu.key).map((menu) => {
                  const sampleImage = getLibrarySampleImage?.(menu.key!);
                  return (
                    <button
                      key={menu.key}
                      className={`${styles.libraryNavBtn} ${activeSubMenu === menu.key ? styles.active : ''}`}
                      onClick={() => onSubMenuChange(menu.key!)}
                    >
                      <div className={styles.libraryNavImageWrapper}>
                        {sampleImage ? (
                          <img src={sampleImage} alt={menu.label} className={styles.libraryNavImage} />
                        ) : (
                          <div className={styles.libraryNavPlaceholder}>
                            {menu.Icon && <menu.Icon size={20} />}
                          </div>
                        )}
                        <div className={styles.libraryNavOverlay}>
                          <span className={styles.libraryNavLabel}>{menu.label}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                // 기타 메뉴: 기존 스타일
                subMenus.map((menu, idx) =>
                  menu.divider ? (
                    <div key={`divider-${idx}`} className={`${styles.subSidebarDivider} ${!menu.label ? styles.noLabel : ''}`}>
                      {menu.label && <span>{menu.label}</span>}
                    </div>
                  ) : menu.key ? (
                    <button
                      key={menu.key}
                      className={`${styles.subSidebarItem} ${activeSubMenu === menu.key ? styles.active : ''} ${menu.locked || menu.comingSoon ? styles.locked : ''}`}
                      onClick={() => !menu.locked && !menu.comingSoon && onSubMenuChange(menu.key!)}
                      disabled={menu.locked || menu.comingSoon}
                    >
                      {menu.Icon && <menu.Icon size={18} />}
                      <span>{menu.label}</span>
                      {menu.isNew && <span className={styles.newBadge}>NEW</span>}
                      {menu.comingSoon && <span className={styles.comingSoonBadge}>준비 중</span>}
                      {menu.locked && <LockIcon size={12} />}
                    </button>
                  ) : null
                )
              )}
            </nav>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className={`${styles.mainContent} ${activeMenu === 'home' ? styles.mainContentHome : ''}`}>
        <div className={`${styles.mainCard} ${activeMenu === 'home' ? styles.mainCardHome : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default StudioLayout;

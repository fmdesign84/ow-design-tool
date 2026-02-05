import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './MobileGNB.module.css';

// 아이콘 import
import logoOnly from '../../../assets/icons/logo-only.svg';
import iconMenu from '../../../assets/icons/icon-1.svg';

// 닫기(X) 아이콘
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const MobileGNB = ({
  pageTitle = 'Orange Whale Studio',
  userName = '사용자',
  userRole = '',
  darkMode = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // ESC 키로 메뉴 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isMenuOpen]);

  // 메뉴 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleLogoClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Fixed Header Bar */}
      <header className={`${styles.mobileHeader} ${darkMode ? styles.darkMode : ''}`}>
        {/* Left: Logo */}
        <div className={styles.headerLeft} onClick={handleLogoClick}>
          <img src={logoOnly} alt="Orange Whale" className={styles.logo} />
        </div>

        {/* Center: Title */}
        <div className={styles.headerCenter}>
          <span className={styles.headerTitle}>Orange Whale</span>
        </div>

        {/* Right: Hamburger */}
        <button
          className={styles.hamburgerBtn}
          onClick={() => setIsMenuOpen(true)}
          aria-label="메뉴 열기"
        >
          <img src={iconMenu} alt="Menu" className={styles.menuIcon} />
        </button>
      </header>

      {/* Overlay Menu */}
      {isMenuOpen && (
        <div
          className={styles.menuOverlay}
          onClick={handleBackdropClick}
        >
          <div
            className={`${styles.menuSlider} ${isMenuOpen ? styles.menuSliderOpen : ''}`}
            ref={menuRef}
          >
            {/* Menu Header */}
            <div className={styles.menuHeader}>
              <div className={styles.menuLogo} onClick={handleLogoClick}>
                <img src={logoOnly} alt="Orange Whale" />
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setIsMenuOpen(false)}
                aria-label="메뉴 닫기"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Profile Section */}
            <div className={styles.profileSection}>
              <div className={styles.profileAvatar}>
                <img
                  src="/images/profile-avatar.png"
                  alt={userName}
                  className={styles.profileAvatarImage}
                />
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{userName}</span>
                {userRole && <span className={styles.profileRole}>{userRole}</span>}
              </div>
            </div>

            <div className={styles.menuDivider}></div>

            {/* Menu Content - AI Studio Only */}
            <nav className={styles.menuContent}>
              {/* Orange Whale Studio 섹션 */}
              <div className={styles.section}>
                <div
                  className={`${styles.mainItem} ${styles.moduleTitle}`}
                >
                  Orange Whale Studio
                </div>
                <div className={styles.submenu}>
                  <div
                    className={`${styles.subItem} ${location.pathname === '/image' || location.pathname === '/' ? styles.active : ''}`}
                    onClick={() => handleMenuItemClick('/image')}
                  >
                    이미지 생성
                  </div>
                  <div
                    className={`${styles.subItem} ${location.pathname === '/video' ? styles.active : ''}`}
                    onClick={() => handleMenuItemClick('/video')}
                  >
                    영상 생성
                  </div>
                  <div
                    className={`${styles.subItem} ${location.pathname === '/design' ? styles.active : ''}`}
                    onClick={() => handleMenuItemClick('/design')}
                  >
                    디자인 어시스턴트
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileGNB;

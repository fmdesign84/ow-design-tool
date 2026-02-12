import { AppLink } from '../../../hooks/useAppRouter';
import { ProfileMenu } from '../../../features/studio/components/Common';
import styles from './Header.module.css';

const Header = ({
  pageTitle = 'Orange Whale Studio',
  userName = '사용자',
  userRole = '',
  transparent = false
}) => {
  return (
    <header className={`${styles.topHeader} ${transparent ? styles.transparent : ''}`}>
      <AppLink
        to="/"
        className={`${styles.pageTitle} ${transparent ? styles.pageTitleTransparent : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <h1 style={{ margin: 0, font: 'inherit', color: 'inherit' }}>{pageTitle}</h1>
      </AppLink>

      <div
        className={styles.headerRight}
        style={transparent ? {
          position: 'fixed',
          top: '16px',
          right: '24px',
          zIndex: 99999
        } : undefined}
      >
        {/* 프로필 메뉴 (역할 전환 + 관리자 접근) */}
        <ProfileMenu transparent={transparent} />
      </div>
    </header>
  );
};

export default Header;

import React, { useCallback, useEffect, useState } from 'react';
import { OrangeWhaleIcon } from '../../components/common/Icons';
import { useAppLocation, useAppNavigate } from '../../hooks/useAppRouter';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import getNodePreset from '../../utils/nodePresets';
import { WaveView } from './views';
import {
  SIDEBAR_MENUS,
  IMAGE_SUB_MENUS,
  TOOLS_SUB_MENUS,
  VIDEO_SUB_MENUS,
  DESIGN_SUB_MENUS,
  LIBRARY_SUB_MENUS,
} from './constants';
import styles from './ImageGenPage.module.css';

const MENU_PATH_MAP = {
  wave: '/wave',
  image: '/image',
  tools: '/tools',
  video: '/video',
  design: '/design',
  library: '/library',
};

const PRESET_NAMES = {
  'character-gen-studio': '캐릭터 생성',
  'storyboard-gen': '포레스트런 스토리보드',
  'storyboard-animation': '포레스트런 애니메이션',
  'storyboard-full': '포레스트런 통합',
  'character-animation': '캐릭터 애니메이션',
};

const PRESET_MENU_MAP = {
  'character-animation': 'video',
};

const WAVE_SWITCH_MENUS = new Set([
  'character-gen-studio',
  'storyboard-gen',
  'storyboard-animation',
  'storyboard-full',
  'character-animation',
]);

const getInitialMenu = (path) => {
  if (path.includes('/video')) return 'video';
  if (path.includes('/tools')) return 'tools';
  if (path.includes('/design')) return 'design';
  if (path.includes('/library')) return 'library';
  if (path.includes('/image')) return 'image';
  return 'wave';
};

const getDefaultSubMenu = (menu) => {
  if (menu === 'video') return 'text-to-video';
  if (menu === 'design') return 'mockup-generator';
  if (menu === 'tools') return 'upscale';
  if (menu === 'library') return 'all';
  if (menu === 'wave') return 'editor';
  return 'text-to-image';
};

const getSubMenusByMenu = (menu) => {
  if (menu === 'image') return IMAGE_SUB_MENUS.filter((item) => !item.divider);
  if (menu === 'tools') return TOOLS_SUB_MENUS;
  if (menu === 'video') return VIDEO_SUB_MENUS.filter((item) => !item.divider);
  if (menu === 'design') return DESIGN_SUB_MENUS;
  if (menu === 'library') return LIBRARY_SUB_MENUS;
  return [];
};

const ImageGenPage = () => {
  const location = useAppLocation();
  const navigate = useAppNavigate();

  const initialMenu = getInitialMenu(location.pathname);
  const [activeMenu, setActiveMenu] = useState(initialMenu);
  const [activeSubMenu, setActiveSubMenu] = useState(getDefaultSubMenu(initialMenu));
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { setNodes, setEdges, updateSession } = useWorkflowStore();

  useEffect(() => {
    const nextMenu = getInitialMenu(location.pathname);
    if (nextMenu !== activeMenu) {
      setActiveMenu(nextMenu);
      setActiveSubMenu(getDefaultSubMenu(nextMenu));
    }
  }, [location.pathname, activeMenu]);

  const switchToWave = useCallback(() => {
    setActiveMenu('wave');
    setActiveSubMenu('editor');
    navigate('/wave');
  }, [navigate]);

  const appendPresetToCanvas = useCallback((menuCategory, menuKey) => {
    const preset = getNodePreset(menuCategory, menuKey);
    if (!preset) return;

    setNodes((prevNodes) => {
      const maxX = prevNodes.length > 0
        ? Math.max(...prevNodes.map((node) => node.position.x)) + 400
        : 0;

      const offsetNodes = preset.nodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x + maxX,
          y: node.position.y,
        },
      }));

      return [...prevNodes, ...offsetNodes];
    });

    setEdges((prevEdges) => [...prevEdges, ...preset.edges]);
  }, [setNodes, setEdges]);

  const loadPresetAndSwitchToWave = useCallback((menuKey) => {
    const category = PRESET_MENU_MAP[menuKey] || 'image';
    appendPresetToCanvas(category, menuKey);

    const presetName = PRESET_NAMES[menuKey];
    if (presetName) {
      updateSession({ name: presetName });
    }

    switchToWave();
  }, [appendPresetToCanvas, switchToWave, updateSession]);

  const handleMenuChange = useCallback((menuKey) => {
    setActiveMenu(menuKey);
    setActiveSubMenu(getDefaultSubMenu(menuKey));

    const nextPath = MENU_PATH_MAP[menuKey] || '/wave';
    navigate(nextPath);
  }, [navigate]);

  const handleSubMenuClick = useCallback((menuKey) => {
    if (WAVE_SWITCH_MENUS.has(menuKey)) {
      loadPresetAndSwitchToWave(menuKey);
      return;
    }

    setActiveSubMenu(menuKey);
    const presetCategory = activeMenu === 'wave' ? 'image' : activeMenu;
    appendPresetToCanvas(presetCategory, menuKey);
  }, [activeMenu, appendPresetToCanvas, loadPresetAndSwitchToWave]);

  const subMenus = getSubMenusByMenu(activeMenu);

  return (
    <div className={styles.studioWrapper}>
      <div className={styles.mainContent}>
        <div
          className={styles.mainCard}
          onClick={() => activeMenu !== 'wave' && handleMenuChange('wave')}
        >
          <WaveView onLightboxChange={setIsLightboxOpen} />

          {activeMenu !== 'wave' && !isLightboxOpen && (
            <div className={styles.floatingSubMenu} onClick={(event) => event.stopPropagation()}>
              <div className={styles.floatingSubMenuCard}>
                {subMenus.map((menu) => (
                  <button
                    key={menu.key}
                    className={`${styles.floatingSubMenuItem} ${activeSubMenu === menu.key ? styles.active : ''} ${menu.locked || menu.comingSoon ? styles.locked : ''}`}
                    onClick={() => !menu.locked && !menu.comingSoon && handleSubMenuClick(menu.key)}
                    disabled={menu.locked || menu.comingSoon}
                    title={menu.label}
                  >
                    <menu.Icon size={16} />
                    <span className={styles.floatingSubMenuLabel}>{menu.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isLightboxOpen && (
            <div className={styles.bottomGnb} onClick={(event) => event.stopPropagation()}>
              <div className={styles.bottomGnbCard}>
                <div
                  className={styles.bottomGnbLogo}
                  onClick={() => navigate('/design-assets')}
                  title="Design Assets"
                >
                  <OrangeWhaleIcon size={28} />
                </div>

                <nav className={styles.bottomGnbNav}>
                  {SIDEBAR_MENUS.map((menu) => (
                    <button
                      key={menu.key}
                      className={`${styles.bottomGnbItem} ${activeMenu === menu.key ? styles.active : ''} ${menu.locked ? styles.locked : ''}`}
                      onClick={() => !menu.locked && handleMenuChange(menu.key)}
                      disabled={menu.locked}
                      title={menu.label}
                    >
                      <menu.Icon size={18} />
                      <span className={styles.bottomGnbLabel}>{menu.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ImageGenPage;

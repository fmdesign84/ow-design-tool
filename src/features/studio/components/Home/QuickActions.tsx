/**
 * QuickActions - 홈 화면 빠른 시작 섹션
 */

import React from 'react';
import { SectionCard } from '../../../../components/common';
import { useAppNavigate } from '../../../../hooks/useAppRouter';
import {
  ImageGenIcon,
  VideoGenIcon,
  UpscaleIcon,
  RemoveBgIcon,
  DesignGenIcon,
} from '../../../../components/common/Icons';
import type { StudioMenu, ImageSubMenu, VideoSubMenu, DesignSubMenu } from '../../types';
import styles from './QuickActions.module.css';

interface QuickAction {
  label: string;
  description: string;
  Icon: React.ComponentType<{ size?: number }>;
  menu: StudioMenu;
  subMenu: ImageSubMenu | VideoSubMenu | DesignSubMenu;
  path: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: '이미지 생성',
    description: 'AI로 이미지 만들기',
    Icon: ImageGenIcon,
    menu: 'image',
    subMenu: 'text-to-image',
    path: '/image',
  },
  {
    label: '영상 생성',
    description: 'AI로 영상 만들기',
    Icon: VideoGenIcon,
    menu: 'video',
    subMenu: 'text-to-video',
    path: '/video',
  },
  {
    label: '업스케일',
    description: '이미지 해상도 높이기',
    Icon: UpscaleIcon,
    menu: 'image',
    subMenu: 'upscale',
    path: '/image',
  },
  {
    label: '배경 없애기',
    description: '투명 배경 만들기',
    Icon: RemoveBgIcon,
    menu: 'image',
    subMenu: 'remove-bg',
    path: '/image',
  },
  {
    label: '템플릿',
    description: '목업 이미지 생성',
    Icon: DesignGenIcon,
    menu: 'design',
    subMenu: 'mockup-generator',
    path: '/design',
  },
];

interface QuickActionsProps {
  onNavigate?: (menu: StudioMenu, subMenu: string, path: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const navigate = useAppNavigate();

  const handleClick = (action: QuickAction) => {
    if (onNavigate) {
      onNavigate(action.menu, action.subMenu, action.path);
    } else {
      navigate(action.path);
    }
  };

  return (
    <SectionCard title="빠른 시작" className={styles.quickActionsSection} animationDelay={0.4}>
      <div className={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            className={styles.quickActionCard}
            onClick={() => handleClick(action)}
          >
            <action.Icon size={24} />
            <span className={styles.quickActionLabel}>{action.label}</span>
            <span className={styles.quickActionDesc}>{action.description}</span>
          </button>
        ))}
      </div>
    </SectionCard>
  );
};

export default QuickActions;

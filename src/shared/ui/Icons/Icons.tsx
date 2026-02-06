/**
 * 중앙 집중식 아이콘 시스템
 * FM ERP 패턴 기반 - 팩토리 패턴으로 일관된 아이콘 생성
 */

import React, { CSSProperties, ReactElement } from 'react';
import styles from './Icons.module.css';

// ===== 타입 정의 =====

export type IconSize = 'sm' | 'md' | 'lg' | number;
export type IconVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted';

export interface IconProps {
  /** 아이콘 크기: sm(16), md(20), lg(24) 또는 숫자 */
  size?: IconSize;
  /** 추가 클래스명 */
  className?: string;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 인라인 스타일 */
  style?: CSSProperties;
  /** 회전 각도 (deg) */
  rotate?: number;
  /** 색상 변형 */
  variant?: IconVariant;
  /** 접근성: 라벨 */
  'aria-label'?: string;
  /** 접근성: 숨김 여부 */
  'aria-hidden'?: boolean;
  /** 툴팁 제목 */
  title?: string;
}

// ===== 상수 =====

const SIZE_MAP: Record<string, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

// ===== 팩토리 함수 =====

interface CreateIconConfig {
  /** 아이콘 이름 (디버깅용) */
  name: string;
  /** SVG path 요소들 */
  path: ReactElement | ReactElement[];
  /** 기본 viewBox (기본값: 0 0 24 24) */
  viewBox?: string;
  /** 기본 strokeWidth (기본값: 2) */
  defaultStrokeWidth?: number;
  /** fill 사용 여부 (기본값: false - stroke 사용) */
  filled?: boolean;
}

const createIcon = (config: CreateIconConfig) => {
  const {
    name,
    path,
    viewBox = '0 0 24 24',
    defaultStrokeWidth = 2,
    filled = false,
  } = config;

  const IconComponent = (props: IconProps): ReactElement => {
    const {
      size = 'md',
      className = '',
      onClick,
      style,
      rotate,
      variant = 'default',
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden,
      title,
    } = props;

    const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size];

    const combinedClassName = [
      styles.icon,
      styles[`variant-${variant}`],
      onClick ? styles.interactive : '',
      className,
    ].filter(Boolean).join(' ');

    const combinedStyle: CSSProperties = {
      ...style,
      ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}),
    };

    return (
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox={viewBox}
        fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth={filled ? undefined : defaultStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={combinedClassName}
        style={combinedStyle}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden ?? !ariaLabel}
        role={ariaLabel ? 'img' : undefined}
      >
        {title && <title>{title}</title>}
        {path}
      </svg>
    );
  };

  IconComponent.displayName = name;
  return IconComponent;
};

// ===== 아이콘 정의 =====

// --- 네비게이션 ---
export const HomeIcon = createIcon({
  name: 'HomeIcon',
  path: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
});

export const MenuIcon = createIcon({
  name: 'MenuIcon',
  path: (
    <>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
});

export const ChevronDownIcon = createIcon({
  name: 'ChevronDownIcon',
  path: <polyline points="6 9 12 15 18 9" />,
});

export const ChevronUpIcon = createIcon({
  name: 'ChevronUpIcon',
  path: <polyline points="18 15 12 9 6 15" />,
});

export const ChevronLeftIcon = createIcon({
  name: 'ChevronLeftIcon',
  path: <polyline points="15 18 9 12 15 6" />,
});

export const ChevronRightIcon = createIcon({
  name: 'ChevronRightIcon',
  path: <polyline points="9 18 15 12 9 6" />,
});

export const ArrowLeftIcon = createIcon({
  name: 'ArrowLeftIcon',
  path: (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ),
});

export const ArrowRightIcon = createIcon({
  name: 'ArrowRightIcon',
  path: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
});

// --- 액션 ---
export const PlusIcon = createIcon({
  name: 'PlusIcon',
  path: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
});

export const MinusIcon = createIcon({
  name: 'MinusIcon',
  path: <line x1="5" y1="12" x2="19" y2="12" />,
});

export const CloseIcon = createIcon({
  name: 'CloseIcon',
  path: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
});

export const CheckIcon = createIcon({
  name: 'CheckIcon',
  path: <polyline points="20 6 9 17 4 12" />,
});

export const SearchIcon = createIcon({
  name: 'SearchIcon',
  path: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
});

export const RefreshIcon = createIcon({
  name: 'RefreshIcon',
  path: (
    <>
      <path d="M21 2v6h-6" />
      <path d="M21 13a9 9 0 1 1-3-7.7L21 8" />
    </>
  ),
});

export const DownloadIcon = createIcon({
  name: 'DownloadIcon',
  path: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
});

export const UploadIcon = createIcon({
  name: 'UploadIcon',
  path: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ),
});

export const TrashIcon = createIcon({
  name: 'TrashIcon',
  path: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
});

export const EditIcon = createIcon({
  name: 'EditIcon',
  path: <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
});

export const CopyIcon = createIcon({
  name: 'CopyIcon',
  path: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
});

export const SaveIcon = createIcon({
  name: 'SaveIcon',
  path: (
    <>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </>
  ),
});

// --- 미디어 ---
export const ImageIcon = createIcon({
  name: 'ImageIcon',
  path: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
});

export const VideoIcon = createIcon({
  name: 'VideoIcon',
  path: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </>
  ),
});

export const PlayIcon = createIcon({
  name: 'PlayIcon',
  path: <polygon points="5 3 19 12 5 21 5 3" />,
});

export const PauseIcon = createIcon({
  name: 'PauseIcon',
  path: (
    <>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </>
  ),
});

export const StopIcon = createIcon({
  name: 'StopIcon',
  path: <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />,
});

// --- 뷰 컨트롤 ---
export const ZoomInIcon = createIcon({
  name: 'ZoomInIcon',
  path: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </>
  ),
});

export const ZoomOutIcon = createIcon({
  name: 'ZoomOutIcon',
  path: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </>
  ),
});

export const MaximizeIcon = createIcon({
  name: 'MaximizeIcon',
  path: (
    <>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </>
  ),
});

export const MinimizeIcon = createIcon({
  name: 'MinimizeIcon',
  path: (
    <>
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </>
  ),
});

export const GridIcon = createIcon({
  name: 'GridIcon',
  path: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </>
  ),
});

export const ListIcon = createIcon({
  name: 'ListIcon',
  path: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </>
  ),
});

// --- 도구 ---
export const SettingsIcon = createIcon({
  name: 'SettingsIcon',
  path: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
});

export const WandIcon = createIcon({
  name: 'WandIcon',
  path: (
    <>
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8L19 13" />
      <path d="M15 9h0" />
      <path d="M17.8 6.2L19 5" />
      <path d="m3 21 9-9" />
      <path d="M12.2 6.2L11 5" />
    </>
  ),
});

export const BrushIcon = createIcon({
  name: 'BrushIcon',
  path: (
    <>
      <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
    </>
  ),
});

export const EraserIcon = createIcon({
  name: 'EraserIcon',
  path: (
    <>
      <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
      <path d="M22 21H7" />
      <path d="m5 11 9 9" />
    </>
  ),
});

export const MousePointerIcon = createIcon({
  name: 'MousePointerIcon',
  path: (
    <>
      <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="m13 13 6 6" />
    </>
  ),
});

export const MoveIcon = createIcon({
  name: 'MoveIcon',
  path: (
    <>
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </>
  ),
});

// --- 상태 ---
export const StarIcon = createIcon({
  name: 'StarIcon',
  path: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
});

export const StarFilledIcon = createIcon({
  name: 'StarFilledIcon',
  path: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  filled: true,
});

export const HeartIcon = createIcon({
  name: 'HeartIcon',
  path: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
});

export const AlertCircleIcon = createIcon({
  name: 'AlertCircleIcon',
  path: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
});

export const InfoIcon = createIcon({
  name: 'InfoIcon',
  path: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
});

export const CheckCircleIcon = createIcon({
  name: 'CheckCircleIcon',
  path: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
});

export const XCircleIcon = createIcon({
  name: 'XCircleIcon',
  path: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </>
  ),
});

// --- Wave/노드 에디터 전용 ---
export const LayersIcon = createIcon({
  name: 'LayersIcon',
  path: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
});

export const GitBranchIcon = createIcon({
  name: 'GitBranchIcon',
  path: (
    <>
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </>
  ),
});

export const BoxIcon = createIcon({
  name: 'BoxIcon',
  path: (
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </>
  ),
});

export const CloudIcon = createIcon({
  name: 'CloudIcon',
  path: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />,
});

export const CloudUploadIcon = createIcon({
  name: 'CloudUploadIcon',
  path: (
    <>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </>
  ),
});

export const TextIcon = createIcon({
  name: 'TextIcon',
  path: (
    <>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </>
  ),
});

export const SparklesIcon = createIcon({
  name: 'SparklesIcon',
  path: (
    <>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </>
  ),
});

export const LayoutIcon = createIcon({
  name: 'LayoutIcon',
  path: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </>
  ),
});

export const FolderIcon = createIcon({
  name: 'FolderIcon',
  path: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />,
});

export const ExternalLinkIcon = createIcon({
  name: 'ExternalLinkIcon',
  path: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </>
  ),
});

export const MoreHorizontalIcon = createIcon({
  name: 'MoreHorizontalIcon',
  path: (
    <>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </>
  ),
});

export const MoreVerticalIcon = createIcon({
  name: 'MoreVerticalIcon',
  path: (
    <>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </>
  ),
});

// --- 기타 ---
export const LockIcon = createIcon({
  name: 'LockIcon',
  path: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
});

export const UnlockIcon = createIcon({
  name: 'UnlockIcon',
  path: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </>
  ),
});

export const EyeIcon = createIcon({
  name: 'EyeIcon',
  path: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
});

export const EyeOffIcon = createIcon({
  name: 'EyeOffIcon',
  path: (
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </>
  ),
});

export const LinkIcon = createIcon({
  name: 'LinkIcon',
  path: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
});

export const SendIcon = createIcon({
  name: 'SendIcon',
  path: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </>
  ),
});

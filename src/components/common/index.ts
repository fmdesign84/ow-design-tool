/**
 * Common Components Barrel Export
 * 공통 컴포넌트 중앙 export
 *
 * 사용법:
 * import { Button, Modal, Input, Badge, Card, Tabs } from '@/components/common';
 */

// ===== 기본 컴포넌트 =====

// Button
export { Button } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button';

// IconButton
export { IconButton } from './IconButton';
export type { IconButtonProps } from './IconButton';

// Input
export { Input } from './Input';
export type { InputProps, InputSize } from './Input';

// Select
export { Select } from './Select';
export type { SelectOption, SelectProps } from './Select';

// Badge
export { Badge } from './Badge';
export type { BadgeProps, BadgeSize, BadgeVariant } from './Badge';

// ===== 레이아웃 컴포넌트 =====

// Card
export { Card } from './Card';
export type { CardProps } from './Card';

// SectionCard
export { SectionCard } from './SectionCard';

// Divider
export { Divider } from './Divider';
export type { DividerProps } from './Divider';

// Modal
export { Modal } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

// ===== 네비게이션 =====

// Tabs
export { Tabs } from './Tabs';
export type { TabItem, TabsProps } from './Tabs';

// ===== 피드백 컴포넌트 =====

// Toast
export { ToastContainer, ToastProvider, useToast } from './Toast';
export type { ToastItem, ToastType } from './Toast';

// Tooltip
export { Tooltip } from './Tooltip';
export type { TooltipPlacement, TooltipProps } from './Tooltip';

// ProgressBar
export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

// ===== 데이터 표시 =====

// Avatar
export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

// Skeleton
export { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonText } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

// ===== 유틸리티 컴포넌트 =====

// LoadingScreen
export { LoadingScreen } from './LoadingScreen';
export type { LoadingScreenProps } from './LoadingScreen';

// ErrorBoundary
export { ErrorBoundary } from './ErrorBoundary';

// LazyImage
export { LazyImage } from './LazyImage';

// ===== 아이콘 =====

export * from './Icons';

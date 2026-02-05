/**
 * Orange Whale Studio 타입 정의
 */

// 이미지 생성 모델
export type ImageModel = 'gemini3flash' | 'gemini3pro' | 'imagen4' | 'gptimage15';

// 영상 생성 모델
export type VideoModel = 'veo2' | 'veo3';

// 품질 옵션
export type QualityOption = 'fast' | 'standard' | 'hd';

// 이미지 비율
export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

// 스타일 프리셋
export type StylePreset = 'auto' | 'photo' | 'illustration' | 'oil' | 'watercolor' | '3d';

// 스튜디오 메뉴
export type StudioMenu = 'home' | 'image' | 'video' | 'design' | 'copilot';

// 이미지 서브메뉴
export type ImageSubMenu = 'text-to-image' | 'upscale' | 'remove-bg';

// 영상 서브메뉴
export type VideoSubMenu = 'text-to-video' | 'image-to-video';

// 디자인 서브메뉴
export type DesignSubMenu = 'mockup-generator';

// 생성 타입
export type GenerationType = 'image' | 'video';

// 갤러리 아이템
export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  image: string;
  prompt?: string;
  style?: string; // 목업 스타일 (poster-a4, billboard 등)
  aspectRatio?: AspectRatio;
  imagenModel?: string;
  detectedStyles?: string[];
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
    aspectRatio?: string;
    model?: string;
    styles?: string[];
    [key: string]: unknown;
  };
  created_at: string;
  isFeatured?: boolean;
}

// 옵션 아이템 (select용)
export interface OptionItem<T extends string = string> {
  key: T;
  label: string;
  desc?: string;
}

// 스타일 프리셋 아이템
export interface StylePresetItem {
  key: StylePreset;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  desc: string;
}

// 메뉴 아이템
export interface MenuItemConfig {
  key: StudioMenu;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  locked?: boolean;
  path?: string;
}

// 서브메뉴 아이템
export interface SubMenuItemConfig {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  locked?: boolean;
}

// 이미지 생성 파라미터
export interface ImageGenerationParams {
  prompt: string;
  model: ImageModel;
  aspectRatio: AspectRatio;
  quality: QualityOption;
  style: StylePreset;
  negativePrompt?: string;
  referenceImage?: string;
}

// 영상 생성 파라미터
export interface VideoGenerationParams {
  prompt: string;
  model: VideoModel;
  aspectRatio: AspectRatio;
  duration: number;
  sourceImage?: string;
}

// 업스케일 파라미터
export interface UpscaleParams {
  image: string;
  scale: 2 | 4;
}

// API 응답 타입
export interface GenerationResponse {
  success: boolean;
  data?: {
    url: string;
    id?: string;
  };
  error?: string;
}

// 목업 타입
export type MockupType =
  | 'banner-horizontal'
  | 'banner-vertical'
  | 'billboard'
  | 'poster'
  | 'social-square'
  | 'social-story'
  | 'presentation'
  | 'namecard'
  | 'signage'
  | 'magazine';

// 목업 설정
export interface MockupConfig {
  key: MockupType;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  aspectRatio: AspectRatio;
  description: string;
}

// 업로드된 이미지
export interface UploadedImage {
  file?: File;
  preview: string;
  name: string;
  base64?: string;
}

// 이미지 역할 (다중 참조용)
export type ImageRole = 'style' | 'object' | 'person' | 'background';

// 참조 이미지 (다중 이미지 지원)
export interface ReferenceImage extends UploadedImage {
  id: string;
  role: ImageRole;
  order: number;
}

// 모델별 이미지 제한
export const MODEL_IMAGE_LIMITS: Record<string, number> = {
  'gemini-3-pro': 14,
  'gemini-3-flash': 14,
  'gpt-image-1.5': 4,
  'imagen-4': 1,
};

// 비율 옵션 (UI용)
export interface AspectRatioOption {
  key: string;  // JS 상수 호환성을 위해 string 사용
  label: string;
  desc: string;
}

// ============================================
// 사용자 관리 타입
// ============================================

// 사용자 역할
export type UserRole = 'user' | 'admin';

// 사용자
export interface User {
  id: string;
  teams_id?: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// 사용자 할당량
export interface UserQuota {
  id: string;
  user_id: string;
  month: string; // 'YYYY-MM'
  used_count: number;
  max_count: number;
  bonus_count: number;
  tokens_used: number;
  created_at: string;
  updated_at: string;
}

// 사용자 + 할당량 (조인된 뷰)
export interface UserWithQuota extends User {
  quota: {
    used: number;
    max: number;
    bonus: number;
    remaining: number;
  };
  stats: {
    total_images: number;
    total_folders: number;
  };
}

// ============================================
// 폴더 관리 타입
// ============================================

// 폴더
export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 폴더 트리 노드 (중첩 구조)
export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
  image_count?: number;
}

// 폴더 생성 파라미터
export interface CreateFolderParams {
  name: string;
  parent_id?: string;
  color?: string;
  icon?: string;
}

// 폴더 수정 파라미터
export interface UpdateFolderParams {
  name?: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

// ============================================
// 사용 로그 타입 (관리자 분석용)
// ============================================

// 액션 타입
export type UsageAction = 'generate' | 'download' | 'delete' | 'share' | 'edit' | 'move';

// 리소스 타입
export type ResourceType = 'image' | 'video' | 'folder';

// 사용 로그 상태
export type UsageStatus = 'success' | 'failed' | 'pending';

// 사용 로그
export interface UsageLog {
  id: string;
  user_id?: string;
  action: UsageAction;
  resource_type: ResourceType;
  resource_id?: string;
  metadata: Record<string, unknown>;
  duration_ms?: number;
  tokens_consumed?: number;
  status: UsageStatus;
  error_message?: string;
  created_at: string;
}

// 사용 로그 생성 파라미터
export interface CreateUsageLogParams {
  user_id?: string;
  action: UsageAction;
  resource_type: ResourceType;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  duration_ms?: number;
  tokens_consumed?: number;
  status?: UsageStatus;
  error_message?: string;
}

// ============================================
// 관리자 통계 타입
// ============================================

// 일별 사용량 통계
export interface DailyUsageStats {
  date: string;
  total_actions: number;
  unique_users: number;
  generations: number;
  images: number;
  videos: number;
  total_tokens: number;
}

// 사용자별 통계 (관리자 뷰)
export interface UserStats {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  used_count: number;
  max_count: number;
  bonus_count: number;
  remaining: number;
  total_images: number;
  total_folders: number;
}

// 관리자 대시보드 요약
export interface AdminDashboardSummary {
  total_users: number;
  active_users_today: number;
  total_generations_today: number;
  total_generations_month: number;
  top_users: UserStats[];
  daily_stats: DailyUsageStats[];
}

// ============================================
// API 요청/응답 타입
// ============================================

// 공통 API 응답 래퍼
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    type: string;
    message: string;
    details?: unknown;
  };
}

// Supabase 이미지 API 응답 데이터
export interface SupabaseImageData {
  id: string;
  type?: 'image' | 'video';
  image_url: string;
  prompt?: string;
  style?: string;
  aspect_ratio?: string;
  model?: string;
  metadata?: {
    aspectRatio?: string;
    model?: string;
    styles?: string[];
    [key: string]: unknown;
  };
  created_at: string;
  is_featured?: boolean;
}

// 이미지 목록 API 응답
export interface ImageListResponse extends ApiResponse<{ images: SupabaseImageData[] }> {
  images?: SupabaseImageData[];
}

// 할당량 조정 요청
export interface AdjustQuotaRequest {
  user_id: string;
  max_count?: number;
  bonus_count?: number;
}

// 사용자 권한 변경 요청
export interface UpdateUserRoleRequest {
  user_id: string;
  role: UserRole;
}

// 갤러리 아이템 (확장 - 폴더 지원)
export interface GalleryItemWithFolder extends GalleryItem {
  user_id?: string;
  folder_id?: string;
  folder_name?: string;
}

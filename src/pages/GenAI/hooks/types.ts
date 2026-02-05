/**
 * 공통 타입 정의
 */

// 갤러리 아이템 (이미지/영상/목업)
export interface GalleryItem {
  id: string;
  image: string;
  prompt: string;
  model: string;
  imagenModel?: string;
  aspectRatio: string;
  quality: string;
  style: string | null;
  mockupType: string | null;
  mockupLabel: string | null;
  createdAt: Date;
  type: 'image' | 'video' | 'mockup';
  metadata: Record<string, unknown> | null;
  detectedStyles: string[];
  mood: string | null;
  colors: string[];
  analysisStatus: 'none' | 'completed';
  is_featured: boolean;
}

// 업로드된 이미지
export interface UploadedImage {
  preview: string;
  name: string;
  base64?: string;
}

// 목업 스타일 키
export const MOCKUP_STYLE_KEYS = [
  'web-banner', 'mobile-banner', 'social-square', 'social-story', 'thumbnail',
  'poster-a4', 'magazine-cover', 'business-card', 'brochure',
  'billboard', 'bus-shelter', 'subway-interior', 'subway-psd', 'storefront', 'building-wrap', 'x-banner', 'bus-wrap', 'taxi-door', 'frp-sculpture',
  'popup-outdoor', 'popup-indoor', 'island-booth', 'exhibition-booth', 'kiosk', 'info-desk',
  'iphone-hand', 'iphone-topview', 'macbook-screen', 'ipad-screen', 'tv-screen', 'watch-face',
  'product-box', 'shopping-bag', 'beverage-can', 'cake-box-kraft', 'cake-box-color', 'tshirt-front', 'tshirt-symbol', 'tshirt-staff',
  'ballpoint-pen', 'sticker-sheet', 'wristband', 'pin-button', 'metal-badge', 'keychain'
] as const;

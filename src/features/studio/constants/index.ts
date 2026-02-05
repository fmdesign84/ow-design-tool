/**
 * Orange Whale Studio 상수 정의
 */

import type {
  OptionItem,
  StylePresetItem,
  MenuItemConfig,
  SubMenuItemConfig,
  ImageModel,
  VideoModel,
  QualityOption,
  AspectRatio,
  StylePreset,
} from '../types';

import {
  StyleAutoIcon,
  StylePhotoIcon,
  StyleVectorIcon,
  StyleOilIcon,
  StyleWatercolorIcon,
  Style3DIcon,
  ImageGenIcon,
  VideoGenIcon,
  DesignGenIcon,
  UpscaleIcon,
  RemoveBgIcon,
} from '../../../components/common/Icons';

// ========== 모델 옵션 ==========

export const IMAGE_MODEL_OPTIONS: OptionItem<ImageModel>[] = [
  { key: 'gemini3flash', label: 'Gemini 3 Flash', desc: '초고속 성능/에이전트' },
  { key: 'gemini3pro', label: 'Gemini 3 Pro', desc: '최신 멀티모달' },
  { key: 'imagen4', label: 'Imagen 4', desc: '고품질 이미지' },
  { key: 'gptimage15', label: 'GPT Image 1.5', desc: 'OpenAI 최신 모델' },
];

export const VIDEO_MODEL_OPTIONS: OptionItem<VideoModel>[] = [
  { key: 'veo2', label: 'Veo 2', desc: '안정적 영상' },
  { key: 'veo3', label: 'Veo 3.1', desc: '최신 고품질' },
];

// ========== 품질 옵션 ==========

export const QUALITY_OPTIONS: OptionItem<QualityOption>[] = [
  { key: 'fast', label: '빠르게', desc: '빠른 생성 (낮은 해상도)' },
  { key: 'standard', label: '표준', desc: '균형 잡힌 품질' },
  { key: 'hd', label: '고품질', desc: '고해상도 (느림)' },
];

// ========== 비율 옵션 ==========

export const IMAGE_ASPECT_RATIOS: OptionItem<AspectRatio>[] = [
  { key: '1:1', label: '1:1', desc: '정사각형' },
  { key: '4:3', label: '4:3', desc: '가로형' },
  { key: '3:4', label: '3:4', desc: '세로형' },
  { key: '16:9', label: '16:9', desc: '와이드' },
  { key: '9:16', label: '9:16', desc: '세로 와이드' },
];

export const VIDEO_ASPECT_RATIOS: OptionItem<AspectRatio>[] = [
  { key: '16:9', label: '16:9', desc: '가로 영상' },
  { key: '9:16', label: '9:16', desc: '세로 영상' },
  { key: '1:1', label: '1:1', desc: '정사각형' },
];

// ========== 스타일 프리셋 ==========

export const STYLE_PRESETS: StylePresetItem[] = [
  { key: 'auto', label: 'Auto', Icon: StyleAutoIcon, desc: 'AI가 자동 판단' },
  { key: 'photo', label: '사진', Icon: StylePhotoIcon, desc: '실사 포토' },
  { key: 'illustration', label: '벡터', Icon: StyleVectorIcon, desc: '디지털 아트' },
  { key: 'oil', label: '유화', Icon: StyleOilIcon, desc: '클래식 유화풍' },
  { key: 'watercolor', label: '수채화', Icon: StyleWatercolorIcon, desc: '수채화 스타일' },
  { key: '3d', label: '3D', Icon: Style3DIcon, desc: '3D 렌더링' },
];

// ========== 네거티브 프롬프트 프리셋 ==========

export const NEGATIVE_PRESETS = [
  { key: 'blurry', label: '흐림', value: 'blurry, out of focus' },
  { key: 'lowquality', label: '저화질', value: 'low quality, low resolution, pixelated' },
  { key: 'watermark', label: '워터마크', value: 'watermark, text, logo, signature' },
  { key: 'badanatomy', label: '신체왜곡', value: 'bad anatomy, deformed, mutated, extra limbs, extra fingers' },
  { key: 'noise', label: '노이즈', value: 'noise, grain, artifacts' },
  { key: 'cartoon', label: '만화풍제외', value: 'cartoon, anime, illustration, drawing' },
];

// ========== 메뉴 설정 ==========

export const STUDIO_MENUS: MenuItemConfig[] = [
  { key: 'image', label: '이미지 생성', Icon: ImageGenIcon, path: '/image' },
  { key: 'video', label: '영상 생성', Icon: VideoGenIcon, path: '/video' },
  { key: 'design', label: '템플릿', Icon: DesignGenIcon, path: '/design' },
];

export const IMAGE_SUBMENUS: SubMenuItemConfig[] = [
  { key: 'text-to-image', label: '이미지 생성', Icon: ImageGenIcon },
  { key: 'upscale', label: '업스케일', Icon: UpscaleIcon },
  { key: 'remove-bg', label: '배경 없애기', Icon: RemoveBgIcon },
];

export const VIDEO_SUBMENUS: SubMenuItemConfig[] = [
  { key: 'text-to-video', label: '영상 생성', Icon: VideoGenIcon },
  { key: 'image-to-video', label: '이미지 → 영상', Icon: ImageGenIcon },
];

export const DESIGN_SUBMENUS: SubMenuItemConfig[] = [
  { key: 'mockup-generator', label: '목업 이미지 생성하기', Icon: DesignGenIcon },
];

// ========== 창작 아이디어 ==========

export const CREATIVE_IDEAS = [
  { emoji: '🌅', text: '황금빛 노을이 물드는 해변에서 서핑하는 고래', type: 'image' as const },
  { emoji: '🎨', text: '빈센트 반 고흐 스타일의 별이 빛나는 서울 야경', type: 'image' as const },
  { emoji: '🚀', text: '네온 불빛이 반짝이는 사이버펑크 우주정거장', type: 'image' as const },
  { emoji: '🌸', text: '벚꽃 날리는 일본 전통 정원에서 명상하는 사무라이', type: 'image' as const },
  { emoji: '🎬', text: '안개 속에서 천천히 나타나는 신비로운 용', type: 'video' as const },
  { emoji: '✨', text: '마법의 숲에서 빛나는 반딧불이와 춤추는 요정', type: 'video' as const },
];

// ========== 기본값 ==========

export const DEFAULT_IMAGE_PARAMS = {
  model: 'gemini3pro' as ImageModel,
  aspectRatio: '1:1' as AspectRatio,
  quality: 'standard' as QualityOption,
  style: 'auto' as StylePreset,
};

export const DEFAULT_VIDEO_PARAMS = {
  model: 'veo3' as VideoModel,
  aspectRatio: '16:9' as AspectRatio,
  duration: 5,
};

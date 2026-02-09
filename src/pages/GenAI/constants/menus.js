/**
 * ImageGenPage 메뉴 상수
 * 사이드바, 서브메뉴 정의
 */
import {
    ImageGenIcon,
    VideoGenIcon,
    DesignGenIcon,
    RemoveBgIcon,
    UpscaleIcon,
    StarIcon,
    LibraryIcon,
    TextToIcon,
    ImageToIcon,
    InpaintToIcon,
    MockupFrameIcon,
    GridAllIcon,
    PhotoFrameIcon,
    FilmReelIcon,
    ScaleUpIcon,
    IdPhotoIcon,
    PoseChangeIcon,
    LocationCompositeIcon,
    VirtualTryonIcon,
    BackgroundGenIcon,
    TextCorrectIcon,
    MultiImageIcon,
    OrangeWaveIcon,
    VideoToWebPIcon,
    PortraitStagingIcon,
} from '../../../components/common/Icons';

// 사이드바 메뉴 옵션 (Wave 기본)
export const SIDEBAR_MENUS = [
    { key: 'wave', label: 'Wave', Icon: OrangeWaveIcon },
    { key: 'image', label: '이미지', Icon: ImageGenIcon },
    { key: 'tools', label: '편집', Icon: UpscaleIcon },
    { key: 'video', label: '영상', Icon: VideoGenIcon },
    { key: 'design', label: '템플릿', Icon: DesignGenIcon },
    { key: 'library', label: '라이브러리', Icon: LibraryIcon },
];

// AI Studio 메뉴 옵션 (비홈 화면용 - 기존 호환)
export const STUDIO_MENUS = [
    { key: 'image', label: '이미지 생성', Icon: ImageGenIcon },
    { key: 'video', label: '영상 생성', Icon: VideoGenIcon },
    { key: 'design', label: '템플릿', Icon: DesignGenIcon },
];

// 이미지 생성 하위 메뉴
export const IMAGE_SUB_MENUS = [
    { key: 'text-to-image', label: '텍스트로', Icon: TextToIcon },
    { key: 'image-to-image', label: '이미지로', Icon: ImageToIcon },
    { key: 'inpainting', label: '부분 편집', Icon: InpaintToIcon },
    { divider: true },
    { key: 'id-photo-studio', label: '증명사진', Icon: IdPhotoIcon },
    { key: 'free-photo', label: '자유사진', Icon: PoseChangeIcon },
    { key: 'location-composite', label: '장소 합성', Icon: LocationCompositeIcon },
    { key: 'virtual-tryon', label: '가상 피팅', Icon: VirtualTryonIcon },
    { key: 'background-gen', label: '배경 생성', Icon: BackgroundGenIcon },
    { key: 'character-gen-studio', label: '캐릭터 생성', Icon: PoseChangeIcon },
    { key: 'storyboard-gen', label: '스토리보드', Icon: FilmReelIcon },
    { key: 'storyboard-animation', label: '스토리보드 영상', Icon: FilmReelIcon },
    { key: 'storyboard-full', label: '스토리보드 통합', Icon: FilmReelIcon },
    { key: 'product-photo', label: '제품 사진', Icon: ImageToIcon, comingSoon: true },
];

// 편집 도구 하위 메뉴
export const TOOLS_SUB_MENUS = [
    { key: 'upscale', label: '업스케일', Icon: ScaleUpIcon },
    { key: 'remove-bg', label: '배경제거', Icon: RemoveBgIcon },
    { key: 'text-correct', label: '텍스트보정', Icon: TextCorrectIcon },
    { key: 'video-to-webp', label: 'WebP변환', Icon: VideoToWebPIcon, locked: true },
];

// 영상 생성 하위 메뉴
export const VIDEO_SUB_MENUS = [
    { key: 'text-to-video', label: '텍스트로', Icon: TextToIcon },
    { key: 'image-to-video', label: '이미지로', Icon: ImageToIcon },
    { key: 'multi-image-to-video', label: '멀티 이미지', Icon: MultiImageIcon },
    { divider: true },
    { key: 'character-animation', label: '캐릭터', Icon: PoseChangeIcon },
];

// 디자인(템플릿) 하위 메뉴
export const DESIGN_SUB_MENUS = [
    { key: 'mockup-generator', label: '목업 생성', Icon: MockupFrameIcon },
    { key: 'portrait-staging', label: '연출 생성', Icon: PortraitStagingIcon },
];

// 라이브러리 하위 메뉴 (핀터레스트 스타일)
export const LIBRARY_SUB_MENUS = [
    { key: 'all', label: '전체', Icon: GridAllIcon },
    { key: 'images', label: '이미지', Icon: PhotoFrameIcon },
    { key: 'design', label: '디자인', Icon: MockupFrameIcon },
    { key: 'videos', label: '영상', Icon: FilmReelIcon },
    { key: 'favorites', label: '즐겨찾기', Icon: StarIcon },
];

// Copilot 하위 메뉴 (비활성화 - 추후 사용)
export const COPILOT_SUB_MENUS = [];

// 디자인 라이브러리 하위 카테고리
export const DESIGN_SUBCATEGORIES = [
    { key: 'all', label: '전체', icon: null },
    { key: 'print', label: '인쇄물', icon: '🖨️' },
    { key: 'outdoor', label: '옥외광고', icon: '🏙️' },
    { key: 'booth', label: '부스', icon: '🏪' },
    { key: 'device', label: '디바이스', icon: '📱' },
];

// 이미지 라이브러리 하위 카테고리 (style 기반)
export const IMAGE_SUBCATEGORIES = [
    { key: 'all', label: '전체', icon: null },
    { key: 'text-to-image', label: '일반', icon: '✏️' },
    { key: 'idphoto', label: '증명사진', icon: '🪪' },
    { key: 'inpainting', label: '부분편집', icon: '✨' },
    { key: 'composite', label: '합성', icon: '🎨' },
];

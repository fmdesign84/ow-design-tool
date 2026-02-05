/**
 * ImageGenPage 상수 통합 export
 */

// 기본 옵션
export {
    MODEL_OPTIONS,
    QUALITY_OPTIONS,
    ASPECT_RATIOS,
    VIDEO_ASPECT_RATIOS,
    NEGATIVE_PRESETS,
    COLOR_MOODS,
    SLIDE_TYPES,
    PRESENTATION_STYLES,
    SOCIAL_PLATFORMS,
    POSTER_SIZES,
    COPILOT_API_URL,
} from './options';

// 메뉴 정의
export {
    SIDEBAR_MENUS,
    STUDIO_MENUS,
    IMAGE_SUB_MENUS,
    TOOLS_SUB_MENUS,
    VIDEO_SUB_MENUS,
    DESIGN_SUB_MENUS,
    LIBRARY_SUB_MENUS,
    COPILOT_SUB_MENUS,
    DESIGN_SUBCATEGORIES,
    IMAGE_SUBCATEGORIES,
} from './menus';

// 스타일 프리셋
export { STYLE_PRESETS } from './styles';

// 목업 관련
export {
    MOCKUP_CATEGORIES,
    MOCKUP_PRESETS,
    MOCKUP_STYLES,
    STATIC_MOCKUP_SAMPLES,
    isDesignImage,
    getStyleCategory,
    isGeneralImage,
    getImageSubcategory,
} from './mockups';

// 연출 생성 (Portrait Staging) 관련
export {
    STAGING_CATEGORIES,
    STAGING_PRESETS,
    getPresetsByCategory,
    getPresetByKey,
    generateStagingPrompt,
} from './stagingPresets';

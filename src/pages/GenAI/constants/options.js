/**
 * ImageGenPage 옵션 상수
 * 모델, 품질, 비율 등 기본 옵션
 */

// 모델 옵션 (Gemini 3 Pro 기본) - 이미지 생성용
export const MODEL_OPTIONS = [
    { key: 'gemini3flash', label: 'Gemini 3 Flash', desc: '초고속 성능/에이전트' },
    { key: 'gemini3pro', label: 'Gemini 3 Pro', desc: '최신 멀티모달' },
    { key: 'imagen4', label: 'Imagen 4', desc: '고품질 이미지' },
];

// 품질/속도 옵션
export const QUALITY_OPTIONS = [
    { key: 'fast', label: '빠르게', desc: '빠른 생성 (낮은 해상도)' },
    { key: 'standard', label: '표준', desc: '균형 잡힌 품질' },
    { key: 'hd', label: '고품질', desc: '고해상도 (느림)' },
];

// 이미지 비율 옵션
export const ASPECT_RATIOS = [
    { key: '1:1', label: '1:1', desc: '정사각형' },
    { key: '4:3', label: '4:3', desc: '가로형' },
    { key: '3:4', label: '3:4', desc: '세로형' },
    { key: '16:9', label: '16:9', desc: '와이드' },
    { key: '9:16', label: '9:16', desc: '세로 와이드' },
];

// 영상 비율 옵션 (Veo 3.1 지원: 16:9, 9:16만)
export const VIDEO_ASPECT_RATIOS = [
    { key: '16:9', label: '16:9', desc: '가로 영상' },
    { key: '9:16', label: '9:16', desc: '세로 영상' },
];

// 네거티브 프롬프트 프리셋
export const NEGATIVE_PRESETS = [
    { key: 'blurry', label: '흐림', value: 'blurry, out of focus' },
    { key: 'lowquality', label: '저화질', value: 'low quality, low resolution, pixelated' },
    { key: 'watermark', label: '워터마크', value: 'watermark, text, logo, signature' },
    { key: 'badanatomy', label: '신체왜곡', value: 'bad anatomy, deformed, mutated, extra limbs, extra fingers' },
    { key: 'noise', label: '노이즈', value: 'noise, grain, artifacts' },
    { key: 'cartoon', label: '만화풍제외', value: 'cartoon, anime, illustration, drawing' },
];

// 컬러 무드 옵션 (팔레트 포함)
export const COLOR_MOODS = [
    {
        key: 'warm',
        label: '따뜻한',
        desc: '프로페셔널하고 친근한',
        palette: ['#E85A2C', '#8B5A3C', '#D4A574', '#FFF8F5', '#3D2B1F'],
    },
    {
        key: 'calm',
        label: '차분한',
        desc: '신뢰감 있고 안정적인',
        palette: ['#2B579A', '#4472C4', '#70AD47', '#F5F8FC', '#2D3748'],
    },
    {
        key: 'modern',
        label: '모던',
        desc: '세련되고 혁신적인',
        palette: ['#00D4FF', '#7C3AED', '#10B981', '#0F172A', '#F1F5F9'],
    },
    {
        key: 'minimal',
        label: '미니멀',
        desc: '깔끔하고 심플한',
        palette: ['#1A1A1A', '#757575', '#E53935', '#FFFFFF', '#F5F5F5'],
    },
];

// 슬라이드 타입 옵션
export const SLIDE_TYPES = [
    { key: 'title', label: '표지', desc: '제목 슬라이드' },
    { key: 'content', label: '본문', desc: '내용 슬라이드' },
    { key: 'section', label: '섹션', desc: '구분 슬라이드' },
    { key: 'ending', label: '마무리', desc: '감사 슬라이드' },
];

// 프레젠테이션 스타일 옵션
export const PRESENTATION_STYLES = [
    { key: 'corporate', label: '비즈니스', desc: '깔끔한 기업 스타일' },
    { key: 'creative', label: '크리에이티브', desc: '창의적이고 역동적인' },
    { key: 'minimal', label: '미니멀', desc: '심플하고 모던한' },
    { key: 'tech', label: '테크', desc: '기술/스타트업 느낌' },
];

// SNS 플랫폼 옵션
export const SOCIAL_PLATFORMS = [
    { key: 'instagram', label: 'Instagram', ratio: '1:1' },
    { key: 'instagram-story', label: 'Insta Story', ratio: '9:16' },
    { key: 'facebook', label: 'Facebook', ratio: '16:9' },
    { key: 'youtube', label: 'YouTube 썸네일', ratio: '16:9' },
];

// 포스터 사이즈 옵션
export const POSTER_SIZES = [
    { key: 'a4-portrait', label: 'A4 세로', ratio: '3:4' },
    { key: 'a4-landscape', label: 'A4 가로', ratio: '4:3' },
    { key: 'banner-wide', label: '배너 (와이드)', ratio: '16:9' },
    { key: 'square', label: '정사각형', ratio: '1:1' },
];

// Power Automate API URL
export const COPILOT_API_URL = 'https://default76fd390213e649bda588896a153fac.e3.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/2c515b96cc8a4f3a8009d73646404a71/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=m1NavCGZY4Yq25WI9-GaQcVDIftK63CTbLJF6oXgWts';

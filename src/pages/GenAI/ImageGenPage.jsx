import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../../components';
import { normalizeModelKey, toLegacyModelKey } from '../../components/genai';
import { calculatePoints, getActionKey, POINT_COSTS } from '../../constants/pointPolicy';
import { compressAndUploadImage } from '../../utils/imageUtils';
// Feature 기반 컴포넌트
import { HomeSection, ImageToImage, RemoveBackground, Upscale, TextToVideo, ImageToVideo, MultiImageToVideo, MockupGenerator, SocialMediaCard, PosterBanner, PptMaker, FreeGeneration, InpaintingEditor, ConversationalEditor, ExpertChat, IDPhotoStudio, ProfileStudio, CompositePhoto, VideoToWebP } from '../../features/studio';
import { AdvancedOptions } from '../../components/genai';
// Wave 노드 에디터
import { NodeEditor } from '../../components/NodeEditor';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import getNodePreset from '../../utils/nodePresets';
import { useVideoStore } from '../../stores/useVideoStore';
import { useImageGenStore } from '../../stores/useImageGenStore';
// 분리된 View 컴포넌트
import { WaveView, DesignView, ToolsView, VideoView, LibraryView, ImageView } from './views';
// 아이콘 (상수 파일에서 사용하지 않는 것만)
import {
    TrashIcon,
    OrangeWhaleIcon,
    DownloadIcon,
    CloseIcon,
    UploadIcon,
    LockIcon,
    ImageFileIcon,
    InpaintIcon,
    ChatEditIcon,
    WandSparkleIcon,
    ImageRefIcon,
    TextToVideoIcon,
    ImageToVideoIcon,
    SocialStoryIcon,
    StarIcon,
    RemoveBgIcon,
    LibraryIcon,
    TextCorrectIcon,
    UpscaleIcon,
    VideoGenIcon,
    ImageToIcon,
    InpaintToIcon,
} from '../../components/common/Icons';
import styles from './ImageGenPage.module.css';
// 상수 import
import {
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
    STYLE_PRESETS,
    MOCKUP_CATEGORIES,
    MOCKUP_PRESETS,
    MOCKUP_STYLES,
    STATIC_MOCKUP_SAMPLES,
    isDesignImage,
    getStyleCategory,
    isGeneralImage,
    getImageSubcategory,
} from './constants';
// 커스텀 훅
import { usePointSystem } from './hooks';

const ImageGenPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // URL 경로에서 초기 메뉴 결정
    const getInitialMenu = () => {
        const path = location.pathname;
        if (path.includes('/video')) return 'video';
        if (path.includes('/tools')) return 'tools';  // 이미지 편집 도구
        if (path.includes('/design')) return 'design';
        if (path.includes('/image')) return 'image';
        return 'wave'; // 기본값은 Wave
    };

    const getInitialSubMenu = (menu) => {
        if (menu === 'video') return 'text-to-video';
        if (menu === 'design') return 'mockup-generator';
        if (menu === 'tools') return 'upscale';  // 이미지 편집 도구
        if (menu === 'copilot') return 'hr-assistant';
        if (menu === 'admin') return 'dashboard';  // 관리자
        if (menu === 'library') return 'all';  // 라이브러리
        return 'text-to-image';
    };

    const initialMenu = getInitialMenu();
    const [activeMenu, setActiveMenu] = useState(initialMenu);
    const [activeSubMenu, setActiveSubMenu] = useState(getInitialSubMenu(initialMenu));
    const [activeDesignSubcategory, setActiveDesignSubcategory] = useState('all');
    const [activeImageSubcategory, setActiveImageSubcategory] = useState('all');
    const [selectedModel, setSelectedModel] = useState('gemini3pro'); // 기본값: Gemini 3 Pro (폴백: Imagen 4)

    // 모델 키 정규화 (gemini3pro → gemini-3-pro)
    const normalizedModel = useMemo(() => normalizeModelKey(selectedModel), [selectedModel]);

    // 모델 변경 핸들러 (정규화된 키 → 레거시 키)
    const handleModelChange = useCallback((newModel) => {
        setSelectedModel(toLegacyModelKey(newModel));
    }, []);

    const [prompt, setPrompt] = useState('');
    const [isWhaleBouncing, setIsWhaleBouncing] = useState(false);
    const [isProfileExpanded, setIsProfileExpanded] = useState(false);
    const [negativePrompt, setNegativePrompt] = useState('');
    const [selectedNegativePresets, setSelectedNegativePresets] = useState([]);
    const [quality, setQuality] = useState('standard');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [stylePreset, setStylePreset] = useState('auto');
    const [imageHistory, setImageHistory] = useState([]); // 이미지 히스토리
    const [isLightboxOpen, setIsLightboxOpen] = useState(false); // 라이트박스 열림 상태

    // 이미지 URL 압축 (Supabase transform)
    const compressImageUrl = (url, width = 300) => {
        if (!url) return null;
        // Supabase storage URL인 경우 transform 파라미터 추가
        if (url.includes('supabase.co/storage')) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}width=${width}&quality=70`;
        }
        return url;
    };

    // 샘플 이미지 캐시 (첫 로드 시 고정, 이후 변경 안함)
    const [samplesCache, setSamplesCache] = useState({
        mockupSamples: null,
        librarySamples: null,
        imageSubcategorySamples: null,
        designSubcategorySamples: null,
        initialized: false
    });

    // 샘플 이미지 초기화 (첫 로드 시 한 번만)
    useEffect(() => {
        if (imageHistory.length > 0 && !samplesCache.initialized) {
            // 목업 샘플 - 정적 이미지 우선, 동적 fallback
            const newMockupSamples = [];
            const seenTypes = new Set();
            const categoryFallbacks = {};

            // 0단계: 정적 이미지 먼저 추가
            Object.entries(STATIC_MOCKUP_SAMPLES).forEach(([mockupType, imageUrl]) => {
                seenTypes.add(mockupType);
                newMockupSamples.push({ mockupType, imageUrl });
                const preset = MOCKUP_PRESETS.find(p => p.key === mockupType);
                if (preset && !categoryFallbacks[preset.category]) {
                    categoryFallbacks[preset.category] = imageUrl;
                }
            });

            // 1단계: 실제 있는 이미지들 수집 (정적 이미지 제외)
            for (const item of imageHistory) {
                if (item.mockupType && !seenTypes.has(item.mockupType)) {
                    seenTypes.add(item.mockupType);
                    const compressed = compressImageUrl(item.image, 300);
                    newMockupSamples.push({ mockupType: item.mockupType, imageUrl: compressed });

                    const preset = MOCKUP_PRESETS.find(p => p.key === item.mockupType);
                    if (preset && !categoryFallbacks[preset.category]) {
                        categoryFallbacks[preset.category] = compressed;
                    }
                }
            }

            // 2단계: 없는 타입들 fallback
            MOCKUP_PRESETS.forEach(preset => {
                if (!seenTypes.has(preset.key) && categoryFallbacks[preset.category]) {
                    newMockupSamples.push({
                        mockupType: preset.key,
                        imageUrl: categoryFallbacks[preset.category]
                    });
                }
            });

            // 라이브러리 샘플
            const generalImages = imageHistory.filter(item => item.type === 'image');
            const defaultGeneral = compressImageUrl(generalImages[0]?.image, 200);

            const newLibrarySamples = {
                all: compressImageUrl(imageHistory[0]?.image, 200),
                images: compressImageUrl(imageHistory.filter(item => isGeneralImage(item))[0]?.image, 200) || defaultGeneral,
                design: compressImageUrl(imageHistory.filter(item => isDesignImage(item))[0]?.image, 200) || defaultGeneral,
                videos: defaultGeneral,
                favorites: compressImageUrl(imageHistory.filter(item => item.is_featured)[0]?.image, 200) || defaultGeneral
            };

            // 이미지 하위 카테고리 샘플
            const newImgSamples = {};
            ['all', 'text-to-image', 'idphoto', 'inpainting', 'composite'].forEach(key => {
                const filtered = imageHistory.filter(item => {
                    if (!isGeneralImage(item)) return false;
                    if (key === 'all') return true;
                    return getImageSubcategory(item) === key;
                });
                newImgSamples[key] = compressImageUrl(filtered[0]?.image, 200) || defaultGeneral;
            });

            // 디자인 하위 카테고리 샘플
            const newDesignSamples = {};
            const defaultDesign = compressImageUrl(imageHistory.filter(item => isDesignImage(item))[0]?.image, 200) || defaultGeneral;
            ['all', 'print', 'outdoor', 'booth', 'device', 'packaging', 'goods'].forEach(key => {
                const filtered = imageHistory.filter(item => {
                    if (!isDesignImage(item)) return false;
                    if (key === 'all') return true;
                    return getStyleCategory(item.style) === key;
                });
                newDesignSamples[key] = compressImageUrl(filtered[0]?.image, 200) || defaultDesign;
            });

            setSamplesCache({
                mockupSamples: newMockupSamples,
                librarySamples: newLibrarySamples,
                imageSubcategorySamples: newImgSamples,
                designSubcategorySamples: newDesignSamples,
                initialized: true
            });
        }
    }, [imageHistory, samplesCache.initialized]);

    // 목업 타입별 샘플 이미지 (캐시에서 가져오기)
    const mockupSamples = samplesCache.mockupSamples || [];

    // 라이브러리 서브메뉴용 고정 이미지
    const LIBRARY_FIXED_IMAGES = {
        images: '/images/library/category-images.webp',
        design: '/images/library/category-design.webp',
        videos: '/images/library/category-videos.webp',
    };

    // 라이브러리 서브메뉴용 샘플 이미지 가져오기 (고정 이미지 우선, 없으면 캐시)
    const getLibrarySampleImage = (menuKey) => {
        // 이미지, 디자인, 영상은 고정 이미지 사용
        if (LIBRARY_FIXED_IMAGES[menuKey]) {
            return LIBRARY_FIXED_IMAGES[menuKey];
        }
        // 나머지는 캐시에서 가져오기
        return samplesCache.librarySamples?.[menuKey] || null;
    };

    // 이미지 하위 카테고리용 샘플 이미지 가져오기 (캐시에서)
    const getImageSubcategorySample = (subcatKey) => {
        return samplesCache.imageSubcategorySamples?.[subcatKey] || null;
    };

    // 디자인 하위 카테고리용 샘플 이미지 가져오기 (캐시에서)
    const getDesignSubcategorySample = (subcatKey) => {
        return samplesCache.designSubcategorySamples?.[subcatKey] || null;
    };

    const [generatedImage, setGeneratedImage] = useState(null); // 현재 생성된 이미지 (대화형 편집용)
    const [featuredImages, setFeaturedImages] = useState([]); // 추천 이미지 (일반)
    const [featuredMockups, setFeaturedMockups] = useState([]); // 추천 목업
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true); // 초기 데이터 로딩
    const [isLoadingMore, setIsLoadingMore] = useState(false); // 무한 스크롤 추가 로딩
    const [hasMoreImages, setHasMoreImages] = useState(true); // 더 불러올 이미지 있는지
    const archiveEndRef = useRef(null); // 무한 스크롤 감지용 (아카이브)
    const resultEndRef = useRef(null); // 무한 스크롤 감지용 (결과물)
    const imageOffsetRef = useRef(0); // 현재 로드된 이미지 수 (dependency 방지용)
    // stale closure 방지용 refs
    const hasMoreRef = useRef(true);
    const isLoadingMoreRef = useRef(false);
    const isLoadingDataRef = useRef(true);
    const [isEnhancing, setIsEnhancing] = useState(false); // 프롬프트 확장 중
    const [error, setError] = useState(null);

    // 포인트 시스템 (커스텀 훅)
    const { pointUsage, loadPointUsage, consumePoints, hasEnoughPoints, getRequiredPoints } = usePointSystem();

    // Copilot 채팅 상태
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    // 로딩 박스 크기 (SVG 테두리 애니메이션용)
    const loadingBoxRef = useRef(null);
    const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });

    // 홈에서 자동 생성 트리거용
    const shouldAutoGenerateRef = useRef(false);

    // Supabase에서 이미지 목록 로드 (무한 스크롤 지원)
    const loadImages = useCallback(async (reset = true) => {
        // 추가 로드 시 중복 호출 방지 (ref로 즉시 체크)
        if (!reset && isLoadingMoreRef.current) return;

        try {
            // ref 사용으로 dependency 제거 → 함수 재생성 방지
            const offset = reset ? 0 : imageOffsetRef.current;
            const limit = 500; // 전체 로드

            if (!reset) {
                isLoadingMoreRef.current = true; // 즉시 ref 업데이트 (race condition 방지)
                setIsLoadingMore(true);
            }

            const response = await fetch(`/api/supabase-images?offset=${offset}&limit=${limit}`);
            const data = await response.json();

            if (data.images) {
                // 목업 타입 키 목록 (style 필드로 목업 여부 판단)
                const MOCKUP_STYLE_KEYS = [
                    'web-banner', 'mobile-banner', 'social-square', 'social-story', 'thumbnail',
                    'poster-a4', 'magazine-cover', 'business-card', 'brochure',
                    'billboard', 'bus-shelter', 'subway-interior', 'subway-psd', 'storefront', 'building-wrap', 'x-banner', 'bus-wrap', 'taxi-door', 'frp-sculpture',
                    'popup-outdoor', 'popup-indoor', 'island-booth', 'exhibition-booth', 'kiosk', 'info-desk',
                    'iphone-hand', 'iphone-topview', 'macbook-screen', 'ipad-screen', 'tv-screen', 'watch-face',
                    'product-box', 'shopping-bag', 'beverage-can', 'cake-box-kraft', 'cake-box-color', 'tshirt-front', 'tshirt-symbol', 'tshirt-staff',
                    'ballpoint-pen', 'sticker-sheet', 'wristband', 'pin-button', 'metal-badge', 'keychain'
                ];

                // DB 필드명을 프론트엔드 형식으로 변환
                const formatted = data.images.map(img => {
                    // style 필드로 목업 여부 판단
                    const isMockup = img.style && MOCKUP_STYLE_KEYS.includes(img.style);
                    const inferredType = img.type || (isMockup ? 'mockup' : 'image');

                    return {
                        id: img.id,
                        image: img.image_url,
                        prompt: img.prompt,
                        model: img.model,
                        imagenModel: img.model,
                        aspectRatio: img.aspect_ratio,
                        quality: img.quality,
                        style: img.style,
                        mockupType: isMockup ? img.style : null,
                        mockupLabel: isMockup ? img.prompt?.replace(' 목업', '') : null,
                        createdAt: new Date(img.created_at),
                        // 타입 및 메타데이터 (영상/이미지 구분)
                        type: inferredType,
                        metadata: img.metadata ? (typeof img.metadata === 'string' ? JSON.parse(img.metadata) : img.metadata) : null,
                        // 스타일 분석 데이터
                        detectedStyles: img.detected_styles || [],
                        mood: img.mood || null,
                        colors: img.colors || [],
                        analysisStatus: img.detected_styles?.length > 0 ? 'completed' : 'none',
                        // 추천 상태
                        is_featured: img.is_featured || false
                    };
                });

                if (reset) {
                    imageOffsetRef.current = formatted.length;
                    setImageHistory(formatted);
                } else {
                    imageOffsetRef.current += formatted.length;
                    setImageHistory(prev => [...prev, ...formatted]);
                }
                // hasMore 업데이트 (state + ref)
                const hasMore = data.hasMore === true;
                hasMoreRef.current = hasMore;
                setHasMoreImages(hasMore);
            }
        } catch (err) {
            console.error('Failed to load images:', err);
        } finally {
            isLoadingMoreRef.current = false;
            setIsLoadingMore(false);
        }
    }, []); // 빈 dependency - 함수 재생성 안됨

    // 추천 이미지 로드 (HOME 페이지용) - 일반 이미지와 목업 분리
    const loadFeaturedImages = useCallback(async () => {
        const formatImages = (images) => images.map(img => ({
            id: img.id,
            image: img.image_url,
            prompt: img.prompt,
            style: img.style,
            type: img.type || 'image',
            aspectRatio: img.aspect_ratio,
            metadata: img.metadata ? (typeof img.metadata === 'string' ? JSON.parse(img.metadata) : img.metadata) : null,
            createdAt: new Date(img.created_at)
        }));

        try {
            // 일반 이미지와 목업 병렬로 가져오기
            const [generalRes, mockupRes] = await Promise.all([
                fetch('/api/supabase-images?featured=true&contentType=general'),
                fetch('/api/supabase-images?featured=true&contentType=mockup'),
            ]);

            const [generalData, mockupData] = await Promise.all([
                generalRes.json(),
                mockupRes.json(),
            ]);

            if (generalData.success && generalData.images) {
                setFeaturedImages(formatImages(generalData.images));
            }

            if (mockupData.success && mockupData.images) {
                setFeaturedMockups(formatImages(mockupData.images));
            }
        } catch (err) {
            console.error('Failed to load featured images:', err);
        }
    }, []);

    // 초기 데이터 로드
    // 로딩 박스 크기 감지 (SVG 테두리 애니메이션용)
    useEffect(() => {
        if (isLoading && loadingBoxRef.current) {
            const element = loadingBoxRef.current;
            const updateSize = () => {
                if (!element) return;
                const rect = element.getBoundingClientRect();
                setBoxSize({ width: rect.width, height: rect.height });
            };
            updateSize();
            const observer = new ResizeObserver(updateSize);
            observer.observe(element);
            return () => observer.disconnect();
        }
    }, [isLoading]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            await Promise.all([loadImages(), loadPointUsage(), loadFeaturedImages()]);
            setIsLoadingData(false);
        };
        loadData();
    }, [loadImages, loadPointUsage, loadFeaturedImages]);

    // refs와 state 동기화 (stale closure 방지)
    useEffect(() => { hasMoreRef.current = hasMoreImages; }, [hasMoreImages]);
    useEffect(() => { isLoadingMoreRef.current = isLoadingMore; }, [isLoadingMore]);
    useEffect(() => { isLoadingDataRef.current = isLoadingData; }, [isLoadingData]);

    // 무한 스크롤 - IntersectionObserver (결과물 + 아카이브 둘 다 감지)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const isVisible = entries.some(entry => entry.isIntersecting);
                // refs 사용으로 최신 상태 참조
                if (isVisible && hasMoreRef.current && !isLoadingMoreRef.current && !isLoadingDataRef.current) {
                    loadImages(false);
                }
            },
            { threshold: 0.1, rootMargin: '100px' } // rootMargin 추가로 더 일찍 로드
        );

        // 결과물 카드 끝
        if (resultEndRef.current) {
            observer.observe(resultEndRef.current);
        }
        // 아카이브 카드 끝
        if (archiveEndRef.current) {
            observer.observe(archiveEndRef.current);
        }

        return () => observer.disconnect();
    }, [loadImages]); // dependencies 최소화 - refs 사용으로 state 의존성 제거

    // URL 변경 시 메뉴 동기화
    useEffect(() => {
        const path = location.pathname;
        let newMenu = 'wave'; // 기본값은 Wave
        if (path.includes('/video')) newMenu = 'video';
        else if (path.includes('/tools')) newMenu = 'tools';
        else if (path.includes('/design')) newMenu = 'design';
        else if (path.includes('/image')) newMenu = 'image';
        else if (path.includes('/library')) newMenu = 'library';

        if (newMenu !== activeMenu) {
            setActiveMenu(newMenu);
            setActiveSubMenu(getInitialSubMenu(newMenu));
        }
    }, [location.pathname]);

    // 메뉴 변경 핸들러 (URL도 변경)
    const handleMenuChange = (menuKey) => {
        setActiveMenu(menuKey);
        setActiveSubMenu(getInitialSubMenu(menuKey));
        // URL 변경
        if (menuKey === 'image') navigate('/image');
        else if (menuKey === 'tools') navigate('/tools');
        else if (menuKey === 'video') navigate('/video');
        else if (menuKey === 'design') navigate('/design');
        else if (menuKey === 'wave') navigate('/');
        else if (menuKey === 'library') navigate('/library');
    };

    // 배경 없애기용 상태
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isStartDragging, setIsStartDragging] = useState(false); // 멀티 이미지 시작
    const [isEndDragging, setIsEndDragging] = useState(false); // 멀티 이미지 끝
    const [removeBgResult, setRemoveBgResult] = useState(null); // 배경 제거 결과 이미지
    const [upscaleResult, setUpscaleResult] = useState(null); // 업스케일 결과 이미지
    const [textCorrectImage, setTextCorrectImage] = useState(null); // 분석할 이미지
    const [textAnalysis, setTextAnalysis] = useState(null); // 분석 결과
    const [textCorrectResult, setTextCorrectResult] = useState(null); // 보정 결과 이미지

    // 증명사진 스튜디오 헤더 상태
    const [idPhotoHeader, setIdPhotoHeader] = useState({ title: '증명사진', showBack: false, onBack: null });

    // 자유사진 헤더 상태
    const [freePhotoHeader, setFreePhotoHeader] = useState({ title: '자유사진', showBack: false, onBack: null });

    // 합성 사진 상태
    const [compositeMode, setCompositeMode] = useState('location'); // 'location' | 'tryon' | 'background'
    const [compositeBackground, setCompositeBackground] = useState(null); // 배경 이미지
    const [compositeForeground, setCompositeForeground] = useState(null); // 전경 이미지
    const [compositeHuman, setCompositeHuman] = useState(null); // 인물 이미지
    const [compositeGarment, setCompositeGarment] = useState(null); // 의류 이미지
    const [compositeSource, setCompositeSource] = useState(null); // 소스 이미지 (배경 생성용)
    const [compositeBackgroundPrompt, setCompositeBackgroundPrompt] = useState(''); // 배경 프롬프트
    const [compositeGarmentCategory, setCompositeGarmentCategory] = useState('upper_body'); // 의류 카테고리
    const [compositeGarmentDescription, setCompositeGarmentDescription] = useState(''); // 의류 설명
    const [compositeResult, setCompositeResult] = useState(null); // 결과 이미지
    const [compositeError, setCompositeError] = useState(null); // 에러 메시지
    const [compositeLoading, setCompositeLoading] = useState(false); // 로딩 상태
    const compositeBackgroundRef = useRef(null);
    const compositeForegroundRef = useRef(null);
    const compositeHumanRef = useRef(null);
    const compositeGarmentRef = useRef(null);
    const compositeSourceRef = useRef(null);

    // activeSubMenu 변경 시 compositeMode 자동 동기화
    useEffect(() => {
        if (activeSubMenu === 'location-composite') {
            setCompositeMode('location');
        } else if (activeSubMenu === 'virtual-tryon') {
            setCompositeMode('tryon');
        } else if (activeSubMenu === 'background-gen') {
            setCompositeMode('background');
        }
    }, [activeSubMenu]);

    // 영상 생성용 상태 (Image-to-Video)
    const [videoPrompt, setVideoPrompt] = useState('');
    const [videoAspectRatio, setVideoAspectRatio] = useState('16:9'); // 16:9, 9:16, 1:1
    const [videoAspectRatioLocked, setVideoAspectRatioLocked] = useState(false); // 이미지 비율로 고정
    const [videoAspectRatioMismatch, setVideoAspectRatioMismatch] = useState(null); // 비율 불일치 안내
    const [videoResolution, setVideoResolution] = useState('720p'); // 720p, 1080p
    const [videoDuration, setVideoDuration] = useState('4'); // 4, 6, 8
    const [videoNegativePrompt, setVideoNegativePrompt] = useState('');
    const [generatedVideo, setGeneratedVideo] = useState(null); // 생성된 영상
    const [videoGenerateAudio, setVideoGenerateAudio] = useState(true); // 오디오 생성 여부
    const [endImage, setEndImage] = useState(null); // 마지막 프레임 이미지 (multi-image-to-video)
    const [showImagePicker, setShowImagePicker] = useState(false); // 이미지 피커 모달
    const [imagePickerTarget, setImagePickerTarget] = useState('start'); // 'start' or 'end'
    const [imagePickerLimit, setImagePickerLimit] = useState(27); // 이미지 피커 표시 개수
    const fileInputRef = useRef(null); // 파일 입력 ref
    const endImageInputRef = useRef(null); // 마지막 이미지 파일 입력 ref

    // 삭제 모달 상태
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // 추천 모달 상태
    const [featuredTargetItem, setFeaturedTargetItem] = useState(null);
    const [showFeaturedConfirm, setShowFeaturedConfirm] = useState(false);

    // 라이트박스 상태
    const [lightboxImage, setLightboxImage] = useState(null);

    // 프롬프트 확장 상태
    const [expandedPromptId, setExpandedPromptId] = useState(null);

    // 삭제 버튼 클릭
    const handleDeleteClick = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    // 삭제 대상 아이템 (메시지 표시용)
    const deleteTargetItem = imageHistory.find(item => item.id === deleteTargetId);

    // 삭제 확인 - 즉시 UI 반영 후 백그라운드에서 API 호출 (낙관적 업데이트)
    const handleDeleteConfirm = () => {
        const targetId = deleteTargetId;
        const targetImage = imageHistory.find(item => item.id === targetId);

        // 1. 즉시 UI 반영 (모달 닫기 + 히스토리에서 제거)
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
        setImageHistory(prev => prev.filter(item => item.id !== targetId));

        // 2. 백그라운드에서 Supabase 삭제 (await 없이)
        if (targetImage) {
            fetch('/api/supabase-images', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: targetId,
                    imageUrl: targetImage.image
                })
            }).catch(err => {
                console.error('Failed to delete from Supabase:', err);
            });
        }
    };

    // 삭제 취소
    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
    };

    // 네거티브 프리셋 토글
    const handleNegativePresetToggle = (preset) => {
        setSelectedNegativePresets(prev => {
            if (prev.includes(preset.key)) {
                return prev.filter(k => k !== preset.key);
            } else {
                return [...prev, preset.key];
            }
        });
    };

    // 선택된 프리셋으로 네거티브 프롬프트 생성
    const getCombinedNegativePrompt = () => {
        const presetValues = selectedNegativePresets
            .map(key => NEGATIVE_PRESETS.find(p => p.key === key)?.value)
            .filter(Boolean);
        const combined = [...presetValues];
        if (negativePrompt.trim()) {
            combined.push(negativePrompt.trim());
        }
        return combined.join(', ');
    };

    // 이미지 다운로드
    const handleDownload = async (item) => {
        try {
            // 영상/이미지에 따라 확장자 결정
            const isVideo = item.type === 'video' || item.image?.startsWith('data:video/');
            const extension = isVideo ? 'mp4' : 'png';
            const fileName = `orange-whale-${formatDateTime(item.createdAt).replace(/[.:]/g, '-')}.${extension}`;

            // Base64 데이터 URL인 경우
            if (item.image.startsWith('data:')) {
                const link = document.createElement('a');
                link.href = item.image;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }

            // 외부 URL인 경우 프록시 API를 통해 다운로드
            const proxyUrl = `/api/download-image?url=${encodeURIComponent(item.image)}&filename=${encodeURIComponent(fileName)}`;

            const link = document.createElement('a');
            link.href = proxyUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download failed:', err);
            // 실패 시 새 창으로 열기
            window.open(item.image, '_blank');
        }
    };

    // 추천 버튼 클릭 - 모달 표시
    const handleFeaturedClick = (item) => {
        setFeaturedTargetItem(item);
        setShowFeaturedConfirm(true);
    };

    // 추천 확인 - 실제 토글 실행
    const handleFeaturedConfirm = async () => {
        const item = featuredTargetItem;
        if (!item) return;

        const newFeaturedState = !item.is_featured;

        // 모달 닫기
        setShowFeaturedConfirm(false);
        setFeaturedTargetItem(null);

        // 낙관적 UI 업데이트 - imageHistory
        setImageHistory(prev => prev.map(img =>
            img.id === item.id ? { ...img, is_featured: newFeaturedState } : img
        ));

        // 목업인지 일반 이미지인지 확인
        const isMockup = item.style && MOCKUP_STYLES.includes(item.style);
        const targetSetter = isMockup ? setFeaturedMockups : setFeaturedImages;

        // 낙관적 UI 업데이트 - 목업/일반 분기
        if (newFeaturedState) {
            // 추천에 추가
            targetSetter(prev => {
                if (prev.find(img => img.id === item.id)) return prev;
                return [{
                    id: item.id,
                    image: item.image,
                    prompt: item.prompt,
                    style: item.style,
                    type: item.type || 'image',
                    aspectRatio: item.aspectRatio || item.aspect_ratio,
                    metadata: item.metadata,
                    createdAt: item.createdAt
                }, ...prev];
            });
        } else {
            // 추천에서 제거 (양쪽 모두에서 제거 - 안전하게)
            setFeaturedImages(prev => prev.filter(img => img.id !== item.id));
            setFeaturedMockups(prev => prev.filter(img => img.id !== item.id));
        }

        // 라이트박스도 업데이트
        if (lightboxImage && lightboxImage.id === item.id) {
            setLightboxImage(prev => ({ ...prev, is_featured: newFeaturedState }));
        }

        try {
            const response = await fetch('/api/supabase-images', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id,
                    is_featured: newFeaturedState
                })
            });

            if (!response.ok) {
                throw new Error('추천 상태 변경 실패');
            }
        } catch (err) {
            console.error('Toggle featured error:', err);
            // 실패 시 원상복구 - imageHistory
            setImageHistory(prev => prev.map(img =>
                img.id === item.id ? { ...img, is_featured: !newFeaturedState } : img
            ));
            // 실패 시 원상복구 - 목업/일반 분기
            if (newFeaturedState) {
                // 추가했던 것 제거
                setFeaturedImages(prev => prev.filter(img => img.id !== item.id));
                setFeaturedMockups(prev => prev.filter(img => img.id !== item.id));
            } else {
                // 제거했던 것 복구
                targetSetter(prev => [{
                    id: item.id,
                    image: item.image,
                    prompt: item.prompt,
                    style: item.style,
                    type: item.type || 'image',
                    aspectRatio: item.aspectRatio || item.aspect_ratio,
                    metadata: item.metadata,
                    createdAt: item.createdAt
                }, ...prev]);
            }
        }
    };

    // 추천 취소
    const handleFeaturedCancel = () => {
        setShowFeaturedConfirm(false);
        setFeaturedTargetItem(null);
    };

    // 이미지 압축 함수 (최대 2048px, JPEG 변환)
    const compressImage = (file, maxSize = 2048, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                const originalWidth = width;
                const originalHeight = height;

                // 최대 크기 제한
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    } else {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // 항상 JPEG로 압축 (PNG quality 파라미터 무시됨)
                // 배경 제거 결과는 어차피 PNG로 돌아옴
                const dataUrl = canvas.toDataURL('image/jpeg', quality);

                const sizeKB = Math.round(dataUrl.length / 1024);
                console.log(`[Compress] ${originalWidth}x${originalHeight} → ${width}x${height}, ${sizeKB}KB (JPEG q=${quality})`);

                // Blob URL 정리
                URL.revokeObjectURL(img.src);
                resolve(dataUrl);
            };
            img.onerror = (e) => {
                console.error('[Compress] Image load failed:', e);
                URL.revokeObjectURL(img.src);
                reject(new Error('이미지 로드 실패'));
            };
            img.src = URL.createObjectURL(file);
        });
    };

    // 이미지 비율 감지 및 비디오 비율 자동 설정
    const detectAndSetVideoAspectRatio = (imageDataUrl) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                let detectedRatio;
                let mismatchInfo = null;

                // Veo 3.1은 16:9 (1.78)와 9:16 (0.56)만 지원
                const ratio16_9 = 16 / 9; // 1.78
                const ratio9_16 = 9 / 16; // 0.56

                // 가장 가까운 지원 비율 찾기
                const diff16_9 = Math.abs(ratio - ratio16_9);
                const diff9_16 = Math.abs(ratio - ratio9_16);

                if (diff16_9 < diff9_16) {
                    detectedRatio = '16:9';
                    // 16:9와 차이가 20% 이상이면 안내 메시지
                    if (diff16_9 / ratio16_9 > 0.2) {
                        mismatchInfo = {
                            original: `${img.width}x${img.height}`,
                            originalRatio: ratio.toFixed(2),
                            target: '16:9'
                        };
                    }
                } else {
                    detectedRatio = '9:16';
                    // 9:16와 차이가 20% 이상이면 안내 메시지
                    if (diff9_16 / ratio9_16 > 0.2) {
                        mismatchInfo = {
                            original: `${img.width}x${img.height}`,
                            originalRatio: ratio.toFixed(2),
                            target: '9:16'
                        };
                    }
                }

                console.log(`[AspectRatio] Detected: ${img.width}x${img.height} = ${ratio.toFixed(2)} → ${detectedRatio}`, mismatchInfo ? '(mismatch)' : '');
                setVideoAspectRatio(detectedRatio);
                setVideoAspectRatioLocked(true);
                setVideoAspectRatioMismatch(mismatchInfo);
                resolve(detectedRatio);
            };
            img.onerror = () => {
                console.error('[AspectRatio] Failed to detect');
                resolve(null);
            };
            img.src = imageDataUrl;
        });
    };

    // 이미지 업로드 핸들러 (배경 없애기용)
    const handleFileSelect = async (file) => {
        if (!file) return;

        console.log('[Upload] File selected:', file.name, file.type, file.size);

        // 이미지 타입 체크
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드 가능합니다.');
            return;
        }

        // 파일 크기 체크 (50MB - 원본 기준)
        if (file.size > 50 * 1024 * 1024) {
            setError('파일 크기는 50MB 이하여야 합니다.');
            return;
        }

        try {
            // 이미지 압축 (최대 2048px)
            const compressedDataUrl = await compressImage(file, 2048, 0.85);
            console.log('[Upload] Compressed size:', Math.round(compressedDataUrl.length / 1024), 'KB');

            setUploadedImage({
                file,
                preview: compressedDataUrl,
                name: file.name
            });

            // 영상 모드에서는 이미지 비율 자동 감지
            if (activeMenu === 'video') {
                await detectAndSetVideoAspectRatio(compressedDataUrl);
            }

            setError(null);
        } catch (err) {
            console.error('[Upload] Compression error:', err);
            setError('이미지 처리 중 오류가 발생했습니다.');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    // 멀티 이미지 - 시작 이미지 드래그 앤 드롭
    const handleStartDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsStartDragging(true);
    };

    const handleStartDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleStartDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsStartDragging(false);
    };

    const handleStartDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsStartDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    // 멀티 이미지 - 끝 이미지 드래그 앤 드롭
    const handleEndDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEndDragging(true);
    };

    const handleEndDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleEndDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEndDragging(false);
    };

    const handleEndDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEndDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleEndImageSelect(file);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
            // 파일 업로드 성공 시 이미지 피커 모달 닫기
            setShowImagePicker(false);
        }
        // 같은 파일을 다시 선택할 수 있도록 value 초기화
        e.target.value = '';
    };

    const handleRemoveUploadedImage = () => {
        setUploadedImage(null);
        setRemoveBgResult(null);
        // 영상 비율 잠금 해제
        setVideoAspectRatioLocked(false);
        setVideoAspectRatioMismatch(null);
        // 파일 입력 초기화
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // 마지막 이미지(multi-image-to-video) 파일 선택 처리 (드래그 앤 드롭용)
    const handleEndImageSelect = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드 가능합니다.');
            return;
        }
        try {
            const compressedDataUrl = await compressImage(file, 2048, 0.85);
            setEndImage({
                preview: compressedDataUrl,
                name: file.name
            });
            setError(null);
        } catch (err) {
            console.error('[Upload] End image error:', err);
            setError('이미지 처리 중 오류가 발생했습니다.');
        }
    };

    // 마지막 이미지(multi-image-to-video) 파일 입력 처리
    const handleEndImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleEndImageSelect(file);
            // 파일 업로드 성공 시 이미지 피커 모달 닫기
            setShowImagePicker(false);
        }
        e.target.value = '';
    };

    // 마지막 이미지 제거
    const handleRemoveEndImage = () => {
        setEndImage(null);
        if (endImageInputRef.current) {
            endImageInputRef.current.value = '';
        }
    };

    // 이미지 피커 모달 열기
    const openImagePicker = (target = 'start') => {
        setImagePickerTarget(target);
        setImagePickerLimit(27); // 초기화
        setShowImagePicker(true);
    };

    // 아카이브에서 이미지 선택
    const handleSelectArchiveImage = async (item) => {
        setShowImagePicker(false);

        let imageData = item.image;

        // URL인 경우 base64로 변환
        if (item.image.startsWith('http')) {
            try {
                imageData = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let { width, height } = img;
                        const maxSize = 2048;

                        if (width > maxSize || height > maxSize) {
                            if (width > height) {
                                height = Math.round((height * maxSize) / width);
                                width = maxSize;
                            } else {
                                width = Math.round((width * maxSize) / height);
                                height = maxSize;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.9));
                    };
                    img.onerror = reject;
                    img.src = item.image;
                });
            } catch (err) {
                console.error('Failed to load archive image:', err);
                return;
            }
        }

        const imageObj = { preview: imageData, file: null, name: 'archive-image' };

        if (imagePickerTarget === 'end') {
            setEndImage(imageObj);
        } else {
            setUploadedImage(imageObj);
            // 영상용일 경우 비율 감지
            if (activeMenu === 'video') {
                detectAndSetVideoAspectRatio(imageData);
            }
        }
    };

    // 히스토리 이미지를 영상 생성으로 보내기
    const handleSendToVideo = async (item) => {
        console.log('[SendToVideo] Called with item:', item?.type, item?.image?.substring(0, 50));

        // 영상 탭으로 전환
        setActiveMenu('video');
        setActiveSubMenu('image-to-video');
        setError(null);

        let imageData = item.image;

        // URL인 경우 fetch로 blob 다운로드 후 base64 변환 (CORS 우회)
        if (item.image && item.image.startsWith('http')) {
            try {
                setIsLoading(true);
                console.log('[SendToVideo] Fetching image via proxy...');

                // 캐시 버스팅 파라미터 제거
                let cleanUrl = item.image;
                if (cleanUrl.includes('?')) {
                    cleanUrl = cleanUrl.split('?')[0];
                }

                // fetch로 이미지 다운로드 (서버 프록시 없이 직접 시도)
                const response = await fetch(cleanUrl);
                if (!response.ok) {
                    throw new Error(`이미지 다운로드 실패: ${response.status}`);
                }
                const blob = await response.blob();
                console.log('[SendToVideo] Downloaded blob:', blob.type, blob.size);

                // Blob을 base64로 변환
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(new Error('이미지 변환 실패'));
                    reader.readAsDataURL(blob);
                });
                console.log('[SendToVideo] Converted to base64, length:', imageData?.length);

            } catch (err) {
                console.error('[SendToVideo] Failed:', err);
                setError('이미지 로드에 실패했습니다: ' + err.message);
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
        }

        if (!imageData || !imageData.startsWith('data:')) {
            console.error('[SendToVideo] Invalid image data:', imageData?.substring(0, 30));
            setError('이미지 데이터가 올바르지 않습니다.');
            return;
        }

        console.log('[SendToVideo] Setting uploadedImage...');
        setUploadedImage({
            file: null,
            preview: imageData,
            name: `${item.prompt?.substring(0, 20) || 'image'}...`
        });

        // 이미지 비율 자동 감지
        await detectAndSetVideoAspectRatio(imageData);
        console.log('[SendToVideo] Complete!');
    };

    // 히스토리 이미지를 배경 없애기로 보내기
    const handleSendToRemoveBg = async (item) => {
        // 배경 없애기 탭으로 먼저 전환
        setActiveSubMenu('remove-bg');
        setRemoveBgResult(null);
        setError(null);

        let imageData = item.image;

        // URL인 경우 base64로 변환 + 압축
        if (item.image.startsWith('http')) {
            try {
                setIsLoading(true);
                console.log('[SendToRemoveBg] Loading and compressing image...');

                // 이미지 로드 및 압축 (Canvas 사용)
                imageData = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        let { width, height } = img;
                        const maxSize = 2048;

                        // 최대 크기 제한
                        if (width > maxSize || height > maxSize) {
                            if (width > height) {
                                height = Math.round((height * maxSize) / width);
                                width = maxSize;
                            } else {
                                width = Math.round((width * maxSize) / height);
                                height = maxSize;
                            }
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        // JPEG로 압축
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        console.log(`[SendToRemoveBg] Compressed: ${img.naturalWidth}x${img.naturalHeight} → ${width}x${height}, ${Math.round(dataUrl.length / 1024)}KB`);
                        resolve(dataUrl);
                    };
                    img.onerror = () => reject(new Error('이미지 로드 실패'));
                    img.src = item.image;
                });
            } catch (err) {
                console.error('[SendToRemoveBg] Failed:', err);
                setError('이미지 로드에 실패했습니다.');
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
        }

        // 이미지를 업로드 상태로 설정
        setUploadedImage({
            file: null,
            preview: imageData,
            name: `${item.prompt.substring(0, 20)}...`
        });
    };

    // 히스토리 이미지를 업스케일로 보내기
    const handleSendToUpscale = async (item) => {
        // 업스케일 탭으로 전환
        setActiveSubMenu('upscale');
        setUpscaleResult(null);
        setError(null);

        let imageData = item.image;

        // URL인 경우 base64로 변환 + 압축
        if (item.image.startsWith('http')) {
            try {
                setIsLoading(true);
                console.log('[SendToUpscale] Loading and compressing image...');

                // 이미지 로드 및 압축 (Canvas 사용)
                imageData = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        let { width, height } = img;
                        const maxSize = 1536; // API 제한 고려

                        // 최대 크기 제한
                        if (width > maxSize || height > maxSize) {
                            if (width > height) {
                                height = Math.round((height * maxSize) / width);
                                width = maxSize;
                            } else {
                                width = Math.round((width * maxSize) / height);
                                height = maxSize;
                            }
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        // JPEG로 압축 (품질 0.9)
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                        console.log(`[SendToUpscale] Compressed: ${img.naturalWidth}x${img.naturalHeight} → ${width}x${height}, ${Math.round(dataUrl.length / 1024)}KB`);
                        resolve(dataUrl);
                    };
                    img.onerror = () => reject(new Error('이미지 로드 실패'));
                    img.src = item.image;
                });
            } catch (err) {
                console.error('[SendToUpscale] Failed:', err);
                setError('이미지 로드에 실패했습니다.');
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
        }

        // 이미지를 업로드 상태로 설정
        setUploadedImage({
            file: null,
            preview: imageData,
            name: `${item.prompt.substring(0, 20)}...`
        });
    };

    // 히스토리 이미지를 텍스트 보정으로 보내기
    const handleSendToTextCorrect = async (item) => {
        // 텍스트 보정 탭으로 전환
        setActiveMenu('tools');
        setActiveSubMenu('text-correct');
        setTextAnalysis(null);
        setTextCorrectResult(null);
        setError(null);

        let imageData = item.image;

        // URL인 경우 base64로 변환
        if (item.image.startsWith('http')) {
            try {
                setIsLoading(true);
                console.log('[SendToTextCorrect] Loading image...');

                imageData = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        // 최대 1536px로 리사이즈 (API 요청 크기 제한)
                        const maxSize = 1536;
                        let width = img.naturalWidth;
                        let height = img.naturalHeight;
                        if (width > maxSize || height > maxSize) {
                            if (width > height) {
                                height = Math.round((height * maxSize) / width);
                                width = maxSize;
                            } else {
                                width = Math.round((width * maxSize) / height);
                                height = maxSize;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        resolve(dataUrl);
                    };
                    img.onerror = () => reject(new Error('이미지 로드 실패'));
                    img.src = item.image;
                });
            } catch (err) {
                console.error('[SendToTextCorrect] Failed:', err);
                setError('이미지 로드에 실패했습니다.');
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
        }

        setTextCorrectImage({
            preview: imageData,
            name: item.prompt?.substring(0, 20) + '...' || '이미지'
        });
    };

    // 히스토리 이미지를 이미지로 생성(Image-to-Image)으로 보내기
    const handleSendToImageToImage = async (item) => {
        // 이미지로 생성 탭으로 전환
        setActiveMenu('image');
        setActiveSubMenu('image-to-image');
        setError(null);

        let imageData = item.image;

        // URL인 경우 base64로 변환
        if (item.image.startsWith('http')) {
            try {
                setIsLoading(true);
                console.log('[SendToImageToImage] Loading image...');

                imageData = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        // 최대 1536px로 리사이즈 (API 요청 크기 제한)
                        const maxSize = 1536;
                        let width = img.naturalWidth;
                        let height = img.naturalHeight;
                        if (width > maxSize || height > maxSize) {
                            if (width > height) {
                                height = Math.round((height * maxSize) / width);
                                width = maxSize;
                            } else {
                                width = Math.round((width * maxSize) / height);
                                height = maxSize;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        resolve(dataUrl);
                    };
                    img.onerror = () => reject(new Error('이미지 로드 실패'));
                    img.src = item.image;
                });
            } catch (err) {
                console.error('[SendToImageToImage] Failed:', err);
                setError('이미지 로드에 실패했습니다.');
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
        }

        // 이미지를 업로드 상태로 설정
        setUploadedImage({
            file: null,
            preview: imageData,
            name: `${item.prompt?.substring(0, 20) || '이미지'}...`
        });
    };

    // 히스토리 이미지를 부분 편집(Inpainting)으로 보내기
    const handleSendToInpainting = async (item) => {
        // 부분 편집 탭으로 전환
        setActiveMenu('image');
        setActiveSubMenu('inpainting');
        setError(null);

        let imageData = item.image;

        // URL인 경우 base64로 변환
        if (item.image.startsWith('http')) {
            try {
                setIsLoading(true);
                console.log('[SendToInpainting] Loading image...');

                imageData = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        // 최대 1536px로 리사이즈 (API 요청 크기 제한)
                        const maxSize = 1536;
                        let width = img.naturalWidth;
                        let height = img.naturalHeight;
                        if (width > maxSize || height > maxSize) {
                            if (width > height) {
                                height = Math.round((height * maxSize) / width);
                                width = maxSize;
                            } else {
                                width = Math.round((width * maxSize) / height);
                                height = maxSize;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        resolve(dataUrl);
                    };
                    img.onerror = () => reject(new Error('이미지 로드 실패'));
                    img.src = item.image;
                });
            } catch (err) {
                console.error('[SendToInpainting] Failed:', err);
                setError('이미지 로드에 실패했습니다.');
                setIsLoading(false);
                return;
            } finally {
                setIsLoading(false);
            }
        }

        // 이미지를 업로드 상태로 설정
        setUploadedImage({
            file: null,
            preview: imageData,
            name: `${item.prompt?.substring(0, 20) || '이미지'}...`
        });
    };

    // 인페인팅 (부분 편집) 생성
    const handleInpaintingGenerate = async (data) => {
        // 포인트 체크
        const requiredPoints = POINT_COSTS['inpainting'];
        if (pointUsage.remaining < requiredPoints) {
            setError(`포인트가 부족합니다. (필요: ${requiredPoints}P, 남은 포인트: ${pointUsage.remaining}P)`);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('[Inpainting] Starting...', { model: data.model });

            const response = await fetch('/api/generate-inpainting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: data.image,
                    mask: data.mask,
                    prompt: data.prompt,
                    model: data.model
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '인페인팅 생성 실패');
            }

            console.log('[Inpainting] Success');
            setGeneratedImage(result.image);

            // 히스토리에 저장
            const newImage = {
                id: Date.now(),
                type: 'inpainting',
                image: result.image,
                imageUrl: result.image,
                prompt: data.prompt,
                model: data.model,
                createdAt: new Date()
            };
            setImageHistory(prev => [newImage, ...prev]);

            // 포인트 차감
            try {
                await consumePoints('inpainting', { prompt: data.prompt?.substring(0, 50), model: data.model });
                console.log('[Points] Deducted:', requiredPoints, 'for inpainting');
            } catch (pointErr) {
                console.error('Failed to deduct points:', pointErr);
            }

        } catch (err) {
            console.error('[Inpainting] Error:', err);
            setError(err.message || '인페인팅 중 오류 발생');
        } finally {
            setIsLoading(false);
        }
    };

    // 프롬프트 확장 (Gemini Flash로 상세 프롬프트 생성)
    const handleEnhancePrompt = async (type = 'image') => {
        const currentPrompt = type === 'video' ? videoPrompt : prompt;
        console.log('[Enhance] Starting...', { type, currentPrompt });
        if (!currentPrompt.trim() || isEnhancing) return;

        setIsEnhancing(true);
        try {
            // 이미지가 있으면 함께 전송 (이미지 기반 프롬프트 생성)
            const requestBody = {
                prompt: currentPrompt,
                type
            };

            // 첨부된 이미지가 있으면 추가
            if (uploadedImage?.preview) {
                requestBody.image = uploadedImage.preview;
            }

            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            console.log('[Enhance] Response:', data);
            if (data.success && data.enhanced) {
                console.log('[Enhance] Setting prompt:', data.enhanced);
                if (type === 'video') {
                    setVideoPrompt(data.enhanced);
                } else {
                    setPrompt(data.enhanced);
                }
            } else {
                console.error('[Enhance] Failed:', data.error);
            }
        } catch (err) {
            console.error('[Enhance] Error:', err);
        } finally {
            setIsEnhancing(false);
        }
    };

    // 영상 생성 (Text-to-Video, Image-to-Video, Multi-Image-to-Video)
    const handleGenerateVideo = async () => {
        // VideoView가 사용하는 useVideoStore에서 상태 가져오기
        const videoStore = useVideoStore.getState();
        const storeUploadedImage = videoStore.uploadedImage;
        const storeEndImage = videoStore.endImage;
        const storeVideoAspectRatio = videoStore.videoAspectRatio;
        const storeVideoDuration = videoStore.videoDuration;
        const storeVideoResolution = videoStore.videoResolution;
        const storeVideoGenerateAudio = videoStore.videoGenerateAudio;

        // 모드별 유효성 검사 (store 상태 사용)
        if (activeSubMenu === 'text-to-video') {
            if (!videoPrompt.trim()) return;
        } else if (activeSubMenu === 'image-to-video') {
            if (!storeUploadedImage || !videoPrompt.trim()) return;
        } else if (activeSubMenu === 'multi-image-to-video') {
            if (!storeUploadedImage || !storeEndImage || !videoPrompt.trim()) return;
        }

        // 포인트 체크 (영상 길이에 따라 차등)
        const videoActionKey = storeVideoDuration === '10' ? 'video-10s' : 'video-5s';
        const requiredPoints = POINT_COSTS[videoActionKey];
        if (pointUsage.remaining < requiredPoints) {
            setError(`포인트가 부족합니다. (필요: ${requiredPoints}P, 남은 포인트: ${pointUsage.remaining}P)`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideo(null);

        // 10분 타임아웃 설정 (영상 생성은 오래 걸림)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600000);

        try {
            console.log('[VideoGen] Starting video generation...');
            console.log('[VideoGen] Mode:', activeSubMenu);
            console.log('[VideoGen] Prompt:', videoPrompt);
            console.log('[VideoGen] Duration:', storeVideoDuration);
            console.log('[VideoGen] Resolution:', storeVideoResolution);
            console.log('[VideoGen] Aspect Ratio:', storeVideoAspectRatio);
            console.log('[VideoGen] Generate Audio:', storeVideoGenerateAudio);

            // 요청 바디 구성 (store 상태 사용)
            const requestBody = {
                prompt: videoPrompt,
                aspectRatio: storeVideoAspectRatio,
                duration: parseInt(storeVideoDuration),
                resolution: storeVideoResolution,
                generateAudio: storeVideoGenerateAudio,
                negativePrompt: videoNegativePrompt || undefined
            };

            // 모드별 이미지 추가 (store 상태 사용)
            if (activeSubMenu === 'image-to-video' && storeUploadedImage) {
                requestBody.image = storeUploadedImage.base64 || storeUploadedImage.preview;
                console.log('[VideoGen] Image data check:');
                console.log('  - Type:', typeof requestBody.image);
                console.log('  - Starts with:', requestBody.image?.substring(0, 30));
                console.log('  - Length:', requestBody.image?.length);
            } else if (activeSubMenu === 'multi-image-to-video' && storeUploadedImage && storeEndImage) {
                requestBody.image = storeUploadedImage.base64 || storeUploadedImage.preview;
                requestBody.endImage = storeEndImage.base64 || storeEndImage.preview;
            }
            // text-to-video는 이미지 없음

            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();
            console.log('[VideoGen] Response data:', data);
            console.log('[VideoGen] Video data:', data.video?.substring?.(0, 100) || data.video);

            if (!response.ok) {
                // friendlyMessage가 있으면 사용, 없으면 기본 메시지
                const errorMsg = data.friendlyMessage?.message || data.message || data.error || 'Video generation failed';
                const error = new Error(errorMsg);
                error.friendlyMessage = data.friendlyMessage;
                throw error;
            }

            if (!data.video) {
                throw new Error('서버에서 영상 데이터가 반환되지 않았습니다.');
            }

            console.log('[VideoGen] Video generated successfully:', data.debug);
            console.log('[VideoGen] Setting video, length:', data.video?.length);
            setGeneratedVideo(data.video);

            // 서버에서 이미 저장된 경우 (savedVideo가 있거나 URL로 반환) 프론트 저장 스킵
            const isAlreadySaved = data.savedVideo || data.video?.startsWith('https://');

            if (isAlreadySaved) {
                console.log('[VideoGen] Already saved on server, skipping frontend save');

                // 아카이브에 추가
                const newVideo = {
                    id: data.savedVideo?.id || Date.now(),
                    image: data.video,
                    prompt: videoPrompt,
                    type: 'video',
                    createdAt: new Date(),
                    metadata: {
                        duration: videoDuration,
                        resolution: videoResolution,
                        aspectRatio: videoAspectRatio,
                        hasAudio: videoGenerateAudio
                    }
                };
                setImageHistory(prev => [newVideo, ...prev]);

                // 포인트 차감
                try {
                    await consumePoints(videoActionKey, {
                        prompt: videoPrompt?.substring(0, 50),
                        duration: videoDuration,
                        resolution: videoResolution
                    });
                    console.log('[Points] Deducted:', requiredPoints, 'for', videoActionKey);
                } catch (pointErr) {
                    console.error('Failed to deduct points:', pointErr);
                }
            } else {
                // base64인 경우에만 프론트에서 저장 시도
                try {
                    console.log('[VideoGen] Saving to Supabase from frontend...');
                    const saveResponse = await fetch('/api/supabase-images', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image: data.video,
                            prompt: videoPrompt,
                            type: 'video',
                            metadata: {
                                duration: videoDuration,
                                resolution: videoResolution,
                                aspectRatio: videoAspectRatio,
                                hasAudio: videoGenerateAudio
                            }
                        })
                    });
                    const savedData = await saveResponse.json();

                    // 응답 상태 확인
                    if (!saveResponse.ok || savedData.error) {
                        throw new Error(savedData.error || `HTTP ${saveResponse.status}`);
                    }
                    console.log('[VideoGen] Saved to Supabase:', savedData);

                    // 아카이브에 추가
                    const newVideo = {
                        id: savedData.id || Date.now(),
                        image: savedData.image_url || data.video,
                        prompt: videoPrompt,
                        type: 'video',
                        createdAt: new Date(),
                        metadata: {
                            duration: videoDuration,
                            resolution: videoResolution,
                            aspectRatio: videoAspectRatio,
                            hasAudio: videoGenerateAudio
                        }
                    };
                    setImageHistory(prev => [newVideo, ...prev]);

                    // 포인트 차감
                    try {
                        await consumePoints(videoActionKey, {
                            prompt: videoPrompt?.substring(0, 50),
                            duration: videoDuration,
                            resolution: videoResolution
                        });
                        console.log('[Points] Deducted:', requiredPoints, 'for', videoActionKey);
                    } catch (pointErr) {
                        console.error('Failed to deduct points:', pointErr);
                    }
                } catch (saveErr) {
                    console.error('[VideoGen] Failed to save to Supabase:', saveErr);
                    // 저장 실패해도 영상은 보여줌 - 아카이브에 임시로 추가
                    const newVideo = {
                        id: Date.now(),
                        image: data.video,
                        prompt: videoPrompt,
                        type: 'video',
                        createdAt: new Date(),
                        metadata: {
                            duration: videoDuration,
                            resolution: videoResolution,
                            aspectRatio: videoAspectRatio,
                            hasAudio: videoGenerateAudio
                        }
                    };
                    setImageHistory(prev => [newVideo, ...prev]);
                }
            }

        } catch (err) {
            clearTimeout(timeoutId);
            console.error('[VideoGen] Error:', err);
            if (err.name === 'AbortError') {
                setError({
                    message: '영상 생성 시간이 초과되었습니다. 다시 시도해주세요. ⏳',
                    detail: null
                });
            } else {
                // friendlyMessage가 있으면 사용 (message + detail)
                setError({
                    message: err.message || '영상 생성 중 오류가 발생했습니다.',
                    detail: err.friendlyMessage?.detail || null
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 이미지를 JPEG로 변환 (AVIF 등 지원하지 않는 형식 처리)
    const convertImageToJpeg = (dataUrl) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.92));
            };
            img.onerror = () => resolve(dataUrl); // 변환 실패 시 원본 반환
            img.src = dataUrl;
        });
    };

    // 합성 사진 파일 업로드 핸들러
    const handleCompositeFileChange = async (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            let preview = event.target.result;

            // AVIF, HEIC 등 지원하지 않는 형식은 JPEG로 변환
            const unsupportedTypes = ['image/avif', 'image/heic', 'image/heif'];
            if (unsupportedTypes.includes(file.type)) {
                preview = await convertImageToJpeg(preview);
            }

            const imageData = {
                file,
                preview,
                name: file.name
            };

            switch (type) {
                case 'background':
                    setCompositeBackground(imageData);
                    break;
                case 'foreground':
                    setCompositeForeground(imageData);
                    break;
                case 'human':
                    setCompositeHuman(imageData);
                    break;
                case 'garment':
                    setCompositeGarment(imageData);
                    break;
                case 'source':
                    setCompositeSource(imageData);
                    break;
            }
        };
        reader.readAsDataURL(file);
    };

    // 합성 사진 드래그 핸들러
    const handleCompositeDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleCompositeDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleCompositeDrop = (e, type) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            let preview = event.target.result;

            // AVIF, HEIC 등 지원하지 않는 형식은 JPEG로 변환
            const unsupportedTypes = ['image/avif', 'image/heic', 'image/heif'];
            if (unsupportedTypes.includes(file.type)) {
                preview = await convertImageToJpeg(preview);
            }

            const imageData = {
                file,
                preview,
                name: file.name
            };

            switch (type) {
                case 'background':
                    setCompositeBackground(imageData);
                    break;
                case 'foreground':
                    setCompositeForeground(imageData);
                    break;
                case 'human':
                    setCompositeHuman(imageData);
                    break;
                case 'garment':
                    setCompositeGarment(imageData);
                    break;
                case 'source':
                    setCompositeSource(imageData);
                    break;
            }
        };
        reader.readAsDataURL(file);
    };

    // 합성 사진 생성 핸들러
    const handleCompositeGenerate = async () => {
        setCompositeLoading(true);
        setCompositeError(null);
        setCompositeResult(null);

        // activeSubMenu에서 실제 모드 결정
        const effectiveMode = activeSubMenu === 'location-composite' ? 'location'
            : activeSubMenu === 'virtual-tryon' ? 'tryon'
                : activeSubMenu === 'background-gen' ? 'background'
                    : compositeMode;

        try {
            let response;

            if (effectiveMode === 'location') {
                // Location Compositing (FLUX Fill)
                if (!compositeBackground || !compositeForeground) {
                    throw new Error('배경 이미지와 전경 이미지를 모두 업로드해주세요.');
                }

                response = await fetch('/api/composite-inpaint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: compositeBackground.preview,
                        mask: compositeForeground.preview,
                        prompt: '자연스럽게 합성해주세요'
                    })
                });
            } else if (effectiveMode === 'tryon') {
                // Virtual Try-On (IDM-VTON)
                if (!compositeHuman || !compositeGarment) {
                    throw new Error('인물 사진과 의류 이미지를 모두 업로드해주세요.');
                }

                response = await fetch('/api/virtual-tryon', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        humanImage: compositeHuman.preview,
                        garmentImage: compositeGarment.preview,
                        category: compositeGarmentCategory,
                        garmentDescription: compositeGarmentDescription
                    })
                });
            } else if (effectiveMode === 'background') {
                // Background Generation (Bria)
                if (!compositeSource) {
                    throw new Error('소스 이미지를 업로드해주세요.');
                }
                if (!compositeBackgroundPrompt.trim()) {
                    throw new Error('배경 설명을 입력해주세요.');
                }

                // 413 에러 방지: 이미지 압축 후 업로드 → URL로 전달
                console.log('[Composite] Uploading source image...');
                const uploadResult = await compressAndUploadImage(compositeSource.preview);

                if (!uploadResult.success) {
                    throw new Error(uploadResult.error || '이미지 업로드에 실패했습니다.');
                }

                console.log('[Composite] Image uploaded, calling generate-background API...');
                response = await fetch('/api/generate-background', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageUrl: uploadResult.imageUrl,
                        refPrompt: compositeBackgroundPrompt
                    })
                });
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.message || errorData.error || '합성 이미지 생성에 실패했습니다.';
                console.error('[Composite API Error]', errorData);
                throw new Error(errorMsg);
            }

            const data = await response.json();

            if (data.success && data.image) {
                setCompositeResult(data.image);
            } else {
                throw new Error(data.error || '이미지 생성에 실패했습니다.');
            }
        } catch (err) {
            console.error('Composite Generation Error:', err);
            setCompositeError(err.message || '합성 이미지 생성 중 오류가 발생했습니다.');
        } finally {
            setCompositeLoading(false);
        }
    };

    // 합성 결과 다운로드 핸들러
    const handleCompositeDownload = () => {
        if (!compositeResult) return;

        const link = document.createElement('a');
        link.href = compositeResult;
        link.download = `composite_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 합성 다시 시도 핸들러
    const handleCompositeRetry = () => {
        setCompositeResult(null);
        setCompositeError(null);
    };

    // 자동 생성 트리거 (홈에서 넘어왔을 때 - 이미지)
    useEffect(() => {
        if (activeMenu === 'image' && shouldAutoGenerateRef.current && prompt.trim() && !isLoading) {
            shouldAutoGenerateRef.current = false;
            // 약간의 딜레이로 UI 렌더링 후 실행
            const timer = setTimeout(() => {
                handleGenerate();
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [activeMenu]);

    // 자동 생성 트리거 (홈에서 넘어왔을 때 - 영상)
    useEffect(() => {
        if (activeMenu === 'video' && shouldAutoGenerateRef.current && videoPrompt.trim() && !isLoading) {
            shouldAutoGenerateRef.current = false;
            // 영상은 이미지가 필요하므로 자동 생성은 스킵하고 안내만
            // (text-to-video는 이미지 없이 프롬프트만으로 생성 가능하도록 향후 개선 필요)
        }
    }, [activeMenu]);

    // Copilot 채팅 메시지 전송
    const handleSendChat = async () => {
        if (!chatInput.trim() || isChatLoading) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsChatLoading(true);

        try {
            const response = await fetch(COPILOT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 텍스트로 먼저 읽고, JSON 파싱 시도
            const text = await response.text();
            let botResponse;
            try {
                const data = JSON.parse(text);
                botResponse = data?.body?.lastResponse || data?.lastResponse || data || '응답을 받지 못했습니다.';
                if (typeof botResponse !== 'string') {
                    botResponse = JSON.stringify(botResponse);
                }
            } catch {
                // JSON이 아니면 텍스트 그대로 사용
                botResponse = text || '응답을 받지 못했습니다.';
            }

            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: typeof botResponse === 'string' ? botResponse : JSON.stringify(botResponse)
            }]);
        } catch (err) {
            console.error('Copilot API Error:', err);
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: `오류가 발생했습니다: ${err.message}`
            }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // 채팅 스크롤 자동 이동
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        // ImageView가 사용하는 useImageGenStore에서 상태 가져오기
        const imageGenStore = useImageGenStore.getState();
        const storeUploadedImage = imageGenStore.uploadedImage;

        // image-to-image 모드에서는 이미지 필수 (store 상태 확인)
        if (activeSubMenu === 'image-to-image' && !storeUploadedImage) {
            setError('참고 이미지를 업로드해주세요.');
            return;
        }

        // 포인트 체크 및 차감
        const actionKey = getActionKey(activeSubMenu, quality);
        const requiredPoints = calculatePoints(actionKey, { model: selectedModel, quality });

        if (pointUsage.remaining < requiredPoints) {
            setError(`포인트가 부족합니다. (필요: ${requiredPoints}P, 남은 포인트: ${pointUsage.remaining}P)`);
            return;
        }

        console.log('[Generate] Starting with prompt:', prompt, `(${requiredPoints}P)`);

        setIsLoading(true);
        setError(null);

        // 타임아웃 설정 (image-to-image는 90초, 일반은 60초)
        const isImageToImage = activeSubMenu === 'image-to-image' && storeUploadedImage;
        const timeoutMs = isImageToImage ? 90000 : 60000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            // API 요청 바디 구성
            const requestBody = {
                prompt,
                aspectRatio,
                stylePreset,
                quality,
                model: selectedModel,
                negativePrompt: getCombinedNegativePrompt() || undefined
            };

            // image-to-image 모드에서는 참고 이미지 추가
            if (activeSubMenu === 'image-to-image' && storeUploadedImage) {
                requestBody.referenceImage = storeUploadedImage.preview;
            }

            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                // Flash 커뮤니케이터의 친화적 메시지가 있으면 사용
                const friendlyMsg = data.friendlyMessage?.message;
                throw new Error(friendlyMsg || data.error || 'Image generation failed');
            }

            // 이미지 생성 API에서 이미 Supabase에 저장됨
            const newImage = {
                id: data.savedImage?.id || Date.now(),
                image: data.image, // URL 또는 base64
                prompt: prompt,
                aspectRatio: aspectRatio,
                quality: data.debug?.quality || quality,
                createdAt: data.savedImage ? new Date(data.savedImage.created_at) : new Date(),
                imagenModel: data.debug?.imagenModel || 'Unknown',
                finalPrompt: data.debug?.finalPrompt || prompt,
                // Flash 커뮤니케이터 메시지 (폴백 시에만 존재)
                friendlyMessage: data.friendlyMessage || null,
                // 스타일 분석 관련 (비동기로 업데이트됨)
                detectedStyles: [],
                mood: null,
                colors: [],
                analysisStatus: 'pending', // pending → completed
            };

            // 로딩 먼저 끄고 이미지 추가
            setIsLoading(false);
            setImageHistory(prev => [newImage, ...prev]);

            // 폴백 메시지가 있으면 사용자에게 표시
            if (data.friendlyMessage?.message) {
                console.log('[Flash Communicator]', data.friendlyMessage.message);
                // 잠시 후 메시지 표시 (이미지가 먼저 보이도록)
                setTimeout(() => {
                    setError(data.friendlyMessage.message);
                    // 3초 후 자동으로 에러 메시지 제거
                    setTimeout(() => setError(null), 5000);
                }, 500);
            }

            // 비동기로 이미지 스타일 분석 요청
            if (data.savedImage?.id && data.image) {
                console.log('[Image] Starting async style analysis...');
                fetch('/api/analyze-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageId: data.savedImage.id,
                        imageUrl: data.image
                    })
                })
                    .then(res => res.json())
                    .then(analysisData => {
                        if (analysisData.success) {
                            console.log('[Analysis] Completed:', analysisData.analysis);
                            // 히스토리에서 해당 이미지 업데이트
                            setImageHistory(prev => prev.map(img =>
                                img.id === data.savedImage.id
                                    ? {
                                        ...img,
                                        detectedStyles: analysisData.analysis.styles || [],
                                        mood: analysisData.analysis.mood || null,
                                        colors: analysisData.analysis.colors || [],
                                        analysisStatus: 'completed'
                                    }
                                    : img
                            ));
                        }
                    })
                    .catch(err => console.error('[Analysis] Error:', err));
            }

            if (data.savedImage) {
                console.log('[Image] Saved to Supabase:', data.savedImage.id);
            } else {
                console.warn('[Image] Not saved to Supabase - local only');
            }

            // 포인트 차감
            try {
                await consumePoints(actionKey, {
                    prompt: prompt.substring(0, 100),
                    model: selectedModel,
                    quality,
                    imageId: data.savedImage?.id
                });
                console.log('[Points] Deducted:', requiredPoints, 'for', actionKey);
            } catch (pointErr) {
                console.error('Failed to deduct points:', pointErr);
            }
        } catch (err) {
            clearTimeout(timeoutId);
            console.error('Error:', err);
            if (err.name === 'AbortError') {
                setError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 날짜/시간 포맷
    const formatDateTime = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}.${month}.${day} ${hours}:${minutes}`;
    };

    // 홈 섹션 네비게이션 핸들러
    const handleHomeNavigate = (menu, subMenu, path) => {
        setActiveMenu(menu);
        setActiveSubMenu(subMenu);
        navigate(path);
    };

    // 워크플로우 스토어
    const { loadWorkflow, setNodes, setEdges } = useWorkflowStore();

    // 서브메뉴 클릭 → 노드 프리셋 로드 (기존 캔버스에 추가)
    const handleSubMenuClick = useCallback((menuKey) => {
        // 캐릭터 생성의 경우 Wave 모드로 전환
        if (menuKey === 'character-gen-studio') {
            const preset = getNodePreset('image', 'character-gen-studio');
            if (preset) {
                setNodes(prevNodes => {
                    const maxX = prevNodes.length > 0
                        ? Math.max(...prevNodes.map(n => n.position.x)) + 400
                        : 0;

                    const offsetNodes = preset.nodes.map(node => ({
                        ...node,
                        position: {
                            x: node.position.x + maxX,
                            y: node.position.y
                        }
                    }));
                    return [...prevNodes, ...offsetNodes];
                });
                setEdges(prevEdges => [...prevEdges, ...preset.edges]);
            }
            setActiveMenu('wave');
            setActiveSubMenu('editor');
            navigate('/wave');
            return;
        }

        setActiveSubMenu(menuKey);

        // 해당 기능의 노드 프리셋 가져오기
        const preset = getNodePreset(activeMenu === 'wave' ? 'image' : activeMenu, menuKey);
        if (preset) {
            // 기존 노드들의 위치를 고려해서 오프셋 계산
            setNodes(prevNodes => {
                // 기존 노드 중 가장 오른쪽 위치 찾기
                const maxX = prevNodes.length > 0
                    ? Math.max(...prevNodes.map(n => n.position.x)) + 400
                    : 0;

                // 새 노드들 위치 조정해서 추가
                const offsetNodes = preset.nodes.map(node => ({
                    ...node,
                    position: {
                        x: node.position.x + maxX,
                        y: node.position.y
                    }
                }));

                return [...prevNodes, ...offsetNodes];
            });

            // 엣지도 추가
            setEdges(prevEdges => [...prevEdges, ...preset.edges]);
        }
    }, [activeMenu, setNodes, setEdges, setActiveMenu, setActiveSubMenu, navigate]);

    // Wave 에디터로 이동 (워크플로우 로드)
    const handleNavigateToWave = useCallback(async (workflowId) => {
        setActiveMenu('wave');
        setActiveSubMenu('editor');
        navigate('/wave');

        // 워크플로우 ID가 있으면 로드
        if (workflowId) {
            try {
                await loadWorkflow(workflowId);
            } catch (error) {
                console.error('워크플로우 로드 실패:', error);
            }
        }
    }, [navigate, loadWorkflow]);

    // 현재 메뉴에 따른 제목 가져오기
    const getCurrentMenuTitle = () => {
        const menu = SIDEBAR_MENUS.find(m => m.key === activeMenu);
        if (!menu) return '';
        if (activeMenu === 'image') return '이미지 생성';
        if (activeMenu === 'tools') return '편집';
        if (activeMenu === 'video') return '영상 생성';
        if (activeMenu === 'library') return '내 라이브러리';
        if (activeMenu === 'design') return '템플릿';
        if (activeMenu === 'copilot') return '오렌지웨일 실험실';
        if (activeMenu === 'admin') return '관리자';
        return menu.label;
    };

    // 서브메뉴 가져오기 헬퍼
    const getSubMenus = () => {
        if (activeMenu === 'image') return IMAGE_SUB_MENUS.filter(m => !m.divider);
        if (activeMenu === 'tools') return TOOLS_SUB_MENUS;
        if (activeMenu === 'video') return VIDEO_SUB_MENUS;
        if (activeMenu === 'design') return DESIGN_SUB_MENUS;
        if (activeMenu === 'library') return LIBRARY_SUB_MENUS;
        return [];
    };

    return (
        <div className={styles.studioWrapper}>
            {/* ========== 메인 컨텐츠 ========== */}
            <div className={styles.mainContent}>
                <div className={styles.mainCard} onClick={() => activeMenu !== 'wave' && handleMenuChange('wave')}>
                    {/* Wave 노드 에디터 (항상 배경) */}
                    <WaveView onLightboxChange={setIsLightboxOpen} />

                    {/* 플로팅 서브메뉴 - wave가 아닐 때 표시, 라이트박스 열리면 숨김 */}
                    {activeMenu !== 'wave' && !isLightboxOpen && (
                        <div className={styles.floatingSubMenu} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.floatingSubMenuCard}>
                                {getSubMenus().map((menu) => (
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

                    {/* 하단 GNB - 라이트박스 열리면 숨김 */}
                    {!isLightboxOpen && (
                    <div className={styles.bottomGnb} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.bottomGnbCard}>
                            {/* 로고 */}
                            <div
                                className={styles.bottomGnbLogo}
                                onClick={() => handleMenuChange('wave')}
                                title="Wave"
                            >
                                <OrangeWhaleIcon size={28} />
                            </div>
                            {/* 네비게이션 */}
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
                            {/* 프로필 */}
                            <div
                                className={styles.bottomGnbProfile}
                                onClick={() => handleMenuChange('admin')}
                                title="관리자"
                            >
                                <img src="/images/profile-avatar.png" alt="윤국현" />
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            </div>

            {/* ========== 삭제 확인 모달 ========== */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onCancel={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                message={deleteTargetItem?.type === 'video'
                    ? "영상을 삭제하시겠습니까?"
                    : "이미지를 삭제하시겠습니까?"}
                confirmedMessage="삭제하였습니다"
                cancelText="아니오"
                confirmText="예"
                variant="delete"
            />

            {/* ========== 추천 확인 모달 ========== */}
            <ConfirmDialog
                isOpen={showFeaturedConfirm}
                onCancel={handleFeaturedCancel}
                onConfirm={handleFeaturedConfirm}
                message={featuredTargetItem?.is_featured
                    ? "홈 갤러리에서 제외하시겠습니까?"
                    : "이 작품을 홈 갤러리에 추천하시겠습니까?"}
                confirmedMessage={featuredTargetItem?.is_featured ? "추천이 해제되었습니다" : "홈 갤러리에 추가되었습니다"}
                cancelText="아니오"
                confirmText="예"
            />

            {/* ========== 라이트박스 ========== */}
            {lightboxImage && (
                <div className={styles.lightboxOverlay} onClick={() => setLightboxImage(null)}>
                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.lightboxImageWrapper}>
                            {lightboxImage.type === 'video' ? (
                                <video
                                    src={lightboxImage.image}
                                    controls
                                    autoPlay
                                    loop
                                    style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }}
                                />
                            ) : (
                                <img src={lightboxImage.image} alt={lightboxImage.prompt} />
                            )}
                        </div>
                        <button className={styles.lightboxClose} onClick={() => setLightboxImage(null)}>
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* ========== 이미지 피커 모달 ========== */}
            {showImagePicker && (
                <div className={styles.imagePickerOverlay} onClick={() => setShowImagePicker(false)}>
                    <div className={styles.imagePickerModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.imagePickerHeader}>
                            <h3>{imagePickerTarget === 'end' ? '마지막 이미지 선택' : '이미지 선택'}</h3>
                            <button className={styles.imagePickerClose} onClick={() => setShowImagePicker(false)}>✕</button>
                        </div>
                        <div className={styles.imagePickerGrid}>
                            <div
                                className={styles.imagePickerUploadBtn}
                                onClick={() => {
                                    setShowImagePicker(false);
                                    if (imagePickerTarget === 'end') {
                                        endImageInputRef.current?.click();
                                    } else {
                                        fileInputRef.current?.click();
                                    }
                                }}
                            >
                                <span className={styles.imagePickerUploadIcon}>+</span>
                                <span className={styles.imagePickerUploadText}>파일 업로드</span>
                            </div>
                            {imageHistory
                                .filter(item => item.type !== 'video')
                                .slice(0, imagePickerLimit)
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className={styles.imagePickerItem}
                                        onClick={() => handleSelectArchiveImage(item)}
                                    >
                                        <img src={item.image} alt={item.prompt} />
                                    </div>
                                ))}
                            {(imageHistory.filter(item => item.type !== 'video').length > imagePickerLimit || hasMoreImages) && (
                                <button
                                    className={styles.imagePickerLoadMoreBtn}
                                    onClick={() => {
                                        setImagePickerLimit(prev => prev + 18);
                                        if (imageHistory.filter(item => item.type !== 'video').length <= imagePickerLimit + 18 && hasMoreImages) {
                                            loadImages(false);
                                        }
                                    }}
                                    disabled={isLoadingMore}
                                >
                                    <span className={styles.imagePickerLoadMoreIcon}>{isLoadingMore ? '...' : '↓'}</span>
                                    <span className={styles.imagePickerLoadMoreText}>{isLoadingMore ? '불러오는 중' : '이미지 더보기'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ImageGenPage;
// force rebuild 2026년 2월 5일 목요일 18시 48분 KST (Import Fix)
// End of component

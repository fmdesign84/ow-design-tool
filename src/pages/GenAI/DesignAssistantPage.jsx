import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    OrangeWhaleIcon,
    UploadIcon,
    DesignGenIcon,
    ImageGenIcon,
    VideoGenIcon,
    LockIcon,
    FlaskIcon,
    // 목업 아이콘
    BannerHorizontalIcon,
    BannerVerticalIcon,
    BillboardIcon,
    PosterIcon,
    SocialSquareIcon,
    ImageRefIcon,
    MultiImageIcon
} from '../../components/common/Icons';
import { processImage } from '../../utils/imageUtils';
import styles from './ImageGenPage.module.css';

/**
 * DesignAssistantPage - 목업 이미지 생성기 v2
 * Gemini 3 Pro Image 기반 - 배경 제거 불필요, 단일 API 호출로 고품질 목업 생성
 */

// 스튜디오 메뉴
const STUDIO_MENUS = [
    { key: 'image', label: '이미지 생성', Icon: ImageGenIcon, path: '/image' },
    { key: 'video', label: '영상 생성', Icon: VideoGenIcon, path: '/video' },
    { key: 'design', label: '디자인 어시스턴트', Icon: DesignGenIcon, path: '/design' },
    { key: 'copilot', label: '오렌지웨일 실험실', Icon: FlaskIcon, path: '/copilot', locked: true },
];

// 목업 타입 프리셋 - 전문 광고 촬영 수준 프롬프트
const MOCKUP_PRESETS = [
    { key: 'banner-horizontal', label: '가로 배너', Icon: BannerHorizontalIcon, ratio: '16:9', description: '웹사이트 상단 배너, 광고 배너' },
    { key: 'banner-vertical', label: '세로 배너', Icon: BannerVerticalIcon, ratio: '9:16', description: '모바일 배너, 스토리' },
    { key: 'billboard', label: '빌보드', Icon: BillboardIcon, ratio: '16:9', description: '옥외 광고판, 도시 배경' },
    { key: 'poster', label: '포스터', Icon: PosterIcon, ratio: '3:4', description: '매거진 광고, 인쇄물' },
    { key: 'social-square', label: 'SNS', Icon: SocialSquareIcon, ratio: '1:1', description: '인스타그램, 라이프스타일' },
    { key: 'device-screen', label: '디바이스', Icon: ImageRefIcon, ratio: '16:9', description: '노트북/모니터 화면' },
    { key: 'packaging', label: '패키징', Icon: MultiImageIcon, ratio: '1:1', description: '제품 박스, 언박싱' },
];

const DesignAssistantPage = () => {
    const navigate = useNavigate();

    // 메뉴 상태
    const [activeMenu] = useState('design');

    // 목업 생성기 상태
    const [mockupFile, setMockupFile] = useState(null);
    const [mockupFileName, setMockupFileName] = useState('');
    const [mockupPreview, setMockupPreview] = useState('');
    const [selectedMockup, setSelectedMockup] = useState('banner-horizontal');
    const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
    const [mockupResult, setMockupResult] = useState(null);
    const mockupInputRef = useRef(null);

    // 에러 상태
    const [error, setError] = useState(null);

    // 메뉴 변경 핸들러
    const handleMenuChange = (menuKey) => {
        const menu = STUDIO_MENUS.find(m => m.key === menuKey);
        if (menu && !menu.locked && menu.path) {
            navigate(menu.path);
        }
    };

    // 목업 이미지 업로드 핸들러
    const handleMockupFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드 가능합니다.');
            return;
        }

        setMockupFile(file);
        setMockupFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => setMockupPreview(e.target.result);
        reader.readAsDataURL(file);
        setError(null);
    };

    // 목업 파일 제거
    const handleRemoveMockupFile = () => {
        setMockupFile(null);
        setMockupFileName('');
        setMockupPreview('');
        setMockupResult(null);
    };

    // 목업 이미지 생성 (Gemini 3 Pro Image - 단일 호출)
    const handleGenerateMockup = async () => {
        if (!mockupFile) {
            setError('제품 이미지를 먼저 업로드해주세요.');
            return;
        }

        setIsGeneratingMockup(true);
        setError(null);

        const mockupInfo = MOCKUP_PRESETS.find(m => m.key === selectedMockup);

        try {
            // 제품 이미지를 base64로 변환
            const rawDataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(mockupFile);
            });

            // 이미지 압축 (413 에러 방지)
            const productDataUrl = await processImage(rawDataUrl, {
                maxWidth: 1536,
                maxHeight: 1536,
                quality: 0.85,
                format: 'jpeg',
            });

            // Gemini 3 Pro Image API 호출 - 배경 제거 불필요
            const response = await fetch('/api/generate-mockup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productImage: productDataUrl,
                    mockupType: selectedMockup
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.friendlyMessage?.message || errData.error || '목업 생성 실패');
            }

            const result = await response.json();

            if (!result.image) {
                throw new Error('이미지 생성 결과가 없습니다.');
            }

            console.log('[Mockup v2]', result.debug);

            setMockupResult({
                id: Date.now(),
                imageUrl: result.image,
                prompt: `${mockupInfo.label} 목업`,
                type: 'mockup',
                mockupType: selectedMockup,
                mockupLabel: mockupInfo.label,
                debug: result.debug
            });

        } catch (err) {
            console.error('Mockup Generation Error:', err);
            setError(err.message || '목업 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGeneratingMockup(false);
        }
    };

    return (
        <div className={styles.studioContainer}>
            {/* 에러 메시지 */}
            {error && (
                <div className={styles.errorMessage}>
                    {error}
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* 1행: 메뉴 카드 */}
            <div className={styles.menuCardWrapper}>
                <div className={styles.tabHeader}>
                    <nav className={styles.tabNav}>
                        {STUDIO_MENUS.map((menu) => (
                            <button
                                key={menu.key}
                                className={`${styles.folderTab} ${activeMenu === menu.key ? styles.active : ''} ${menu.locked ? styles.locked : ''}`}
                                onClick={() => !menu.locked && handleMenuChange(menu.key)}
                                disabled={menu.locked}
                            >
                                <menu.Icon size={16} />
                                <span>{menu.label}</span>
                                {menu.locked && <LockIcon size={12} />}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className={`content-box ${styles.menuCard}`}>
                    <div className={styles.subMenuSection}>
                        <div className={styles.subMenuBar}>
                            <button className={`${styles.subMenuItem} ${styles.active}`}>
                                목업 이미지 생성하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2행: 3열 레이아웃 */}
            <div className={styles.bottomRow}>
                {/* 왼쪽: 옵션 카드 */}
                <div className={`content-box ${styles.optionsCard}`}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>옵션</span>
                    </div>
                    <div className={styles.optionsArea}>
                        <div className={styles.mockupContainer}>
                            {/* 파일 업로드 영역 */}
                            <input
                                type="file"
                                ref={mockupInputRef}
                                onChange={handleMockupFileUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />

                            {/* 제품 이미지 업로드 영역 */}
                            {!mockupPreview ? (
                                <div
                                    className={styles.mockupUploadZone}
                                    onClick={() => mockupInputRef.current?.click()}
                                >
                                    <UploadIcon size={32} />
                                    <h3>제품 이미지 업로드</h3>
                                    <p>목업에 합성할 제품 사진을 선택하세요</p>
                                    <span className={styles.mockupUploadHint}>
                                        배경 제거 불필요 - AI가 자동 인식
                                    </span>
                                </div>
                            ) : (
                                <div className={styles.mockupPreviewArea}>
                                    <img
                                        src={mockupPreview}
                                        alt="제품 이미지 미리보기"
                                        className={styles.mockupPreviewImage}
                                    />
                                    <button
                                        className={styles.mockupRemoveBtn}
                                        onClick={handleRemoveMockupFile}
                                    >
                                        ✕
                                    </button>
                                    <span className={styles.mockupFileName}>{mockupFileName}</span>
                                </div>
                            )}

                            {/* 목업 타입 선택 */}
                            <div className={styles.settingGroup} style={{ marginTop: '16px' }}>
                                <label className={styles.label}>목업 타입</label>
                                <div className={styles.mockupPresetGrid}>
                                    {MOCKUP_PRESETS.map((preset) => (
                                        <button
                                            key={preset.key}
                                            className={`${styles.mockupPresetBtn} ${selectedMockup === preset.key ? styles.active : ''}`}
                                            onClick={() => setSelectedMockup(preset.key)}
                                            title={preset.description}
                                            disabled={isGeneratingMockup}
                                        >
                                            <span className={styles.mockupPresetIcon}><preset.Icon size={20} /></span>
                                            <span className={styles.mockupPresetLabel}>{preset.label}</span>
                                            <span className={styles.mockupPresetRatio}>{preset.ratio}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 생성 버튼 */}
                            <button
                                className={styles.generateBtn}
                                onClick={handleGenerateMockup}
                                disabled={!mockupFile || isGeneratingMockup}
                                style={{ marginTop: '16px' }}
                            >
                                {isGeneratingMockup ? (
                                    <>
                                        <span className={styles.spinner} />
                                        목업 생성 중...
                                    </>
                                ) : (
                                    '목업 이미지 생성하기'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 가운데: 결과물 */}
                <div className={`content-box ${styles.imageCard}`}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>결과물</span>
                    </div>

                    {mockupResult ? (
                        <div className={styles.imageArea}>
                            <img
                                src={mockupResult.imageUrl}
                                alt={mockupResult.prompt}
                                className={styles.generatedImage}
                            />
                        </div>
                    ) : (
                        <div className={styles.imagePlaceholder}>
                            <OrangeWhaleIcon size={48} />
                            <span className={styles.placeholderText}>
                                제품 이미지를 업로드하고 목업을 생성하세요
                            </span>
                        </div>
                    )}
                </div>

                {/* 오른쪽: 아카이브 */}
                <div className={`content-box ${styles.archiveCard}`}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>아카이브</span>
                    </div>
                    <div className={styles.archiveArea}>
                        <div className={styles.archiveEmpty}>
                            <span>이 기능은 아카이브를 사용하지 않습니다</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignAssistantPage;

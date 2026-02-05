/**
 * ImageGenPage 목업 상수
 * 목업 카테고리, 프리셋, 샘플 이미지
 */
import {
    BannerHorizontalIcon,
    BannerVerticalIcon,
    BillboardIcon,
    PosterIcon,
    SocialSquareIcon,
    PresentationIcon,
    NamecardIcon,
    SignageIcon,
    MagazineIcon,
} from '../../../components/common/Icons';

// 목업 카테고리
export const MOCKUP_CATEGORIES = [
    { key: 'print', label: '인쇄물', icon: '🖨️' },
    { key: 'outdoor', label: '옥외광고', icon: '🏙️' },
    { key: 'booth', label: '부스', icon: '🏪' },
    { key: 'device', label: '디바이스', icon: '📱' },
    { key: 'packaging', label: '패키징', icon: '📦' },
    { key: 'goods', label: '굿즈', icon: '🎁' },
];

// 목업 타입 프리셋 (카테고리별 정리)
export const MOCKUP_PRESETS = [
    // 인쇄물
    { key: 'poster-a4', label: '포스터', Icon: PosterIcon, ratio: '3:4', category: 'print', description: '벽 부착/와이어' },
    { key: 'magazine-cover', label: '매거진', Icon: MagazineIcon, ratio: '3:4', category: 'print', description: '커피테이블 매거진' },
    { key: 'business-card', label: '명함', Icon: NamecardIcon, ratio: '16:9', category: 'print', description: '비즈니스 카드' },
    { key: 'brochure', label: '브로슈어', Icon: PresentationIcon, ratio: '4:3', category: 'print', description: '카탈로그, 안내문' },
    // 옥외광고
    { key: 'billboard', label: '빌보드', Icon: BillboardIcon, ratio: '16:9', category: 'outdoor', description: '도시 빌보드 광고' },
    { key: 'bus-shelter', label: '버스 정류장', Icon: SignageIcon, ratio: '9:16', category: 'outdoor', description: '버스 쉘터 광고' },
    { key: 'subway-interior', label: '지하철 내부', Icon: BannerHorizontalIcon, ratio: '16:9', category: 'outdoor', description: '좌석 윗부분 광고' },
    { key: 'subway-psd', label: '승강장 안전문', Icon: BannerHorizontalIcon, ratio: '16:9', category: 'outdoor', description: 'PSD 안전문 광고' },
    { key: 'storefront', label: '매장 간판', Icon: SignageIcon, ratio: '16:9', category: 'outdoor', description: '상점 파사드' },
    { key: 'building-wrap', label: '건물 랩핑', Icon: BillboardIcon, ratio: '9:16', category: 'outdoor', description: '대형 건물 광고' },
    { key: 'x-banner', label: 'X배너', Icon: BannerVerticalIcon, ratio: '9:16', category: 'outdoor', description: '세로 스탠드 배너' },
    { key: 'bus-wrap', label: '버스 광고', Icon: BannerHorizontalIcon, ratio: '21:9', category: 'outdoor', description: '버스 차량 측면 랩핑' },
    { key: 'taxi-door', label: '택시 광고', Icon: SignageIcon, ratio: '16:9', category: 'outdoor', description: '앞뒤문 래핑' },
    { key: 'frp-sculpture', label: 'FRP 조형물', Icon: SignageIcon, ratio: '1:1', category: 'outdoor', description: '야외 대형 캐릭터' },
    { key: 'giant-balloon-day', label: '벌룬 (낮)', Icon: SignageIcon, ratio: '1:1', category: 'outdoor', description: '대형 캐릭터 에어벌룬 - 주간' },
    { key: 'giant-balloon-night', label: '벌룬 (밤)', Icon: SignageIcon, ratio: '1:1', category: 'outdoor', description: '대형 캐릭터 에어벌룬 - 야간 조명' },
    // 부스
    { key: 'popup-outdoor', label: '팝업 (야외)', Icon: SignageIcon, ratio: '16:9', category: 'booth', description: '야외 임시 매장' },
    { key: 'popup-indoor', label: '팝업 (실내)', Icon: SignageIcon, ratio: '16:9', category: 'booth', description: '백화점/쇼핑몰 내' },
    { key: 'island-booth', label: '아일랜드', Icon: SocialSquareIcon, ratio: '1:1', category: 'booth', description: '쇼핑몰 중앙 부스' },
    { key: 'exhibition-booth', label: '전시 부스', Icon: PresentationIcon, ratio: '16:9', category: 'booth', description: '박람회/전시회' },
    { key: 'kiosk', label: '키오스크', Icon: BannerVerticalIcon, ratio: '9:16', category: 'booth', description: '사용자 인터랙션' },
    { key: 'info-desk', label: '안내데스크', Icon: PresentationIcon, ratio: '16:9', category: 'booth', description: '리셉션/안내 카운터' },
    // 디바이스
    { key: 'iphone-hand', label: '아이폰 (손)', Icon: SignageIcon, ratio: '9:16', category: 'device', description: '손에 들고' },
    { key: 'iphone-topview', label: '아이폰 (탑뷰)', Icon: SocialSquareIcon, ratio: '1:1', category: 'device', description: '플랫레이' },
    { key: 'macbook-screen', label: '맥북', Icon: PresentationIcon, ratio: '16:9', category: 'device', description: '웹사이트/앱' },
    { key: 'ipad-screen', label: '아이패드', Icon: PresentationIcon, ratio: '4:3', category: 'device', description: '태블릿 앱' },
    { key: 'tv-screen', label: 'TV 화면', Icon: BannerHorizontalIcon, ratio: '16:9', category: 'device', description: '스마트TV' },
    { key: 'watch-face', label: '애플워치', Icon: SocialSquareIcon, ratio: '1:1', category: 'device', description: '워치 페이스' },
    // 패키징
    { key: 'product-box', label: '제품 박스', Icon: SocialSquareIcon, ratio: '1:1', category: 'packaging', description: '3D 박스' },
    { key: 'shopping-bag-color', label: '쇼핑백 (포토인쇄)', Icon: PosterIcon, ratio: '3:4', category: 'packaging', description: '유광코팅, 이미지/일러스트' },
    { key: 'shopping-bag-kraft', label: '쇼핑백 (로고만)', Icon: PosterIcon, ratio: '3:4', category: 'packaging', description: '형압/금박/은박, 로고 중심' },
    { key: 'beverage-can', label: '음료 캔', Icon: PosterIcon, ratio: '3:4', category: 'packaging', description: '캔 음료' },
    { key: 'cake-box-kraft', label: '손잡이 박스 (크래프트)', Icon: SocialSquareIcon, ratio: '1:1', category: 'packaging', description: '크래프트 재질' },
    { key: 'cake-box-color', label: '손잡이 박스 (컬러)', Icon: SocialSquareIcon, ratio: '1:1', category: 'packaging', description: '컬러 인쇄' },
    { key: 'tshirt-front', label: '티셔츠 (전면)', Icon: SocialSquareIcon, ratio: '1:1', category: 'packaging', description: '가슴 중앙 프린트' },
    { key: 'tshirt-symbol', label: '티셔츠 (심볼)', Icon: SocialSquareIcon, ratio: '1:1', category: 'packaging', description: '왼쪽 가슴 로고' },
    { key: 'tshirt-staff', label: '티셔츠 (스태프)', Icon: SocialSquareIcon, ratio: '1:1', category: 'packaging', description: '뒷면 STAFF' },
    // 굿즈
    { key: 'ballpoint-pen', label: '볼펜', Icon: BannerHorizontalIcon, ratio: '16:9', category: 'goods', description: '기업 굿즈' },
    { key: 'sticker-sheet', label: '스티커', Icon: SocialSquareIcon, ratio: '1:1', category: 'goods', description: '다이컷 스티커' },
    { key: 'wristband', label: '입장 밴드', Icon: BannerHorizontalIcon, ratio: '16:9', category: 'goods', description: '이벤트/페스티벌' },
    { key: 'pin-button', label: '핀버튼', Icon: SocialSquareIcon, ratio: '1:1', category: 'goods', description: '동그란 버튼핀' },
    { key: 'metal-badge', label: '금속 뱃지', Icon: SocialSquareIcon, ratio: '1:1', category: 'goods', description: '에나멜 뱃지' },
    { key: 'keychain', label: '키링', Icon: SocialSquareIcon, ratio: '1:1', category: 'goods', description: '아크릴 키링' },
];

// 목업 스타일 목록 (추천 토글 시 분기용)
export const MOCKUP_STYLES = MOCKUP_PRESETS.map(p => p.key);

// 정적 목업 샘플 이미지 (동적 로딩 대체 - 37개 WebP 최적화)
export const STATIC_MOCKUP_SAMPLES = {
    // 인쇄물 (print)
    'poster-a4': '/images/mockups/poster-a4.webp',
    'magazine-cover': '/images/mockups/magazine-cover.webp',
    'business-card': '/images/mockups/business-card.webp',
    'brochure': '/images/mockups/brochure.webp',
    // 옥외광고 (outdoor)
    'billboard': '/images/mockups/billboard.webp',
    'bus-shelter': '/images/mockups/bus-shelter.webp',
    'subway-interior': '/images/mockups/subway-interior.webp',
    'subway-psd': '/images/mockups/subway-psd.webp',
    'storefront': '/images/mockups/storefront.webp',
    'building-wrap': '/images/mockups/building-wrap.webp',
    'x-banner': '/images/mockups/x-banner.webp',
    'bus-wrap': '/images/mockups/bus-wrap.webp',
    'taxi-door': '/images/mockups/taxi-door.webp',
    'giant-balloon-day': '/images/mockups/giant-balloon-day.webp',
    'giant-balloon-night': '/images/mockups/giant-balloon-night.webp',
    'frp-sculpture': '/images/mockups/frp-sculpture.png',
    // 부스 (booth)
    'popup-store': '/images/mockups/popup-store.webp',
    'popup-outdoor': '/images/mockups/popup-outdoor.png',
    'popup-indoor': '/images/mockups/popup-indoor.png',
    'island-booth': '/images/mockups/island-booth.webp',
    'exhibition-booth': '/images/mockups/exhibition-booth.webp',
    'kiosk': '/images/mockups/kiosk.webp',
    'info-desk': '/images/mockups/info-desk.webp',
    // 디바이스 (device)
    'iphone-hand': '/images/mockups/iphone-hand.webp',
    'iphone-topview': '/images/mockups/iphone-topview.webp',
    'macbook-screen': '/images/mockups/macbook-screen.webp',
    'ipad-screen': '/images/mockups/ipad-screen.webp',
    'tv-screen': '/images/mockups/tv-screen.webp',
    'watch-face': '/images/mockups/watch-face.webp',
    // 패키징 (packaging)
    'product-box': '/images/mockups/product-box.webp',
    'shopping-bag-color': '/images/mockups/shopping-bag-color.webp',
    'shopping-bag-kraft': '/images/mockups/shopping-bag-kraft.webp',
    'beverage-can': '/images/mockups/beverage-can.webp',
    'cake-box': '/images/mockups/cake-box.webp',
    'cake-box-kraft': '/images/mockups/cake-box-kraft.webp',
    'cake-box-color': '/images/mockups/cake-box-color.webp',
    'tshirt-print': '/images/mockups/tshirt-print.webp',
    'tshirt-front': '/images/mockups/tshirt-front.webp',
    'tshirt-symbol': '/images/mockups/tshirt-symbol.webp',
    'tshirt-staff': '/images/mockups/tshirt-staff.webp',
    // 굿즈 (goods)
    'ballpoint-pen': '/images/mockups/ballpoint-pen.webp',
    'sticker-sheet': '/images/mockups/sticker-sheet.webp',
    'wristband': '/images/mockups/wristband.webp',
    'pin-button': '/images/mockups/pin-button.webp',
    'metal-badge': '/images/mockups/metal-badge.webp',
    'keychain': '/images/mockups/keychain.webp',
};

// 디자인 이미지 확인 헬퍼 함수
export const isDesignImage = (item) => MOCKUP_STYLES.includes(item.style);

// 스타일을 카테고리로 매핑하는 헬퍼 함수
export const getStyleCategory = (style) => MOCKUP_PRESETS.find(p => p.key === style)?.category || null;

// 일반 이미지 확인 헬퍼 함수 (디자인/목업이 아닌 이미지)
export const isGeneralImage = (item) => item.type === 'image' && !isDesignImage(item);

// 이미지 서브카테고리 판별 헬퍼 함수 (style 기반)
export const getImageSubcategory = (item) => {
    if (!isGeneralImage(item)) return null;

    const style = item.style || '';

    // 증명사진
    if (style === 'idphoto') return 'idphoto';

    // 부분편집 (inpainting)
    if (['inpaint', 'inpainting', 'outpaint', 'outpainting'].includes(style)) return 'inpainting';

    // 합성사진 (배경 생성, 합성)
    if (['composite', 'background-gen', 'bg-gen'].includes(style)) return 'composite';

    // 텍스트로 생성 (기본값)
    return 'text-to-image';
};

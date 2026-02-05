/**
 * PurposeSelector 컴포넌트
 * 증명사진 용도 선택 화면 - 공인 증명사진 vs 프로필/포트폴리오
 */
import React from 'react';
import styles from './PurposeSelector.module.css';

// 카테고리 타입
export type PhotoCategory = 'official' | 'creative';

// 표정 옵션 타입
export interface ExpressionOption {
  id: string;
  name: string;
  description: string;
}

// 공인 증명사진 표정 (2개만)
export const OFFICIAL_EXPRESSIONS: ExpressionOption[] = [
  { id: 'neutral', name: '무표정', description: '여권/비자 등 공식 서류용' },
  { id: 'slight-smile', name: '살짝 미소', description: '자연스러운 미소' },
];

// 프로필/포트폴리오 표정 (다양)
export const CREATIVE_EXPRESSIONS: ExpressionOption[] = [
  { id: 'confident', name: '자신감', description: '당당하고 신뢰감 있는 표정' },
  { id: 'friendly', name: '친근한 미소', description: '따뜻하고 호감가는 미소' },
  { id: 'professional', name: '전문가적', description: '차분하고 전문적인 인상' },
  { id: 'approachable', name: '편안한', description: '부드럽고 편안한 분위기' },
  { id: 'dynamic', name: '활기찬', description: '에너지 넘치는 밝은 표정' },
  { id: 'thoughtful', name: '사려깊은', description: '지적이고 신중한 인상' },
];

// 용도 타입 정의
export interface PhotoPurpose {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  badge?: string;
  category: PhotoCategory;
  specs: {
    ratio: string;
    size: string;
    sizePx: string;
    background: string[];
    faceRatio?: string;      // 얼굴 비율
    earVisible?: boolean;    // 귀 노출 필수 여부
    expressions: ExpressionOption[];
  };
  requirements?: string[];   // 주요 요구사항
}

// 비자 규격 정보
export interface VisaSpec {
  country: string;
  countryCode: string;
  flag: string;
  size: string;
  sizeMM: string;
  sizePx: string;
  background: string;
  faceRatio?: string;
  requirements: string[];
}

export const VISA_SPECS: VisaSpec[] = [
  {
    country: '한국',
    countryCode: 'KR',
    flag: '🇰🇷',
    size: '3.5x4.5cm',
    sizeMM: '35x45mm',
    sizePx: '413x531px',
    background: '흰색',
    faceRatio: '71-80%',
    requirements: ['6개월 이내 촬영', '정면 응시', '귀 노출 필수', '무표정 또는 자연스러운 미소'],
  },
  {
    country: '미국',
    countryCode: 'US',
    flag: '🇺🇸',
    size: '2x2 inch',
    sizeMM: '51x51mm',
    sizePx: '600x600px',
    background: '흰색/오프화이트',
    faceRatio: '50-69%',
    requirements: ['안경 착용 불가', '6개월 이내 촬영', '정면 응시'],
  },
  {
    country: '일본',
    countryCode: 'JP',
    flag: '🇯🇵',
    size: '4.5x3.5cm',
    sizeMM: '45x35mm',
    sizePx: '531x413px',
    background: '흰색/연회색',
    requirements: ['6개월 이내 촬영', '정면 응시', '무배경'],
  },
  {
    country: '중국',
    countryCode: 'CN',
    flag: '🇨🇳',
    size: '3.3x4.8cm',
    sizeMM: '33x48mm',
    sizePx: '390x567px',
    background: '흰색',
    requirements: ['귀 노출 필수', '6개월 이내 촬영', '정면 응시'],
  },
  {
    country: 'EU/쉥겐',
    countryCode: 'EU',
    flag: '🇪🇺',
    size: '3.5x4.5cm',
    sizeMM: '35x45mm',
    sizePx: '413x531px',
    background: '흰색~연회색',
    faceRatio: '70-80%',
    requirements: ['6개월 이내 촬영', '얼굴 70-80%', '중립적 표정'],
  },
];

// 공인 증명사진 목록
export const OFFICIAL_PURPOSES: PhotoPurpose[] = [
  {
    id: 'passport',
    name: '여권',
    icon: '🛂',
    description: '해외여행, 비자 신청용',
    color: '#1976D2',
    badge: '엄격',
    category: 'official',
    specs: {
      ratio: '7:9',
      size: '3.5x4.5cm',
      sizePx: '413x531px',
      background: ['흰색'],
      faceRatio: '71-80%',
      earVisible: true,
      expressions: OFFICIAL_EXPRESSIONS,
    },
    requirements: ['얼굴 비율 71-80%', '귀 노출 필수', '6개월 이내 촬영', '무표정/살짝 미소'],
  },
  {
    id: 'resident-id',
    name: '주민등록증',
    icon: '🪪',
    description: '주민등록증 발급/갱신',
    color: '#388E3C',
    category: 'official',
    specs: {
      ratio: '7:9',
      size: '3.5x4.5cm',
      sizePx: '413x531px',
      background: ['흰색'],
      earVisible: false,
      expressions: OFFICIAL_EXPRESSIONS,
    },
    requirements: ['6개월 이내 촬영', '정면 응시', '자연스러운 표정 가능'],
  },
  {
    id: 'driver-license',
    name: '운전면허증',
    icon: '🚗',
    description: '운전면허 발급/갱신',
    color: '#7B1FA2',
    category: 'official',
    specs: {
      ratio: '3:4',
      size: '3x4cm',
      sizePx: '354x472px',
      background: ['흰색'],
      expressions: OFFICIAL_EXPRESSIONS,
    },
    requirements: ['6개월 이내 촬영', '정면 응시'],
  },
  {
    id: 'resume',
    name: '이력서/취업',
    icon: '📋',
    description: '입사지원, 취업용',
    color: '#F57C00',
    badge: '추천',
    category: 'official',
    specs: {
      ratio: '3:4',
      size: '3x4cm',
      sizePx: '354x472px',
      background: ['흰색', '연회색'],
      expressions: OFFICIAL_EXPRESSIONS,
    },
    requirements: ['단정한 복장', '자연스러운 미소 권장'],
  },
  {
    id: 'visa',
    name: '출장 비자',
    icon: '✈️',
    description: '국가별 규격 자동 적용',
    color: '#00796B',
    badge: '규격보장',
    category: 'official',
    specs: {
      ratio: '국가별',
      size: '국가별 상이',
      sizePx: '국가별 상이',
      background: ['흰색'],
      expressions: OFFICIAL_EXPRESSIONS,
    },
    requirements: ['국가별 규격 자동 적용', '반려 시 무료 재생성'],
  },
];

// 프로필/포트폴리오 목록
export const CREATIVE_PURPOSES: PhotoPurpose[] = [
  {
    id: 'company-profile',
    name: '사내 프로필',
    icon: '👤',
    description: '인트라넷, 조직도, 사원증',
    color: '#5C6BC0',
    category: 'creative',
    specs: {
      ratio: '1:1',
      size: '자유',
      sizePx: '800x800px',
      background: ['흰색', '연회색', '연파랑', '그라데이션'],
      expressions: CREATIVE_EXPRESSIONS,
    },
  },
  {
    id: 'presenter',
    name: '발표자 소개',
    icon: '🎤',
    description: '컨퍼런스, 웨비나, 강연',
    color: '#E53935',
    badge: '인기',
    category: 'creative',
    specs: {
      ratio: '1:1',
      size: '자유',
      sizePx: '1000x1000px',
      background: ['흰색', '연회색', '그라데이션', '컬러'],
      expressions: CREATIVE_EXPRESSIONS,
    },
  },
  {
    id: 'business-card',
    name: '명함/비즈니스',
    icon: '💼',
    description: '명함, 이메일 서명, 프로필',
    color: '#FF8F00',
    category: 'creative',
    specs: {
      ratio: '1:1',
      size: '자유',
      sizePx: '600x600px',
      background: ['흰색', '연회색'],
      expressions: CREATIVE_EXPRESSIONS,
    },
  },
  {
    id: 'portfolio',
    name: '포트폴리오',
    icon: '🎨',
    description: 'LinkedIn, 개인 웹사이트',
    color: '#00ACC1',
    category: 'creative',
    specs: {
      ratio: '자유',
      size: '자유',
      sizePx: '1200x1200px',
      background: ['흰색', '연회색', '그라데이션', '컬러', '스튜디오'],
      expressions: CREATIVE_EXPRESSIONS,
    },
  },
];

// 전체 목록 (하위 호환)
export const PHOTO_PURPOSES: PhotoPurpose[] = [...OFFICIAL_PURPOSES, ...CREATIVE_PURPOSES];

// 카테고리 정보 (자유사진은 별도 메뉴로 분리됨)
export const PHOTO_CATEGORIES = [
  {
    id: 'official' as PhotoCategory,
    name: '공인 증명사진',
    icon: '🏛️',
    description: '정해진 규격, 엄격한 기준',
    color: '#1976D2',
    badge: '규격 보장',
    purposes: OFFICIAL_PURPOSES,
  },
];

interface PurposeSelectorProps {
  onSelect: (purpose: PhotoPurpose) => void;
  onCategorySelect?: (category: PhotoCategory) => void;
  selectedPurpose?: PhotoPurpose | null;
}

export const PurposeSelector: React.FC<PurposeSelectorProps> = ({
  onSelect,
  onCategorySelect,
  selectedPurpose,
}) => {
  // 공인 증명사진만 남았으므로 바로 용도 선택 화면 표시
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>어떤 증명사진이 필요하세요?</h2>
          <p className={styles.subtitle}>용도에 맞는 규격으로 자동 적용됩니다</p>
        </div>
      </div>

      <div className={styles.grid}>
        {OFFICIAL_PURPOSES.map((purpose) => (
          <button
            key={purpose.id}
            className={`${styles.purposeCard} ${selectedPurpose?.id === purpose.id ? styles.selected : ''}`}
            onClick={() => onSelect(purpose)}
            style={{ '--accent-color': purpose.color } as React.CSSProperties}
          >
            <span className={styles.purposeIcon}>{purpose.icon}</span>
            <div className={styles.purposeText}>
              <span className={styles.purposeName}>{purpose.name}</span>
              <span className={styles.purposeDesc}>{purpose.description}</span>
              {purpose.specs && (
                <span className={styles.purposeSpec}>
                  {purpose.specs.size} · {purpose.specs.ratio}
                </span>
              )}
            </div>
            {purpose.badge && (
              <span className={styles.badge}>{purpose.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PurposeSelector;

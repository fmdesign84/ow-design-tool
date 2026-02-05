/**
 * StyleSelector 컴포넌트
 * 제품 사진 스타일 선택 화면 - 5가지 스타일 옵션
 */
import React from 'react';
import styles from './StyleSelector.module.css';

// 스타일 타입 정의
export type ProductStyleKey = 'studio' | 'lifestyle' | 'floating' | 'seasonal' | 'minimal';

// 계절 옵션 타입
export interface SeasonOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// 계절 옵션 목록
export const SEASON_OPTIONS: SeasonOption[] = [
  { id: 'spring', name: '봄', description: '벚꽃, 새싹, 따뜻한 분위기', icon: '🌸' },
  { id: 'summer', name: '여름', description: '시원한 바다, 청량감', icon: '☀️' },
  { id: 'autumn', name: '가을', description: '단풍, 따뜻한 톤', icon: '🍂' },
  { id: 'winter', name: '겨울', description: '눈, 크리스마스 분위기', icon: '❄️' },
];

// 스튜디오 배경색 옵션
export interface BackgroundColorOption {
  id: string;
  name: string;
  color: string;
}

export const STUDIO_BACKGROUND_COLORS: BackgroundColorOption[] = [
  { id: 'white', name: '화이트', color: '#FFFFFF' },
  { id: 'light-gray', name: '라이트 그레이', color: '#F5F5F5' },
  { id: 'soft-pink', name: '소프트 핑크', color: '#FFF0F5' },
  { id: 'soft-blue', name: '소프트 블루', color: '#F0F8FF' },
  { id: 'cream', name: '크림', color: '#FFFDD0' },
];

// 제품 스타일 타입 정의
export interface ProductStyle {
  key: ProductStyleKey;
  name: string;
  icon: string;
  description: string;
  color: string;
  badge?: string;
  promptTemplate: string;
  subOptions?: {
    type: 'season' | 'color';
    options: SeasonOption[] | BackgroundColorOption[];
  };
}

// 제품 사진 스타일 목록
export const PRODUCT_STYLES: ProductStyle[] = [
  {
    key: 'studio',
    name: '스튜디오',
    icon: '📷',
    description: '깔끔한 단색 배경, 전문적인 조명',
    color: '#1976D2',
    badge: '인기',
    promptTemplate: 'Product photo on clean {color} studio background with soft lighting, professional product photography, high-end commercial look',
    subOptions: {
      type: 'color',
      options: STUDIO_BACKGROUND_COLORS,
    },
  },
  {
    key: 'lifestyle',
    name: '라이프스타일',
    icon: '🏠',
    description: '실제 사용 환경에서의 자연스러운 연출',
    color: '#388E3C',
    badge: '추천',
    promptTemplate: 'Product in real lifestyle setting, natural environment, editorial style photography, warm ambient lighting, cozy atmosphere',
  },
  {
    key: 'floating',
    name: '플로팅',
    icon: '✨',
    description: '떠있는 느낌의 역동적인 구도',
    color: '#7B1FA2',
    promptTemplate: 'Product floating in air with soft shadow below, minimal background, levitation effect, dynamic composition, professional studio lighting',
  },
  {
    key: 'seasonal',
    name: '계절/시즌',
    icon: '🎄',
    description: '봄, 여름, 가을, 겨울 테마 배경',
    color: '#F57C00',
    promptTemplate: '{season} themed product photo with seasonal decorations and atmosphere, festive mood, harmonious color palette',
    subOptions: {
      type: 'season',
      options: SEASON_OPTIONS,
    },
  },
  {
    key: 'minimal',
    name: '미니멀',
    icon: '◻️',
    description: '단순한 기하학적 배경과 드라마틱 조명',
    color: '#00796B',
    promptTemplate: 'Minimalist product photography, simple geometric background, dramatic studio lighting, clean aesthetic, modern design',
  },
];

interface StyleSelectorProps {
  onSelect: (style: ProductStyle, subOption?: SeasonOption | BackgroundColorOption) => void;
  selectedStyle?: ProductStyle | null;
  selectedSubOption?: SeasonOption | BackgroundColorOption | null;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  onSelect,
  selectedStyle,
  selectedSubOption,
}) => {
  const [expandedStyle, setExpandedStyle] = React.useState<ProductStyleKey | null>(null);

  const handleStyleClick = (style: ProductStyle) => {
    if (style.subOptions) {
      // 서브옵션이 있는 경우 확장/축소 토글
      setExpandedStyle(expandedStyle === style.key ? null : style.key);
    } else {
      // 서브옵션이 없는 경우 바로 선택
      onSelect(style);
    }
  };

  const handleSubOptionClick = (style: ProductStyle, subOption: SeasonOption | BackgroundColorOption) => {
    onSelect(style, subOption);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>어떤 스타일로 촬영할까요?</h2>
          <p className={styles.subtitle}>제품에 맞는 배경 스타일을 선택하세요</p>
        </div>
      </div>

      <div className={styles.grid}>
        {PRODUCT_STYLES.map((style) => (
          <div key={style.key} className={styles.styleWrapper}>
            <button
              className={`${styles.styleCard} ${selectedStyle?.key === style.key ? styles.selected : ''} ${expandedStyle === style.key ? styles.expanded : ''}`}
              onClick={() => handleStyleClick(style)}
              style={{ '--accent-color': style.color } as React.CSSProperties}
            >
              <span className={styles.styleIcon}>{style.icon}</span>
              <div className={styles.styleText}>
                <span className={styles.styleName}>{style.name}</span>
                <span className={styles.styleDesc}>{style.description}</span>
              </div>
              {style.badge && (
                <span className={styles.badge}>{style.badge}</span>
              )}
              {style.subOptions && (
                <span className={`${styles.expandIcon} ${expandedStyle === style.key ? styles.rotated : ''}`}>
                  ▼
                </span>
              )}
            </button>

            {/* 서브옵션 표시 */}
            {style.subOptions && expandedStyle === style.key && (
              <div className={styles.subOptionsContainer}>
                {style.subOptions.type === 'season' && (
                  <div className={styles.subOptionsGrid}>
                    {(style.subOptions.options as SeasonOption[]).map((season) => (
                      <button
                        key={season.id}
                        className={`${styles.subOptionCard} ${selectedSubOption && 'id' in selectedSubOption && selectedSubOption.id === season.id ? styles.selected : ''}`}
                        onClick={() => handleSubOptionClick(style, season)}
                      >
                        <span className={styles.subOptionIcon}>{season.icon}</span>
                        <span className={styles.subOptionName}>{season.name}</span>
                        <span className={styles.subOptionDesc}>{season.description}</span>
                      </button>
                    ))}
                  </div>
                )}
                {style.subOptions.type === 'color' && (
                  <div className={styles.colorOptionsGrid}>
                    {(style.subOptions.options as BackgroundColorOption[]).map((colorOpt) => (
                      <button
                        key={colorOpt.id}
                        className={`${styles.colorOptionCard} ${selectedSubOption && 'color' in selectedSubOption && selectedSubOption.id === colorOpt.id ? styles.selected : ''}`}
                        onClick={() => handleSubOptionClick(style, colorOpt)}
                      >
                        <span
                          className={styles.colorSwatch}
                          style={{ backgroundColor: colorOpt.color }}
                        />
                        <span className={styles.colorName}>{colorOpt.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>🎨</span>
          <div className={styles.infoContent}>
            <strong>AI 배경 생성</strong>
            <p>선택한 스타일에 맞는 배경을 AI가 자동 생성합니다</p>
          </div>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>🔄</span>
          <div className={styles.infoContent}>
            <strong>무제한 재생성</strong>
            <p>마음에 들지 않으면 다른 스타일로 다시 생성하세요</p>
          </div>
        </div>
      </div>

      <div className={styles.noteCard}>
        <span className={styles.noteIcon}>💡</span>
        <p>제품의 특성에 따라 가장 잘 어울리는 스타일이 다릅니다. 여러 스타일을 시도해 보세요!</p>
      </div>
    </div>
  );
};

export default StyleSelector;

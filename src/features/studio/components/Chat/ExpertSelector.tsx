/**
 * ExpertSelector 컴포넌트
 * 전문가 챗봇 선택 화면
 */
import React from 'react';
import styles from './ExpertSelector.module.css';

// 전문가 페르소나 정의
export interface ExpertPersona {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  welcomeMessage: string;
  suggestedPrompts: string[];
}

export const EXPERT_PERSONAS: ExpertPersona[] = [
  {
    id: 'thumbnail',
    name: '썸네일 마스터',
    icon: '🎬',
    description: '유튜브/블로그 썸네일',
    color: '#FF0000',
    welcomeMessage: '안녕하세요! 어떤 콘텐츠의 썸네일을 만들까요?',
    suggestedPrompts: ['영상 리뷰', '튜토리얼', '브이로그', '뉴스/정보'],
  },
  {
    id: 'presentation',
    name: 'PPT 디자이너',
    icon: '📊',
    description: '슬라이드 이미지, 도해',
    color: '#FF6B00',
    welcomeMessage: '발표 자료를 위한 이미지를 만들어 드릴게요. 어떤 발표인가요?',
    suggestedPrompts: ['사업 제안', '분기 보고', '신제품 소개', '팀 소개'],
  },
  {
    id: 'social',
    name: 'SNS 마케터',
    icon: '📱',
    description: '인스타 피드/스토리',
    color: '#E1306C',
    welcomeMessage: '어떤 SNS 콘텐츠를 만들까요?',
    suggestedPrompts: ['인스타 피드', '스토리/릴스', '카드뉴스', '이벤트 공지'],
  },
  {
    id: 'product',
    name: '제품 사진가',
    icon: '📦',
    description: '제품 목업, 상세 이미지',
    color: '#00C853',
    welcomeMessage: '제품 이미지를 전문적으로 만들어 드릴게요. 어떤 제품인가요?',
    suggestedPrompts: ['상품 상세', '목업 합성', '라이프스타일', '패키지'],
  },
  {
    id: 'banner',
    name: '배너 크리에이터',
    icon: '🖼️',
    description: '웹/앱 배너, 광고',
    color: '#2196F3',
    welcomeMessage: '어디에 사용할 배너인가요?',
    suggestedPrompts: ['웹사이트 메인', '이벤트 팝업', '앱 스토어', 'GDN 광고'],
  },
  {
    id: 'idphoto',
    name: '증명사진 스튜디오',
    icon: '👔',
    description: '증명사진, 프로필',
    color: '#607D8B',
    welcomeMessage: '프로필 사진을 만들어 드릴게요. 사진을 업로드해주세요!',
    suggestedPrompts: ['증명사진', '비즈니스 프로필', 'SNS 프로필', '캐주얼'],
  },
  {
    id: 'video',
    name: '영상 프로듀서',
    icon: '🎥',
    description: '짧은 홍보 영상, 릴스',
    color: '#9C27B0',
    welcomeMessage: '어떤 영상을 만들까요?',
    suggestedPrompts: ['제품 홍보', '이벤트 안내', '브랜드 소개', '릴스/숏츠'],
  },
  {
    id: 'brand',
    name: '브랜드 가디언',
    icon: '🏢',
    description: '가이드라인 준수 콘텐츠',
    color: '#FF9800',
    welcomeMessage: '브랜드 가이드라인에 맞는 콘텐츠를 만들어 드릴게요. 먼저 Brand Kit를 확인할까요?',
    suggestedPrompts: ['로고 활용', '컬러 시스템', '템플릿 생성', '가이드 체크'],
  },
];

interface ExpertSelectorProps {
  onSelect: (expert: ExpertPersona) => void;
  onFreeMode?: () => void;
}

export const ExpertSelector: React.FC<ExpertSelectorProps> = ({
  onSelect,
  onFreeMode,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>어떤 작업을 도와드릴까요?</h2>
        <p className={styles.subtitle}>전문가를 선택하면 맞춤 가이드를 받을 수 있어요</p>
      </div>

      <div className={styles.grid}>
        {EXPERT_PERSONAS.map((expert) => (
          <button
            key={expert.id}
            className={styles.expertCard}
            onClick={() => onSelect(expert)}
            style={{ '--accent-color': expert.color } as React.CSSProperties}
          >
            <span className={styles.expertIcon}>{expert.icon}</span>
            <span className={styles.expertName}>{expert.name}</span>
            <span className={styles.expertDesc}>{expert.description}</span>
          </button>
        ))}
      </div>

      {onFreeMode && (
        <div className={styles.freeMode}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>또는</span>
          <span className={styles.dividerLine} />
        </div>
      )}

      {onFreeMode && (
        <button className={styles.freeModeBtn} onClick={onFreeMode}>
          자유롭게 대화하기
        </button>
      )}
    </div>
  );
};

export default ExpertSelector;

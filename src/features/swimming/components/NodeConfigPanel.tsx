/**
 * Swimming Node Config Panel
 * 노드 설정 패널 - 선택된 노드의 속성 편집
 * Zinc 다크 테마 + 접기/펼치기 기능
 */

import React, { useCallback, useState } from 'react';
import type { SwimmingNodeData } from '../types';
import { swimmingNodeRegistry } from '../nodes/registry';
import styles from './NodeConfigPanel.module.css';

// 아이콘 컴포넌트
const ChevronUpIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

const ChevronDownIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

interface NodeConfigPanelProps {
  selectedNode: {
    id: string;
    data: SwimmingNodeData;
  } | null;
  onConfigChange: (nodeId: string, config: Record<string, unknown>) => void;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  selectedNode,
  onConfigChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  // 훅은 조건문 전에 호출해야 함
  const handleChange = useCallback(
    (key: string, value: unknown) => {
      if (!selectedNode) return;
      onConfigChange(selectedNode.id, {
        ...selectedNode.data.config,
        [key]: value,
      });
    },
    [selectedNode, onConfigChange]
  );

  if (!selectedNode) {
    return null; // 선택된 노드가 없으면 패널 숨김
  }

  const nodeDef = swimmingNodeRegistry.get(selectedNode.data.nodeId);
  if (!nodeDef) return null;

  // 노드 타입별 설정 UI 렌더링
  const renderConfig = () => {
    switch (selectedNode.data.nodeId) {
      case 'text-input':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>텍스트</label>
            <textarea
              className={styles.textarea}
              value={String(selectedNode.data.config?.text || '')}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="텍스트를 입력하세요..."
              rows={5}
            />
            <label className={styles.label}>레벨</label>
            <select
              className={styles.select}
              value={String(selectedNode.data.config?.level || 'body')}
              onChange={(e) => handleChange('level', e.target.value)}
            >
              <option value="h1">제목 (H1)</option>
              <option value="h2">부제목 (H2)</option>
              <option value="h3">소제목 (H3)</option>
              <option value="body">본문</option>
              <option value="caption">캡션</option>
            </select>
          </div>
        );

      case 'ai-text':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>프롬프트</label>
            <textarea
              className={styles.textarea}
              value={String(selectedNode.data.config?.prompt || '')}
              onChange={(e) => handleChange('prompt', e.target.value)}
              placeholder="AI에게 생성할 텍스트를 설명하세요..."
              rows={4}
            />
            <label className={styles.label}>톤</label>
            <select
              className={styles.select}
              value={String(selectedNode.data.config?.tone || 'professional')}
              onChange={(e) => handleChange('tone', e.target.value)}
            >
              <option value="professional">전문적</option>
              <option value="casual">캐주얼</option>
              <option value="friendly">친근한</option>
              <option value="formal">격식체</option>
            </select>
            <label className={styles.label}>길이</label>
            <select
              className={styles.select}
              value={String(selectedNode.data.config?.length || 'medium')}
              onChange={(e) => handleChange('length', e.target.value)}
            >
              <option value="short">짧게</option>
              <option value="medium">보통</option>
              <option value="long">길게</option>
            </select>
          </div>
        );

      case 'image-input':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>이미지 URL</label>
            <input
              type="text"
              className={styles.input}
              value={String(selectedNode.data.config?.url || '')}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://..."
            />
            <label className={styles.label}>대체 텍스트</label>
            <input
              type="text"
              className={styles.input}
              value={String(selectedNode.data.config?.alt || '')}
              onChange={(e) => handleChange('alt', e.target.value)}
              placeholder="이미지 설명"
            />
            <label className={styles.label}>맞춤</label>
            <select
              className={styles.select}
              value={String(selectedNode.data.config?.objectFit || 'cover')}
              onChange={(e) => handleChange('objectFit', e.target.value)}
            >
              <option value="cover">채우기</option>
              <option value="contain">맞춤</option>
              <option value="fill">늘리기</option>
            </select>
          </div>
        );

      case 'ai-image':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>프롬프트</label>
            <textarea
              className={styles.textarea}
              value={String(selectedNode.data.config?.prompt || '')}
              onChange={(e) => handleChange('prompt', e.target.value)}
              placeholder="생성할 이미지를 설명하세요..."
              rows={4}
            />
            <label className={styles.label}>스타일</label>
            <select
              className={styles.select}
              value={String(selectedNode.data.config?.style || 'photo')}
              onChange={(e) => handleChange('style', e.target.value)}
            >
              <option value="photo">사진</option>
              <option value="illustration">일러스트</option>
              <option value="3d">3D</option>
              <option value="vector">벡터</option>
            </select>
          </div>
        );

      case 'chart':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>차트 유형</label>
            <select
              className={styles.select}
              value={String(selectedNode.data.config?.chartType || 'bar')}
              onChange={(e) => handleChange('chartType', e.target.value)}
            >
              <option value="bar">막대</option>
              <option value="line">선</option>
              <option value="pie">파이</option>
              <option value="doughnut">도넛</option>
            </select>
            <label className={styles.label}>제목</label>
            <input
              type="text"
              className={styles.input}
              value={String(selectedNode.data.config?.title || '')}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="차트 제목"
            />
          </div>
        );

      case 'table':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>열 개수</label>
            <input
              type="number"
              className={styles.input}
              value={Number(selectedNode.data.config?.columns || 3)}
              onChange={(e) => handleChange('columns', parseInt(e.target.value))}
              min={1}
              max={10}
            />
            <label className={styles.label}>행 개수</label>
            <input
              type="number"
              className={styles.input}
              value={Number(selectedNode.data.config?.rows || 4)}
              onChange={(e) => handleChange('rows', parseInt(e.target.value))}
              min={1}
              max={20}
            />
          </div>
        );

      case 'hero-layout':
      case 'two-column-layout':
      case 'three-column-layout':
      case 'grid-layout':
      case 'data-layout':
      case 'cta-layout':
      case 'blank-layout':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>배경색</label>
            <input
              type="color"
              className={styles.colorInput}
              value={String(selectedNode.data.config?.backgroundColor || '#1E1E1E')}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
            />
            <label className={styles.label}>패딩</label>
            <input
              type="range"
              className={styles.range}
              value={Number(selectedNode.data.config?.padding || 40)}
              onChange={(e) => handleChange('padding', parseInt(e.target.value))}
              min={0}
              max={100}
            />
            <span className={styles.rangeValue}>
              {Number(selectedNode.data.config?.padding || 40)}px
            </span>
          </div>
        );

      case 'brand-kit':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>브랜드 이름</label>
            <input
              type="text"
              className={styles.input}
              value={String(selectedNode.data.config?.name || '')}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="브랜드 이름"
            />
            <label className={styles.label}>기본 색상</label>
            <input
              type="color"
              className={styles.colorInput}
              value={String(selectedNode.data.config?.primaryColor || '#3B82F6')}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
            />
            <label className={styles.label}>보조 색상</label>
            <input
              type="color"
              className={styles.colorInput}
              value={String(selectedNode.data.config?.secondaryColor || '#64748B')}
              onChange={(e) => handleChange('secondaryColor', e.target.value)}
            />
            <label className={styles.label}>강조 색상</label>
            <input
              type="color"
              className={styles.colorInput}
              value={String(selectedNode.data.config?.accentColor || '#F59E0B')}
              onChange={(e) => handleChange('accentColor', e.target.value)}
            />
          </div>
        );

      case 'theme':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>테마 프리셋</label>
            <select
              className={styles.select}
              value={String(selectedNode.data.config?.preset || 'dark')}
              onChange={(e) => handleChange('preset', e.target.value)}
            >
              <option value="dark">다크</option>
              <option value="light">라이트</option>
              <option value="corporate">비즈니스</option>
              <option value="creative">크리에이티브</option>
              <option value="minimal">미니멀</option>
            </select>
          </div>
        );

      case 'page':
      case 'document':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>이름</label>
            <input
              type="text"
              className={styles.input}
              value={String(selectedNode.data.config?.name || '')}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={selectedNode.data.nodeId === 'page' ? '페이지 이름' : '문서 이름'}
            />
          </div>
        );

      case 'export-ppt':
      case 'export-pdf':
        return (
          <div className={styles.configSection}>
            <label className={styles.label}>파일 이름</label>
            <input
              type="text"
              className={styles.input}
              value={String(selectedNode.data.config?.filename || '')}
              onChange={(e) => handleChange('filename', e.target.value)}
              placeholder="파일명"
            />
            <label className={styles.label}>품질</label>
            <select
              className={styles.select}
              value={String(selectedNode.data.config?.quality || 'standard')}
              onChange={(e) => handleChange('quality', e.target.value)}
            >
              <option value="draft">초안</option>
              <option value="standard">표준</option>
              <option value="high">고품질</option>
            </select>
          </div>
        );

      default:
        return (
          <div className={styles.emptyConfig}>
            <p>이 노드에는 설정 가능한 옵션이 없습니다.</p>
          </div>
        );
    }
  };

  return (
    <div className={`${styles.panel} ${!isExpanded ? styles.collapsed : ''}`}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.headerLeft}>
          <div
            className={styles.nodeIndicator}
            style={{ background: nodeDef.color }}
          />
          <span className={styles.title}>{nodeDef.name}</span>
        </div>
        <button className={styles.toggleButton}>
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </div>
      {isExpanded && (
        <div className={styles.content}>
          <p className={styles.description}>{nodeDef.description}</p>
          {renderConfig()}
        </div>
      )}
    </div>
  );
};

export default NodeConfigPanel;

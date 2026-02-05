/**
 * Node Picker Popup
 * 플로팅 팝업으로 노드를 선택하는 컴포넌트
 */

import React, { useState, useRef, useEffect } from 'react';
import type { NodeCategory, NodeDefinition } from '../../nodes/types';
import { CATEGORY_COLORS } from '../../nodes/types';
import { getAllNodes, getNodesByCategory } from '../../nodes/registry';
import styles from './NodePicker.module.css';

// 인라인 SVG 아이콘 컴포넌트
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// 노드 아이콘 SVG 컴포넌트들
const TypeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ImagePlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
    <line x1="16" y1="5" x2="22" y2="5" />
    <line x1="19" y1="2" x2="19" y2="8" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polygon points="10 9 15 12 10 15 10 9" />
  </svg>
);

const Maximize2Icon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const ScissorsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const GitMergeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M6 21V9a9 9 0 0 0 9 9" />
  </svg>
);

const ArrowRightCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 16 16 12 12 8" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const ArrowLeftCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 8 8 12 12 16" />
    <line x1="16" y1="12" x2="8" y2="12" />
  </svg>
);

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const DefaultNodeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// 아이콘 이름 → SVG 컴포넌트 매핑
const NODE_ICONS: Record<string, React.FC> = {
  'Type': TypeIcon,
  'Upload': UploadIcon,
  'ImagePlus': ImagePlusIcon,
  'Video': VideoIcon,
  'Maximize2': Maximize2Icon,
  'Scissors': ScissorsIcon,
  'Sparkles': SparklesIcon,
  'GitMerge': GitMergeIcon,
  'ArrowRightCircle': ArrowRightCircleIcon,
  'ArrowLeftCircle': ArrowLeftCircleIcon,
  'Image': ImageIcon,
};

// 노드 아이콘 렌더링 헬퍼
const renderNodeIcon = (iconName: string) => {
  const IconComponent = NODE_ICONS[iconName] || DefaultNodeIcon;
  return <IconComponent />;
};

interface NodePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
  anchorPosition?: { x: number; y: number };
}

const CATEGORY_LABELS: Record<NodeCategory, string> = {
  io: '입출력',
  generation: '생성',
  editing: '편집',
  analysis: '분석',
  utility: '유틸리티',
};

const CATEGORY_ORDER: NodeCategory[] = ['io', 'generation', 'editing', 'analysis', 'utility'];

/**
 * 노드 선택 팝업 컴포넌트
 */
const NodePicker: React.FC<NodePickerProps> = ({
  isOpen,
  onClose,
  onSelectNode,
  anchorPosition,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NodeCategory | 'all'>('all');
  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 팝업 열릴 때 검색창에 포커스
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 검색 필터링
  const filterNodes = (nodes: NodeDefinition[]) => {
    if (!searchQuery.trim()) return nodes;
    const query = searchQuery.toLowerCase();
    return nodes.filter(
      node =>
        node.name.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query)
    );
  };

  // 전체 노드 또는 카테고리별 노드 가져오기
  const getFilteredNodes = () => {
    if (selectedCategory === 'all') {
      return filterNodes(getAllNodes());
    }
    return filterNodes(getNodesByCategory(selectedCategory));
  };

  const filteredNodes = getFilteredNodes();

  // 카테고리별로 그룹핑 (전체 보기일 때)
  const groupedNodes = selectedCategory === 'all'
    ? CATEGORY_ORDER.map(category => ({
        category,
        nodes: filterNodes(getNodesByCategory(category)),
      })).filter(group => group.nodes.length > 0)
    : [{ category: selectedCategory, nodes: filteredNodes }];

  const handleNodeClick = (nodeId: string) => {
    onSelectNode(nodeId);
    onClose();
  };

  // 팝업 위치 계산
  const popupStyle: React.CSSProperties = anchorPosition
    ? {
        position: 'fixed',
        left: anchorPosition.x,
        top: anchorPosition.y,
      }
    : {};

  // 휠 이벤트 전파 방지 (ReactFlow 줌 방지)
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.overlay} onWheel={handleWheel}>
      <div
        ref={popupRef}
        className={styles.popup}
        style={popupStyle}
        onWheel={handleWheel}
      >
        {/* 헤더 */}
        <div className={styles.header}>
          <h3 className={styles.title}>노드 추가</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* 검색 */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><SearchIcon /></span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="노드 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className={styles.categoryTabs}>
          <button
            className={`${styles.categoryTab} ${selectedCategory === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            전체
          </button>
          {CATEGORY_ORDER.map(category => (
            <button
              key={category}
              className={`${styles.categoryTab} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
              style={{ '--tab-color': CATEGORY_COLORS[category] } as React.CSSProperties}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        {/* 노드 목록 */}
        <div className={styles.nodeList}>
          {groupedNodes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>검색 결과가 없습니다</p>
            </div>
          ) : (
            groupedNodes.map(({ category, nodes }) => (
              <div key={category} className={styles.categoryGroup}>
                {selectedCategory === 'all' && (
                  <div
                    className={styles.categoryHeader}
                    style={{ '--category-color': CATEGORY_COLORS[category] } as React.CSSProperties}
                  >
                    <span className={styles.categoryIndicator} />
                    <span>{CATEGORY_LABELS[category]}</span>
                    <span className={styles.categoryCount}>{nodes.length}</span>
                  </div>
                )}
                <div className={styles.nodeGrid}>
                  {nodes.map(node => (
                    <button
                      key={node.id}
                      className={styles.nodeCard}
                      onClick={() => handleNodeClick(node.id)}
                      style={{ '--node-color': CATEGORY_COLORS[node.category] } as React.CSSProperties}
                    >
                      <span className={styles.nodeIcon}>{renderNodeIcon(node.icon)}</span>
                      <div className={styles.nodeInfo}>
                        <span className={styles.nodeName}>{node.name}</span>
                        <span className={styles.nodeDesc}>{node.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 하단 힌트 */}
        <div className={styles.footer}>
          <span>클릭하여 캔버스에 추가</span>
        </div>
      </div>
    </div>
  );
};

export default NodePicker;

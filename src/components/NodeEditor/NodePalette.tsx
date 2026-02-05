/**
 * Node Palette
 * 드래그 앤 드롭으로 노드를 추가하는 사이드바
 */

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { NodeCategory, NodeDefinition } from '../../nodes/types';
import { CATEGORY_COLORS } from '../../nodes/types';
import { getNodesByCategory } from '../../nodes/registry';
import styles from './NodePalette.module.css';

interface NodePaletteProps {
  onDragStart?: (nodeId: string) => void;
  embedded?: boolean;
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
 * 노드 팔레트 컴포넌트
 */
const NodePalette: React.FC<NodePaletteProps> = ({ onDragStart, embedded = false }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(['generation', 'editing'])
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category: NodeCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDragStart = (event: React.DragEvent, nodeId: string) => {
    event.dataTransfer.setData('application/reactflow', nodeId);
    event.dataTransfer.effectAllowed = 'move';
    onDragStart?.(nodeId);
  };

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

  return (
    <div className={`${styles.palette} ${embedded ? styles.embedded : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>노드</h3>
      </div>

      {/* 검색 */}
      <div className={styles.search}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 카테고리별 노드 목록 */}
      <div className={styles.categories}>
        {CATEGORY_ORDER.map(category => {
          const nodes = filterNodes(getNodesByCategory(category));
          if (nodes.length === 0) return null;

          const isExpanded = expandedCategories.has(category);
          const categoryColor = CATEGORY_COLORS[category];

          return (
            <div key={category} className={styles.category}>
              <button
                className={styles.categoryHeader}
                onClick={() => toggleCategory(category)}
                style={{ '--category-color': categoryColor } as React.CSSProperties}
              >
                <span className={styles.categoryIndicator} />
                <span className={styles.categoryLabel}>{CATEGORY_LABELS[category]}</span>
                <span className={styles.categoryCount}>{nodes.length}</span>
                <span className={`${styles.arrow} ${isExpanded ? styles.expanded : ''}`}>
                  ▶
                </span>
              </button>

              {isExpanded && (
                <div className={styles.nodeList}>
                  {nodes.map(node => (
                    <div
                      key={node.id}
                      className={styles.nodeItem}
                      draggable
                      onDragStart={e => handleDragStart(e, node.id)}
                      title={node.description}
                    >
                      <span className={styles.nodeIcon}>{node.icon}</span>
                      <span className={styles.nodeName}>{node.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 도움말 */}
      <div className={styles.help}>
        <p>노드를 드래그하여 캔버스에 추가하세요</p>
      </div>
    </div>
  );
};

export default NodePalette;

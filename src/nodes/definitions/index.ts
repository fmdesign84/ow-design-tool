/**
 * Node Definitions - 모든 노드 정의 통합
 */

import { defaultNodeCatalog, flattenNodeCatalog } from './catalog';
// IO 노드
// 모든 노드 통합
import { ioNodes } from './io';
import { generationNodes } from './generation';
import { editingNodes } from './editing';
import { analysisNodes } from './analysis';
import { utilityNodes } from './utility';

export * from './io';
export { ioNodes } from './io';

// 생성 노드
export * from './generation';
export { generationNodes } from './generation';

// 편집 노드
export * from './editing';
export { editingNodes } from './editing';

// 분석 노드
export * from './analysis';
export { analysisNodes } from './analysis';

// 유틸리티 노드
export * from './utility';
export { utilityNodes } from './utility';
export { defaultNodeCatalog, flattenNodeCatalog } from './catalog';
export type { NodeCatalogEntry } from './catalog';

/**
 * 모든 기본 노드 목록
 * 순서: 생성 → 편집 → 분석 → 유틸 → IO (워크플로우 출력이 맨 밑)
 */
export const allNodes = [
  ...generationNodes,
  ...editingNodes,
  ...analysisNodes,
  ...utilityNodes,
  ...ioNodes,
];

export const allNodesFromCatalog = flattenNodeCatalog(defaultNodeCatalog);

export default allNodes;

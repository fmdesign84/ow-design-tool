/**
 * Orange Whale Node System
 * 노드 기반 워크플로우 시스템 메인 export
 */

// 타입 정의
// 초기화 함수
import { nodeRegistry } from './registry';
import {
  defaultNodeCatalog,
  flattenNodeCatalog,
  type NodeCatalogEntry,
} from './definitions';
import { rlog } from '../utils/debug';

export * from './types';
export type {
  DataType,
  NodeCategory,
  InputDefinition,
  OutputDefinition,
  ConfigDefinition,
  ConfigType,
  NodeDefinition,
  NodeResult,
  NodeInstance,
  Connection,
  Workflow,
  NodeExecutionStatus,
  NodeExecutionState,
  WorkflowResult,
} from './types';

// 노드 레지스트리
export {
  nodeRegistry,
  registerNode,
  registerNodes,
  getNode,
  getAllNodes,
  getNodesByCategory,
  useNodeRegistry,
} from './registry';

// 노드 정의
export * from './definitions';
export { allNodes } from './definitions';

export type InitializeNodeSystemOptions = {
  clearBeforeRegister?: boolean;
  includeBundles?: string[];
  excludeBundles?: string[];
};

// 워크플로우 엔진
export {
  WorkflowEngine,
  WorkflowError,
  ParallelWorkflowEngine,
  WorkflowBuilder,
  createWorkflow,
  createImageWithUpscaleWorkflow,
  createRemoveBackgroundWorkflow,
} from './engine';
export type { WorkflowExecuteOptions } from './engine';

// API 유틸리티
export * from './api';

// 훅
export { useWorkflowExecution } from './hooks';
export type { ExecutionResult, WorkflowExecutionState } from './hooks';

/**
 * 노드 시스템 초기화
 * 앱 시작 시 호출하여 모든 기본 노드를 레지스트리에 등록
 */
export function initializeNodeSystem(): void {
  initializeNodeSystemWithCatalog(defaultNodeCatalog);
}

export function initializeNodeSystemWithCatalog(
  catalog = defaultNodeCatalog,
  options: InitializeNodeSystemOptions = {}
): void {
  const resolvedCatalog = resolveNodeCatalog(catalog, options);

  if (options.clearBeforeRegister) {
    nodeRegistry.clear();
  }
  nodeRegistry.registerAll(flattenNodeCatalog(resolvedCatalog));
  rlog('NodeSystem', `Initialized with ${nodeRegistry.size} nodes`);
}

function resolveNodeCatalog(
  catalog: NodeCatalogEntry[],
  options: InitializeNodeSystemOptions
): NodeCatalogEntry[] {
  let resolved = catalog;

  if (options.includeBundles?.length) {
    const includes = new Set(options.includeBundles);
    resolved = resolved.filter(entry => includes.has(entry.id));
  }

  if (options.excludeBundles?.length) {
    const excludes = new Set(options.excludeBundles);
    resolved = resolved.filter(entry => !excludes.has(entry.id));
  }

  return resolved;
}

/**
 * 노드 시스템 정보
 */
export function getNodeSystemInfo() {
  return {
    totalNodes: nodeRegistry.size,
    nodeIds: nodeRegistry.getIds(),
    categories: {
      io: nodeRegistry.getByCategory('io').length,
      generation: nodeRegistry.getByCategory('generation').length,
      editing: nodeRegistry.getByCategory('editing').length,
      analysis: nodeRegistry.getByCategory('analysis').length,
      utility: nodeRegistry.getByCategory('utility').length,
    },
  };
}

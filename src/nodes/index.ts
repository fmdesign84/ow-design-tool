/**
 * Orange Whale Node System
 * 노드 기반 워크플로우 시스템 메인 export
 */

// 타입 정의
// 초기화 함수
import { nodeRegistry } from './registry';
import { allNodes } from './definitions';

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
  nodeRegistry.registerAll(allNodes);
  console.log(`[NodeSystem] Initialized with ${nodeRegistry.size} nodes`);
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

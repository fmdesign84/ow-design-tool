/**
 * Orange Whale Workflow Engine
 * 워크플로우 실행 엔진 모듈
 */

// 순차 실행 엔진
// 기본 export
import { WorkflowEngine } from './WorkflowEngine';
import { ParallelWorkflowEngine } from './ParallelWorkflowEngine';
import { WorkflowBuilder } from './WorkflowBuilder';

export { WorkflowEngine, WorkflowError } from './WorkflowEngine';
export type { WorkflowExecuteOptions } from './WorkflowEngine';

// 병렬 실행 엔진
export { ParallelWorkflowEngine } from './ParallelWorkflowEngine';

// 워크플로우 빌더
export {
  WorkflowBuilder,
  createWorkflow,
  createImageWithUpscaleWorkflow,
  createRemoveBackgroundWorkflow,
} from './WorkflowBuilder';

const engines = {
  WorkflowEngine,
  ParallelWorkflowEngine,
  WorkflowBuilder,
};

export default engines;

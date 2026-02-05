/**
 * Orange Whale Workflow Engine
 * 노드 기반 워크플로우 실행 엔진
 */

import type {
  Workflow,
  NodeInstance,
  NodeExecutionState,
  NodeExecutionStatus,
  WorkflowResult,
} from '../types';
import { nodeRegistry } from '../registry';

/**
 * 워크플로우 실행 옵션
 */
export interface WorkflowExecuteOptions {
  /** 에러 발생 시 계속 진행 여부 */
  continueOnError?: boolean;
  /** 실행 상태 변경 콜백 */
  onNodeStateChange?: (nodeId: string, state: NodeExecutionState) => void;
  /** 진행률 콜백 (0-100) */
  onProgress?: (progress: number) => void;
  /** 타임아웃 (ms) */
  timeout?: number;
}

/**
 * 워크플로우 실행 에러
 */
export class WorkflowError extends Error {
  constructor(
    public nodeId: string,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}

/**
 * 워크플로우 엔진 클래스
 */
export class WorkflowEngine {
  private workflow: Workflow;
  private executionState: Map<string, NodeExecutionState> = new Map();
  private options: WorkflowExecuteOptions;

  constructor(workflow: Workflow, options: WorkflowExecuteOptions = {}) {
    this.workflow = workflow;
    this.options = {
      continueOnError: workflow.continueOnError ?? false,
      ...options,
    };
  }

  /**
   * 워크플로우 실행
   */
  async execute(initialInputs: Record<string, unknown> = {}): Promise<WorkflowResult> {
    const startTime = Date.now();
    this.executionState.clear();

    try {
      // 1. 순환 참조 검사
      this.detectCycle();

      // 2. 토폴로지 정렬
      const executionOrder = this.topologicalSort();

      // 3. 초기 입력 설정
      this.setInitialInputs(initialInputs);

      // 4. 노드 순차 실행
      const totalNodes = executionOrder.length;
      let completedNodes = 0;

      for (const nodeInstanceId of executionOrder) {
        const node = this.getNodeInstance(nodeInstanceId);
        const nodeDef = nodeRegistry.get(node.nodeId);

        if (!nodeDef) {
          throw new WorkflowError(
            nodeInstanceId,
            `Node definition not found: ${node.nodeId}`,
            'NODE_NOT_FOUND'
          );
        }

        // 실행 상태 업데이트: running
        this.updateNodeState(nodeInstanceId, {
          status: 'running',
          startedAt: new Date(),
        });

        try {
          // 입력 수집
          const inputs = this.collectInputs(nodeInstanceId);

          // 노드 실행
          const result = await nodeDef.execute(inputs, node.config);

          // 결과 저장
          this.updateNodeState(nodeInstanceId, {
            status: result.error ? 'error' : 'completed',
            outputs: result.outputs,
            error: result.error,
            completedAt: new Date(),
          });

          // 에러 처리
          if (result.error && !this.options.continueOnError) {
            throw new WorkflowError(
              nodeInstanceId,
              result.error.message,
              result.error.code
            );
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          this.updateNodeState(nodeInstanceId, {
            status: 'error',
            error: { message: errorMessage },
            completedAt: new Date(),
          });

          if (!this.options.continueOnError) {
            throw error instanceof WorkflowError
              ? error
              : new WorkflowError(nodeInstanceId, errorMessage);
          }
        }

        // 진행률 업데이트
        completedNodes++;
        this.options.onProgress?.(Math.round((completedNodes / totalNodes) * 100));
      }

      // 5. 최종 출력 수집
      const outputs = this.collectFinalOutputs();

      return {
        success: true,
        outputs,
        nodeStates: new Map(this.executionState),
        error: null,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const workflowError = error instanceof WorkflowError
        ? error
        : new WorkflowError('unknown', error instanceof Error ? error.message : 'Unknown error');

      return {
        success: false,
        outputs: {},
        nodeStates: new Map(this.executionState),
        error: {
          nodeId: workflowError.nodeId,
          message: workflowError.message,
        },
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 토폴로지 정렬 (Kahn's algorithm)
   * 노드 실행 순서 결정
   */
  private topologicalSort(): string[] {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    // 초기화
    for (const node of this.workflow.nodes) {
      inDegree.set(node.instanceId, 0);
      adjacency.set(node.instanceId, []);
    }

    // 진입 차수 계산
    for (const conn of this.workflow.connections) {
      const current = inDegree.get(conn.targetNodeId) ?? 0;
      inDegree.set(conn.targetNodeId, current + 1);

      const adj = adjacency.get(conn.sourceNodeId) ?? [];
      adj.push(conn.targetNodeId);
      adjacency.set(conn.sourceNodeId, adj);
    }

    // 진입 차수가 0인 노드들로 시작
    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const result: string[] = [];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);

      const neighbors = adjacency.get(nodeId) ?? [];
      for (const neighbor of neighbors) {
        const degree = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, degree);

        if (degree === 0) {
          queue.push(neighbor);
        }
      }
    }

    // 모든 노드가 정렬되었는지 확인
    if (result.length !== this.workflow.nodes.length) {
      throw new WorkflowError(
        'workflow',
        'Cycle detected in workflow',
        'CYCLE_DETECTED'
      );
    }

    return result;
  }

  /**
   * 순환 참조 검사 (DFS)
   */
  private detectCycle(): void {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const adjacency = new Map<string, string[]>();
    for (const node of this.workflow.nodes) {
      adjacency.set(node.instanceId, []);
    }
    for (const conn of this.workflow.connections) {
      const adj = adjacency.get(conn.sourceNodeId) ?? [];
      adj.push(conn.targetNodeId);
      adjacency.set(conn.sourceNodeId, adj);
    }

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adjacency.get(nodeId) ?? [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of this.workflow.nodes) {
      if (!visited.has(node.instanceId)) {
        if (dfs(node.instanceId)) {
          throw new WorkflowError(
            'workflow',
            'Cycle detected in workflow',
            'CYCLE_DETECTED'
          );
        }
      }
    }
  }

  /**
   * 초기 입력 설정 (워크플로우 입력 노드에)
   */
  private setInitialInputs(initialInputs: Record<string, unknown>): void {
    for (const entryNodeId of this.workflow.entryNodes) {
      const node = this.getNodeInstance(entryNodeId);

      // workflow-input 노드에 외부 값 주입
      if (node.nodeId === 'workflow-input') {
        const inputKey = node.config.label as string || 'input';
        const value = initialInputs[inputKey] ?? initialInputs._default;

        this.updateNodeState(entryNodeId, {
          status: 'completed',
          outputs: { value, _externalValue: value },
          completedAt: new Date(),
        });
      }
    }
  }

  /**
   * 노드 입력 수집 (이전 노드 출력에서)
   */
  private collectInputs(nodeInstanceId: string): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};

    // 이 노드로 들어오는 연결들
    const incomingConnections = this.workflow.connections.filter(
      c => c.targetNodeId === nodeInstanceId
    );

    for (const conn of incomingConnections) {
      const sourceState = this.executionState.get(conn.sourceNodeId);
      if (sourceState?.outputs) {
        inputs[conn.targetInputId] = sourceState.outputs[conn.sourceOutputId];
      }
    }

    // 노드 config에서 직접 설정된 값도 입력으로 사용
    const node = this.getNodeInstance(nodeInstanceId);
    const nodeDef = nodeRegistry.get(node.nodeId);

    if (nodeDef) {
      for (const inputDef of nodeDef.inputs) {
        // 연결에서 값을 받지 않았고, config에 값이 있으면 사용
        if (inputs[inputDef.id] === undefined && node.config[inputDef.id] !== undefined) {
          inputs[inputDef.id] = node.config[inputDef.id];
        }
        // 그래도 없으면 기본값 사용
        if (inputs[inputDef.id] === undefined && inputDef.default !== undefined) {
          inputs[inputDef.id] = inputDef.default;
        }
      }
    }

    return inputs;
  }

  /**
   * 최종 출력 수집 (출력 노드들에서)
   */
  private collectFinalOutputs(): Record<string, unknown> {
    const outputs: Record<string, unknown> = {};

    for (const exitNodeId of this.workflow.exitNodes) {
      const state = this.executionState.get(exitNodeId);
      const node = this.getNodeInstance(exitNodeId);

      if (state?.outputs) {
        const label = (node.config.label as string) || exitNodeId;
        outputs[label] = state.outputs._workflowResult ?? state.outputs;
      }
    }

    return outputs;
  }

  /**
   * 노드 인스턴스 조회
   */
  private getNodeInstance(instanceId: string): NodeInstance {
    const node = this.workflow.nodes.find(n => n.instanceId === instanceId);
    if (!node) {
      throw new WorkflowError(
        instanceId,
        `Node instance not found: ${instanceId}`,
        'INSTANCE_NOT_FOUND'
      );
    }
    return node;
  }

  /**
   * 노드 실행 상태 업데이트
   */
  private updateNodeState(
    nodeInstanceId: string,
    update: Partial<NodeExecutionState>
  ): void {
    const current = this.executionState.get(nodeInstanceId) ?? {
      status: 'pending' as NodeExecutionStatus,
    };

    const newState: NodeExecutionState = {
      ...current,
      ...update,
    };

    this.executionState.set(nodeInstanceId, newState);
    this.options.onNodeStateChange?.(nodeInstanceId, newState);
  }

  /**
   * 현재 실행 상태 조회
   */
  getExecutionState(): Map<string, NodeExecutionState> {
    return new Map(this.executionState);
  }

  /**
   * 특정 노드 실행 상태 조회
   */
  getNodeState(nodeInstanceId: string): NodeExecutionState | undefined {
    return this.executionState.get(nodeInstanceId);
  }
}

export default WorkflowEngine;

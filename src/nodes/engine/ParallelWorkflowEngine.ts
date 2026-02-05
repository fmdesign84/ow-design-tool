/**
 * Parallel Workflow Engine
 * 병렬 실행을 지원하는 워크플로우 엔진
 */

import type {
  Workflow,
  NodeInstance,
  NodeExecutionState,
  NodeExecutionStatus,
  WorkflowResult,
} from '../types';
import { nodeRegistry } from '../registry';
import { WorkflowError, WorkflowExecuteOptions } from './WorkflowEngine';

/**
 * 병렬 워크플로우 엔진
 * 의존성이 없는 노드들을 동시에 실행
 */
export class ParallelWorkflowEngine {
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
   * 워크플로우 병렬 실행
   */
  async execute(initialInputs: Record<string, unknown> = {}): Promise<WorkflowResult> {
    const startTime = Date.now();
    this.executionState.clear();

    try {
      // 1. 순환 참조 검사
      this.detectCycle();

      // 2. 의존성 그래프 구축
      const { inDegree, adjacency } = this.buildDependencyGraph();

      // 3. 초기 입력 설정
      this.setInitialInputs(initialInputs, inDegree);

      // 4. 실행 대기 노드 (진입 차수 0)
      const readyQueue = new Set<string>();
      const pendingNodes = new Set<string>();

      for (const node of this.workflow.nodes) {
        const degree = inDegree.get(node.instanceId) ?? 0;
        // 이미 초기화된 입력 노드는 제외
        if (degree === 0 && !this.executionState.has(node.instanceId)) {
          readyQueue.add(node.instanceId);
        } else if (!this.executionState.has(node.instanceId)) {
          pendingNodes.add(node.instanceId);
        }
      }

      const totalNodes = this.workflow.nodes.length;
      let completedNodes = this.executionState.size;  // 이미 완료된 입력 노드 수

      // 5. 병렬 실행 루프
      while (readyQueue.size > 0 || pendingNodes.size > 0) {
        if (readyQueue.size === 0) {
          // 실행할 노드가 없는데 대기 중인 노드가 있으면 에러
          throw new WorkflowError(
            'workflow',
            'Deadlock detected: nodes waiting for inputs that will never arrive',
            'DEADLOCK'
          );
        }

        // 준비된 노드들 병렬 실행
        const nodesToExecute = Array.from(readyQueue);
        readyQueue.clear();

        const results = await Promise.allSettled(
          nodesToExecute.map(nodeId => this.executeNode(nodeId))
        );

        // 결과 처리
        for (let i = 0; i < results.length; i++) {
          const nodeId = nodesToExecute[i];
          const result = results[i];

          if (result.status === 'rejected') {
            if (!this.options.continueOnError) {
              throw result.reason;
            }
          }

          completedNodes++;

          // 후속 노드들의 진입 차수 감소
          const successors = adjacency.get(nodeId) ?? [];
          for (const successor of successors) {
            const degree = (inDegree.get(successor) ?? 1) - 1;
            inDegree.set(successor, degree);

            if (degree === 0) {
              readyQueue.add(successor);
              pendingNodes.delete(successor);
            }
          }
        }

        // 진행률 업데이트
        this.options.onProgress?.(Math.round((completedNodes / totalNodes) * 100));
      }

      // 6. 최종 출력 수집
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
   * 단일 노드 실행
   */
  private async executeNode(nodeInstanceId: string): Promise<void> {
    const node = this.getNodeInstance(nodeInstanceId);
    const nodeDef = nodeRegistry.get(node.nodeId);

    if (!nodeDef) {
      throw new WorkflowError(
        nodeInstanceId,
        `Node definition not found: ${node.nodeId}`,
        'NODE_NOT_FOUND'
      );
    }

    // 실행 상태: running
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

      if (result.error && !this.options.continueOnError) {
        throw new WorkflowError(
          nodeInstanceId,
          result.error.message,
          result.error.code
        );
      }
    } catch (error) {
      if (error instanceof WorkflowError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateNodeState(nodeInstanceId, {
        status: 'error',
        error: { message: errorMessage },
        completedAt: new Date(),
      });

      throw new WorkflowError(nodeInstanceId, errorMessage);
    }
  }

  /**
   * 의존성 그래프 구축
   */
  private buildDependencyGraph() {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();
    const reverseAdjacency = new Map<string, string[]>();

    // 초기화
    for (const node of this.workflow.nodes) {
      inDegree.set(node.instanceId, 0);
      adjacency.set(node.instanceId, []);
      reverseAdjacency.set(node.instanceId, []);
    }

    // 연결 정보로 그래프 구축
    for (const conn of this.workflow.connections) {
      // 진입 차수
      const degree = inDegree.get(conn.targetNodeId) ?? 0;
      inDegree.set(conn.targetNodeId, degree + 1);

      // 정방향 인접 리스트
      const adj = adjacency.get(conn.sourceNodeId) ?? [];
      if (!adj.includes(conn.targetNodeId)) {
        adj.push(conn.targetNodeId);
      }
      adjacency.set(conn.sourceNodeId, adj);

      // 역방향 인접 리스트
      const revAdj = reverseAdjacency.get(conn.targetNodeId) ?? [];
      if (!revAdj.includes(conn.sourceNodeId)) {
        revAdj.push(conn.sourceNodeId);
      }
      reverseAdjacency.set(conn.targetNodeId, revAdj);
    }

    return { inDegree, adjacency, reverseAdjacency };
  }

  /**
   * 순환 참조 검사
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
   * 초기 입력 설정
   */
  private setInitialInputs(
    initialInputs: Record<string, unknown>,
    inDegree: Map<string, number>
  ): void {
    for (const entryNodeId of this.workflow.entryNodes) {
      const node = this.getNodeInstance(entryNodeId);

      if (node.nodeId === 'workflow-input') {
        const inputKey = (node.config.label as string) || 'input';
        const value = initialInputs[inputKey] ?? initialInputs._default;

        this.updateNodeState(entryNodeId, {
          status: 'completed',
          outputs: { value, _externalValue: value },
          completedAt: new Date(),
        });

        // 진입 차수 0으로 설정 (이미 완료됨)
        inDegree.set(entryNodeId, -1);
      }
    }
  }

  /**
   * 노드 입력 수집
   */
  private collectInputs(nodeInstanceId: string): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};

    const incomingConnections = this.workflow.connections.filter(
      c => c.targetNodeId === nodeInstanceId
    );

    for (const conn of incomingConnections) {
      const sourceState = this.executionState.get(conn.sourceNodeId);
      if (sourceState?.outputs) {
        inputs[conn.targetInputId] = sourceState.outputs[conn.sourceOutputId];
      }
    }

    // config에서 직접 설정된 값
    const node = this.getNodeInstance(nodeInstanceId);
    const nodeDef = nodeRegistry.get(node.nodeId);

    if (nodeDef) {
      for (const inputDef of nodeDef.inputs) {
        if (inputs[inputDef.id] === undefined && node.config[inputDef.id] !== undefined) {
          inputs[inputDef.id] = node.config[inputDef.id];
        }
        if (inputs[inputDef.id] === undefined && inputDef.default !== undefined) {
          inputs[inputDef.id] = inputDef.default;
        }
      }
    }

    return inputs;
  }

  /**
   * 최종 출력 수집
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
}

export default ParallelWorkflowEngine;

/**
 * Orange Wave - Workflow Execution Hook
 * 워크플로우 실행 상태 관리 훅
 */

import { useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { CustomNodeData } from '../../components/NodeEditor/CustomNode';
import type { NodeExecutionState, WorkflowResult } from '../types';
import { nodeRegistry } from '../registry';

export interface ExecutionResult {
  nodeId: string;
  instanceId: string;
  outputs: Record<string, unknown>;
  error?: { message: string; code?: string } | null;
  duration: number;
}

export interface WorkflowExecutionState {
  isRunning: boolean;
  currentNodeId: string | null;
  nodeStates: Map<string, NodeExecutionState>;
  results: ExecutionResult[];
  finalOutputs: Record<string, unknown>;
  error: { nodeId: string; message: string } | null;
  duration: number;
}

const initialState: WorkflowExecutionState = {
  isRunning: false,
  currentNodeId: null,
  nodeStates: new Map(),
  results: [],
  finalOutputs: {},
  error: null,
  duration: 0,
};

/**
 * 워크플로우 실행 훅
 */
export function useWorkflowExecution() {
  const [state, setState] = useState<WorkflowExecutionState>(initialState);

  /**
   * 노드 상태 업데이트
   */
  const updateNodeState = useCallback(
    (instanceId: string, nodeState: Partial<NodeExecutionState>) => {
      setState(prev => {
        const newNodeStates = new Map(prev.nodeStates);
        const existing = newNodeStates.get(instanceId) || { status: 'pending' };
        newNodeStates.set(instanceId, { ...existing, ...nodeState });
        return { ...prev, nodeStates: newNodeStates };
      });
    },
    []
  );

  /**
   * 레벨 기반 토폴로지 정렬 (병렬 실행 지원)
   * 같은 레벨의 노드들은 종속성이 없으므로 동시 실행 가능
   */
  const getLevelGroups = useCallback(
    (nodes: Node<CustomNodeData>[], edges: Edge[]): string[][] => {
      const inDegree = new Map<string, number>();
      const adjacency = new Map<string, string[]>();

      // 초기화
      nodes.forEach(node => {
        inDegree.set(node.id, 0);
        adjacency.set(node.id, []);
      });

      // 엣지 기반 그래프 구성
      edges.forEach(edge => {
        const targets = adjacency.get(edge.source) || [];
        targets.push(edge.target);
        adjacency.set(edge.source, targets);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      });

      // 레벨별 그룹화 (Kahn's algorithm 변형)
      const levels: string[][] = [];
      const remaining = new Map(inDegree);

      while (remaining.size > 0) {
        // 현재 레벨: inDegree가 0인 노드들
        const currentLevel: string[] = [];
        remaining.forEach((degree, nodeId) => {
          if (degree === 0) currentLevel.push(nodeId);
        });

        if (currentLevel.length === 0) {
          // 사이클 감지 - 남은 노드 강제 추가
          const firstRemaining = remaining.keys().next().value;
          if (firstRemaining) currentLevel.push(firstRemaining);
        }

        levels.push(currentLevel);

        // 현재 레벨 노드들 제거 및 다음 노드들의 inDegree 감소
        currentLevel.forEach(nodeId => {
          remaining.delete(nodeId);
          const neighbors = adjacency.get(nodeId) || [];
          neighbors.forEach(neighbor => {
            if (remaining.has(neighbor)) {
              remaining.set(neighbor, (remaining.get(neighbor) || 1) - 1);
            }
          });
        });
      }

      return levels;
    },
    []
  );

  /**
   * 노드 입력값 수집 (연결된 노드의 출력에서)
   */
  const collectInputs = useCallback(
    (
      nodeId: string,
      edges: Edge[],
      nodeOutputs: Map<string, Record<string, unknown>>
    ): Record<string, unknown> => {
      const inputs: Record<string, unknown> = {};

      edges
        .filter(edge => edge.target === nodeId)
        .forEach(edge => {
          const sourceOutputs = nodeOutputs.get(edge.source);
          if (sourceOutputs && edge.sourceHandle && edge.targetHandle) {
            inputs[edge.targetHandle] = sourceOutputs[edge.sourceHandle];
          }
        });

      return inputs;
    },
    []
  );

  /**
   * 워크플로우 실행 (레벨별 병렬 실행)
   * 같은 레벨의 노드들은 동시에 실행되어 성능 향상
   */
  const execute = useCallback(
    async (
      nodes: Node<CustomNodeData>[],
      edges: Edge[],
      onNodeStateChange?: (nodeId: string, status: string) => void
    ): Promise<WorkflowResult> => {
      const startTime = Date.now();

      // 상태 초기화
      setState({
        isRunning: true,
        currentNodeId: null,
        nodeStates: new Map(),
        results: [],
        finalOutputs: {},
        error: null,
        duration: 0,
      });

      // 모든 노드 pending 상태로
      nodes.forEach(node => {
        updateNodeState(node.id, { status: 'pending' });
        onNodeStateChange?.(node.id, 'pending');
      });

      const nodeOutputs = new Map<string, Record<string, unknown>>();
      const levelGroups = getLevelGroups(nodes, edges);
      const results: ExecutionResult[] = [];

      try {
        // 레벨별 순차 실행 (각 레벨 내에서는 병렬)
        for (const levelNodeIds of levelGroups) {
          // 레벨 내 모든 노드 병렬 실행
          const levelResults = await Promise.all(
            levelNodeIds.map(async (instanceId): Promise<ExecutionResult | null> => {
              const node = nodes.find(n => n.id === instanceId);
              if (!node) return null;

              const nodeDef = nodeRegistry.get(node.data.nodeId);
              if (!nodeDef) {
                throw new Error(`노드 정의를 찾을 수 없음: ${node.data.nodeId}`);
              }

              // 노드 실행 시작
              updateNodeState(instanceId, {
                status: 'running',
                startedAt: new Date(),
              });
              onNodeStateChange?.(instanceId, 'running');

              // 입력값 수집 (이전 레벨의 출력에서)
              const inputs = collectInputs(instanceId, edges, nodeOutputs);
              const config = node.data.config || {};

              // 노드 실행
              const nodeStartTime = Date.now();
              const result = await nodeDef.execute(inputs, config);
              const nodeDuration = Date.now() - nodeStartTime;

              // 결과 저장 (다음 레벨에서 사용)
              nodeOutputs.set(instanceId, result.outputs);

              const executionResult: ExecutionResult = {
                nodeId: node.data.nodeId,
                instanceId,
                outputs: result.outputs,
                error: result.error,
                duration: nodeDuration,
              };

              if (result.error) {
                updateNodeState(instanceId, {
                  status: 'error',
                  error: result.error,
                  completedAt: new Date(),
                });
                onNodeStateChange?.(instanceId, 'error');
              } else {
                updateNodeState(instanceId, {
                  status: 'completed',
                  outputs: result.outputs,
                  completedAt: new Date(),
                });
                onNodeStateChange?.(instanceId, 'completed');
              }

              return executionResult;
            })
          );

          // 결과 수집 및 에러 체크
          for (const result of levelResults) {
            if (result) {
              results.push(result);

              // 에러가 있으면 즉시 중단
              if (result.error) {
                const finalDuration = Date.now() - startTime;
                setState(prev => ({
                  ...prev,
                  isRunning: false,
                  currentNodeId: null,
                  results,
                  error: { nodeId: result.instanceId, message: result.error!.message },
                  duration: finalDuration,
                }));

                return {
                  success: false,
                  outputs: {},
                  nodeStates: new Map(),
                  error: { nodeId: result.instanceId, message: result.error!.message },
                  duration: finalDuration,
                };
              }
            }
          }
        }

        // 최종 출력 (마지막 노드들의 출력)
        const finalOutputs: Record<string, unknown> = {};
        const exitNodes = nodes.filter(
          node => !edges.some(edge => edge.source === node.id)
        );
        exitNodes.forEach(node => {
          const outputs = nodeOutputs.get(node.id);
          if (outputs) {
            Object.assign(finalOutputs, outputs);
          }
        });

        const finalDuration = Date.now() - startTime;
        setState(prev => ({
          ...prev,
          isRunning: false,
          currentNodeId: null,
          results,
          finalOutputs,
          duration: finalDuration,
        }));

        return {
          success: true,
          outputs: finalOutputs,
          nodeStates: new Map(),
          duration: finalDuration,
        };
      } catch (error) {
        const finalDuration = Date.now() - startTime;
        const message = error instanceof Error ? error.message : '알 수 없는 오류';

        setState(prev => ({
          ...prev,
          isRunning: false,
          currentNodeId: null,
          results,
          error: { nodeId: '', message },
          duration: finalDuration,
        }));

        return {
          success: false,
          outputs: {},
          nodeStates: new Map(),
          error: { nodeId: '', message },
          duration: finalDuration,
        };
      }
    },
    [getLevelGroups, collectInputs, updateNodeState]
  );

  /**
   * 실행 취소/리셋
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export default useWorkflowExecution;

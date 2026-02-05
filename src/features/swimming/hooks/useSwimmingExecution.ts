/**
 * Swimming Execution Engine
 * 노드 그래프 실행 엔진
 */

import { useCallback, useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import type { SwimmingNodeData } from '../types';
import { swimmingNodeRegistry } from '../nodes/registry';

// 실행 상태
export type ExecutionStatus = 'idle' | 'running' | 'completed' | 'error';

// 노드 실행 결과
interface NodeExecutionResult {
  nodeId: string;
  outputs: Record<string, unknown>;
  error?: string;
}

// 실행 컨텍스트
interface ExecutionContext {
  nodeResults: Map<string, NodeExecutionResult>;
  status: ExecutionStatus;
  currentNodeId: string | null;
  error: string | null;
}

// 훅 반환 타입
interface UseSwimmingExecutionReturn {
  execute: () => Promise<void>;
  status: ExecutionStatus;
  currentNodeId: string | null;
  error: string | null;
  nodeStatuses: Map<string, ExecutionStatus>;
  reset: () => void;
}

/**
 * 토폴로지컬 정렬 - 노드 실행 순서 결정
 */
function topologicalSort(
  nodes: Node<SwimmingNodeData>[],
  edges: Edge[]
): string[] {
  const nodeIds = new Set(nodes.map(n => n.id));
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  // 초기화
  nodeIds.forEach(id => {
    inDegree.set(id, 0);
    adjacencyList.set(id, []);
  });

  // 엣지로부터 그래프 구성
  edges.forEach(edge => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      adjacencyList.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  });

  // Kahn's algorithm
  const queue: string[] = [];
  const result: string[] = [];

  // 입력 차수가 0인 노드 찾기
  nodeIds.forEach(id => {
    if (inDegree.get(id) === 0) {
      queue.push(id);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    adjacencyList.get(current)?.forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }

  // 사이클 체크
  if (result.length !== nodeIds.size) {
    throw new Error('노드 그래프에 순환이 발견되었습니다.');
  }

  return result;
}

/**
 * 노드의 입력값 수집
 * 다중 연결 지원: 같은 handle에 여러 edge가 연결되면 배열로 수집 (y 위치 기준 정렬)
 */
function collectInputs(
  node: Node<SwimmingNodeData>,
  edges: Edge[],
  results: Map<string, NodeExecutionResult>,
  allNodes: Node<SwimmingNodeData>[]
): Record<string, unknown> {
  const inputs: Record<string, unknown> = {};
  const nodeDef = swimmingNodeRegistry.get(node.data.nodeId);

  if (!nodeDef) return inputs;

  // 이 노드를 타겟으로 하는 edge들을 handle별로 그룹화
  const edgesByHandle = new Map<string, Edge[]>();
  edges
    .filter(e => e.target === node.id)
    .forEach(edge => {
      const handle = edge.targetHandle || 'default';
      if (!edgesByHandle.has(handle)) {
        edgesByHandle.set(handle, []);
      }
      edgesByHandle.get(handle)!.push(edge);
    });

  // 각 입력 포트에 대해 처리
  nodeDef.inputs.forEach(input => {
    const handleEdges = edgesByHandle.get(input.id) || [];

    if (handleEdges.length > 1) {
      // 다중 연결 → 배열로 수집 (source 노드의 y 위치 기준 정렬)
      const values = handleEdges
        .sort((a, b) => {
          const nodeA = allNodes.find(n => n.id === a.source);
          const nodeB = allNodes.find(n => n.id === b.source);
          return (nodeA?.position.y || 0) - (nodeB?.position.y || 0);
        })
        .map(edge => {
          const sourceResult = results.get(edge.source);
          if (sourceResult && edge.sourceHandle) {
            return sourceResult.outputs[edge.sourceHandle];
          }
          return null;
        })
        .filter(val => val !== null && val !== undefined);

      inputs[input.id] = values;
    } else if (handleEdges.length === 1) {
      // 단일 연결 → 단일 값
      const edge = handleEdges[0];
      const sourceResult = results.get(edge.source);
      if (sourceResult && edge.sourceHandle) {
        inputs[input.id] = sourceResult.outputs[edge.sourceHandle];
      }
    }
  });

  return inputs;
}

/**
 * 노드 실행 함수
 * registry에 정의된 execute 함수 사용
 */
async function executeNode(
  node: Node<SwimmingNodeData>,
  inputs: Record<string, unknown>
): Promise<NodeExecutionResult> {
  const nodeDef = swimmingNodeRegistry.get(node.data.nodeId);

  if (!nodeDef) {
    return {
      nodeId: node.id,
      outputs: {},
      error: '알 수 없는 노드 타입',
    };
  }

  // registry에 execute 함수가 있으면 사용
  if (nodeDef.execute) {
    const config = node.data.config || {};
    const result = await nodeDef.execute(inputs, config);

    if (result.error) {
      return {
        nodeId: node.id,
        outputs: result.outputs,
        error: result.error.message,
      };
    }

    return {
      nodeId: node.id,
      outputs: result.outputs,
    };
  }

  // execute 함수가 없으면 패스스루 (입력을 그대로 출력)
  const outputs: Record<string, unknown> = {};
  nodeDef.outputs.forEach(output => {
    // 동일한 타입의 입력이 있으면 연결
    const matchingInput = Object.entries(inputs).find(
      ([_, value]) => value !== null && value !== undefined
    );
    if (matchingInput) {
      outputs[output.id] = matchingInput[1];
    }
  });

  return {
    nodeId: node.id,
    outputs,
  };
}

/**
 * Swimming 실행 훅
 */
export function useSwimmingExecution(
  nodes: Node<SwimmingNodeData>[],
  edges: Edge[],
  onNodeStatusChange?: (nodeId: string, status: ExecutionStatus) => void
): UseSwimmingExecutionReturn {
  const [context, setContext] = useState<ExecutionContext>({
    nodeResults: new Map(),
    status: 'idle',
    currentNodeId: null,
    error: null,
  });

  const [nodeStatuses, setNodeStatuses] = useState<Map<string, ExecutionStatus>>(
    new Map()
  );

  // 노드 상태 업데이트
  const updateNodeStatus = useCallback(
    (nodeId: string, status: ExecutionStatus) => {
      setNodeStatuses(prev => {
        const next = new Map(prev);
        next.set(nodeId, status);
        return next;
      });
      onNodeStatusChange?.(nodeId, status);
    },
    [onNodeStatusChange]
  );

  // 실행
  const execute = useCallback(async () => {
    if (nodes.length === 0) {
      setContext(prev => ({
        ...prev,
        status: 'completed',
        error: null,
      }));
      return;
    }

    // 상태 초기화
    setContext(prev => ({
      ...prev,
      status: 'running',
      currentNodeId: null,
      error: null,
      nodeResults: new Map(),
    }));

    const newStatuses = new Map<string, ExecutionStatus>();
    nodes.forEach(node => newStatuses.set(node.id, 'idle'));
    setNodeStatuses(newStatuses);

    try {
      // 실행 순서 결정
      const executionOrder = topologicalSort(nodes, edges);
      const results = new Map<string, NodeExecutionResult>();

      // 순서대로 실행
      for (const nodeId of executionOrder) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        // 현재 노드 상태 업데이트
        setContext(prev => ({
          ...prev,
          currentNodeId: nodeId,
        }));
        updateNodeStatus(nodeId, 'running');

        try {
          // 입력 수집 (다중 연결 지원)
          const inputs = collectInputs(node, edges, results, nodes);

          // 노드 실행
          const result = await executeNode(node, inputs);

          if (result.error) {
            throw new Error(result.error);
          }

          results.set(nodeId, result);
          updateNodeStatus(nodeId, 'completed');
        } catch (nodeError) {
          updateNodeStatus(nodeId, 'error');
          throw new Error(
            `노드 "${node.data.label}" 실행 실패: ${
              nodeError instanceof Error ? nodeError.message : '알 수 없는 오류'
            }`
          );
        }
      }

      // 완료
      setContext(prev => ({
        ...prev,
        status: 'completed',
        currentNodeId: null,
        nodeResults: results,
      }));
    } catch (error) {
      setContext(prev => ({
        ...prev,
        status: 'error',
        currentNodeId: null,
        error: error instanceof Error ? error.message : '실행 중 오류 발생',
      }));
    }
  }, [nodes, edges, updateNodeStatus]);

  // 리셋
  const reset = useCallback(() => {
    setContext({
      nodeResults: new Map(),
      status: 'idle',
      currentNodeId: null,
      error: null,
    });
    setNodeStatuses(new Map());
  }, []);

  return {
    execute,
    status: context.status,
    currentNodeId: context.currentNodeId,
    error: context.error,
    nodeStatuses,
    reset,
  };
}

export default useSwimmingExecution;

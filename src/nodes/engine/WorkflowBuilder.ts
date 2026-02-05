/**
 * Workflow Builder
 * 워크플로우를 쉽게 생성하기 위한 빌더 유틸리티
 */

import type {
  Workflow,
  NodeInstance,
  Connection,
} from '../types';
import { nodeRegistry } from '../registry';

/**
 * 워크플로우 빌더 클래스
 * 메서드 체이닝으로 워크플로우 구성
 */
export class WorkflowBuilder {
  private workflow: Workflow;
  private nodeCounter = 0;

  constructor(name: string, description?: string) {
    this.workflow = {
      id: this.generateId('workflow'),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      nodes: [],
      connections: [],
      entryNodes: [],
      exitNodes: [],
    };
  }

  /**
   * 노드 추가
   */
  addNode(
    nodeId: string,
    config: Record<string, unknown> = {},
    position: { x: number; y: number } = { x: 0, y: 0 }
  ): { instanceId: string; builder: WorkflowBuilder } {
    // 노드 정의 확인
    if (!nodeRegistry.has(nodeId)) {
      console.warn(`[WorkflowBuilder] Node "${nodeId}" not found in registry`);
    }

    const instanceId = this.generateId(nodeId);

    const nodeInstance: NodeInstance = {
      instanceId,
      nodeId,
      position,
      config,
    };

    this.workflow.nodes.push(nodeInstance);

    // 워크플로우 입력 노드는 entryNodes에 추가
    if (nodeId === 'workflow-input') {
      this.workflow.entryNodes.push(instanceId);
    }

    // 워크플로우 출력 노드는 exitNodes에 추가
    if (nodeId === 'workflow-output') {
      this.workflow.exitNodes.push(instanceId);
    }

    return { instanceId, builder: this };
  }

  /**
   * 연결 추가
   */
  connect(
    sourceInstanceId: string,
    sourceOutputId: string,
    targetInstanceId: string,
    targetInputId: string
  ): WorkflowBuilder {
    const connection: Connection = {
      id: this.generateId('connection'),
      sourceNodeId: sourceInstanceId,
      sourceOutputId,
      targetNodeId: targetInstanceId,
      targetInputId,
    };

    this.workflow.connections.push(connection);
    return this;
  }

  /**
   * 간편 연결 (기본 출력 → 기본 입력)
   */
  pipe(
    sourceInstanceId: string,
    targetInstanceId: string,
    sourceOutput = 'image',
    targetInput = 'image'
  ): WorkflowBuilder {
    return this.connect(sourceInstanceId, sourceOutput, targetInstanceId, targetInput);
  }

  /**
   * 전역 변수 설정
   */
  setVariables(variables: Record<string, unknown>): WorkflowBuilder {
    this.workflow.variables = variables;
    return this;
  }

  /**
   * 에러 시 계속 진행 설정
   */
  continueOnError(value = true): WorkflowBuilder {
    this.workflow.continueOnError = value;
    return this;
  }

  /**
   * 노드 위치 업데이트
   */
  setNodePosition(
    instanceId: string,
    position: { x: number; y: number }
  ): WorkflowBuilder {
    const node = this.workflow.nodes.find(n => n.instanceId === instanceId);
    if (node) {
      node.position = position;
    }
    return this;
  }

  /**
   * 노드 설정 업데이트
   */
  setNodeConfig(
    instanceId: string,
    config: Record<string, unknown>
  ): WorkflowBuilder {
    const node = this.workflow.nodes.find(n => n.instanceId === instanceId);
    if (node) {
      node.config = { ...node.config, ...config };
    }
    return this;
  }

  /**
   * 워크플로우 빌드
   */
  build(): Workflow {
    this.workflow.updatedAt = new Date();
    return { ...this.workflow };
  }

  /**
   * JSON 문자열로 export
   */
  toJSON(): string {
    return JSON.stringify(this.build(), null, 2);
  }

  /**
   * 고유 ID 생성
   */
  private generateId(prefix: string): string {
    this.nodeCounter++;
    return `${prefix}-${Date.now()}-${this.nodeCounter}`;
  }

  /**
   * JSON에서 워크플로우 로드
   */
  static fromJSON(json: string): Workflow {
    const data = JSON.parse(json);
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}

/**
 * 빌더 생성 헬퍼 함수
 */
export function createWorkflow(name: string, description?: string): WorkflowBuilder {
  return new WorkflowBuilder(name, description);
}

/**
 * 프리셋 워크플로우: 이미지 생성 후 업스케일
 */
export function createImageWithUpscaleWorkflow(): Workflow {
  const builder = createWorkflow('이미지 생성 + 업스케일', '이미지를 생성하고 2배 업스케일합니다');

  const { instanceId: inputId } = builder.addNode('workflow-input', { label: '프롬프트', inputType: 'text' });
  const { instanceId: genId } = builder.addNode('generate-image', { model: 'imagen4', aspectRatio: '1:1' });
  const { instanceId: upscaleId } = builder.addNode('upscale-image', { scale: '2' });
  const { instanceId: outputId } = builder.addNode('workflow-output', { label: '결과' });

  builder
    .connect(inputId, 'value', genId, 'prompt')
    .pipe(genId, upscaleId)
    .pipe(upscaleId, outputId, 'image', 'value');

  return builder.build();
}

/**
 * 프리셋 워크플로우: 배경 제거 파이프라인
 */
export function createRemoveBackgroundWorkflow(): Workflow {
  const builder = createWorkflow('배경 제거', '이미지에서 배경을 제거합니다');

  const { instanceId: inputId } = builder.addNode('workflow-input', { label: '이미지', inputType: 'image' });
  const { instanceId: removeId } = builder.addNode('remove-background', {});
  const { instanceId: outputId } = builder.addNode('workflow-output', { label: '누끼' });

  builder
    .connect(inputId, 'value', removeId, 'image')
    .pipe(removeId, outputId, 'image', 'value');

  return builder.build();
}

export default WorkflowBuilder;

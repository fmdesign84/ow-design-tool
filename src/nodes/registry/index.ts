/**
 * Orange Whale Node Registry
 * 노드 정의 등록 및 조회
 */

import type { NodeDefinition, NodeCategory } from '../types';

/**
 * 노드 레지스트리 클래스
 * 싱글톤 패턴으로 구현
 */
class NodeRegistry {
  private nodes: Map<string, NodeDefinition> = new Map();
  private static instance: NodeRegistry;

  private constructor() {}

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry();
    }
    return NodeRegistry.instance;
  }

  /**
   * 노드 등록
   */
  register(node: NodeDefinition): void {
    if (this.nodes.has(node.id)) {
      console.warn(`[NodeRegistry] Node "${node.id}" already registered. Overwriting.`);
    }
    this.nodes.set(node.id, node);
  }

  /**
   * 여러 노드 일괄 등록
   */
  registerAll(nodes: NodeDefinition[]): void {
    nodes.forEach(node => this.register(node));
  }

  /**
   * 노드 ID로 조회
   */
  get(nodeId: string): NodeDefinition | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * 노드 존재 여부 확인
   */
  has(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  /**
   * 모든 노드 반환
   */
  getAll(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  /**
   * 카테고리별 노드 반환
   */
  getByCategory(category: NodeCategory): NodeDefinition[] {
    return this.getAll().filter(node => node.category === category);
  }

  /**
   * 노드 ID 목록 반환
   */
  getIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * 노드 개수 반환
   */
  get size(): number {
    return this.nodes.size;
  }

  /**
   * 레지스트리 초기화 (테스트용)
   */
  clear(): void {
    this.nodes.clear();
  }

  /**
   * 노드 제거
   */
  unregister(nodeId: string): boolean {
    return this.nodes.delete(nodeId);
  }
}

// 싱글톤 인스턴스 export
export const nodeRegistry = NodeRegistry.getInstance();

// 편의 함수들
export const registerNode = (node: NodeDefinition) => nodeRegistry.register(node);
export const registerNodes = (nodes: NodeDefinition[]) => nodeRegistry.registerAll(nodes);
export const getNode = (nodeId: string) => nodeRegistry.get(nodeId);
export const getAllNodes = () => nodeRegistry.getAll();
export const getNodesByCategory = (category: NodeCategory) => nodeRegistry.getByCategory(category);

/**
 * React Hook: 노드 레지스트리 접근
 */
export const useNodeRegistry = () => {
  return {
    get: getNode,
    getAll: getAllNodes,
    getByCategory: getNodesByCategory,
    has: (nodeId: string) => nodeRegistry.has(nodeId),
  };
};

export default nodeRegistry;

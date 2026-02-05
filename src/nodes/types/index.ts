/**
 * Orange Whale Node System - Type Definitions
 * 노드 기반 워크플로우 시스템 타입 정의
 */

// ===== 데이터 타입 =====

/**
 * 노드 포트에서 사용하는 데이터 타입
 */
export type DataType =
  | 'image'      // 이미지 URL
  | 'images'     // 이미지 배열
  | 'video'      // 비디오 URL
  | 'text'       // 문자열
  | 'number'     // 숫자
  | 'boolean'    // 참/거짓
  | 'json'       // JSON 객체
  | 'array'      // 배열
  | 'any';       // 모든 타입

/**
 * 노드 카테고리
 */
export type NodeCategory =
  | 'io'           // 입출력
  | 'generation'   // 생성
  | 'editing'      // 편집
  | 'analysis'     // 분석
  | 'utility';     // 유틸리티

// ===== 입력/출력 정의 =====

/**
 * 노드 입력 포트 정의
 */
export interface InputDefinition {
  id: string;              // 고유 ID (e.g., 'image', 'prompt')
  name: string;            // 표시 이름 (e.g., '입력 이미지')
  type: DataType;          // 데이터 타입
  required: boolean;       // 필수 여부
  default?: unknown;       // 기본값
  description?: string;    // 설명
}

/**
 * 노드 출력 포트 정의
 */
export interface OutputDefinition {
  id: string;              // 고유 ID (e.g., 'output_image')
  name: string;            // 표시 이름 (e.g., '결과 이미지')
  type: DataType;          // 데이터 타입
  description?: string;    // 설명
}

// ===== 설정 정의 =====

/**
 * 설정 입력 타입
 */
export type ConfigType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'slider'
  | 'color'
  | 'image-upload'
  | 'mockup-select';

/**
 * 노드 설정 정의
 */
export interface ConfigDefinition {
  id: string;              // 설정 ID
  name: string;            // 표시 이름
  type: ConfigType;        // 입력 타입
  default?: unknown;       // 기본값
  description?: string;    // 설명
  // select 타입용
  options?: Array<{ value: string; label: string }>;
  // slider 타입용
  min?: number;
  max?: number;
  step?: number;
}

// ===== 노드 실행 결과 =====

/**
 * 노드 실행 결과
 */
export interface NodeResult {
  outputs: Record<string, unknown>;  // 출력 값들
  error?: {
    message: string;
    code?: string;
  } | null;
}

// ===== 노드 정의 =====

/**
 * 노드 정의 인터페이스
 * 모든 노드는 이 인터페이스를 구현해야 함
 */
export interface NodeDefinition {
  // 메타데이터
  id: string;                    // 고유 ID (e.g., 'generate-image')
  name: string;                  // 표시 이름 (e.g., '이미지 생성')
  category: NodeCategory;        // 카테고리
  icon: string;                  // 아이콘 (이모지 또는 아이콘 이름)
  description: string;           // 설명

  // 포트 정의
  inputs: InputDefinition[];     // 입력 포트들
  outputs: OutputDefinition[];   // 출력 포트들

  // 설정 정의
  config: ConfigDefinition[];    // 사이드 패널 설정

  // 실행 함수
  execute: (
    inputs: Record<string, unknown>,
    config: Record<string, unknown>
  ) => Promise<NodeResult>;
}

// ===== 워크플로우 타입 =====

/**
 * 노드 인스턴스 (워크플로우에서 사용)
 */
export interface NodeInstance {
  instanceId: string;              // 고유 인스턴스 ID
  nodeId: string;                  // 노드 정의 ID
  position: { x: number; y: number };  // 캔버스 위치
  config: Record<string, unknown>;     // 설정 값
}

/**
 * 노드 간 연결
 */
export interface Connection {
  id: string;
  sourceNodeId: string;       // 출발 노드 인스턴스 ID
  sourceOutputId: string;     // 출발 출력 슬롯 ID
  targetNodeId: string;       // 도착 노드 인스턴스 ID
  targetInputId: string;      // 도착 입력 슬롯 ID
}

/**
 * 워크플로우 정의
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  // 노드 인스턴스들
  nodes: NodeInstance[];

  // 연결 (엣지)
  connections: Connection[];

  // 전역 변수
  variables?: Record<string, unknown>;

  // 입력/출력 노드 ID
  entryNodes: string[];
  exitNodes: string[];

  // 에러 발생 시 계속 진행 여부
  continueOnError?: boolean;
}

// ===== 실행 상태 =====

/**
 * 노드 실행 상태
 */
export type NodeExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'error'
  | 'skipped';

/**
 * 노드 실행 상태 정보
 */
export interface NodeExecutionState {
  status: NodeExecutionStatus;
  outputs?: Record<string, unknown>;
  error?: {
    message: string;
    code?: string;
  } | null;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * 워크플로우 실행 결과
 */
export interface WorkflowResult {
  success: boolean;
  outputs: Record<string, unknown>;
  nodeStates: Map<string, NodeExecutionState>;
  error?: {
    nodeId: string;
    message: string;
  } | null;
  duration: number;  // ms
}

// ===== 포트 색상 =====

/**
 * 데이터 타입별 포트 색상
 */
export const PORT_COLORS: Record<DataType, string> = {
  image: '#9333EA',      // 보라
  images: '#7C3AED',     // 보라 (진함)
  video: '#EC4899',      // 핑크
  text: '#3B82F6',       // 파랑
  number: '#22C55E',     // 초록
  boolean: '#F59E0B',    // 주황
  json: '#6366F1',       // 인디고
  array: '#14B8A6',      // 청록
  any: '#9E9E9E',        // 그레이
};

/**
 * 카테고리별 색상
 */
export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  io: '#6B7280',         // 그레이
  generation: '#8B5CF6', // 보라
  editing: '#F59E0B',    // 주황
  analysis: '#3B82F6',   // 파랑
  utility: '#10B981',    // 초록
};

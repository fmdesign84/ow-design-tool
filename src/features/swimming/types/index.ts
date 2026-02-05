/**
 * Swimming - 노드 기반 문서 생성 시스템 타입 정의
 */

// ===== 기본 타입 =====

export type PortType = 'text' | 'image' | 'layout' | 'style' | 'page' | 'document';

export interface Port {
  id: string;
  name: string;
  type: PortType;
}

// ===== 콘텐츠 타입 =====

export interface TextContent {
  text: string;
  level?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  align?: 'left' | 'center' | 'right';
}

export interface ImageContent {
  url: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export interface ChartContent {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: {
    labels: string[];
    values: number[];
  };
  title?: string;
}

export interface TableContent {
  headers: string[];
  rows: string[][];
}

export type ElementContent = TextContent | ImageContent | ChartContent | TableContent;

// ===== 레이아웃 타입 =====

export interface Position {
  x: number;      // 0-100 (퍼센트)
  y: number;
  width: number;
  height: number;
}

export interface LayoutElement {
  id: string;
  type: 'text' | 'image' | 'chart' | 'table' | 'shape';
  position: Position;
  content: ElementContent;
  style?: ElementStyle;
}

export interface ElementStyle {
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  shadow?: boolean;
}

export type LayoutType = 'hero' | 'two-column' | 'three-column' | 'grid' | 'data' | 'cta' | 'blank' | 'title-only';

export interface PageLayout {
  id: string;
  type: LayoutType;
  elements: LayoutElement[];
}

// ===== 스타일 타입 =====

export interface PageStyle {
  backgroundColor: string;
  padding: number;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface BrandKit {
  name: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

// ===== 문서 내 페이지 설정 타입 =====

export interface DocumentPageConfig {
  id: string;
  name: string;
  layoutIndex: number;  // 연결된 레이아웃 중 몇 번째 사용
  styleIndex: number;   // 연결된 스타일 중 몇 번째 사용
}

// ===== 페이지 & 문서 타입 =====

export interface PageData {
  id: string;
  name: string;
  layout: PageLayout;
  style: PageStyle;
  order: number;
}

export interface DocumentData {
  id: string;
  name: string;
  pages: PageData[];
  defaultStyle: PageStyle;
  brandKit?: BrandKit;
  createdAt: Date;
  updatedAt: Date;
}

// ===== 노드 시스템 타입 =====

export type SwimmingNodeType =
  // 콘텐츠 노드
  | 'text-input'
  | 'ai-text'
  | 'image-input'
  | 'ai-image'
  | 'chart'
  | 'table'
  // 레이아웃 노드
  | 'hero-layout'
  | 'two-column-layout'
  | 'three-column-layout'
  | 'grid-layout'
  | 'data-layout'
  | 'cta-layout'
  | 'blank-layout'
  // 스타일 노드
  | 'brand-kit'
  | 'theme'
  | 'custom-style'
  // 출력 노드
  | 'page'
  | 'document'
  | 'export-ppt'
  | 'export-pdf';

// 노드 실행 결과 타입
export interface SwimmingNodeResult {
  outputs: Record<string, unknown>;
  error?: {
    message: string;
    code?: string;
  };
}

// 노드 실행 함수 타입
export type SwimmingNodeExecute = (
  inputs: Record<string, unknown>,
  config: Record<string, unknown>
) => Promise<SwimmingNodeResult>;

export interface SwimmingNodeDefinition {
  id: SwimmingNodeType;
  name: string;
  description: string;
  category: 'content' | 'layout' | 'style' | 'output';
  icon: string;
  color: string;
  inputs: Port[];
  outputs: Port[];
  defaultConfig?: Record<string, unknown>;
  // 노드 실행 함수 (선택적 - 없으면 패스스루)
  execute?: SwimmingNodeExecute;
}

export interface SwimmingNodeData {
  nodeId: SwimmingNodeType;
  label: string;
  config: Record<string, unknown>;
  status?: 'idle' | 'running' | 'completed' | 'error';
  outputs?: Record<string, unknown>;
  // React Flow 호환성을 위한 인덱스 시그니처
  [key: string]: unknown;
}

// ===== 실행 타입 =====

export interface SwimmingExecutionResult {
  success: boolean;
  document?: DocumentData;
  error?: string;
  duration: number;
}

// ===== 내보내기 옵션 =====

export interface ExportOptions {
  format: 'pptx' | 'pdf' | 'html';
  quality?: 'draft' | 'standard' | 'high';
  includeNotes?: boolean;
}

// ===== 포트 색상 =====

export const SWIMMING_PORT_COLORS: Record<PortType, string> = {
  text: '#F59E0B',     // 앰버 - 텍스트
  image: '#8B5CF6',    // 바이올렛 - 이미지
  layout: '#3B82F6',   // 블루 - 레이아웃
  style: '#EC4899',    // 핑크 - 스타일
  page: '#10B981',     // 에메랄드 - 페이지
  document: '#06B6D4', // 시안 - 문서
};

// ===== 기본 스타일 =====

export const DEFAULT_PAGE_STYLE: PageStyle = {
  backgroundColor: '#1E1E1E',
  padding: 40,
  fontFamily: 'Pretendard, sans-serif',
  primaryColor: '#FFFFFF',
  secondaryColor: '#9CA3AF',
  accentColor: '#3B82F6',
};

export const DEFAULT_BRAND_KIT: BrandKit = {
  name: 'Default',
  colors: {
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#F59E0B',
    background: '#0F172A',
    text: '#F8FAFC',
  },
  fonts: {
    heading: 'Pretendard',
    body: 'Pretendard',
  },
};

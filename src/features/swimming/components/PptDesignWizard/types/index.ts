// ============================================
// 디자인 토큰 타입
// ============================================
export interface DesignTokens {
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

// ============================================
// 문서 파싱 관련 타입
// ============================================
export type DocumentType = 'excel' | 'word' | 'markdown' | 'docx' | 'image';

export interface ParsedDocument {
  type: DocumentType;
  filename: string;
  content: DocumentContent;
  metadata?: Record<string, unknown>;
}

export interface DocumentContent {
  sections: ContentSection[];
  rawText?: string;
}

export interface ContentSection {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'chart-data' | 'image';
  level?: number; // heading level (1-6)
  content: string | string[] | TableData | ChartData;
  items?: string[]; // list items (for type: 'list')
  metadata?: Record<string, unknown>;
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  title?: string;
  labels: string[];
  datasets: {
    name: string;
    values: number[];
    color?: string;
  }[];
}

// ============================================
// 이미지 관련 타입
// ============================================
export interface ImageAsset {
  id: string;
  filename: string;
  url: string; // base64 or blob URL
  width: number;
  height: number;
  aspectRatio: number;
  tags?: string[]; // AI가 분석한 이미지 태그
  matchedSectionId?: string; // 매칭된 섹션 ID
}

// ============================================
// 슬라이드 구성 타입
// ============================================
export type SlideLayoutType =
  | 'title'
  | 'section-header'
  | 'content'
  | 'two-column'
  | 'image-left'
  | 'image-right'
  | 'full-image'
  | 'chart'
  | 'comparison'
  | 'quote'
  | 'closing';

export interface SlideConfig {
  id: string;
  order: number;
  layout: SlideLayoutType;
  content: SlideContent;
  designTokens?: Partial<DesignTokens>; // 슬라이드별 오버라이드
  notes?: string; // 발표자 노트
}

export interface SlideContent {
  title?: string;
  subtitle?: string;
  body?: string | string[];
  bulletPoints?: string[];
  image?: ImageAsset;
  chart?: ChartData;
  table?: TableData;
  quote?: {
    text: string;
    author?: string;
  };
  columns?: {
    left: Partial<SlideContent>;
    right: Partial<SlideContent>;
  };
}

// ============================================
// AI 분석 결과 타입
// ============================================
export interface ContentAnalysis {
  summary: string;
  mainTopics: string[];
  suggestedSlideCount: number;
  structure: {
    hasIntro: boolean;
    hasConclusion: boolean;
    sectionCount: number;
  };
  dataVisualizations: {
    sectionId: string;
    suggestedChartType: ChartData['type'];
    reason: string;
  }[];
  imageMatches: {
    imageId: string;
    sectionId: string;
    confidence: number;
    reason: string;
  }[];
}

// ============================================
// 프로젝트 상태 타입
// ============================================
export interface ProjectState {
  // 입력 데이터
  designTokens: DesignTokens | null;
  documents: ParsedDocument[];
  images: ImageAsset[];

  // AI 분석 결과
  analysis: ContentAnalysis | null;

  // 슬라이드 구성
  slides: SlideConfig[];

  // UI 상태
  currentStep: number;
  isProcessing: boolean;
  errors: string[];
}

// ============================================
// 액션 타입
// ============================================
export type ProjectAction =
  | { type: 'SET_DESIGN_TOKENS'; payload: DesignTokens }
  | { type: 'ADD_DOCUMENT'; payload: ParsedDocument }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'ADD_IMAGE'; payload: ImageAsset }
  | { type: 'REMOVE_IMAGE'; payload: string }
  | { type: 'SET_ANALYSIS'; payload: ContentAnalysis }
  | { type: 'SET_SLIDES'; payload: SlideConfig[] }
  | { type: 'UPDATE_SLIDE'; payload: { id: string; updates: Partial<SlideConfig> } }
  | { type: 'REORDER_SLIDES'; payload: string[] }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET' };

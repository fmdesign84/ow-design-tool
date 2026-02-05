/**
 * 문서 스타일 통합기 - 타입 정의
 * 문서 구조(헤딩/본문/목록)를 완전히 파악하고 스타일 적용
 */

// ===== 문서 요소 타입 =====
export type ElementType =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'paragraph'
  | 'listBullet'
  | 'listNumber'
  | 'table'
  | 'image'
  | 'pageBreak';

// ===== 텍스트 런 (스타일이 다른 텍스트 조각) =====
export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  fontSize?: number;      // pt
  fontFamily?: string;
  color?: string;         // hex
  highlight?: string;     // 형광펜 색상
}

// ===== 문서 요소 (단락/헤딩/목록 등) =====
export interface DocumentElement {
  id: string;
  type: ElementType;
  runs: TextRun[];           // 텍스트 조각들

  // 단락 스타일
  alignment?: 'left' | 'center' | 'right' | 'justify';
  lineSpacing?: number;      // 배수 (1.0, 1.5, 2.0 등)
  spaceBefore?: number;      // pt
  spaceAfter?: number;       // pt
  indentLeft?: number;       // pt
  indentRight?: number;      // pt
  indentFirstLine?: number;  // pt

  // 목록 정보
  listLevel?: number;        // 0부터 시작
  listNumber?: number;       // 현재 번호 (1, 2, 3...)
  listFormat?: string;       // "1.", "1.1", "가.", "①" 등

  // 원본 정보 (디버깅용)
  rawStyleId?: string;
  rawStyleName?: string;
}

// ===== 스타일 정의 (각 요소 타입별) =====
export interface ElementStyle {
  // 텍스트 스타일
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;

  // 단락 스타일
  alignment: 'left' | 'center' | 'right' | 'justify';
  lineSpacing: number;
  spaceBefore: number;
  spaceAfter: number;
  indentLeft: number;
  indentFirstLine: number;
}

// ===== 문서 전체 스타일 맵 =====
export interface DocumentStyleMap {
  heading1: ElementStyle;
  heading2: ElementStyle;
  heading3: ElementStyle;
  heading4: ElementStyle;
  paragraph: ElementStyle;   // 본문
  listBullet: ElementStyle;
  listNumber: ElementStyle;

  // 번호 매기기 형식
  numberingFormats: {
    heading1: string;  // "제1장", "Chapter 1", "1." 등
    heading2: string;  // "1.1", "제1절" 등
    heading3: string;  // "1.1.1", "가." 등
    list: string;      // "1)", "①", "가)" 등
  };

  // 페이지 설정
  pageMargins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// ===== 파싱된 문서 =====
export interface ParsedDocument {
  id: string;
  name: string;
  type: 'docx' | 'pdf' | 'txt';
  file: File;

  // 파싱된 내용
  elements: DocumentElement[];

  // 추출된 스타일
  styleMap: DocumentStyleMap;

  // 문서 구조 분석 결과
  structure: {
    hasHeadings: boolean;
    headingLevels: number[];     // 사용된 헤딩 레벨들
    hasNumberedList: boolean;
    hasBulletList: boolean;
    lastHeadingNumbers: number[]; // [1, 2, 1] = "1.2.1"까지 사용됨
  };

  isMainDocument: boolean;
  order: number;
}

// ===== 병합 모드 =====
export type MergeMode =
  | 'smartMerge'      // 스마트 병합: 번호/챕터 자동 연결
  | 'simpleMerge'     // 단순 병합: 순서대로만
  | 'styleOnly';      // 스타일만 적용: 별도 파일로

// ===== 병합 설정 =====
export interface MergeSettings {
  mode: MergeMode;

  // 스마트 병합 옵션
  continueNumbering: boolean;    // 번호 이어가기
  addSectionBreak: boolean;      // 섹션 구분 추가

  // 단순 병합 옵션
  addSeparator: boolean;         // 구분선 추가
  separatorStyle: 'line' | 'pageBreak' | 'title';

  // 공통
  outputFormat: 'docx' | 'pdf';
}

// ===== 상태 =====
export interface MergerState {
  documents: ParsedDocument[];
  mainDocument: ParsedDocument | null;
  settings: MergeSettings;
  isProcessing: boolean;
  progress: number;
  progressMessage: string;
  error: string | null;
}

// ===== 기본값 =====
export const DEFAULT_ELEMENT_STYLE: ElementStyle = {
  fontFamily: '맑은 고딕',
  fontSize: 11,
  fontColor: '#000000',
  bold: false,
  italic: false,
  underline: false,
  alignment: 'left',
  lineSpacing: 1.15,
  spaceBefore: 0,
  spaceAfter: 8,
  indentLeft: 0,
  indentFirstLine: 0,
};

export const DEFAULT_STYLE_MAP: DocumentStyleMap = {
  heading1: {
    ...DEFAULT_ELEMENT_STYLE,
    fontSize: 16,
    bold: true,
    spaceBefore: 12,
    spaceAfter: 6,
  },
  heading2: {
    ...DEFAULT_ELEMENT_STYLE,
    fontSize: 14,
    bold: true,
    spaceBefore: 10,
    spaceAfter: 4,
  },
  heading3: {
    ...DEFAULT_ELEMENT_STYLE,
    fontSize: 12,
    bold: true,
    spaceBefore: 8,
    spaceAfter: 4,
  },
  heading4: {
    ...DEFAULT_ELEMENT_STYLE,
    fontSize: 11,
    bold: true,
    spaceBefore: 6,
    spaceAfter: 2,
  },
  paragraph: {
    ...DEFAULT_ELEMENT_STYLE,
  },
  listBullet: {
    ...DEFAULT_ELEMENT_STYLE,
    indentLeft: 18,
  },
  listNumber: {
    ...DEFAULT_ELEMENT_STYLE,
    indentLeft: 18,
  },
  numberingFormats: {
    heading1: '제{n}장',
    heading2: '{n}.{n}',
    heading3: '{n}.{n}.{n}',
    list: '{n})',
  },
  pageMargins: {
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
  },
};

export const DEFAULT_MERGE_SETTINGS: MergeSettings = {
  mode: 'smartMerge',
  continueNumbering: true,
  addSectionBreak: true,
  addSeparator: true,
  separatorStyle: 'title',
  outputFormat: 'docx',
};

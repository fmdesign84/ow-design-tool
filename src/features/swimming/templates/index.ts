/**
 * Swimming 예시 템플릿
 * 바로 사용 가능한 워크플로우 예시
 * 노드 간격: 세로 200px 이상, 가로 300px 이상
 *
 * 새로운 구조:
 * - page 노드 제거
 * - layout/style → document 직접 연결
 * - document 노드의 config.pages로 페이지 관리
 */

import type { Node, Edge } from '@xyflow/react';
import type { SwimmingNodeData, DocumentPageConfig } from '../types';

export interface SwimmingTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  nodes: Node<SwimmingNodeData>[];
  edges: Edge[];
  locked?: boolean;      // 잠금 상태 (coming soon)
  isNew?: boolean;       // NEW 뱃지
  isWizard?: boolean;    // 스텝바이스텝 UI 사용 여부
}

// 1. 회사 소개서 템플릿 (단일 페이지)
export const companyIntroTemplate: SwimmingTemplate = {
  id: 'company-intro',
  name: '회사 소개서',
  description: '텍스트 → 히어로 레이아웃 → PPT 출력',
  locked: true,
  nodes: [
    {
      id: 'text-1',
      type: 'swimming',
      position: { x: 50, y: 50 },
      data: {
        nodeId: 'text-input',
        label: '회사명',
        config: { text: 'FM Group', level: 'h1' },
        status: 'idle',
      },
    },
    {
      id: 'text-2',
      type: 'swimming',
      position: { x: 50, y: 250 },
      data: {
        nodeId: 'text-input',
        label: '슬로건',
        config: { text: 'Creative Solutions for Your Business', level: 'h2' },
        status: 'idle',
      },
    },
    {
      id: 'layout-1',
      type: 'swimming',
      position: { x: 400, y: 100 },
      data: {
        nodeId: 'hero-layout',
        label: '히어로 레이아웃',
        config: { backgroundColor: '#0F172A', padding: 60 },
        status: 'idle',
      },
    },
    {
      id: 'theme-1',
      type: 'swimming',
      position: { x: 400, y: 350 },
      data: {
        nodeId: 'theme',
        label: '다크 테마',
        config: { preset: 'dark' },
        status: 'idle',
      },
    },
    {
      id: 'doc-1',
      type: 'swimming',
      position: { x: 750, y: 200 },
      data: {
        nodeId: 'document',
        label: '문서',
        config: {
          name: '회사 소개서',
          pages: [
            { id: 'p1', name: '표지', layoutIndex: 0, styleIndex: 0 },
          ] as DocumentPageConfig[],
        },
        status: 'idle',
      },
    },
    {
      id: 'export-1',
      type: 'swimming',
      position: { x: 1100, y: 200 },
      data: {
        nodeId: 'export-ppt',
        label: 'PPT 출력',
        config: { filename: '회사소개서', quality: 'high' },
        status: 'idle',
      },
    },
  ],
  edges: [
    // 텍스트 → 레이아웃
    { id: 'e1', source: 'text-1', target: 'layout-1', sourceHandle: 'text', targetHandle: 'title' },
    { id: 'e2', source: 'text-2', target: 'layout-1', sourceHandle: 'text', targetHandle: 'subtitle' },
    // 레이아웃 → 문서
    { id: 'e3', source: 'layout-1', target: 'doc-1', sourceHandle: 'layout', targetHandle: 'layouts' },
    // 스타일 → 문서
    { id: 'e4', source: 'theme-1', target: 'doc-1', sourceHandle: 'style', targetHandle: 'styles' },
    // 문서 → 출력
    { id: 'e5', source: 'doc-1', target: 'export-1', sourceHandle: 'document', targetHandle: 'document' },
  ],
};

// 2. AI 프레젠테이션 템플릿 (다중 페이지)
const aiPresentationTemplate: SwimmingTemplate = {
  id: 'ai-presentation',
  name: 'AI 프레젠테이션',
  description: 'AI 텍스트 생성 → 2개 레이아웃 → PPT',
  locked: true,
  nodes: [
    {
      id: 'ai-text-1',
      type: 'swimming',
      position: { x: 50, y: 50 },
      data: {
        nodeId: 'ai-text',
        label: 'AI 제목 생성',
        config: {
          prompt: '혁신적인 AI 기술 발표 제목 생성',
          tone: 'professional',
          length: 'short'
        },
        status: 'idle',
      },
    },
    {
      id: 'ai-text-2',
      type: 'swimming',
      position: { x: 50, y: 350 },
      data: {
        nodeId: 'ai-text',
        label: 'AI 본문 생성',
        config: {
          prompt: 'AI 기술의 장점과 활용 사례 3가지',
          tone: 'professional',
          length: 'medium'
        },
        status: 'idle',
      },
    },
    {
      id: 'layout-1',
      type: 'swimming',
      position: { x: 400, y: 50 },
      data: {
        nodeId: 'hero-layout',
        label: '표지 레이아웃',
        config: { backgroundColor: '#0F172A', padding: 60 },
        status: 'idle',
      },
    },
    {
      id: 'layout-2',
      type: 'swimming',
      position: { x: 400, y: 300 },
      data: {
        nodeId: 'two-column-layout',
        label: '본문 레이아웃',
        config: { backgroundColor: '#1E293B', padding: 40 },
        status: 'idle',
      },
    },
    {
      id: 'brand-1',
      type: 'swimming',
      position: { x: 400, y: 550 },
      data: {
        nodeId: 'brand-kit',
        label: '브랜드 킷',
        config: {
          name: 'Tech Corp',
          primaryColor: '#3B82F6',
          secondaryColor: '#64748B',
          accentColor: '#10B981'
        },
        status: 'idle',
      },
    },
    {
      id: 'doc-1',
      type: 'swimming',
      position: { x: 750, y: 250 },
      data: {
        nodeId: 'document',
        label: '문서',
        config: {
          name: 'AI 프레젠테이션',
          pages: [
            { id: 'p1', name: '표지', layoutIndex: 0, styleIndex: 0 },
            { id: 'p2', name: '본문 1', layoutIndex: 1, styleIndex: 0 },
            { id: 'p3', name: '본문 2', layoutIndex: 1, styleIndex: 0 },
          ] as DocumentPageConfig[],
        },
        status: 'idle',
      },
    },
    {
      id: 'export-1',
      type: 'swimming',
      position: { x: 1100, y: 250 },
      data: {
        nodeId: 'export-ppt',
        label: 'PPT 출력',
        config: { filename: 'AI_프레젠테이션', quality: 'high' },
        status: 'idle',
      },
    },
  ],
  edges: [
    // 텍스트 → 레이아웃
    { id: 'e1', source: 'ai-text-1', target: 'layout-1', sourceHandle: 'text', targetHandle: 'title' },
    { id: 'e2', source: 'ai-text-2', target: 'layout-2', sourceHandle: 'text', targetHandle: 'left' },
    // 레이아웃들 → 문서 (다중 연결)
    { id: 'e3', source: 'layout-1', target: 'doc-1', sourceHandle: 'layout', targetHandle: 'layouts' },
    { id: 'e4', source: 'layout-2', target: 'doc-1', sourceHandle: 'layout', targetHandle: 'layouts' },
    // 스타일 → 문서
    { id: 'e5', source: 'brand-1', target: 'doc-1', sourceHandle: 'style', targetHandle: 'styles' },
    // 문서 → 출력
    { id: 'e6', source: 'doc-1', target: 'export-1', sourceHandle: 'document', targetHandle: 'document' },
  ],
};

// 3. 제품 카탈로그 템플릿
export const productCatalogTemplate: SwimmingTemplate = {
  id: 'product-catalog',
  name: '제품 카탈로그',
  description: '이미지 + 텍스트 → 그리드 → PDF',
  locked: true,
  nodes: [
    {
      id: 'text-1',
      type: 'swimming',
      position: { x: 50, y: 50 },
      data: {
        nodeId: 'text-input',
        label: '카탈로그 제목',
        config: { text: '2024 신제품 카탈로그', level: 'h1' },
        status: 'idle',
      },
    },
    {
      id: 'img-1',
      type: 'swimming',
      position: { x: 50, y: 300 },
      data: {
        nodeId: 'image-input',
        label: '제품 이미지',
        config: { url: '', alt: '제품', objectFit: 'cover' },
        status: 'idle',
      },
    },
    {
      id: 'layout-1',
      type: 'swimming',
      position: { x: 400, y: 50 },
      data: {
        nodeId: 'hero-layout',
        label: '표지 레이아웃',
        config: { backgroundColor: '#FFFFFF', padding: 60 },
        status: 'idle',
      },
    },
    {
      id: 'layout-2',
      type: 'swimming',
      position: { x: 400, y: 300 },
      data: {
        nodeId: 'grid-layout',
        label: '제품 그리드',
        config: { backgroundColor: '#F8FAFC', padding: 40 },
        status: 'idle',
      },
    },
    {
      id: 'theme-1',
      type: 'swimming',
      position: { x: 400, y: 550 },
      data: {
        nodeId: 'theme',
        label: '라이트 테마',
        config: { preset: 'light' },
        status: 'idle',
      },
    },
    {
      id: 'doc-1',
      type: 'swimming',
      position: { x: 750, y: 250 },
      data: {
        nodeId: 'document',
        label: '카탈로그',
        config: {
          name: '제품 카탈로그',
          pages: [
            { id: 'p1', name: '표지', layoutIndex: 0, styleIndex: 0 },
            { id: 'p2', name: '제품 1', layoutIndex: 1, styleIndex: 0 },
            { id: 'p3', name: '제품 2', layoutIndex: 1, styleIndex: 0 },
            { id: 'p4', name: '제품 3', layoutIndex: 1, styleIndex: 0 },
          ] as DocumentPageConfig[],
        },
        status: 'idle',
      },
    },
    {
      id: 'export-1',
      type: 'swimming',
      position: { x: 1100, y: 250 },
      data: {
        nodeId: 'export-pdf',
        label: 'PDF 출력',
        config: { filename: '제품카탈로그', quality: 'high' },
        status: 'idle',
      },
    },
  ],
  edges: [
    // 텍스트/이미지 → 레이아웃
    { id: 'e1', source: 'text-1', target: 'layout-1', sourceHandle: 'text', targetHandle: 'title' },
    { id: 'e2', source: 'img-1', target: 'layout-2', sourceHandle: 'image', targetHandle: 'items' },
    // 레이아웃들 → 문서 (다중 연결)
    { id: 'e3', source: 'layout-1', target: 'doc-1', sourceHandle: 'layout', targetHandle: 'layouts' },
    { id: 'e4', source: 'layout-2', target: 'doc-1', sourceHandle: 'layout', targetHandle: 'layouts' },
    // 스타일 → 문서
    { id: 'e5', source: 'theme-1', target: 'doc-1', sourceHandle: 'style', targetHandle: 'styles' },
    // 문서 → 출력
    { id: 'e6', source: 'doc-1', target: 'export-1', sourceHandle: 'document', targetHandle: 'document' },
  ],
};

// 4. PPT Design 템플릿 (스텝바이스텝 위자드)
const pptDesignTemplate: SwimmingTemplate = {
  id: 'ppt-design',
  name: 'PPT Design',
  description: 'AI 기반 프레젠테이션 디자인 제안',
  locked: true,
  isWizard: true,
  nodes: [], // 위자드 모드는 노드 에디터 사용 안함
  edges: [],
};

// 5. 문서 스타일 통합 템플릿 (스텝바이스텝 위자드)
const documentMergerTemplate: SwimmingTemplate = {
  id: 'document-merger',
  name: '문서 스타일 통합',
  description: '여러 문서의 스타일을 통일하여 병합',
  locked: true,
  isWizard: true,
  nodes: [], // 위자드 모드는 노드 에디터 사용 안함
  edges: [],
};

// 모든 템플릿 내보내기
export const swimmingTemplates: SwimmingTemplate[] = [
  pptDesignTemplate,        // NEW 뱃지로 맨 앞에
  documentMergerTemplate,   // NEW 뱃지
  aiPresentationTemplate,   // Coming Soon
];

export default swimmingTemplates;

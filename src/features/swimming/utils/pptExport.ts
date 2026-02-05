/**
 * Swimming PPT Export Utility
 * API를 통한 서버사이드 PPT 생성
 */

import type { Node, Edge } from '@xyflow/react';
import type { SwimmingNodeData } from '../types';

// 테마 설정
interface ThemeConfig {
  preset: 'dark' | 'light' | 'corporate' | 'creative' | 'minimal';
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

// 브랜드 설정
interface BrandConfig {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

// 레이아웃 데이터
interface LayoutData {
  type: string;
  config: Record<string, unknown>;
  content: Record<string, unknown>;
}

// 페이지 데이터
interface PageData {
  name: string;
  layout?: LayoutData;
  style?: Record<string, unknown>;
}

// 문서 데이터
interface DocumentData {
  name: string;
  pages: PageData[];
  brand?: BrandConfig;
  theme?: ThemeConfig;
}

// 내보내기 옵션
interface ExportOptions {
  filename?: string;
  quality?: 'draft' | 'standard' | 'high';
  author?: string;
}

// 테마 프리셋 -> 컬러 무드 매핑
const THEME_TO_MOOD: Record<string, string> = {
  dark: 'modern',
  light: 'calm',
  corporate: 'calm',
  creative: 'warm',
  minimal: 'minimal',
};

/**
 * 노드 그래프에서 문서 데이터 추출
 */
function extractDocumentData(
  nodes: Node<SwimmingNodeData>[],
  edges: Edge[]
): DocumentData | null {
  // document 노드 찾기
  const documentNode = nodes.find(n => n.data.nodeId === 'document');

  // 브랜드 노드 찾기
  const brandNode = nodes.find(n => n.data.nodeId === 'brand-kit');
  const brand: BrandConfig | undefined = brandNode?.data.config as unknown as BrandConfig;

  // 테마 노드 찾기
  const themeNode = nodes.find(n => n.data.nodeId === 'theme');
  const theme: ThemeConfig | undefined = themeNode?.data.config as unknown as ThemeConfig;

  // 페이지 노드들 찾기
  const pageNodes = nodes.filter(n => n.data.nodeId === 'page');

  // 레이아웃 노드들과 연결 정보 수집
  const pages: PageData[] = pageNodes.map(pageNode => {
    // 페이지에 연결된 레이아웃 찾기
    const layoutEdge = edges.find(e => e.target === pageNode.id && e.targetHandle === 'layout');
    let layout: LayoutData | undefined;

    if (layoutEdge) {
      const layoutNode = nodes.find(n => n.id === layoutEdge.source);
      if (layoutNode && layoutNode.data.nodeId.includes('layout')) {
        // 레이아웃에 연결된 콘텐츠 노드들 수집
        const contentInputs: Record<string, unknown> = {};
        const layoutDef = edges.filter(e => e.target === layoutNode.id);

        layoutDef.forEach(edge => {
          const contentNode = nodes.find(n => n.id === edge.source);
          if (contentNode) {
            const handleId = edge.targetHandle || 'content';
            if (contentNode.data.nodeId === 'text-input') {
              contentInputs[handleId] = contentNode.data.config?.text || '';
            } else if (contentNode.data.nodeId === 'image-input') {
              contentInputs[handleId] = contentNode.data.config?.url || '';
            } else if (contentNode.data.nodeId === 'ai-text') {
              contentInputs[handleId] = `[AI 생성: ${contentNode.data.config?.prompt || ''}]`;
            }
          }
        });

        layout = {
          type: layoutNode.data.nodeId,
          config: layoutNode.data.config || {},
          content: contentInputs,
        };
      }
    }

    return {
      name: String(pageNode.data.config?.name || '새 페이지'),
      layout,
    };
  });

  // 텍스트 노드들도 수집 (페이지가 없는 경우)
  if (pages.length === 0) {
    const textNodes = nodes.filter(n => n.data.nodeId === 'text-input');
    if (textNodes.length > 0) {
      pages.push({
        name: documentNode?.data.config?.name as string || '슬라이드 1',
        layout: {
          type: 'content',
          config: {},
          content: {
            text: textNodes.map(n => n.data.config?.text || '').join('\n\n'),
          },
        },
      });
    }
  }

  return {
    name: String(documentNode?.data.config?.name || '새 문서'),
    pages: pages.length > 0 ? pages : [{ name: '기본 페이지' }],
    brand,
    theme,
  };
}

/**
 * Base64를 Blob으로 변환
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/**
 * Blob 다운로드
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * API를 통해 PPT 슬라이드 생성
 */
async function generateSlide(
  title: string,
  subtitle: string,
  description: string,
  mood: string,
  slideType: 'title' | 'content' | 'section' | 'ending'
): Promise<{ data: string; filename: string }> {
  const response = await fetch('/api/generate-pptx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      subtitle,
      description,
      mood,
      slideType,
    }),
  });

  if (!response.ok) {
    throw new Error('PPT 생성 실패');
  }

  return response.json();
}

/**
 * Swimming 노드 그래프를 PPT로 내보내기
 */
export async function exportToPpt(
  nodes: Node<SwimmingNodeData>[],
  edges: Edge[],
  options: ExportOptions = {}
): Promise<void> {
  // 문서 데이터 추출
  const documentData = extractDocumentData(nodes, edges);

  // 테마에서 컬러 무드 결정
  const themePreset = documentData?.theme?.preset || 'dark';
  const mood = THEME_TO_MOOD[themePreset] || 'modern';

  const docName = documentData?.name || options.filename || '새 문서';

  // 페이지가 없으면 기본 슬라이드 생성
  if (!documentData?.pages || documentData.pages.length === 0) {
    const result = await generateSlide(
      docName,
      '',
      '',
      mood,
      'title'
    );

    const blob = base64ToBlob(result.data, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    downloadBlob(blob, result.filename);
    return;
  }

  // 첫 번째 페이지를 표지로, 나머지를 콘텐츠로
  const firstPage = documentData.pages[0];

  // 슬라이드 타입 결정
  let slideType: 'title' | 'content' | 'section' | 'ending' = 'title';
  let title = firstPage.name;
  let subtitle = '';
  let description = '';

  if (firstPage.layout) {
    const { type, content } = firstPage.layout;

    if (type === 'hero-layout') {
      slideType = 'title';
      title = String(content.title || firstPage.name);
      subtitle = String(content.subtitle || '');
    } else if (type === 'cta-layout') {
      slideType = 'ending';
      title = String(content.headline || firstPage.name);
      description = String(content.description || '');
    } else {
      slideType = 'content';
      title = firstPage.name;
      description = Object.values(content)
        .filter(v => typeof v === 'string')
        .join('\n\n');
    }
  }

  // API 호출
  const result = await generateSlide(
    title,
    subtitle,
    description,
    mood,
    slideType
  );

  // 다운로드
  const blob = base64ToBlob(result.data, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  const filename = `${docName.replace(/[^a-zA-Z0-9가-힣\s]/g, '').replace(/\s+/g, '_')}.pptx`;
  downloadBlob(blob, filename);
}

/**
 * 간단한 PPT 내보내기 (직접 데이터로)
 */
export async function exportSimplePpt(
  title: string,
  subtitle: string = '',
  description: string = '',
  mood: string = 'modern',
  slideType: 'title' | 'content' | 'section' | 'ending' = 'title'
): Promise<void> {
  const result = await generateSlide(title, subtitle, description, mood, slideType);
  const blob = base64ToBlob(result.data, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  downloadBlob(blob, result.filename);
}

export default exportToPpt;

/**
 * Swimming 노드 레지스트리
 * 모든 노드 정의를 관리
 */

import type { SwimmingNodeDefinition, SwimmingNodeType, DocumentPageConfig } from '../types';
import { getApiUrl } from '../../../utils/apiRoute';

// ===== 콘텐츠 노드 정의 =====

const contentNodes: SwimmingNodeDefinition[] = [
  {
    id: 'text-input',
    name: '텍스트 입력',
    description: '직접 텍스트를 입력합니다',
    category: 'content',
    icon: 'Type',
    color: '#F59E0B',
    inputs: [],
    outputs: [{ id: 'text', name: '텍스트', type: 'text' }],
    defaultConfig: {
      text: '',
      level: 'body',
    },
    execute: async (_inputs, config) => {
      return {
        outputs: {
          text: {
            content: config.text || '',
            level: config.level || 'body',
          },
        },
      };
    },
  },
  {
    id: 'ai-text',
    name: 'AI 텍스트',
    description: 'AI로 텍스트를 생성합니다',
    category: 'content',
    icon: 'Sparkles',
    color: '#F59E0B',
    inputs: [{ id: 'context', name: '컨텍스트', type: 'text' }],
    outputs: [{ id: 'text', name: '텍스트', type: 'text' }],
    defaultConfig: {
      prompt: '',
      tone: 'professional',
      length: 'medium',
    },
    execute: async (inputs, config) => {
      try {
        const prompt = (config.prompt as string) || '';

        // 프롬프트가 비어있으면 바로 반환
        if (!prompt.trim()) {
          return {
            outputs: {
              text: {
                content: '',
                level: 'body',
              },
            },
          };
        }

        const response = await fetch(getApiUrl('/api/enhance-prompt', { method: 'POST' }), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt,
            type: 'image', // enhance-prompt API 형식에 맞춤
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          // API 실패 시 원본 프롬프트 사용
          return {
            outputs: {
              text: {
                content: prompt,
                level: 'body',
              },
            },
          };
        }

        return {
          outputs: {
            text: {
              content: data.enhanced || prompt,
              level: 'body',
            },
          },
        };
      } catch (error) {
        // 네트워크 오류 시 원본 프롬프트 사용
        return {
          outputs: {
            text: {
              content: (config.prompt as string) || '',
              level: 'body',
            },
          },
        };
      }
    },
  },
  {
    id: 'image-input',
    name: '이미지 입력',
    description: '이미지를 업로드합니다',
    category: 'content',
    icon: 'Image',
    color: '#8B5CF6',
    inputs: [],
    outputs: [{ id: 'image', name: '이미지', type: 'image' }],
    defaultConfig: {
      url: '',
      objectFit: 'cover',
    },
  },
  {
    id: 'ai-image',
    name: 'AI 이미지',
    description: 'AI로 이미지를 생성합니다 (Wave 연동)',
    category: 'content',
    icon: 'Wand2',
    color: '#8B5CF6',
    inputs: [],
    outputs: [{ id: 'image', name: '이미지', type: 'image' }],
    defaultConfig: {
      prompt: '',
      aspectRatio: '16:9',
    },
  },
  {
    id: 'chart',
    name: '차트',
    description: '데이터 차트를 생성합니다',
    category: 'content',
    icon: 'BarChart3',
    color: '#F59E0B',
    inputs: [],
    outputs: [{ id: 'chart', name: '차트', type: 'image' }],
    defaultConfig: {
      type: 'bar',
      data: { labels: [], values: [] },
      title: '',
    },
  },
  {
    id: 'table',
    name: '테이블',
    description: '표 데이터를 입력합니다',
    category: 'content',
    icon: 'Table',
    color: '#F59E0B',
    inputs: [],
    outputs: [{ id: 'table', name: '테이블', type: 'text' }],
    defaultConfig: {
      headers: ['열 1', '열 2', '열 3'],
      rows: [['', '', '']],
    },
  },
];

// ===== 레이아웃 노드 정의 =====

const layoutNodes: SwimmingNodeDefinition[] = [
  {
    id: 'hero-layout',
    name: '히어로 레이아웃',
    description: '큰 이미지와 타이틀이 있는 표지 레이아웃',
    category: 'layout',
    icon: 'Layers',
    color: '#3B82F6',
    inputs: [
      { id: 'title', name: '타이틀', type: 'text' },
      { id: 'subtitle', name: '서브타이틀', type: 'text' },
      { id: 'image', name: '배경 이미지', type: 'image' },
    ],
    outputs: [{ id: 'layout', name: '레이아웃', type: 'layout' }],
    defaultConfig: {
      titlePosition: 'center',
      overlay: 0.4,
      textAlign: 'center',
    },
    execute: async (inputs, config) => {
      return {
        outputs: {
          layout: {
            type: 'hero',
            title: inputs.title || null,
            subtitle: inputs.subtitle || null,
            image: inputs.image || null,
            config: {
              titlePosition: config.titlePosition || 'center',
              overlay: config.overlay || 0.4,
              textAlign: config.textAlign || 'center',
            },
          },
        },
      };
    },
  },
  {
    id: 'two-column-layout',
    name: '2단 레이아웃',
    description: '좌우 2단으로 나눈 레이아웃',
    category: 'layout',
    icon: 'Columns2',
    color: '#3B82F6',
    inputs: [
      { id: 'left', name: '좌측 콘텐츠', type: 'text' },
      { id: 'right', name: '우측 콘텐츠', type: 'text' },
    ],
    outputs: [{ id: 'layout', name: '레이아웃', type: 'layout' }],
    defaultConfig: {
      ratio: '1:1',
      gap: 40,
    },
    execute: async (inputs, config) => {
      return {
        outputs: {
          layout: {
            type: 'two-column',
            left: inputs.left || null,
            right: inputs.right || null,
            config: {
              ratio: config.ratio || '1:1',
              gap: config.gap || 40,
            },
          },
        },
      };
    },
  },
  {
    id: 'three-column-layout',
    name: '3단 레이아웃',
    description: '3단으로 나눈 레이아웃',
    category: 'layout',
    icon: 'Columns3',
    color: '#3B82F6',
    inputs: [
      { id: 'col1', name: '1열', type: 'text' },
      { id: 'col2', name: '2열', type: 'text' },
      { id: 'col3', name: '3열', type: 'text' },
    ],
    outputs: [{ id: 'layout', name: '레이아웃', type: 'layout' }],
    defaultConfig: {
      gap: 24,
    },
  },
  {
    id: 'grid-layout',
    name: '그리드 레이아웃',
    description: '여러 아이템을 그리드로 배치',
    category: 'layout',
    icon: 'Grid3x3',
    color: '#3B82F6',
    inputs: [
      { id: 'items', name: '아이템들', type: 'text' },
    ],
    outputs: [{ id: 'layout', name: '레이아웃', type: 'layout' }],
    defaultConfig: {
      columns: 3,
      gap: 16,
    },
  },
  {
    id: 'data-layout',
    name: '데이터 레이아웃',
    description: '차트와 설명이 있는 데이터 중심 레이아웃',
    category: 'layout',
    icon: 'PieChart',
    color: '#3B82F6',
    inputs: [
      { id: 'title', name: '타이틀', type: 'text' },
      { id: 'chart', name: '차트', type: 'image' },
      { id: 'description', name: '설명', type: 'text' },
    ],
    outputs: [{ id: 'layout', name: '레이아웃', type: 'layout' }],
    defaultConfig: {
      chartPosition: 'left',
      chartSize: 60,
    },
  },
  {
    id: 'cta-layout',
    name: 'CTA 레이아웃',
    description: '콜투액션 페이지 레이아웃',
    category: 'layout',
    icon: 'MousePointerClick',
    color: '#3B82F6',
    inputs: [
      { id: 'heading', name: '헤딩', type: 'text' },
      { id: 'subheading', name: '서브헤딩', type: 'text' },
      { id: 'buttonText', name: '버튼 텍스트', type: 'text' },
    ],
    outputs: [{ id: 'layout', name: '레이아웃', type: 'layout' }],
    defaultConfig: {
      align: 'center',
      buttonColor: 'primary',
    },
  },
  {
    id: 'blank-layout',
    name: '빈 레이아웃',
    description: '자유롭게 요소를 배치하는 빈 레이아웃',
    category: 'layout',
    icon: 'Square',
    color: '#3B82F6',
    inputs: [],
    outputs: [{ id: 'layout', name: '레이아웃', type: 'layout' }],
    defaultConfig: {},
  },
];

// ===== 스타일 노드 정의 =====

const styleNodes: SwimmingNodeDefinition[] = [
  {
    id: 'brand-kit',
    name: '브랜드 킷',
    description: '브랜드 색상, 폰트, 로고를 설정합니다',
    category: 'style',
    icon: 'Palette',
    color: '#EC4899',
    inputs: [],
    outputs: [{ id: 'style', name: '스타일', type: 'style' }],
    defaultConfig: {
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B',
      accentColor: '#F59E0B',
      fontFamily: 'Pretendard',
    },
    execute: async (_inputs, config) => {
      return {
        outputs: {
          style: {
            primaryColor: config.primaryColor || '#3B82F6',
            secondaryColor: config.secondaryColor || '#64748B',
            accentColor: config.accentColor || '#F59E0B',
            fontFamily: config.fontFamily || 'Pretendard',
          },
        },
      };
    },
  },
  {
    id: 'theme',
    name: '테마',
    description: '프리셋 테마를 적용합니다',
    category: 'style',
    icon: 'Paintbrush',
    color: '#EC4899',
    inputs: [],
    outputs: [{ id: 'style', name: '스타일', type: 'style' }],
    defaultConfig: {
      preset: 'dark-modern',
    },
  },
  {
    id: 'custom-style',
    name: '커스텀 스타일',
    description: '세부 스타일을 직접 설정합니다',
    category: 'style',
    icon: 'Settings2',
    color: '#EC4899',
    inputs: [],
    outputs: [{ id: 'style', name: '스타일', type: 'style' }],
    defaultConfig: {
      backgroundColor: '#0F172A',
      textColor: '#F8FAFC',
      padding: 40,
    },
  },
];

// ===== 출력 노드 정의 =====

const outputNodes: SwimmingNodeDefinition[] = [
  {
    id: 'page',
    name: '페이지',
    description: '단일 페이지를 생성합니다',
    category: 'output',
    icon: 'FileText',
    color: '#10B981',
    inputs: [
      { id: 'layout', name: '레이아웃', type: 'layout' },
      { id: 'style', name: '스타일', type: 'style' },
    ],
    outputs: [{ id: 'page', name: '페이지', type: 'page' }],
    defaultConfig: {
      name: '새 페이지',
    },
    execute: async (inputs, config) => {
      return {
        outputs: {
          page: {
            name: config.name || '새 페이지',
            layout: inputs.layout || null,
            style: inputs.style || null,
          },
        },
      };
    },
  },
  {
    id: 'document',
    name: '문서',
    description: '여러 페이지를 하나의 문서로 조합합니다 (더블클릭으로 편집)',
    category: 'output',
    icon: 'FileStack',
    color: '#06B6D4',
    inputs: [
      { id: 'layouts', name: '레이아웃들', type: 'layout' }, // 다중 연결 허용
      { id: 'styles', name: '스타일들', type: 'style' },     // 다중 연결 허용
    ],
    outputs: [{ id: 'document', name: '문서', type: 'document' }],
    defaultConfig: {
      name: '새 문서',
      pages: [
        { id: 'page-1', name: '페이지 1', layoutIndex: 0, styleIndex: 0 },
      ] as DocumentPageConfig[],
    },
    execute: async (inputs, config) => {
      // layouts/styles가 배열 또는 단일 객체일 수 있음
      const layoutsInput = inputs.layouts;
      const stylesInput = inputs.styles;

      const layouts = Array.isArray(layoutsInput)
        ? layoutsInput.filter(l => l !== null && l !== undefined)
        : layoutsInput ? [layoutsInput] : [];

      const styles = Array.isArray(stylesInput)
        ? stylesInput.filter(s => s !== null && s !== undefined)
        : stylesInput ? [stylesInput] : [];

      // config.pages에서 페이지 설정 가져오기
      const pageConfigs = (config.pages as DocumentPageConfig[]) || [
        { id: 'default', name: '페이지 1', layoutIndex: 0, styleIndex: 0 }
      ];

      // 페이지 생성: layoutIndex/styleIndex로 해당 레이아웃/스타일 참조
      const pages = pageConfigs.map((pageConfig: DocumentPageConfig) => ({
        id: pageConfig.id,
        name: pageConfig.name,
        layout: layouts[pageConfig.layoutIndex] || layouts[0] || null,
        style: styles[pageConfig.styleIndex] || styles[0] || null,
      }));

      return {
        outputs: {
          document: {
            name: config.name || '새 문서',
            pages,
            createdAt: new Date().toISOString(),
          },
        },
      };
    },
  },
  {
    id: 'export-ppt',
    name: 'PPT 내보내기',
    description: 'PowerPoint 파일로 내보냅니다',
    category: 'output',
    icon: 'Presentation',
    color: '#EF4444',
    inputs: [{ id: 'document', name: '문서', type: 'document' }],
    outputs: [],
    defaultConfig: {
      filename: 'presentation.pptx',
    },
    execute: async (inputs, config) => {
      try {
        const doc = inputs.document as {
          name?: string;
          pages?: Array<{
            id?: string;
            name?: string;
            layout?: {
              type?: string;
              title?: { content?: string } | string | null;
              subtitle?: { content?: string } | string | null;
              left?: { content?: string } | string | null;
              right?: { content?: string } | string | null;
              image?: { url?: string } | string | null;
              config?: Record<string, unknown>;
            };
            style?: {
              primaryColor?: string;
              secondaryColor?: string;
              accentColor?: string;
              backgroundColor?: string;
              fontFamily?: string;
            };
          }>;
        };

        if (!doc || !doc.pages || doc.pages.length === 0) {
          return {
            outputs: {},
            error: {
              message: '내보낼 페이지가 없습니다',
              code: 'NO_PAGES',
            },
          };
        }

        // 텍스트 컨텐츠 추출 헬퍼
        const extractText = (val: unknown): string => {
          if (!val) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'object' && val !== null && 'content' in val) {
            return (val as { content?: string }).content || '';
          }
          return '';
        };

        // 페이지를 슬라이드 데이터로 변환
        const slides = doc.pages.map((page, index) => {
          const layout = page.layout;
          const layoutType = layout?.type || (index === 0 ? 'title' : 'content');

          // 레이아웃 타입 매핑
          let type = 'content';
          if (layoutType === 'hero' || index === 0) type = 'title';
          else if (layoutType === 'two-column') type = 'two-column';
          else if (layoutType === 'cta') type = 'ending';

          // 콘텐츠 수집
          const contents: string[] = [];
          if (layout) {
            Object.entries(layout).forEach(([key, val]) => {
              if (key !== 'type' && key !== 'config' && key !== 'title' && key !== 'subtitle' && key !== 'left' && key !== 'right' && val) {
                const text = extractText(val);
                if (text) contents.push(text);
              }
            });
          }

          return {
            type,
            title: extractText(layout?.title) || page.name || `슬라이드 ${index + 1}`,
            subtitle: extractText(layout?.subtitle) || '',
            content: contents.join('\n\n'),
            left: extractText(layout?.left) || '',
            right: extractText(layout?.right) || '',
          };
        });

        // API 호출
        const response = await fetch(getApiUrl('/api/generate-pptx', { method: 'POST' }), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slides,
            documentName: doc.name || '프레젠테이션',
            mood: 'modern',
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          return {
            outputs: {},
            error: {
              message: data.error || 'PPT 생성 실패',
              code: 'API_ERROR',
            },
          };
        }

        // base64를 Blob으로 변환하여 다운로드
        const base64Data = data.data;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename || (config.filename as string) || 'presentation.pptx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return {
          outputs: {
            success: true,
            filename: data.filename,
            pageCount: doc.pages.length,
          },
        };
      } catch (error) {
        console.error('PPT 생성 오류:', error);
        return {
          outputs: {},
          error: {
            message: error instanceof Error ? error.message : 'PPT 내보내기 실패',
            code: 'EXPORT_ERROR',
          },
        };
      }
    },
  },
  {
    id: 'export-pdf',
    name: 'PDF 내보내기',
    description: 'PDF 파일로 내보냅니다',
    category: 'output',
    icon: 'FileDown',
    color: '#EF4444',
    inputs: [{ id: 'document', name: '문서', type: 'document' }],
    outputs: [],
    defaultConfig: {
      filename: 'document.pdf',
    },
  },
];

// ===== 전체 노드 정의 =====

export const swimmingNodeDefinitions: SwimmingNodeDefinition[] = [
  ...contentNodes,
  ...layoutNodes,
  ...styleNodes,
  ...outputNodes,
];

// ===== 레지스트리 =====

class SwimmingNodeRegistry {
  private nodes: Map<SwimmingNodeType, SwimmingNodeDefinition> = new Map();

  constructor() {
    swimmingNodeDefinitions.forEach(node => {
      this.nodes.set(node.id, node);
    });
  }

  get(id: SwimmingNodeType): SwimmingNodeDefinition | undefined {
    return this.nodes.get(id);
  }

  getAll(): SwimmingNodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  getByCategory(category: SwimmingNodeDefinition['category']): SwimmingNodeDefinition[] {
    return this.getAll().filter(node => node.category === category);
  }
}

export const swimmingNodeRegistry = new SwimmingNodeRegistry();

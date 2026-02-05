/**
 * Swimming 커스텀 노드 컴포넌트
 * Wave CustomNode 구조 그대로 + Zinc 다크 테마
 */

import React, { memo, useMemo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import type { SwimmingNodeData, PortType, DocumentPageConfig } from '../types';
import { swimmingNodeRegistry } from '../nodes/registry';
import { SWIMMING_PORT_COLORS } from '../types';
import styles from './SwimmingNode.module.css';

// 인라인 아이콘 컴포넌트
interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const TypeIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round">
    <polyline points="4 7 4 4 20 4 20 7"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/>
  </svg>
);

const SparklesIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
  </svg>
);

const ImageIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const Wand2Icon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/>
  </svg>
);

const BarChart3Icon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
  </svg>
);

const TableIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>
  </svg>
);

const LayersIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
  </svg>
);

const Columns2Icon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>
  </svg>
);

const Columns3Icon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>
  </svg>
);

const Grid3x3Icon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>
  </svg>
);

const PieChartIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
  </svg>
);

const SquareIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
  </svg>
);

const PaletteIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

const PaintbrushIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/>
  </svg>
);

const Settings2Icon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
  </svg>
);

const FileTextIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);

const FileStackIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 2v5h5"/><path d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17l4 4z"/><path d="M7 8v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H15"/><path d="M3 12v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H11"/>
  </svg>
);

const PresentationIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>
  </svg>
);

const FileDownIcon = ({ size = 18, color }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/>
  </svg>
);

const Loader2Icon = ({ size = 14, className }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const CheckCircle2Icon = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

const XCircleIcon = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
  </svg>
);

const PlusSmallIcon = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const XSmallIcon = ({ size = 10 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

// 아이콘 매핑
const ICON_MAP: Record<string, React.FC<IconProps>> = {
  'Type': TypeIcon,
  'Sparkles': SparklesIcon,
  'Image': ImageIcon,
  'Wand2': Wand2Icon,
  'BarChart3': BarChart3Icon,
  'Table': TableIcon,
  'Layers': LayersIcon,
  'Columns2': Columns2Icon,
  'Columns3': Columns3Icon,
  'Grid3x3': Grid3x3Icon,
  'PieChart': PieChartIcon,
  'MousePointerClick': SquareIcon,
  'Square': SquareIcon,
  'Palette': PaletteIcon,
  'Paintbrush': PaintbrushIcon,
  'Settings2': Settings2Icon,
  'FileText': FileTextIcon,
  'FileStack': FileStackIcon,
  'Presentation': PresentationIcon,
  'FileDown': FileDownIcon,
};

interface SwimmingNodeProps extends NodeProps {
  data: SwimmingNodeData;
}

const SwimmingNode: React.FC<SwimmingNodeProps> = memo(({ id, data, selected }) => {
  const { setNodes } = useReactFlow();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const nodeDef = useMemo(() => {
    return swimmingNodeRegistry.get(data.nodeId);
  }, [data.nodeId]);

  // 문서 노드 페이지 관리
  const pages = useMemo(() => {
    if (data.nodeId !== 'document') return [];
    return (data.config?.pages as DocumentPageConfig[]) || [];
  }, [data.nodeId, data.config?.pages]);

  const updatePages = useCallback((newPages: DocumentPageConfig[]) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...(node.data as SwimmingNodeData).config,
                  pages: newPages,
                },
              },
            }
          : node
      )
    );
  }, [id, setNodes]);

  const handleAddPage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newPage: DocumentPageConfig = {
      id: `page-${Date.now()}`,
      name: `${pages.length + 1}`,
      layoutIndex: 0,
      styleIndex: 0,
    };
    updatePages([...pages, newPage]);
  }, [pages, updatePages]);

  const handleDeletePage = useCallback((e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    if (pages.length <= 1) return;
    updatePages(pages.filter((p) => p.id !== pageId));
  }, [pages, updatePages]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...pages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);
    updatePages(newPages);
    setDraggedIndex(index);
  }, [draggedIndex, pages, updatePages]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedIndex(null);
  }, []);

  if (!nodeDef) {
    return (
      <div className={styles.node}>
        <div className={styles.header}>
          <span className={styles.title}>알 수 없는 노드</span>
        </div>
      </div>
    );
  }

  const IconComponent = ICON_MAP[nodeDef.icon] || SquareIcon;

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <Loader2Icon className={styles.spinner} />;
      case 'completed':
        return <CheckCircle2Icon className={styles.checkmark} />;
      case 'error':
        return <XCircleIcon className={styles.errorIcon} />;
      default:
        return null;
    }
  };

  const getHandleColor = (type: PortType): string => {
    return SWIMMING_PORT_COLORS[type] || '#64748B';
  };

  // 문서 노드 여부
  const isDocumentNode = data.nodeId === 'document';

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''} ${
        data.status === 'running' ? styles.running : ''
      } ${data.status === 'error' ? styles.error : ''}`}
    >
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div
            className={styles.iconBox}
            style={{ background: `${nodeDef.color}20`, color: nodeDef.color }}
          >
            <IconComponent size={16} />
          </div>
          <span className={styles.title}>{data.label || nodeDef.name}</span>
        </div>
        <div className={styles.headerRight}>
          {getStatusIcon()}
        </div>
      </div>

      {/* 입력 포트 섹션 */}
      {nodeDef.inputs.length > 0 && (
        <div className={styles.inputSection}>
          {nodeDef.inputs.map((input) => (
            <div key={input.id} className={styles.inputRow}>
              <Handle
                type="target"
                position={Position.Left}
                id={input.id}
                className={styles.handle}
                style={{
                  backgroundColor: getHandleColor(input.type),
                  '--handle-color': getHandleColor(input.type),
                } as React.CSSProperties}
              />
              <span
                className={styles.inputLabel}
                style={{ color: getHandleColor(input.type) }}
              >
                {input.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 문서 노드 페이지 관리 */}
      {isDocumentNode && (
        <div className={styles.pageChipSection}>
          <div className={styles.pageChipList}>
            {pages.map((page, index) => (
              <div
                key={page.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`${styles.pageChip} ${draggedIndex === index ? styles.dragging : ''}`}
              >
                <span className={styles.pageChipNumber}>{index + 1}</span>
                <span className={styles.pageChipName}>{page.name}</span>
                {pages.length > 1 && (
                  <button
                    className={styles.pageChipDelete}
                    onClick={(e) => handleDeletePage(e, page.id)}
                  >
                    <XSmallIcon />
                  </button>
                )}
              </div>
            ))}
            <button className={styles.pageAddButton} onClick={handleAddPage}>
              <PlusSmallIcon />
            </button>
          </div>
        </div>
      )}

      {/* 출력 포트 섹션 */}
      {nodeDef.outputs.length > 0 && (
        <div className={styles.outputSection}>
          {nodeDef.outputs.map((output) => (
            <div key={output.id} className={styles.outputRow}>
              <span
                className={styles.outputLabel}
                style={{ color: getHandleColor(output.type) }}
              >
                {output.name}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                className={styles.handle}
                style={{
                  backgroundColor: getHandleColor(output.type),
                  '--handle-color': getHandleColor(output.type),
                } as React.CSSProperties}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

SwimmingNode.displayName = 'SwimmingNode';

export default SwimmingNode;

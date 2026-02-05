/**
 * Swimming Editor - 노드 기반 문서 생성 시스템
 * Wave 스타일 플로팅 UI + 다크모드 테마
 */

import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  BackgroundVariant,
  useReactFlow,
  useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SwimmingNode from './SwimmingNode';
import NodeConfigPanel from './NodeConfigPanel';
import type { SwimmingNodeData, SwimmingNodeType, PortType } from '../types';
import { SWIMMING_PORT_COLORS } from '../types';
import { swimmingNodeRegistry, swimmingNodeDefinitions } from '../nodes/registry';
import { useSwimmingExecution, ExecutionStatus } from '../hooks';
import { exportToPpt } from '../utils';
import { swimmingTemplates, SwimmingTemplate } from '../templates';
import { PptDesignWizard } from './PptDesignWizard';
import { DocumentMergerWizard } from './DocumentMergerWizard';
import styles from './SwimmingEditor.module.css';

// ===== 아이콘 컴포넌트 =====
interface IconProps {
  size?: number;
  className?: string;
}

const ArrowLeftIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const PlusIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const SelectIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3l14 9-7 2-3 7-4-18z"/>
  </svg>
);

const HandIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/>
    <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);

const UndoIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>
);

const RedoIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
  </svg>
);

const SaveIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const UploadIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const ZoomInIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const ZoomOutIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const LayoutGridIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>
);

const ChevronUpIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

const ChevronDownIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const PlayIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const DownloadIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);

const Loader2Icon = ({ size = 16, className = '' }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// ===== 노드 팔레트용 아이콘 =====
const TypeIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <polyline points="4 7 4 4 20 4 20 7"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/>
  </svg>
);

const SparklesIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
  </svg>
);

const ImageIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const Wand2Icon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/>
  </svg>
);

const BarChart3Icon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
  </svg>
);

const TableIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>
  </svg>
);

const LayersIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
  </svg>
);

const Columns2Icon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>
  </svg>
);

const Columns3Icon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>
  </svg>
);

const Grid3x3Icon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>
  </svg>
);

const PieChartIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
  </svg>
);

const MousePointerClickIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 9 5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 5.1"/><path d="m5.1 8-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/>
  </svg>
);

const SquareIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
  </svg>
);

const PaletteIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

const PaintbrushIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"/><path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/><path d="M14.5 17.5 4.5 15"/>
  </svg>
);

const Settings2Icon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
  </svg>
);

const FileTextIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);

const FileStackIconSmall = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 2v5h5"/><path d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17l4 4z"/><path d="M7 8v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H15"/><path d="M3 12v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H11"/>
  </svg>
);

const PresentationIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>
  </svg>
);

const FileDownIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/>
  </svg>
);

const LockIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// 문서 스타일 통합 아이콘 - 두 문서가 같은 스타일로 연결됨
const DocumentStyleIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* 왼쪽 문서 */}
    <rect x="2" y="2" width="8" height="11" rx="1"/>
    <line x1="4" y1="5" x2="8" y2="5"/>
    <line x1="4" y1="7" x2="7" y2="7"/>
    <line x1="4" y1="9" x2="8" y2="9"/>
    {/* 오른쪽 문서 */}
    <rect x="14" y="11" width="8" height="11" rx="1"/>
    <line x1="16" y1="14" x2="20" y2="14"/>
    <line x1="16" y1="16" x2="19" y2="16"/>
    <line x1="16" y1="18" x2="20" y2="18"/>
    {/* 연결 화살표 (스타일 전파) */}
    <path d="M10 8l4 4"/>
    <path d="M11 11l3 1"/>
  </svg>
);

const RobotIcon = ({ size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

// 노드 타입별 아이콘 매핑
const NODE_ICON_MAP: Record<string, React.FC<IconProps>> = {
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
  'MousePointerClick': MousePointerClickIcon,
  'Square': SquareIcon,
  'Palette': PaletteIcon,
  'Paintbrush': PaintbrushIcon,
  'Settings2': Settings2Icon,
  'FileText': FileTextIcon,
  'FileStack': FileStackIconSmall,
  'Presentation': PresentationIcon,
  'FileDown': FileDownIcon,
};

// ===== 노드 타입 등록 =====
const nodeTypes = {
  swimming: SwimmingNode,
};

// 기본 엣지 스타일 (Zinc 계열)
const defaultEdgeOptions = {
  style: { stroke: '#52525B', strokeWidth: 2 },
  type: 'smoothstep',
};


// ===== 메인 에디터 (내부) =====

const SwimmingEditorInner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn, zoomOut } = useReactFlow();
  const viewport = useViewport();

  // 상태
  const [nodes, setNodes] = useState<Node<SwimmingNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [documentName, setDocumentName] = useState('새 문서');
  const [isDirty, setIsDirty] = useState(false);
  const [currentTool, setCurrentTool] = useState<'select' | 'pan'>('select');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 패널 상태
  const [isNodePanelOpen, setIsNodePanelOpen] = useState(true);

  // 위자드 모드 상태
  const [wizardTemplate, setWizardTemplate] = useState<SwimmingTemplate | null>(null);

  // 노드 상태 변경 콜백
  const handleNodeStatusChange = useCallback((nodeId: string, status: ExecutionStatus) => {
    setNodes(nds =>
      nds.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, status } }
          : node
      )
    );
  }, []);

  // 실행 엔진
  const { execute, status: executionStatus } = useSwimmingExecution(nodes, edges, handleNodeStatusChange);

  // 선택된 노드 정보
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return null;
    return { id: node.id, data: node.data };
  }, [selectedNodeId, nodes]);

  // 노드 설정 변경 처리
  const handleConfigChange = useCallback((nodeId: string, newConfig: Record<string, unknown>) => {
    setNodes(nds =>
      nds.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config: newConfig } }
          : node
      )
    );
    setIsDirty(true);
  }, []);

  // 노드 선택 처리
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<SwimmingNodeData>) => {
    setSelectedNodeId(node.id);
  }, []);

  // 패널 닫기
  const handleClosePanel = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // 노드 변경 처리
  const onNodesChange = useCallback((changes: NodeChange<Node<SwimmingNodeData>>[]) => {
    setNodes(nds => applyNodeChanges(changes, nds));
    setIsDirty(true);
  }, []);

  // 엣지 변경 처리
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(eds => applyEdgeChanges(changes, eds));
    setIsDirty(true);
  }, []);

  // 연결 처리 - 포트 타입에 따른 컬러 적용
  const onConnect = useCallback((connection: Connection) => {
    // 소스 노드의 출력 포트 타입 찾기
    const sourceNode = nodes.find(n => n.id === connection.source);
    if (sourceNode) {
      const nodeDef = swimmingNodeRegistry.get(sourceNode.data.nodeId);
      const outputPort = nodeDef?.outputs.find(o => o.id === connection.sourceHandle);
      const portType = outputPort?.type as PortType;
      const edgeColor = portType ? SWIMMING_PORT_COLORS[portType] : '#52525B';

      const coloredEdge: Edge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source || '',
        target: connection.target || '',
        style: { stroke: edgeColor, strokeWidth: 2 },
        type: 'smoothstep',
      };
      setEdges(eds => [...eds, coloredEdge]);
    } else {
      setEdges(eds => addEdge(connection, eds));
    }
    setIsDirty(true);
  }, [nodes]);

  // 노드 추가
  const addNode = useCallback(
    (nodeType: SwimmingNodeType, position?: { x: number; y: number }) => {
      const nodeDef = swimmingNodeRegistry.get(nodeType);
      if (!nodeDef) return;

      const newNode: Node<SwimmingNodeData> = {
        id: `${nodeType}-${Date.now()}`,
        type: 'swimming',
        position: position || { x: 250, y: 150 + nodes.length * 100 },
        data: {
          nodeId: nodeType,
          label: nodeDef.name,
          config: { ...nodeDef.defaultConfig },
          status: 'idle',
        },
      };

      setNodes(nds => [...nds, newNode]);
      setIsDirty(true);
    },
    [nodes.length]
  );

  // 드래그 앤 드롭 처리
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/swimming-node') as SwimmingNodeType;
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(nodeType, position);
    },
    [screenToFlowPosition, addNode]
  );

  // 노드 드래그 시작
  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: SwimmingNodeType) => {
      event.dataTransfer.setData('application/swimming-node', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  // 내보내기 상태
  const [isExporting, setIsExporting] = useState(false);

  // PPT 내보내기
  const handleExport = useCallback(async () => {
    if (nodes.length === 0) {
      alert('내보낼 노드가 없습니다.');
      return;
    }

    setIsExporting(true);
    try {
      await exportToPpt(nodes, edges, {
        filename: documentName,
        author: 'Swimming Editor',
      });
    } catch (error) {
      console.error('PPT 내보내기 실패:', error);
      alert('내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  }, [nodes, edges, documentName]);

  // 템플릿 로드 - 엣지에 컬러 적용
  const loadTemplate = useCallback((template: SwimmingTemplate) => {
    setNodes(template.nodes);

    // 템플릿 엣지에 포트 타입 컬러 적용
    const coloredEdges = template.edges.map(edge => {
      const sourceNode = template.nodes.find(n => n.id === edge.source);
      if (sourceNode) {
        const nodeDef = swimmingNodeRegistry.get(sourceNode.data.nodeId);
        const outputPort = nodeDef?.outputs.find(o => o.id === edge.sourceHandle);
        const portType = outputPort?.type as PortType;
        const edgeColor = portType ? SWIMMING_PORT_COLORS[portType] : '#52525B';
        return {
          ...edge,
          style: { stroke: edgeColor, strokeWidth: 2 },
          type: 'smoothstep',
        };
      }
      return edge;
    });

    setEdges(coloredEdges);
    setDocumentName(template.name);
    setIsDirty(true);
  }, []);

  // 카테고리별 노드 그룹화
  const nodesByCategory = useMemo(() => {
    return {
      content: swimmingNodeDefinitions.filter(n => n.category === 'content'),
      layout: swimmingNodeDefinitions.filter(n => n.category === 'layout'),
      style: swimmingNodeDefinitions.filter(n => n.category === 'style'),
      output: swimmingNodeDefinitions.filter(n => n.category === 'output'),
    };
  }, []);

  return (
    <div className={styles.editor}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.brandSection}>
            <span className={styles.brandIcon}>🏊</span>
            <span className={styles.brandName}>Swimming</span>
            <span className={styles.betaBadge}>Beta</span>
          </div>
          {nodes.length > 0 && (
            <>
              <div className={styles.headerDivider} />
              <button className={styles.homeButton} title="새 문서">
                <ArrowLeftIcon size={18} />
              </button>
            </>
          )}
        </div>

        {/* 중앙: 문서 이름 */}
        {nodes.length > 0 && (
          <div className={styles.headerCenter}>
            <input
              type="text"
              className={styles.documentName}
              value={documentName}
              onChange={e => {
                setDocumentName(e.target.value);
                setIsDirty(true);
              }}
            />
            {isDirty && <span className={styles.unsavedBadge}>저장 안 됨</span>}
          </div>
        )}

        {/* 우측: 줌, 실행, 내보내기 */}
        <div className={styles.headerRight}>
          {nodes.length > 0 && (
            <>
              <div className={styles.zoomControl}>
                <button className={styles.zoomButton} onClick={() => zoomOut()} title="축소">
                  <ZoomOutIcon />
                </button>
                <span className={styles.zoomLevel}>{Math.round(viewport.zoom * 100)}%</span>
                <button className={styles.zoomButton} onClick={() => zoomIn()} title="확대">
                  <ZoomInIcon />
                </button>
              </div>
              <button
                className={`${styles.runButton} ${executionStatus === 'running' ? styles.running : ''}`}
                onClick={execute}
                disabled={executionStatus === 'running' || nodes.length === 0}
              >
                {executionStatus === 'running' ? (
                  <>
                    <Loader2Icon className={styles.spinner} />
                    실행 중...
                  </>
                ) : (
                  <>
                    <PlayIcon />
                    실행
                  </>
                )}
              </button>
              <button
                className={styles.exportButton}
                onClick={handleExport}
                disabled={isExporting || nodes.length === 0}
              >
                {isExporting ? (
                  <Loader2Icon className={styles.spinner} />
                ) : (
                  <DownloadIcon />
                )}
                내보내기
              </button>
            </>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.content}>
        {/* 위자드 모드 - 캔버스 대신 표시 */}
        {wizardTemplate?.isWizard && wizardTemplate.id === 'ppt-design' && (
          <PptDesignWizard onBack={() => setWizardTemplate(null)} />
        )}
        {wizardTemplate?.isWizard && wizardTemplate.id === 'document-merger' && (
          <DocumentMergerWizard onBack={() => setWizardTemplate(null)} />
        )}

        {/* 캔버스 영역 - 위자드 모드가 아닐 때만 표시 */}
        {!wizardTemplate && (
        <div className={`${styles.canvas} ${currentTool === 'select' ? styles.selectMode : styles.panMode}`} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            snapToGrid
            snapGrid={[20, 20]}
            minZoom={0.2}
            maxZoom={2}
            panOnDrag={currentTool === 'pan' ? true : [1]}
            selectionOnDrag={currentTool === 'select'}
            proOptions={{ hideAttribution: true }}
            // 다중 연결 허용 - document 노드의 pages 입력에 여러 page 연결 가능
            isValidConnection={() => true}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#3F3F46" />
          </ReactFlow>

          {/* 플로팅 툴바 (좌측) - Wave 스타일 */}
          {nodes.length > 0 && (
            <div className={styles.floatingToolbar}>
              {/* 노드 추가 */}
              <button
                className={styles.toolbarButton}
                onClick={() => setIsNodePanelOpen(!isNodePanelOpen)}
                title="노드 패널 토글"
              >
                <PlusIcon />
              </button>

              <div className={styles.toolbarDivider} />

              {/* 선택 도구 */}
              <button
                className={`${styles.toolbarButton} ${currentTool === 'select' ? styles.active : ''}`}
                onClick={() => setCurrentTool('select')}
                title="선택 도구 (V)"
              >
                <SelectIcon />
              </button>

              {/* 손 도구 */}
              <button
                className={`${styles.toolbarButton} ${currentTool === 'pan' ? styles.active : ''}`}
                onClick={() => setCurrentTool('pan')}
                title="손 도구 (H)"
              >
                <HandIcon />
              </button>

              <div className={styles.toolbarDivider} />

              {/* Undo */}
              <button className={`${styles.toolbarButton} ${styles.disabled}`} title="실행 취소" disabled>
                <UndoIcon />
              </button>

              {/* Redo */}
              <button className={`${styles.toolbarButton} ${styles.disabled}`} title="다시 실행" disabled>
                <RedoIcon />
              </button>

              <div className={styles.toolbarDivider} />

              {/* 저장 */}
              <button className={styles.toolbarButton} title="저장">
                <SaveIcon />
              </button>

              {/* 불러오기 */}
              <button className={styles.toolbarButton} title="불러오기">
                <UploadIcon />
              </button>
            </div>
          )}

          {/* 빈 상태: 템플릿 선택 또는 위자드 */}
          {nodes.length === 0 && !wizardTemplate && (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>문서를 시작하세요</h2>
              <p className={styles.emptySubtitle}>템플릿을 선택하거나 빈 캔버스에서 시작하세요</p>
              <div className={styles.templateGrid}>
                {swimmingTemplates.map(template => {
                  const isLocked = template.locked;
                  const isNew = template.isNew;
                  const isWizard = template.isWizard;

                  return (
                    <button
                      key={template.id}
                      className={`${styles.templateCard} ${isLocked ? styles.locked : ''} ${isNew ? styles.new : ''}`}
                      onClick={() => {
                        if (isLocked) return;
                        if (isWizard) {
                          setWizardTemplate(template);
                        } else {
                          loadTemplate(template);
                        }
                      }}
                      disabled={isLocked}
                    >
                      {/* NEW 뱃지 */}
                      {isNew && <span className={styles.newBadge}>NEW</span>}

                      {/* 잠금 아이콘 */}
                      {isLocked && (
                        <div className={styles.lockOverlay}>
                          <LockIcon size={24} />
                          <span>Coming Soon</span>
                        </div>
                      )}

                      <div className={styles.templateIcon}>
                        {template.id === 'ppt-design' && <PresentationIcon size={24} />}
                        {template.id === 'document-merger' && <DocumentStyleIcon size={24} />}
                        {template.id === 'ai-presentation' && <RobotIcon size={24} />}
                      </div>
                      <div className={styles.templateInfo}>
                        <p className={styles.templateName}>{template.name}</p>
                        <p className={styles.templateDesc}>{template.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 오른쪽 패널 영역 */}
          {nodes.length > 0 && (
            <div className={styles.rightPanels}>
              {/* 노드 팔레트 패널 */}
              <div className={`${styles.floatingPanel} ${!isNodePanelOpen ? styles.collapsed : ''}`}>
                <div className={styles.panelHeader} onClick={() => setIsNodePanelOpen(!isNodePanelOpen)}>
                  <div className={styles.panelHeaderLeft}>
                    <LayoutGridIcon size={16} />
                    <span>노드</span>
                  </div>
                  <button className={styles.panelToggle}>
                    {isNodePanelOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </button>
                </div>
                {isNodePanelOpen && (
                  <div className={styles.panelContent}>
                    {/* 콘텐츠 */}
                    <div className={styles.categorySection}>
                      <div className={styles.categoryLabel}>콘텐츠</div>
                      {nodesByCategory.content.map(node => {
                        const IconComp = NODE_ICON_MAP[node.icon];
                        return (
                          <button
                            key={node.id}
                            className={styles.nodeItem}
                            draggable
                            onDragStart={e => onDragStart(e, node.id)}
                            onClick={() => addNode(node.id)}
                          >
                            <div className={styles.nodeIcon} style={{ background: `${node.color}20`, color: node.color }}>
                              {IconComp && <IconComp />}
                            </div>
                            <div className={styles.nodeInfo}>
                              <p className={styles.nodeName}>{node.name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {/* 레이아웃 */}
                    <div className={styles.categorySection}>
                      <div className={styles.categoryLabel}>레이아웃</div>
                      {nodesByCategory.layout.map(node => {
                        const IconComp = NODE_ICON_MAP[node.icon];
                        return (
                          <button
                            key={node.id}
                            className={styles.nodeItem}
                            draggable
                            onDragStart={e => onDragStart(e, node.id)}
                            onClick={() => addNode(node.id)}
                          >
                            <div className={styles.nodeIcon} style={{ background: `${node.color}20`, color: node.color }}>
                              {IconComp && <IconComp />}
                            </div>
                            <div className={styles.nodeInfo}>
                              <p className={styles.nodeName}>{node.name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {/* 스타일 */}
                    <div className={styles.categorySection}>
                      <div className={styles.categoryLabel}>스타일</div>
                      {nodesByCategory.style.map(node => {
                        const IconComp = NODE_ICON_MAP[node.icon];
                        return (
                          <button
                            key={node.id}
                            className={styles.nodeItem}
                            draggable
                            onDragStart={e => onDragStart(e, node.id)}
                            onClick={() => addNode(node.id)}
                          >
                            <div className={styles.nodeIcon} style={{ background: `${node.color}20`, color: node.color }}>
                              {IconComp && <IconComp />}
                            </div>
                            <div className={styles.nodeInfo}>
                              <p className={styles.nodeName}>{node.name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {/* 출력 */}
                    <div className={styles.categorySection}>
                      <div className={styles.categoryLabel}>출력</div>
                      {nodesByCategory.output.map(node => {
                        const IconComp = NODE_ICON_MAP[node.icon];
                        return (
                          <button
                            key={node.id}
                            className={styles.nodeItem}
                            draggable
                            onDragStart={e => onDragStart(e, node.id)}
                            onClick={() => addNode(node.id)}
                          >
                            <div className={styles.nodeIcon} style={{ background: `${node.color}20`, color: node.color }}>
                              {IconComp && <IconComp />}
                            </div>
                            <div className={styles.nodeInfo}>
                              <p className={styles.nodeName}>{node.name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 노드 설정 패널 */}
              {selectedNode && (
                <NodeConfigPanel
                  selectedNode={selectedNode}
                  onConfigChange={handleConfigChange}
                  onClose={handleClosePanel}
                />
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

// ===== 메인 에디터 (프로바이더 래퍼) =====

const SwimmingEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <SwimmingEditorInner />
    </ReactFlowProvider>
  );
};

export default SwimmingEditor;

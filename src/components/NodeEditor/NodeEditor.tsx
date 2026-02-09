/**
 * Orange Wave - Node Editor
 */

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode, { CustomNodeData } from './CustomNode';
import NodePicker from './NodePicker';
import ResultPanel from './ResultPanel';
import SaveWorkflowDialog from './SaveWorkflowDialog';
import WaveListPanel from './WaveListPanel';
import { initializeNodeSystem, useWorkflowExecution } from '../../nodes';
import { nodeRegistry } from '../../nodes/registry';
import { PORT_COLORS } from '../../nodes/types';
import type { NodeExecutionStatus } from '../../nodes/types';
import { useWorkflowStore } from '../../stores/useWorkflowStore';
import { rlog } from '../../utils/debug';
import {
  embedWorkflowToPng,
  extractWorkflowFromPng,
  createDefaultWorkflowImage,
  captureNodeEditor,
  WorkflowData,
} from '../../utils/pngWorkflow';
import styles from './NodeEditor.module.css';

// ===== 템플릿 아이콘 (Lucide 기반, strokeWidth 1.5) =====

// 직접 만들기 - Lucide plus
const TemplateEmptyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

// 레퍼런스 이미지 - Lucide image-plus
const TemplateImageRefIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
    <line x1="16" x2="22" y1="5" y2="5" />
    <line x1="19" x2="19" y1="2" y2="8" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

// 목업 - Lucide monitor-smartphone
const TemplateMockupIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
    <path d="M10 19v-3.96 3.15" />
    <path d="M7 19h5" />
    <rect width="6" height="10" x="16" y="12" rx="2" />
  </svg>
);

// 증명사진 - Lucide id-card
const TemplateIdPhotoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 10h2" />
    <path d="M16 14h2" />
    <path d="M6.17 15a3 3 0 0 1 5.66 0" />
    <circle cx="9" cy="11" r="2" />
    <rect x="2" y="5" width="20" height="14" rx="2" />
  </svg>
);

// 프로모션 영상 - Lucide clapperboard
const TemplateVideoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
    <path d="m6.2 5.3 3.1 3.9" />
    <path d="m12.4 3.4 3.1 4" />
    <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  </svg>
);

// 이미지를 영상으로 - Lucide play-circle
const TemplatePlayIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="#3B82F6" stroke="none" />
  </svg>
);

// 업스케일 - Lucide maximize-2
const TemplateUpscaleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" x2="14" y1="3" y2="10" />
    <line x1="3" x2="10" y1="21" y2="14" />
  </svg>
);

// 배경 제거 - Lucide scissors
const TemplateRemoveBgIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <path d="M8.12 8.12 12 12" />
    <path d="M20 4 8.12 15.88" />
    <circle cx="6" cy="18" r="3" />
    <path d="M14.8 14.8 20 20" />
  </svg>
);

// 템플릿 아이콘 매핑
const TEMPLATE_ICONS: Record<string, React.FC> = {
  'empty': TemplateEmptyIcon,
  'image-to-image': TemplateImageRefIcon,
  'mockup': TemplateMockupIcon,
  'id-photo': TemplateIdPhotoIcon,
  'text-to-video': TemplateVideoIcon,
  'image-to-video': TemplatePlayIcon,
  'upscale': TemplateUpscaleIcon,
  'remove-bg': TemplateRemoveBgIcon,
};

// ===== 툴바 아이콘 (레퍼런스 스타일 통일: strokeWidth 1.5) =====

// 노드 추가 (+)
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// 선택 도구 (화살표 커서)
const SelectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3l14 9-7 2-3 7-4-18z" />
  </svg>
);

// 손 도구 (팬)
const HandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

// Undo (되돌리기)
const UndoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

// Redo (다시 실행)
const RedoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
  </svg>
);

// JSON 저장 (이미지 아이콘 + 화살표)
const SavePngIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// JSON 저장 (중괄호 아이콘)
const SaveJsonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
    <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
  </svg>
);

// 업로드
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// 줌 인 (+)
const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

// 줌 아웃 (-)
const ZoomOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

// 홈 (화살표)
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

// 클라우드 저장
const CloudSaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m8 17 4 4 4-4" />
  </svg>
);

// 노드 시스템 초기화
initializeNodeSystem();

// 커스텀 노드 타입 등록
const nodeTypes = {
  custom: CustomNode,
};

// 에지 스타일
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  style: { strokeWidth: 2 },
};

// 워크플로우 템플릿 - 최종 아웃풋/용도 기준 (8개)
const WORKFLOW_TEMPLATES = [
  // 직접 만들기
  { id: 'empty', name: '직접\n만들기', desc: '빈 캔버스에서 시작', color: 'empty' },
  // 콘텐츠 제작
  { id: 'image-to-image', name: '레퍼런스로\n이미지 만들기', desc: '참조 이미지 변형', color: 'image' },
  { id: 'mockup', name: '제품 목업\n만들기', desc: '목업 이미지 생성', color: 'image' },
  { id: 'id-photo', name: '증명사진\n만들기', desc: '증명사진/프로필', color: 'image' },
  // 영상 제작
  { id: 'text-to-video', name: '프로모션 영상\n만들기', desc: '텍스트로 영상 생성', color: 'video' },
  { id: 'image-to-video', name: '사진을\n영상으로', desc: '이미지를 영상으로', color: 'video' },
  // 이미지 보정
  { id: 'upscale', name: '이미지\n선명하게', desc: '해상도/품질 향상', color: 'upscale' },
  { id: 'remove-bg', name: '배경\n없애기', desc: '누끼 이미지 생성', color: 'upscale' },
];

interface NodeEditorProps {
  initialWorkflowName?: string;
  onSave?: (workflow: { nodes: Node[]; edges: Edge[] }) => void;
  onLoad?: () => { nodes: Node[]; edges: Edge[] } | null;
  embedded?: boolean;
  onLightboxChange?: (isOpen: boolean) => void;
}

/**
 * Orange Wave 노드 에디터 내부 컴포넌트
 */
// imageHistory 아이템 타입
interface ImageHistoryItem {
  id: string;
  image: string;
  prompt: string;
  model?: string;
  type: 'image' | 'video' | 'mockup';
  createdAt: Date;
  mockupType?: string;
}

const NodeEditorInner: React.FC<NodeEditorProps> = ({
  initialWorkflowName = '새 워크플로우',
  onSave,
  onLoad,
  onLightboxChange,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isNodePickerOpen, setIsNodePickerOpen] = useState(false);
  const [isResultPanelOpen, setIsResultPanelOpen] = useState(true);
  const [isWaveListExpanded, setIsWaveListExpanded] = useState(true);
  const [isStarted, setIsStarted] = useState(false); // 직접 만들기로 빈 캔버스 시작 여부
  const [currentTool, setCurrentTool] = useState<'select' | 'pan'>('select');
  const { screenToFlowPosition, zoomIn, zoomOut } = useReactFlow();
  const viewport = useViewport();

  // 워크플로우 Store - Controlled Mode (Single Source of Truth)
  const {
    session: workflowSession,
    isSaving,
    setNodes,
    setEdges,
    saveWorkflow,
    saveAsNewWorkflow,
    resetSession,
  } = useWorkflowStore();

  // Store에서 nodes/edges 직접 사용 (useMemo로 안정화)
  const nodes = useMemo(
    () => (workflowSession.nodes || []) as Node<CustomNodeData>[],
    [workflowSession.nodes]
  );
  const edges = useMemo(
    () => workflowSession.edges || [],
    [workflowSession.edges]
  );

  // ReactFlow Controlled Mode 핸들러
  const onNodesChange = useCallback(
    (changes: NodeChange<Node<CustomNodeData>>[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds) as Node<CustomNodeData>[]);
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  // 저장 다이얼로그 상태
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState(initialWorkflowName);

  // 워크플로우 이름 동기화
  useEffect(() => {
    if (workflowSession.name) {
      setWorkflowName(workflowSession.name);
    }
  }, [workflowSession.name]);

  // imageHistory 상태 (Supabase에서 로드)
  const [imageHistory, setImageHistory] = useState<ImageHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 워크플로우 실행 훅
  const workflow = useWorkflowExecution();

  // 웨이브 홈(템플릿 선택)으로 이동 핸들러
  const handleGoWaveHome = useCallback(() => {
    if (workflowSession.isDirty && nodes.length > 0) {
      // 변경사항 있으면 저장 확인
      setPendingNavigation('wave-home');
      setShowSaveDialog(true);
    } else {
      // 변경사항 없으면 바로 클리어
      setNodes([]);
      setEdges([]);
      setIsStarted(false);
      resetSession();
      workflow.reset();
    }
  }, [workflowSession.isDirty, nodes.length, setNodes, setEdges, resetSession, workflow]);

  // 클라우드 저장 핸들러
  const handleCloudSave = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  // 저장 다이얼로그 - 저장 처리
  const handleSaveDialogSave = useCallback(async (name: string) => {
    try {
      // 노드 에디터 캡쳐
      let capturedImage: string | undefined;
      try {
        capturedImage = await captureNodeEditor(nodes);
      } catch (captureError) {
        console.warn('노드 캡쳐 실패, 기본 이미지 사용:', captureError);
        // 캡쳐 실패해도 저장 진행 (기본 이미지 사용)
      }

      await saveWorkflow(name, capturedImage);
      setShowSaveDialog(false);
      if (pendingNavigation === 'wave-home') {
        // 웨이브 홈으로 (노드 클리어)
        setNodes([]);
        setEdges([]);
        resetSession();
        workflow.reset();
        setPendingNavigation(null);
      } else if (pendingNavigation) {
        window.location.href = pendingNavigation;
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error('워크플로우 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  }, [saveWorkflow, pendingNavigation, setNodes, setEdges, resetSession, workflow, nodes]);

  // 저장 다이얼로그 - 다른 이름으로 저장 (항상 새 워크플로우 생성)
  const handleSaveAsDialogSave = useCallback(async (name: string) => {
    try {
      // 노드 에디터 캡쳐
      let capturedImage: string | undefined;
      try {
        capturedImage = await captureNodeEditor(nodes);
      } catch (captureError) {
        console.warn('노드 캡쳐 실패, 기본 이미지 사용:', captureError);
      }

      await saveAsNewWorkflow(name, capturedImage);
      setShowSaveDialog(false);
      if (pendingNavigation === 'wave-home') {
        setNodes([]);
        setEdges([]);
        resetSession();
        workflow.reset();
        setPendingNavigation(null);
      } else if (pendingNavigation) {
        window.location.href = pendingNavigation;
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error('워크플로우 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  }, [saveAsNewWorkflow, pendingNavigation, setNodes, setEdges, resetSession, workflow, nodes]);

  // 저장 다이얼로그 - 저장 안 함
  const handleSaveDialogDiscard = useCallback(() => {
    setShowSaveDialog(false);
    if (pendingNavigation === 'wave-home') {
      // 웨이브 홈으로 (노드 클리어)
      setNodes([]);
      setEdges([]);
      resetSession();
      workflow.reset();
      setPendingNavigation(null);
    } else if (pendingNavigation) {
      resetSession();
      window.location.href = pendingNavigation;
      setPendingNavigation(null);
    }
  }, [pendingNavigation, resetSession, setNodes, setEdges, workflow]);

  // 저장 다이얼로그 - 취소
  const handleSaveDialogCancel = useCallback(() => {
    setShowSaveDialog(false);
    setPendingNavigation(null);
  }, []);

  // Supabase에서 이미지 히스토리 로드
  const loadImageHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch('/api/supabase-images?offset=0&limit=50');
      const data = await response.json();

      if (data.images) {
        const MOCKUP_STYLE_KEYS = [
          'web-banner', 'mobile-banner', 'social-square', 'social-story', 'thumbnail',
          'poster-a4', 'magazine-cover', 'business-card', 'brochure',
          'billboard', 'bus-shelter', 'subway-interior', 'subway-psd', 'storefront', 'building-wrap', 'x-banner', 'bus-wrap', 'taxi-door', 'frp-sculpture',
          'popup-outdoor', 'popup-indoor', 'island-booth', 'exhibition-booth', 'kiosk', 'info-desk',
          'iphone-hand', 'iphone-topview', 'macbook-screen', 'ipad-screen', 'tv-screen', 'watch-face',
          'product-box', 'shopping-bag', 'beverage-can', 'cake-box-kraft', 'cake-box-color', 'tshirt-front', 'tshirt-symbol', 'tshirt-staff',
          'ballpoint-pen', 'sticker-sheet', 'wristband', 'pin-button', 'metal-badge', 'keychain'
        ];

        const formatted: ImageHistoryItem[] = data.images.map((img: { id: string; image_url: string; prompt: string; model?: string; type?: string; style?: string; created_at: string }) => {
          const isMockup = img.style && MOCKUP_STYLE_KEYS.includes(img.style);
          return {
            id: img.id,
            image: img.image_url,
            prompt: img.prompt,
            model: img.model,
            type: img.type || (isMockup ? 'mockup' : 'image'),
            createdAt: new Date(img.created_at),
            mockupType: isMockup ? img.style : undefined,
          };
        });
        setImageHistory(formatted);
      }
    } catch (err) {
      console.error('Failed to load image history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // 컴포넌트 마운트 시 히스토리 로드
  useEffect(() => {
    loadImageHistory();
  }, [loadImageHistory]);

  // 아이템 삭제 핸들러
  const handleDeleteHistoryItem = useCallback(async (id: string) => {
    // 낙관적 UI 업데이트
    setImageHistory(prev => prev.filter(item => item.id !== id));

    try {
      await fetch(`/api/supabase-images?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete item:', err);
      // 실패 시 다시 로드
      loadImageHistory();
    }
  }, [loadImageHistory]);

  const nodeIdCounter = useRef(0);

  const getNewNodeId = useCallback(() => {
    nodeIdCounter.current += 1;
    return `node-${Date.now()}-${nodeIdCounter.current}`;
  }, []);

  const updateNodeStatus = useCallback(
    (nodeId: string, status: string) => {
      setNodes(nds =>
        nds.map(n =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, status: status as NodeExecutionStatus } }
            : n
        )
      );
    },
    [setNodes]
  );

  // 워크플로우 실행 완료 시 노드에 outputs 전달
  useEffect(() => {
    if (!workflow.isRunning && workflow.results.length > 0) {
      setNodes(nds =>
        nds.map(n => {
          const result = workflow.results.find(r => r.instanceId === n.id);
          if (result) {
            return {
              ...n,
              data: {
                ...n.data,
                outputs: result.outputs,
                error: result.error?.message,
              },
            };
          }
          return n;
        })
      );
    }
  }, [workflow.isRunning, workflow.results, setNodes]);


  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n: Node<CustomNodeData>) => n.id === params.source);
      if (sourceNode) {
        const nodeDef = nodeRegistry.get(sourceNode.data.nodeId);
        const outputDef = nodeDef?.outputs.find(o => o.id === params.sourceHandle);
        const portColor = outputDef ? PORT_COLORS[outputDef.type] : '#9E9E9E';

        const newEdge = {
          ...params,
          type: 'smoothstep',
          style: { stroke: portColor, strokeWidth: 2 },
          animated: false,
        };

        setEdges(eds => addEdge(newEdge, eds));
      } else {
        setEdges(eds => addEdge(params, eds));
      }
    },
    [nodes, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeId = event.dataTransfer.getData('application/reactflow');
      if (!nodeId) return;

      const nodeDef = nodeRegistry.get(nodeId);
      if (!nodeDef) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaultConfig: Record<string, unknown> = {};
      nodeDef.config.forEach(cfg => {
        if (cfg.default !== undefined) {
          defaultConfig[cfg.id] = cfg.default;
        }
      });

      const newNode: Node<CustomNodeData> = {
        id: getNewNodeId(),
        type: 'custom',
        position,
        data: {
          nodeId: nodeId,
          config: defaultConfig,
          status: undefined,
        },
      };

      setNodes(nds => [...nds, newNode]);
    },
    [screenToFlowPosition, getNewNodeId, setNodes]
  );

  /**
   * NodePicker에서 노드 선택 시 겹치지 않게 배치
   */
  const handlePickerNodeSelect = useCallback((nodeDefId: string) => {
    const nodeDef = nodeRegistry.get(nodeDefId);
    if (!nodeDef) return;

    const defaultConfig: Record<string, unknown> = {};
    nodeDef.config.forEach(cfg => {
      if (cfg.default !== undefined) {
        defaultConfig[cfg.id] = cfg.default;
      }
    });

    // 노드 크기 및 간격
    const NODE_WIDTH = 300;
    const SPACING_X = 80; // 노드 간 여유 간격

    let newX: number;
    let newY: number;

    if (nodes.length === 0) {
      // 첫 노드: 캔버스 좌측 상단에 배치
      newX = 100;
      newY = 100;
    } else {
      // 마지막 노드 (가장 최근 추가된 노드) 기준
      const lastNode = nodes[nodes.length - 1];

      // 마지막 노드 오른쪽에 배치, Y는 동일 (상단 정렬)
      newX = lastNode.position.x + NODE_WIDTH + SPACING_X;
      newY = lastNode.position.y;
    }

    const newNode: Node<CustomNodeData> = {
      id: getNewNodeId(),
      type: 'custom',
      position: { x: newX, y: newY },
      data: {
        nodeId: nodeDefId,
        config: defaultConfig,
        status: undefined,
      },
    };

    setNodes(nds => [...nds, newNode]);
  }, [getNewNodeId, setNodes, nodes]);

  /**
   * 템플릿으로 시작
   */
  const handleTemplateSelect = useCallback((templateId: string) => {
    if (templateId === 'empty') {
      // 빈 캔버스로 시작 (노드 피커 열지 않음)
      setIsStarted(true);
      return;
    }

    // 템플릿별 초기 노드 생성
    const centerX = 400;
    const centerY = 200;

    // 공통 헬퍼: 텍스트 입력 + 생성 노드 패턴
    const createTextToNodeTemplate = (nodeId: string, config: Record<string, unknown> = {}) => {
      const promptNode: Node<CustomNodeData> = {
        id: getNewNodeId(),
        type: 'custom',
        position: { x: centerX - 200, y: centerY },
        data: { nodeId: 'text-input', config: { text: '' }, status: undefined },
      };
      const genNode: Node<CustomNodeData> = {
        id: getNewNodeId(),
        type: 'custom',
        position: { x: centerX + 200, y: centerY },
        data: { nodeId, config, status: undefined },
      };
      setNodes([promptNode, genNode]);
      setEdges([{
        id: 'e1',
        source: promptNode.id,
        target: genNode.id,
        sourceHandle: 'text',
        targetHandle: 'prompt',
        type: 'smoothstep',
        style: { stroke: '#3B82F6', strokeWidth: 2 },
      }]);
    };

    // 공통 헬퍼: 이미지 입력 + 처리 노드 패턴
    const createImageToNodeTemplate = (nodeId: string, config: Record<string, unknown> = {}, targetHandle = 'image') => {
      const imageNode: Node<CustomNodeData> = {
        id: getNewNodeId(),
        type: 'custom',
        position: { x: centerX - 200, y: centerY },
        data: { nodeId: 'image-upload', config: {}, status: undefined },
      };
      const processNode: Node<CustomNodeData> = {
        id: getNewNodeId(),
        type: 'custom',
        position: { x: centerX + 200, y: centerY },
        data: { nodeId, config, status: undefined },
      };
      setNodes([imageNode, processNode]);
      setEdges([{
        id: 'e1',
        source: imageNode.id,
        target: processNode.id,
        sourceHandle: 'image',
        targetHandle,
        type: 'smoothstep',
        style: { stroke: '#9333EA', strokeWidth: 2 },
      }]);
    };

    // 템플릿별 처리
    switch (templateId) {
      // 이미지 생성
      case 'text-to-image':
        createTextToNodeTemplate('text-to-image', { aspectRatio: '1:1' });
        break;
      case 'image-to-image':
        createImageToNodeTemplate('image-to-image', { aspectRatio: '1:1', strength: 0.7 });
        break;
      case 'id-photo':
        createImageToNodeTemplate('id-photo', { purpose: 'resume', background: 'white' }, 'referenceImages');
        break;

      // 영상 생성
      case 'text-to-video':
        createTextToNodeTemplate('text-to-video', { aspectRatio: '16:9', duration: '4' });
        break;
      case 'image-to-video':
        createImageToNodeTemplate('image-to-video', { aspectRatio: '16:9', duration: '4' });
        break;

      // 편집
      case 'upscale':
        createImageToNodeTemplate('upscale-image', { scale: '2' });
        break;
      case 'remove-bg':
        createImageToNodeTemplate('remove-background', {});
        break;

      // 디자인
      case 'mockup':
        createImageToNodeTemplate('mockup', { mockupType: 'social-square' }, 'productImage');
        break;
    }

    // 템플릿 선택 후에도 노드 피커 열기
  }, [getNewNodeId, setNodes, setEdges]);

  const handleRun = useCallback(async () => {
    if (nodes.length === 0) {
      alert('실행할 노드가 없습니다.');
      return;
    }

    setNodes(nds =>
      nds.map(node => ({
        ...node,
        data: { ...node.data, status: 'pending' as const, error: undefined },
      }))
    );

    setIsResultPanelOpen(true);
    await workflow.execute(nodes, edges, updateNodeStatus);
  }, [nodes, edges, setNodes, workflow, updateNodeStatus]);

  // 워크플로우 PNG 파일로 다운로드 (워크플로우 JSON 임베딩)
  const handleSaveWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      alert('저장할 워크플로우가 없습니다.');
      return;
    }

    const workflowData: WorkflowData = {
      name: workflowName,
      nodes: nodes,
      edges: edges,
    };

    rlog('LocalSave', '저장 시작', { name: workflowData.name, nodeCount: nodes.length });

    try {
      // 노드 에디터 캡쳐 (5초 타임아웃)
      let imageForEmbed: string | Blob;
      try {
        const capturePromise = captureNodeEditor(nodes);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('캡쳐 타임아웃')), 5000)
        );
        imageForEmbed = await Promise.race([capturePromise, timeoutPromise]);
      } catch (captureError) {
        rlog('LocalSave', '캡쳐 실패, 기본 이미지 사용', { error: String(captureError) });
        imageForEmbed = await createDefaultWorkflowImage(nodes.length, workflowName);
      }

      // 워크플로우 임베딩
      const pngBlob = await embedWorkflowToPng(imageForEmbed, workflowData);
      downloadBlob(pngBlob, workflowName);
      rlog('LocalSave', '저장 완료');
    } catch (error) {
      rlog('LocalSave', '임베딩 실패, JSON fallback', { error: String(error) });
      // PNG 임베딩 실패 시 JSON으로 fallback
      try {
        const jsonStr = JSON.stringify(workflowData, null, 2);
        const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(jsonBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${workflowName.replace(/\s+/g, '_')}_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('PNG 저장 실패로 JSON으로 대체 저장했습니다.');
      } catch (fallbackError) {
        alert('워크플로우 저장에 실패했습니다: ' + String(error));
      }
    }
  }, [nodes, edges, workflowName]);

  // 다운로드 헬퍼 함수
  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 워크플로우 JSON 파일로 다운로드 (단순 JSON)
  const handleSaveWorkflowJson = useCallback(() => {
    if (nodes.length === 0) {
      alert('저장할 워크플로우가 없습니다.');
      return;
    }

    const workflowData: WorkflowData = {
      name: workflowName,
      nodes: nodes,
      edges: edges,
    };

    const jsonString = JSON.stringify(workflowData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    rlog('LocalSave', 'JSON 저장 완료', { name: workflowName });
  }, [nodes, edges, workflowName]);

  // 파일 선택 다이얼로그 열기
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // PNG/JSON 파일 업로드 및 워크플로우 복원
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    rlog('LocalLoad', '파일 로드 시작', { name: file.name, type: file.type });

    try {
      let workflowData: WorkflowData | null = null;

      // PNG 파일인 경우 메타데이터에서 워크플로우 추출
      if (file.type === 'image/png' || file.name.endsWith('.png')) {
        workflowData = await extractWorkflowFromPng(file);
        if (!workflowData) {
          alert('PNG 파일에서 워크플로우를 찾을 수 없습니다.');
          return;
        }
      } else {
        // JSON 파일인 경우 직접 파싱
        const content = await file.text();
        workflowData = JSON.parse(content) as WorkflowData;
      }

      if (!workflowData?.nodes || !workflowData?.edges) {
        alert('유효하지 않은 워크플로우 파일입니다.');
        return;
      }

      rlog('LocalLoad', '로드 성공', { nodeCount: workflowData.nodes.length });
      setNodes(workflowData.nodes as Node<CustomNodeData>[]);
      setEdges(workflowData.edges);
      if (workflowData.name) {
        setWorkflowName(workflowData.name);
      }
      workflow.reset();
    } catch (error) {
      console.error('워크플로우 로드 실패:', error);
      alert('워크플로우 파일을 읽는데 실패했습니다.');
    }

    // 같은 파일 다시 선택 가능하도록 초기화
    event.target.value = '';
  }, [setNodes, setEdges, workflow, setWorkflowName]);

  return (
    <div className={styles.editor}>
      {/* 헤더 */}
      <div className={styles.header}>
        {/* 좌측: 로고 + 웨이브홈 버튼 */}
        <div className={styles.headerLeft}>
          <div className={styles.brandSection}>
            <span className={styles.brandIcon}>🌊</span>
            <span className={styles.brandName}>Wave</span>
            <span className={styles.betaBadge}>Beta</span>
          </div>
          {/* 웨이브 홈 버튼 - 노드가 있거나 시작된 상태일 때 표시 */}
          {(nodes.length > 0 || isStarted) && (
            <>
              <div className={styles.headerDivider} />
              <button
                className={styles.homeButton}
                onClick={handleGoWaveHome}
                title="새 워크플로우"
              >
                <HomeIcon />
              </button>
            </>
          )}
        </div>

        {/* 중앙: 워크플로우 이름 */}
        {(nodes.length > 0 || isStarted) && (
          <div className={styles.headerCenter}>
            <span className={styles.workflowName}>{workflowName || '새 워크플로우'}</span>
            {workflowSession.isDirty && (
              <span className={styles.unsavedBadge}>저장 안 됨</span>
            )}
          </div>
        )}

        {/* 우측: 줌, 저장, 실행 */}
        <div className={styles.headerRight}>
          {/* 줌 컨트롤 */}
          {(nodes.length > 0 || isStarted) && (
            <div className={styles.zoomControl}>
              <button
                className={styles.zoomButton}
                onClick={() => zoomOut()}
                title="축소 (Cmd+-)"
              >
                <ZoomOutIcon />
              </button>
              <span className={styles.zoomLevel}>{Math.round(viewport.zoom * 100)}%</span>
              <button
                className={styles.zoomButton}
                onClick={() => zoomIn()}
                title="확대 (Cmd++)"
              >
                <ZoomInIcon />
              </button>
            </div>
          )}
          {/* 클라우드 저장 버튼 */}
          {nodes.length > 0 && (
            <button
              className={styles.cloudSaveButton}
              onClick={handleCloudSave}
              disabled={isSaving}
              title="워크플로우 저장"
            >
              <CloudSaveIcon />
              <span>저장</span>
            </button>
          )}
          {nodes.length > 0 && (
            <button
              className={`${styles.runButton} ${workflow.isRunning ? styles.running : ''}`}
              onClick={handleRun}
              disabled={workflow.isRunning || nodes.length === 0}
            >
              {workflow.isRunning ? (
                <>
                  <span className={styles.spinner} />
                  실행 중...
                </>
              ) : (
                <>▶ 실행</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* 중앙: React Flow 캔버스 */}
        <div className={`${styles.canvas} ${currentTool === 'select' ? styles.selectMode : styles.panMode}`} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            snapToGrid
            snapGrid={[20, 20]}
            minZoom={0.2}
            maxZoom={2}
            panOnDrag={currentTool === 'pan' ? true : [1]}
            selectionOnDrag={currentTool === 'select'}
            multiSelectionKeyCode="Shift"
            deleteKeyCode={['Backspace', 'Delete']}
            zoomOnScroll={!isNodePickerOpen}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={2}
              color="#D1D5DB"
            />
          </ReactFlow>

          {/* 플로팅 툴바 (레퍼런스 스타일) */}
          {(nodes.length > 0 || isStarted) && (
            <div className={styles.floatingToolbar}>
              {/* 노드 추가 */}
              <button
                className={styles.toolbarButton}
                onClick={() => setIsNodePickerOpen(true)}
                title="노드 추가 (N)"
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

              {/* 손 도구 (팬) */}
              <button
                className={`${styles.toolbarButton} ${currentTool === 'pan' ? styles.active : ''}`}
                onClick={() => setCurrentTool('pan')}
                title="손 도구 (H)"
              >
                <HandIcon />
              </button>

              <div className={styles.toolbarDivider} />

              {/* Undo */}
              <button
                className={`${styles.toolbarButton} ${styles.disabled}`}
                title="실행 취소 (Cmd+Z)"
                disabled
              >
                <UndoIcon />
              </button>

              {/* Redo */}
              <button
                className={`${styles.toolbarButton} ${styles.disabled}`}
                title="다시 실행 (Cmd+Shift+Z)"
                disabled
              >
                <RedoIcon />
              </button>

              <div className={styles.toolbarDivider} />

              {/* 워크플로우 PNG 저장 (이미지+워크플로우) */}
              <button
                className={styles.toolbarButton}
                onClick={handleSaveWorkflow}
                title="PNG로 저장 (이미지에 워크플로우 포함)"
              >
                <SavePngIcon />
              </button>

              {/* 워크플로우 JSON 저장 (데이터만) */}
              <button
                className={styles.toolbarButton}
                onClick={handleSaveWorkflowJson}
                title="JSON으로 저장 (데이터만)"
              >
                <SaveJsonIcon />
              </button>

              {/* 워크플로우 불러오기 (업로드) */}
              <button
                className={styles.toolbarButton}
                onClick={handleUploadClick}
                title="불러오기 (PNG 또는 JSON)"
              >
                <UploadIcon />
              </button>
            </div>
          )}

          {/* 숨겨진 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.json,image/png,application/json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {/* 빈 상태: 템플릿 선택 */}
          {nodes.length === 0 && !isStarted && (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>워크플로우를 시작하세요</h2>
              <p className={styles.emptySubtitle}>템플릿을 선택하거나 빈 캔버스에서 시작하세요</p>
              <div className={styles.templateGrid}>
                {WORKFLOW_TEMPLATES.map(template => {
                  const IconComponent = TEMPLATE_ICONS[template.id];
                  return (
                    <button
                      key={template.id}
                      className={`${styles.templateCard} ${styles[template.color]}`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className={styles.templateIcon}>
                        {IconComponent && <IconComponent />}
                      </div>
                      <span className={styles.templateName}>{template.name}</span>
                      <span className={styles.templateDesc}>{template.desc}</span>
                    </button>
                  );
                })}
              </div>
              {/* 하단 버튼 영역 */}
              <div className={styles.emptyActions}>
                <button
                  className={styles.uploadButton}
                  onClick={handleUploadClick}
                  title="로컬 컴퓨터에서 워크플로우 불러오기"
                >
                  <UploadIcon />
                  <span>워크플로우 불러오기</span>
                </button>
                <button
                  className={styles.uploadButton}
                  onClick={() => setIsNodePickerOpen(true)}
                  title="노드를 선택해서 시작"
                >
                  <TemplateEmptyIcon />
                  <span>노드로 시작하기</span>
                </button>
              </div>
            </div>
          )}

          {/* 오른쪽 패널 영역 - 플로팅 (노드가 있을 때만 표시) */}
          {nodes.length > 0 && (
            <div className={styles.rightPanels}>
              {/* 웨이브 리스트 패널 */}
              <WaveListPanel
                isExpanded={isWaveListExpanded}
                onToggleExpand={() => setIsWaveListExpanded(!isWaveListExpanded)}
              />
              {/* 미디어 아카이브 패널 */}
              <ResultPanel
                isOpen={isResultPanelOpen}
                isRunning={workflow.isRunning}
                results={workflow.results}
                finalOutputs={workflow.finalOutputs}
                error={workflow.error}
                duration={workflow.duration}
                onClose={() => setIsResultPanelOpen(false)}
                imageHistory={imageHistory}
                isLoadingHistory={isLoadingHistory}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onRefreshHistory={loadImageHistory}
                onLightboxChange={onLightboxChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* 노드 선택 팝업 */}
      <NodePicker
        isOpen={isNodePickerOpen}
        onClose={() => setIsNodePickerOpen(false)}
        onSelectNode={handlePickerNodeSelect}
      />

      {/* 저장 다이얼로그 */}
      <SaveWorkflowDialog
        isOpen={showSaveDialog}
        defaultName={workflowName}
        isSaving={isSaving}
        isFromFeatured={workflowSession.isFromFeatured}
        hasSessionId={!!workflowSession.id}
        isNavigating={!!pendingNavigation}
        onSave={handleSaveDialogSave}
        onSaveAs={handleSaveAsDialogSave}
        onDiscard={handleSaveDialogDiscard}
        onCancel={handleSaveDialogCancel}
      />
    </div>
  );
};

/**
 * Orange Wave 노드 에디터 (Provider 포함)
 */
const NodeEditor: React.FC<NodeEditorProps> = props => {
  return (
    <ReactFlowProvider>
      <NodeEditorInner {...props} />
    </ReactFlowProvider>
  );
};

export default NodeEditor;

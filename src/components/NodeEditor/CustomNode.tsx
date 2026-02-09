/**
 * Custom Node Component
 */

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow, useEdges } from '@xyflow/react';
import type { NodeExecutionStatus, ConfigDefinition, NodeDefinition } from '../../nodes/types';
import { PORT_COLORS, CATEGORY_COLORS } from '../../nodes/types';
import { nodeRegistry, getAllNodes } from '../../nodes/registry';
import { MOCKUP_CATEGORIES, MOCKUP_PRESETS, STATIC_MOCKUP_SAMPLES } from '../../pages/GenAI/constants/mockups';
import { rlog } from '../../utils/debug';
import styles from './CustomNode.module.css';

// 검색 아이콘
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// 이미지 업로드 아이콘
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// 실행(플레이) 아이콘
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// 휴지통 아이콘
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// 노드 아이콘 컴포넌트들 (Lucide 스타일)
const NodeIcons: Record<string, React.FC<{ size?: number }>> = {
  Type: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  Upload: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  ImagePlus: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
      <line x1="16" y1="5" x2="22" y2="5" />
      <line x1="19" y1="2" x2="19" y2="8" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  ),
  Video: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  ),
  Clapperboard: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
      <path d="m6.2 5.3 3.1 3.9" />
      <path d="m12.4 3.4 3.1 4" />
      <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  ),
  Film: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M17 3v18" />
      <path d="M3 7h4" />
      <path d="M3 12h18" />
      <path d="M3 17h4" />
      <path d="M17 7h4" />
      <path d="M17 17h4" />
    </svg>
  ),
  Maximize2: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
  Scissors: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <path d="M8.12 8.12 12 12" />
      <path d="M20 4 8.12 15.88" />
      <circle cx="6" cy="18" r="3" />
      <path d="M14.8 14.8 20 20" />
    </svg>
  ),
  Layout: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  UserSquare: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Paintbrush: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
      <path d="M14.5 17.5 4.5 15" />
    </svg>
  ),
  Sparkles: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  ),
  ArrowRightCircle: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="m12 16 4-4-4-4" />
    </svg>
  ),
  ArrowLeftCircle: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 12H8" />
      <path d="m12 8-4 4 4 4" />
    </svg>
  ),
  GitMerge: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M6 21V9a9 9 0 0 0 9 9" />
    </svg>
  ),
};

// 아이콘 이름으로 아이콘 컴포넌트 가져오기
const getNodeIcon = (iconName: string, size = 18) => {
  const IconComponent = NodeIcons[iconName];
  if (IconComponent) {
    return <IconComponent size={size} />;
  }
  // 기본 아이콘 (알 수 없는 경우)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
};

// 목업 카테고리 및 타입 데이터
// 목업 카테고리별 프리셋 그룹핑 (mockups.js 데이터 활용)
const MOCKUP_CATEGORY_ITEMS = MOCKUP_CATEGORIES.map(cat => ({
  id: cat.key,
  name: cat.label,
  items: MOCKUP_PRESETS
    .filter(preset => preset.category === cat.key)
    .map(preset => ({
      value: preset.key,
      label: preset.label,
      ratio: preset.ratio,
      image: STATIC_MOCKUP_SAMPLES[preset.key as keyof typeof STATIC_MOCKUP_SAMPLES] || null,
      description: preset.description,
    })),
}));

export interface CustomNodeData {
  nodeId: string;
  config: Record<string, unknown>;
  status?: NodeExecutionStatus;
  error?: string;
  outputs?: Record<string, unknown>;
  [key: string]: unknown;
}

interface CustomNodeProps {
  id: string;
  data: CustomNodeData;
  selected?: boolean;
}

/**
 * 커스텀 노드 컴포넌트
 */
const CustomNodeComponent: React.FC<CustomNodeProps> = ({ id, data, selected }) => {
  // 명시적 타입 추출
  const { nodeId, config, status, error, outputs } = data as {
    nodeId: string;
    config: Record<string, unknown>;
    status?: NodeExecutionStatus;
    error?: string;
    outputs?: Record<string, unknown>;
  };

  const nodeDefResult = nodeRegistry.get(nodeId);
  const [settingsOpen, setSettingsOpen] = useState(true); // 기본 펼침
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 노드 검색

  // 목업 카테고리 - config의 mockupType에서 초기값 계산
  const getInitialMockupCategory = useCallback(() => {
    const savedType = config.mockupType as string | undefined;
    if (!savedType) return 'print';
    // 저장된 mockupType이 속한 카테고리 찾기
    const found = MOCKUP_CATEGORY_ITEMS.find(cat =>
      cat.items.some(item => item.value === savedType)
    );
    return found?.id || 'print';
  }, [config.mockupType]);

  const [mockupCategory, setMockupCategory] = useState(getInitialMockupCategory);

  // config.mockupType 변경 시 카테고리 동기화
  useEffect(() => {
    setMockupCategory(getInitialMockupCategory());
  }, [getInitialMockupCategory]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const nodeListRef = useRef<HTMLDivElement>(null);
  const { setNodes, setEdges, getNodes } = useReactFlow();
  const edges = useEdges();

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuOpen && addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addMenuOpen]);

  // 메뉴 열릴 때 검색창에 포커스
  useEffect(() => {
    if (addMenuOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [addMenuOpen]);

  // 노드 리스트 휠 스크롤 - native event로 React Flow 줌 차단
  useEffect(() => {
    const listEl = nodeListRef.current;
    if (!listEl || !addMenuOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      listEl.scrollTop += e.deltaY;
    };

    listEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => listEl.removeEventListener('wheel', handleWheel);
  }, [addMenuOpen]);

  // config 변경 핸들러
  const handleConfigChange = useCallback((configId: string, value: unknown) => {
    rlog('Config', `변경 ${id}`, { configId, value });
    setNodes(nodes => nodes.map(node => {
      if (node.id === id) {
        const newConfig = {
          ...(node.data as CustomNodeData).config,
          [configId]: value,
        };
        rlog('Config', `적용 ${id}`, { newConfig });
        return {
          ...node,
          data: {
            ...node.data,
            config: newConfig,
          },
        };
      }
      return node;
    }));
  }, [id, setNodes]);

  // 이미지 파일 처리
  const handleImageFile = useCallback((file: File, configId: string) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      handleConfigChange(configId, dataUrl);
    };
    reader.readAsDataURL(file);
  }, [handleConfigChange]);

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, configId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageFile(file, configId);
    }
  }, [handleImageFile]);

  // 파일 입력 핸들러
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, configId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file, configId);
    }
  }, [handleImageFile]);

  // 다음 노드 추가 - 실제 노드 높이 기반 배치
  const handleAddNode = useCallback((nodeDefId: string) => {
    const newNodeDef = nodeRegistry.get(nodeDefId);
    if (!newNodeDef || !nodeDefResult) return;

    const currentNodes = getNodes();
    const currentNode = currentNodes.find(n => n.id === id);
    if (!currentNode) return;

    // 이 노드에서 나가는 엣지들 찾기 (이미 연결된 노드들)
    const outgoingEdges = edges.filter(edge => edge.source === id);
    const connectedNodeIds = outgoingEdges.map(edge => edge.target);
    const connectedNodes = currentNodes.filter(n => connectedNodeIds.includes(n.id));

    // 새 노드 위치 계산
    const HORIZONTAL_GAP = 350;  // 오른쪽 간격
    const VERTICAL_GAP = 30;     // 노드 사이 여백
    const DEFAULT_HEIGHT = 200;  // DOM 측정 실패 시 기본값

    let newY: number;

    if (connectedNodes.length === 0) {
      // 연결된 노드 없음 → 부모 노드와 같은 Y 정렬
      newY = currentNode.position.y;
    } else {
      // 연결된 노드들 중 가장 아래에 있는 노드 찾기
      const lowestNode = connectedNodes.reduce((lowest, node) =>
        node.position.y > lowest.position.y ? node : lowest
      , connectedNodes[0]);

      // 가장 아래 노드의 실제 DOM 높이 측정
      const nodeElement = document.querySelector(`[data-id="${lowestNode.id}"]`);
      const actualHeight = nodeElement?.getBoundingClientRect().height || DEFAULT_HEIGHT;

      // 실제 높이 기반으로 아래에 배치
      newY = lowestNode.position.y + actualHeight + VERTICAL_GAP;
    }

    const newNodeId = `node-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'custom',
      position: {
        x: currentNode.position.x + HORIZONTAL_GAP,
        y: newY,
      },
      data: {
        nodeId: nodeDefId,
        config: {},
        status: undefined,
      },
    };

    setNodes(nodes => [...nodes, newNode]);

    // 자동 연결
    if (nodeDefResult.outputs[0] && newNodeDef.inputs[0]) {
      const newEdge = {
        id: `e-${id}-${newNodeId}`,
        source: id,
        target: newNodeId,
        sourceHandle: nodeDefResult.outputs[0].id,
        targetHandle: newNodeDef.inputs[0].id,
        type: 'smoothstep',
        style: { stroke: PORT_COLORS[nodeDefResult.outputs[0].type], strokeWidth: 2 },
      };
      setEdges(edges => [...edges, newEdge]);
    }

    setAddMenuOpen(false);
    setSearchQuery('');
  }, [id, nodeDefResult, setNodes, setEdges, getNodes, edges]);

  // 연결된 모든 선행 노드를 토폴로지 순서로 찾기
  const getExecutionOrder = useCallback((targetNodeId: string): string[] => {
    const visited = new Set<string>();
    const order: string[] = [];

    // 선행 노드 수집 (upstream: 현재 노드 포함)
    const visitUpstream = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const incomingEdges = edges.filter(edge => edge.target === nodeId);
      for (const edge of incomingEdges) {
        visitUpstream(edge.source);
      }

      order.push(nodeId);
    };

    // 하위 노드 수집 (downstream: 현재 노드 이후)
    const visitDownstream = (nodeId: string) => {
      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (visited.has(edge.target)) continue;
        // 하위 노드의 다른 선행 노드도 먼저 수집
        const otherIncoming = edges.filter(e => e.target === edge.target && e.source !== nodeId);
        for (const otherEdge of otherIncoming) {
          if (!visited.has(otherEdge.source)) {
            visitUpstream(otherEdge.source);
          }
        }
        visited.add(edge.target);
        order.push(edge.target);
        visitDownstream(edge.target);
      }
    };

    visitUpstream(targetNodeId);
    visitDownstream(targetNodeId);
    return order;
  }, [edges]);

  // 노드 실행 핸들러 - 연결된 모든 선행 노드부터 순서대로 실행
  const handleExecuteNode = useCallback(async () => {
    if (!nodeDefResult) return;
    if (status === 'running') return;

    // 실행 순서 계산 (토폴로지 정렬)
    const executionOrder = getExecutionOrder(id);
    const allNodes = getNodes();

    // 실행 결과를 임시 저장 (setNodes의 비동기 문제 해결)
    const executionResults: Record<string, Record<string, unknown>> = {};
    // 에러난 노드 추적 (의존하는 후속 노드 스킵용)
    const failedNodeIds = new Set<string>();

    // 순서대로 실행
    for (const execNodeId of executionOrder) {
      const node = allNodes.find(n => n.id === execNodeId);
      if (!node) continue;

      const nodeData = node.data as CustomNodeData;
      const nodeDef = nodeRegistry.get(nodeData.nodeId);
      if (!nodeDef) continue;

      // 선행 노드 중 에러난 노드에 의존하는 경우 스킵
      const incomingEdges = edges.filter(edge => edge.target === execNodeId);
      const dependsOnFailed = incomingEdges.some(edge => failedNodeIds.has(edge.source));
      if (dependsOnFailed) {
        failedNodeIds.add(execNodeId);
        setNodes(nodes => nodes.map(n => {
          if (n.id === execNodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                status: 'error' as NodeExecutionStatus,
                error: '선행 노드 실패로 스킵됨',
              },
            };
          }
          return n;
        }));
        continue;
      }

      // 이미 완료된 선행 노드는 건너뛰기 (결과 캐시만 수집)
      // 단, 현재 실행 대상 노드(id)는 항상 재실행
      if (execNodeId !== id && nodeData.status === 'completed' && nodeData.outputs) {
        executionResults[execNodeId] = nodeData.outputs;
        continue;
      }

      // 상태를 running으로 변경
      setNodes(nodes => nodes.map(n => {
        if (n.id === execNodeId) {
          return {
            ...n,
            data: { ...n.data, status: 'running' as NodeExecutionStatus, error: undefined },
          };
        }
        return n;
      }));

      try {
        // 연결된 노드에서 입력 데이터 수집 (캐시된 결과 사용)
        const inputs: Record<string, unknown> = {};

        for (const edge of incomingEdges) {
          // 먼저 캐시된 결과에서 찾기
          if (executionResults[edge.source] && edge.sourceHandle) {
            const outputValue = executionResults[edge.source][edge.sourceHandle];
            if (edge.targetHandle && outputValue) {
              inputs[edge.targetHandle] = outputValue;
            }
          } else {
            // 캐시에 없으면 기존 노드 데이터에서 찾기
            const sourceNode = allNodes.find(n => n.id === edge.source);
            if (sourceNode && sourceNode.data) {
              const sourceData = sourceNode.data as CustomNodeData;
              if (sourceData.outputs && edge.sourceHandle) {
                const outputValue = sourceData.outputs[edge.sourceHandle];
                if (edge.targetHandle && outputValue) {
                  inputs[edge.targetHandle] = outputValue;
                }
              }
            }
          }
        }

        // 노드의 execute 함수 호출
        const result = await nodeDef.execute(inputs, nodeData.config || {});

        // 결과를 캐시에 저장
        if (result.outputs) {
          executionResults[execNodeId] = result.outputs;
        }

        // 결과 적용
        setNodes(nodes => nodes.map(n => {
          if (n.id === execNodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                status: (result.error ? 'error' : 'completed') as NodeExecutionStatus,
                outputs: result.outputs,
                error: result.error?.message,
              },
            };
          }
          return n;
        }));

        if (result.error) {
          // 에러난 노드 기록하고 계속 진행 (독립 브랜치는 실행)
          failedNodeIds.add(execNodeId);
        }
      } catch (err) {
        failedNodeIds.add(execNodeId);
        setNodes(nodes => nodes.map(n => {
          if (n.id === execNodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                status: 'error' as NodeExecutionStatus,
                error: err instanceof Error ? err.message : '실행 중 오류 발생',
              },
            };
          }
          return n;
        }));
        // break 하지 않고 계속 진행
      }
    }
  }, [id, nodeDefResult, status, edges, getExecutionOrder, setNodes, getNodes]);

  // 노드 삭제 핸들러
  const handleDeleteNode = useCallback(() => {
    // 이 노드와 연결된 모든 엣지 삭제
    setEdges(eds => eds.filter(edge => edge.source !== id && edge.target !== id));
    // 노드 삭제
    setNodes(nds => nds.filter(node => node.id !== id));
  }, [id, setNodes, setEdges]);

  if (!nodeDefResult) {
    return (
      <div className={styles.node}>
        <div className={styles.header}>
          <span className={styles.icon}>❓</span>
          <span className={styles.title}>Unknown Node</span>
        </div>
        <div className={styles.errorMsg}>Node not found: {nodeId}</div>
      </div>
    );
  }

  // 타입 안전을 위해 명시적 타입 지정
  const nodeDef: NodeDefinition = nodeDefResult;

  const categoryColor = CATEGORY_COLORS[nodeDef.category];
  const statusClass = status ? (styles[status] as string || '') : '';
  const hasPreview = Boolean(outputs?.['image'] || outputs?.['video']);

  // 실행 가능 여부 판단
  const isReadyToExecute = (() => {
    // 이미 실행 중이면 false
    if (status === 'running') return false;

    // 필수 config 확인 (image-upload 타입의 경우 값이 있어야 함)
    const requiredConfigs = nodeDef.config.filter(cfg =>
      cfg.type === 'image-upload' ||
      (cfg.type === 'mockup-select')
    );

    for (const cfg of requiredConfigs) {
      const value = config[cfg.id] ?? cfg.default;
      if (!value) return false;
    }

    // 필수 입력이 없는 경우 (입력 노드 등) 바로 실행 가능
    if (nodeDef.inputs.length === 0) return true;

    // 필수 입력이 있으면 연결되어 있거나 config로 값이 제공되어야 함
    // TODO: 실제 연결 상태 확인 필요 - 일단 간단히 처리
    return true;
  })();

  // 설정 입력 렌더링
  const renderConfigInput = (configDef: ConfigDefinition) => {
    const value = config[configDef.id] ?? configDef.default ?? '';

    switch (configDef.type) {
      case 'text':
        return (
          <textarea
            className={styles.textarea}
            value={String(value)}
            onChange={e => handleConfigChange(configDef.id, e.target.value)}
            placeholder={configDef.description || configDef.name}
            rows={3}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className={styles.input}
            value={Number(value) || 0}
            onChange={e => handleConfigChange(configDef.id, Number(e.target.value))}
            min={configDef.min}
            max={configDef.max}
            step={configDef.step}
          />
        );
      case 'boolean':
        return (
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={e => handleConfigChange(configDef.id, e.target.checked)}
            />
            <span className={styles.toggleSlider} />
          </label>
        );
      case 'select':
        return (
          <select
            className={styles.select}
            value={String(value)}
            onChange={e => handleConfigChange(configDef.id, e.target.value)}
          >
            {configDef.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'slider':
        return (
          <div className={styles.sliderWrapper}>
            <input
              type="range"
              className={styles.slider}
              value={Number(value) || configDef.min || 0}
              onChange={e => handleConfigChange(configDef.id, Number(e.target.value))}
              min={configDef.min}
              max={configDef.max}
              step={configDef.step}
            />
            <span className={styles.sliderValue}>{String(value)}</span>
          </div>
        );
      case 'image-upload':
        return (
          <div
            className={`${styles.imageUploadZone} ${isDragOver ? styles.dragOver : ''} ${value ? styles.hasImage : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, configDef.id)}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, configDef.id)}
              style={{ display: 'none' }}
            />
            {value ? (
              <div className={styles.uploadedImageWrapper}>
                <img src={String(value)} alt="업로드된 이미지" className={styles.uploadedImage} />
                <button
                  className={styles.removeImageBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfigChange(configDef.id, '');
                    // file input 초기화 (같은 파일 재업로드 가능하도록)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className={styles.uploadPlaceholder}>
                <UploadIcon />
                <span className={styles.uploadText}>이미지를 드래그하거나<br />클릭하여 업로드</span>
              </div>
            )}
          </div>
        );
      case 'mockup-select':
        const currentCategory = MOCKUP_CATEGORY_ITEMS.find(c => c.id === mockupCategory) || MOCKUP_CATEGORY_ITEMS[0];
        return (
          <div className={styles.mockupSelector}>
            {/* 카테고리 탭 */}
            <div className={styles.mockupCategoryTabs}>
              {MOCKUP_CATEGORY_ITEMS.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.mockupCategoryTab} ${mockupCategory === cat.id ? styles.active : ''}`}
                  onClick={() => setMockupCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {/* 목업 타입 그리드 - 썸네일 이미지 포함 */}
            <div className={styles.mockupGrid}>
              {currentCategory.items.map(item => (
                <button
                  key={item.value}
                  className={`${styles.mockupCard} ${value === item.value ? styles.selected : ''}`}
                  onClick={() => handleConfigChange(configDef.id, item.value)}
                  title={item.description}
                >
                  <div className={styles.mockupThumb}>
                    {item.image ? (
                      <img src={item.image} alt={item.label} className={styles.mockupImage} />
                    ) : (
                      <span className={styles.mockupRatio}>{item.ratio}</span>
                    )}
                  </div>
                  <span className={styles.mockupLabel}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''} ${statusClass}`}
      style={{ '--category-color': categoryColor } as React.CSSProperties}
    >
      {/* 액션 버튼들 - 노드 상단에 오버레이 */}
      {selected && (
        <div className={styles.nodeActions}>
          {isReadyToExecute && (
            <button
              className={styles.executeBtn}
              onClick={handleExecuteNode}
            >
              <PlayIcon />
              <span>실행</span>
            </button>
          )}
          <button
            className={styles.deleteBtn}
            onClick={handleDeleteNode}
            title="노드 삭제"
          >
            <TrashIcon />
          </button>
        </div>
      )}

      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.categoryDot} style={{ backgroundColor: categoryColor }} />
          <span className={styles.title}>{String(nodeDef.name)}</span>
        </div>
        <div className={styles.headerRight}>
          {status === 'running' && <span className={styles.spinner} />}
          {status === 'completed' && <span className={styles.checkmark}>✓</span>}
          {status === 'error' && <span className={styles.errorIcon}>!</span>}
        </div>
      </div>

      {/* 입력 포트 섹션 - 핸들과 라벨이 한 줄에 */}
      {nodeDef.inputs.length > 0 && (
        <div className={styles.inputSection}>
          {nodeDef.inputs.map(input => (
            <div key={input.id} className={styles.inputRow}>
              <Handle
                type="target"
                position={Position.Left}
                id={input.id}
                className={`${styles.handle} ${styles.inputHandle}`}
                style={{
                  backgroundColor: PORT_COLORS[input.type],
                  '--handle-color': PORT_COLORS[input.type],
                } as React.CSSProperties}
              />
              <span className={styles.inputLabel}>
                {input.name}
                {input.required && <span className={styles.required}>*</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 프리뷰 (이미지/영상) - 호버 시 액션 버튼 */}
      {hasPreview && (
        <div className={styles.preview}>
          {Boolean(outputs?.['image']) && (
            <div className={styles.previewWrapper}>
              <img
                src={String(outputs?.['image'] || '')}
                alt="Preview"
                className={styles.previewImage}
              />
              <div className={styles.previewActions}>
                <button
                  className={styles.previewActionBtn}
                  onClick={() => window.open(String(outputs?.['image']), '_blank')}
                  title="새 탭에서 보기"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
                <button
                  className={styles.previewActionBtn}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = String(outputs?.['image']);
                    link.download = `wave-output-${Date.now()}.png`;
                    link.click();
                  }}
                  title="다운로드"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {Boolean(outputs?.['video']) && (
            <div className={styles.previewWrapper}>
              <video
                src={String(outputs?.['video'] || '')}
                className={styles.previewVideo}
                controls
                muted
              />
              <div className={styles.previewActions}>
                <button
                  className={styles.previewActionBtn}
                  onClick={() => window.open(String(outputs?.['video']), '_blank')}
                  title="새 탭에서 보기"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
                <button
                  className={styles.previewActionBtn}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = String(outputs?.['video']);
                    link.download = `wave-output-${Date.now()}.mp4`;
                    link.click();
                  }}
                  title="다운로드"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 이미지 업로드 영역 - 토글 없이 바로 표시 */}
      {nodeDef.config.some(cfg => cfg.type === 'image-upload') && (
        <div className={styles.uploadSection}>
          {nodeDef.config
            .filter(cfg => cfg.type === 'image-upload')
            .map(cfg => renderConfigInput(cfg))}
        </div>
      )}

      {/* 목업 선택 영역 - 토글 없이 바로 표시 */}
      {nodeDef.config.some(cfg => cfg.type === 'mockup-select') && (
        <div className={styles.mockupSection}>
          {nodeDef.config
            .filter(cfg => cfg.type === 'mockup-select')
            .map(cfg => renderConfigInput(cfg))}
        </div>
      )}

      {/* 설정 섹션 - image-upload, mockup-select 제외 */}
      {nodeDef.config.filter(cfg => cfg.type !== 'image-upload' && cfg.type !== 'mockup-select').length > 0 && (
        <div className={styles.settingsSection}>
          <button
            className={styles.settingsToggle}
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <span className={`${styles.arrow} ${settingsOpen ? styles.open : ''}`}>▶</span>
            <span>Settings</span>
          </button>

          {settingsOpen && (
            <div className={styles.settingsContent}>
              {nodeDef.config
                .filter(cfg => cfg.type !== 'image-upload' && cfg.type !== 'mockup-select')
                .map(cfg => (
                  <div key={cfg.id} className={styles.configItem}>
                    <label className={styles.configLabel}>{cfg.name}</label>
                    {renderConfigInput(cfg)}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 출력 포트 섹션 - 핸들과 라벨이 한 줄에 */}
      {nodeDef.outputs.length > 0 && (
        <div className={styles.outputSection}>
          {nodeDef.outputs.map(output => (
            <div key={output.id} className={styles.outputRow}>
              <span className={styles.outputLabel}>{output.name}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                className={`${styles.handle} ${styles.outputHandle}`}
                style={{
                  backgroundColor: PORT_COLORS[output.type],
                  '--handle-color': PORT_COLORS[output.type],
                } as React.CSSProperties}
              />
            </div>
          ))}
        </div>
      )}

      {/* + 버튼으로 다음 노드 추가 - 노드 레벨에 배치 */}
      <div className={styles.addNodeWrapper} ref={addMenuRef}>
        <button
          className={styles.addNodeBtn}
          onClick={() => setAddMenuOpen(!addMenuOpen)}
        >
          +
        </button>

        {addMenuOpen && (
          <div className={styles.addNodeMenu}>
            {/* 검색 입력 */}
            <div className={styles.addNodeSearch}>
              <SearchIcon />
              <input
                ref={searchInputRef}
                type="text"
                className={styles.addNodeSearchInput}
                placeholder="노드 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* 노드 리스트 - 연결 가능한 노드만 표시 */}
            <div className={styles.addNodeList} ref={nodeListRef}>
              {getAllNodes()
                .filter(node => {
                  // 현재 노드의 output 타입들
                  const currentOutputTypes = nodeDef.outputs.map(o => o.type);

                  // 후보 노드의 input 타입들
                  const candidateInputTypes = node.inputs.map(i => i.type);

                  // 연결 가능 여부: output과 input 타입이 매칭되는지
                  // 'any' 타입은 모든 타입과 연결 가능
                  // 'image'와 'images'는 호환 (단일 이미지 → 복수 이미지 입력)
                  const isCompatible = (outType: string, inType: string) =>
                    outType === inType ||
                    outType === 'any' || inType === 'any' ||
                    (outType === 'image' && inType === 'images') ||
                    (outType === 'images' && inType === 'image');
                  const canConnect = currentOutputTypes.some(outType =>
                    candidateInputTypes.some(inType => isCompatible(outType, inType))
                  );

                  // 연결 불가능하면 목록에서 제외
                  if (!canConnect) return false;

                  // 검색어 필터
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    node.name.toLowerCase().includes(query) ||
                    node.description?.toLowerCase().includes(query) ||
                    node.category.toLowerCase().includes(query)
                  );
                })
                .map(node => (
                  <button
                    key={node.id}
                    className={styles.addNodeMenuItem}
                    onClick={() => handleAddNode(node.id)}
                  >
                    <span className={styles.addNodeIcon}>{getNodeIcon(node.icon)}</span>
                    <div className={styles.addNodeInfo}>
                      <span className={styles.addNodeName}>{node.name}</span>
                      {node.description && (
                        <span className={styles.addNodeDesc}>{node.description}</span>
                      )}
                    </div>
                  </button>
                ))}
              {getAllNodes().filter(node => {
                // 현재 노드의 output 타입들
                const currentOutputTypes = nodeDef.outputs.map(o => o.type);
                const candidateInputTypes = node.inputs.map(i => i.type);
                const canConnect = currentOutputTypes.some(outType =>
                  candidateInputTypes.some(inType =>
                    outType === inType || outType === 'any' || inType === 'any'
                  )
                );
                if (!canConnect) return false;

                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  node.name.toLowerCase().includes(query) ||
                  node.description?.toLowerCase().includes(query) ||
                  node.category.toLowerCase().includes(query)
                );
              }).length === 0 && (
                <div className={styles.addNodeEmpty}>
                  {searchQuery ? '검색 결과가 없습니다' : '연결 가능한 노드가 없습니다'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className={styles.errorMsg}>
          <span className={styles.errorText}>{error}</span>
          <button
            className={styles.errorCopyBtn}
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(error);
            }}
            title="에러 복사"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(CustomNodeComponent);

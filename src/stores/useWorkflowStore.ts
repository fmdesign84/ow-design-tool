/**
 * Wave 워크플로우 상태 관리 (Zustand)
 * - 현재 세션 (노드, 엣지, 뷰포트)
 * - 저장된 워크플로우 목록
 * - localStorage 영속화 (세션 복구용)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Node, Edge } from '@xyflow/react';
import {
  embedWorkflowToPng,
  createDefaultWorkflowImage,
  blobToBase64,
  extractWorkflowFromPng,
} from '../utils/pngWorkflow';
import { getApiUrl } from '../utils/apiRoute';

// 워크플로우 목록 아이템
export interface WorkflowListItem {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  node_count: number;
  is_featured: boolean;
  template_id: string | null;
  created_at: string;
  updated_at: string;
}

// 현재 세션 상태
export interface WorkflowSession {
  id: string | null;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
  templateId: string | null;
  isDirty: boolean;
  lastResultImage: string | null;
  // 추천 워크플로우에서 복제된 경우 true (원본 수정 불가)
  isFromFeatured: boolean;
}

// 기본 세션 상태
const DEFAULT_SESSION: WorkflowSession = {
  id: null,
  name: '새 워크플로우',
  description: '',
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  templateId: null,
  isDirty: false,
  lastResultImage: null,
  isFromFeatured: false,
};

// Store 인터페이스
interface WorkflowStore {
  // 현재 세션
  session: WorkflowSession;

  // 저장된 워크플로우 목록
  savedWorkflows: WorkflowListItem[];
  featuredWorkflows: WorkflowListItem[];

  // 로딩 상태
  isLoading: boolean;
  isSaving: boolean;

  // Actions - 세션
  updateSession: (updates: Partial<WorkflowSession>) => void;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  setLastResultImage: (image: string | null) => void;
  markDirty: () => void;
  markClean: () => void;
  resetSession: () => void;

  // Actions - CRUD
  saveWorkflow: (name?: string, capturedImage?: string) => Promise<string>;
  saveAsNewWorkflow: (name: string, capturedImage?: string) => Promise<string>;
  loadWorkflow: (id: string) => Promise<void>;
  loadFromImage: (imageUrl: string) => Promise<boolean>;
  deleteWorkflow: (id: string) => Promise<void>;
  renameWorkflow: (id: string, name: string) => Promise<void>;

  // Actions - 추천
  toggleFeatured: (id: string, featured: boolean) => Promise<void>;

  // Actions - 목록
  fetchWorkflows: () => Promise<void>;
  fetchFeaturedWorkflows: () => Promise<void>;
}

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set, get) => ({
      // ===== 상태 =====
      session: { ...DEFAULT_SESSION },
      savedWorkflows: [],
      featuredWorkflows: [],
      isLoading: false,
      isSaving: false,

      // ===== 세션 액션 =====

      updateSession: (updates) => {
        set((state) => ({
          session: {
            ...state.session,
            ...updates,
            isDirty: true,
          },
        }));
      },

      setNodes: (nodesOrUpdater) => {
        set((state) => {
          const currentNodes = state.session.nodes || [];
          const newNodes = typeof nodesOrUpdater === 'function'
            ? nodesOrUpdater(currentNodes)
            : nodesOrUpdater;
          return {
            session: {
              ...state.session,
              nodes: newNodes,
              isDirty: true,
            },
          };
        });
      },

      setEdges: (edgesOrUpdater) => {
        set((state) => {
          const currentEdges = state.session.edges || [];
          const newEdges = typeof edgesOrUpdater === 'function'
            ? edgesOrUpdater(currentEdges)
            : edgesOrUpdater;
          return {
            session: {
              ...state.session,
              edges: newEdges,
              isDirty: true,
            },
          };
        });
      },

      setViewport: (viewport) => {
        set((state) => ({
          session: {
            ...state.session,
            viewport,
          },
        }));
      },

      setLastResultImage: (image) => {
        set((state) => ({
          session: {
            ...state.session,
            lastResultImage: image,
          },
        }));
      },

      markDirty: () => {
        set((state) => ({
          session: {
            ...state.session,
            isDirty: true,
          },
        }));
      },

      markClean: () => {
        set((state) => ({
          session: {
            ...state.session,
            isDirty: false,
          },
        }));
      },

      resetSession: () => {
        set({ session: { ...DEFAULT_SESSION } });
      },

      // ===== CRUD 액션 =====

      saveWorkflow: async (name?: string, capturedImage?: string) => {
        const { session } = get();
        const workflowName = name || session.name || '새 워크플로우';

        set({ isSaving: true });

        try {
          // 노드 config에서 base64 이미지 제거 (용량 문제 해결)
          // 워크플로우는 "구조"만 저장, 업로드된 이미지는 매번 다시 입력
          const cleanNodes = session.nodes.map((node) => {
            const nodeData = node.data as { config?: Record<string, unknown> };
            if (!nodeData?.config) return node;

            const cleanConfig: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(nodeData.config)) {
              // base64 이미지 데이터는 제외 (data:image로 시작하는 긴 문자열)
              if (typeof value === 'string' && value.startsWith('data:image')) {
                cleanConfig[key] = null; // placeholder
              } else {
                cleanConfig[key] = value;
              }
            }

            return {
              ...node,
              data: { ...nodeData, config: cleanConfig },
            };
          });

          // 워크플로우 데이터
          const workflowData = {
            name: workflowName,
            description: session.description || undefined,
            nodes: cleanNodes,
            edges: session.edges,
            viewport: session.viewport,
            templateId: session.templateId || undefined,
          };

          // PNG 이미지 생성 (워크플로우 JSON 임베딩)
          let pngBlob: Blob;

          if (capturedImage) {
            // 노드 에디터 캡쳐 이미지에 워크플로우 임베딩
            pngBlob = await embedWorkflowToPng(capturedImage, workflowData);
          } else {
            // 캡쳐 이미지 없으면 기본 이미지 생성 후 임베딩
            const defaultImage = await createDefaultWorkflowImage(
              session.nodes.length,
              workflowName
            );
            pngBlob = await embedWorkflowToPng(defaultImage, workflowData);
          }

          // Base64로 변환
          const imageBase64 = await blobToBase64(pngBlob);

          // API 요청 데이터
          const requestBody = {
            id: session.id,
            name: workflowName,
            description: session.description,
            imageBase64,
            nodeCount: session.nodes.length,
            templateId: session.templateId,
          };

          // API 호출
          const response = await fetch(getApiUrl('/api/workflows', { method: 'POST' }), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || '저장 실패');
          }

          // 세션 업데이트
          set((state) => ({
            session: {
              ...state.session,
              id: data.workflow.id,
              name: workflowName,
              isDirty: false,
              isFromFeatured: false, // 저장 후에는 내 워크플로우
            },
          }));

          // 목록 새로고침
          await get().fetchWorkflows();

          return data.workflow.id;
        } finally {
          set({ isSaving: false });
        }
      },

      // 다른 이름으로 저장 (항상 새 워크플로우 생성)
      saveAsNewWorkflow: async (name: string, capturedImage?: string) => {
        const { session } = get();

        set({ isSaving: true });

        try {
          // 노드 config에서 base64 이미지 제거
          const cleanNodes = session.nodes.map((node) => {
            const nodeData = node.data as { config?: Record<string, unknown> };
            if (!nodeData?.config) return node;

            const cleanConfig: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(nodeData.config)) {
              if (typeof value === 'string' && value.startsWith('data:image')) {
                cleanConfig[key] = null;
              } else {
                cleanConfig[key] = value;
              }
            }

            return {
              ...node,
              data: { ...nodeData, config: cleanConfig },
            };
          });

          // 워크플로우 데이터
          const workflowData = {
            name,
            description: session.description || undefined,
            nodes: cleanNodes,
            edges: session.edges,
            viewport: session.viewport,
            templateId: session.templateId || undefined,
          };

          // PNG 이미지 생성
          let pngBlob: Blob;
          if (capturedImage) {
            pngBlob = await embedWorkflowToPng(capturedImage, workflowData);
          } else {
            const defaultImage = await createDefaultWorkflowImage(
              session.nodes.length,
              name
            );
            pngBlob = await embedWorkflowToPng(defaultImage, workflowData);
          }

          const imageBase64 = await blobToBase64(pngBlob);

          // API 요청 - id를 null로 전달하여 항상 새로 생성
          const requestBody = {
            id: null, // 항상 새로 생성
            name,
            description: session.description,
            imageBase64,
            nodeCount: session.nodes.length,
            templateId: session.templateId,
          };

          const response = await fetch(getApiUrl('/api/workflows', { method: 'POST' }), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || '저장 실패');
          }

          // 세션 업데이트 - 새 ID로 전환
          set((state) => ({
            session: {
              ...state.session,
              id: data.workflow.id,
              name,
              isDirty: false,
              isFromFeatured: false, // 이제 내 워크플로우
            },
          }));

          // 목록 새로고침
          await get().fetchWorkflows();

          return data.workflow.id;
        } finally {
          set({ isSaving: false });
        }
      },

      loadWorkflow: async (id) => {
        set({ isLoading: true });

        try {
          const response = await fetch(getApiUrl(`/api/workflows?id=${id}`));
          const data = await response.json();

          if (!data.success || !data.workflow) {
            throw new Error('워크플로우를 찾을 수 없습니다');
          }

          const workflow = data.workflow;

          // PNG에서 워크플로우 데이터 추출
          const workflowData = await extractWorkflowFromPng(workflow.image_url);

          if (!workflowData) {
            throw new Error('워크플로우 데이터 추출 실패');
          }

          // 세션 업데이트
          // 추천 워크플로우: isFromFeatured=true, ID는 유지하지만 저장 시 새로 생성되도록
          // 내 워크플로우: isFromFeatured=false, ID 유지하여 덮어쓰기 가능
          set({
            session: {
              id: workflow.id, // ID는 항상 유지 (표시/참조용)
              name: workflow.name,
              description: workflow.description || '',
              nodes: workflowData.nodes,
              edges: workflowData.edges,
              viewport: workflowData.viewport || { x: 0, y: 0, zoom: 1 },
              templateId: workflow.template_id,
              isDirty: false, // 불러온 직후는 dirty 아님
              lastResultImage: workflow.image_url,
              isFromFeatured: workflow.is_featured, // 추천에서 왔는지 표시
            },
          });
        } finally {
          set({ isLoading: false });
        }
      },

      loadFromImage: async (imageUrl) => {
        try {
          const workflowData = await extractWorkflowFromPng(imageUrl);

          if (!workflowData) {
            return false;
          }

          set({
            session: {
              id: null,
              name: workflowData.name || '불러온 워크플로우',
              description: workflowData.description || '',
              nodes: workflowData.nodes,
              edges: workflowData.edges,
              viewport: workflowData.viewport || { x: 0, y: 0, zoom: 1 },
              templateId: workflowData.templateId || null,
              isDirty: true,
              lastResultImage: imageUrl,
              isFromFeatured: false, // 이미지에서 불러온 건 새 워크플로우
            },
          });

          return true;
        } catch {
          return false;
        }
      },

      deleteWorkflow: async (id) => {
        const response = await fetch(getApiUrl('/api/workflows', { method: 'DELETE' }), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || '삭제 실패');
        }

        // 현재 세션이 삭제된 워크플로우면 리셋
        if (get().session.id === id) {
          get().resetSession();
        }

        // 목록 새로고침
        await get().fetchWorkflows();
      },

      renameWorkflow: async (id, name) => {
        const response = await fetch(getApiUrl('/api/workflows', { method: 'PATCH' }), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || '이름 변경 실패');
        }

        // 현재 세션이면 이름 업데이트
        if (get().session.id === id) {
          set((state) => ({
            session: {
              ...state.session,
              name,
            },
          }));
        }

        // 목록 새로고침
        await get().fetchWorkflows();
      },

      // ===== 추천 액션 =====

      toggleFeatured: async (id, featured) => {
        const response = await fetch(getApiUrl('/api/workflows', { method: 'PATCH' }), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, is_featured: featured }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || '추천 토글 실패');
        }

        // 목록 새로고침
        await get().fetchWorkflows();
        await get().fetchFeaturedWorkflows();
      },

      // ===== 목록 액션 =====

      fetchWorkflows: async () => {
        try {
          const response = await fetch(getApiUrl('/api/workflows?limit=50'));
          const data = await response.json();

          if (data.success) {
            set({ savedWorkflows: data.workflows || [] });
          }
        } catch (error) {
          console.error('Failed to fetch workflows:', error);
        }
      },

      fetchFeaturedWorkflows: async () => {
        try {
          const response = await fetch(getApiUrl('/api/workflows?featured=true&limit=10'));
          const data = await response.json();

          if (data.success) {
            set({ featuredWorkflows: data.workflows || [] });
          }
        } catch (error) {
          console.error('Failed to fetch featured workflows:', error);
        }
      },
    }),
    {
      name: 'orange-whale-workflow',
      storage: createJSONStorage(() => localStorage),
      // 세션의 일부만 저장 (노드/엣지 제외 - 너무 큼)
      partialize: (state) => ({
        session: {
          id: state.session.id,
          name: state.session.name,
          description: state.session.description,
          templateId: state.session.templateId,
          isDirty: state.session.isDirty,
          isFromFeatured: state.session.isFromFeatured,
          // nodes, edges, viewport, lastResultImage는 저장 안 함
        },
      }),
    }
  )
);

// 셀렉터
export const selectSession = (state: WorkflowStore) => state.session;
export const selectIsDirty = (state: WorkflowStore) => state.session.isDirty;
export const selectIsFromFeatured = (state: WorkflowStore) => state.session.isFromFeatured;
export const selectWorkflows = (state: WorkflowStore) => state.savedWorkflows;
export const selectFeaturedWorkflows = (state: WorkflowStore) => state.featuredWorkflows;

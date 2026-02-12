/**
 * 폴더 관리 훅
 * - 폴더 목록 조회
 * - 폴더 생성/수정/삭제
 * - 트리 구조 변환
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Folder, FolderTreeNode, CreateFolderParams, UpdateFolderParams } from '../types';
import { getApiUrl } from '../../../utils/apiRoute';

interface UseFoldersOptions {
  userId?: string;
  parentId?: string | null;
  includeCount?: boolean;
  autoFetch?: boolean;
}

interface UseFoldersReturn {
  folders: Folder[];
  folderTree: FolderTreeNode[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createFolder: (params: CreateFolderParams) => Promise<Folder>;
  updateFolder: (id: string, params: UpdateFolderParams) => Promise<Folder>;
  deleteFolder: (id: string, moveImagesTo?: string) => Promise<void>;
  getFolderPath: (folderId: string) => Folder[];
}

// 폴더 목록을 트리 구조로 변환
function buildFolderTree(folders: Folder[], parentId: string | null = null): FolderTreeNode[] {
  return folders
    .filter(f => f.parent_id === parentId)
    .map(folder => ({
      ...folder,
      children: buildFolderTree(folders, folder.id),
    }))
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function useFolders(options: UseFoldersOptions = {}): UseFoldersReturn {
  const { userId, parentId, includeCount = true, autoFetch = true } = options;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 폴더 목록 조회
  const fetchFolders = useCallback(async () => {
    if (!userId) {
      setFolders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        user_id: userId,
        include_count: String(includeCount),
      });

      if (parentId !== undefined) {
        params.set('parent_id', parentId === null ? 'null' : parentId);
      }

      const response = await fetch(getApiUrl(`/api/folders?${params}`));

      if (!response.ok) {
        throw new Error('폴더 목록을 불러오지 못했습니다.');
      }

      const data = await response.json();
      setFolders(data.folders || []);
    } catch (err) {
      console.error('[useFolders] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId, parentId, includeCount]);

  // 폴더 생성
  const createFolder = useCallback(async (params: CreateFolderParams): Promise<Folder> => {
    if (!userId) {
      throw new Error('사용자 정보가 없습니다.');
    }

    const response = await fetch(getApiUrl('/api/folders', { method: 'POST' }), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        ...params,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '폴더 생성에 실패했습니다.');
    }

    const data = await response.json();
    const newFolder = data.folder;

    // 로컬 상태 업데이트
    setFolders(prev => [...prev, newFolder]);

    return newFolder;
  }, [userId]);

  // 폴더 수정
  const updateFolder = useCallback(async (id: string, params: UpdateFolderParams): Promise<Folder> => {
    const response = await fetch(getApiUrl('/api/folders', { method: 'PATCH' }), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...params }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '폴더 수정에 실패했습니다.');
    }

    const data = await response.json();
    const updatedFolder = data.folder;

    // 로컬 상태 업데이트
    setFolders(prev => prev.map(f => f.id === id ? updatedFolder : f));

    return updatedFolder;
  }, []);

  // 폴더 삭제
  const deleteFolder = useCallback(async (id: string, moveImagesTo?: string): Promise<void> => {
    const response = await fetch(getApiUrl('/api/folders', { method: 'DELETE' }), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        move_images_to: moveImagesTo,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '폴더 삭제에 실패했습니다.');
    }

    // 로컬 상태 업데이트
    setFolders(prev => prev.filter(f => f.id !== id));
  }, []);

  // 폴더 경로 조회 (breadcrumb용)
  const getFolderPath = useCallback((folderId: string): Folder[] => {
    const path: Folder[] = [];
    let currentId: string | undefined = folderId;

    while (currentId) {
      const targetId: string = currentId; // 클로저 문제 방지용 복사
      const folder = folders.find(f => f.id === targetId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parent_id || undefined;
      } else {
        break;
      }
    }

    return path;
  }, [folders]);

  // 트리 구조 계산
  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);

  // 초기 로드
  useEffect(() => {
    if (autoFetch) {
      fetchFolders();
    }
  }, [autoFetch, fetchFolders]);

  return {
    folders,
    folderTree,
    isLoading,
    error,
    refetch: fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolderPath,
  };
}

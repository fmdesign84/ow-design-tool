/**
 * 폴더 트리 컴포넌트
 * - 중첩 폴더 구조 표시
 * - 폴더 선택/확장
 * - 드래그 앤 드롭 (옵션)
 */

import React, { useState, useCallback } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Image,
} from 'lucide-react';
import type { FolderTreeNode } from '../../types';

interface FolderTreeProps {
  folders: FolderTreeNode[];
  selectedId?: string | null;
  onSelect?: (folder: FolderTreeNode | null) => void;
  onCreateFolder?: (parentId?: string) => void;
  onRenameFolder?: (folder: FolderTreeNode) => void;
  onDeleteFolder?: (folder: FolderTreeNode) => void;
  showImageCount?: boolean;
  showActions?: boolean;
  className?: string;
}

interface FolderNodeProps {
  folder: FolderTreeNode;
  level: number;
  selectedId?: string | null;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect?: (folder: FolderTreeNode | null) => void;
  onCreateFolder?: (parentId?: string) => void;
  onRenameFolder?: (folder: FolderTreeNode) => void;
  onDeleteFolder?: (folder: FolderTreeNode) => void;
  showImageCount?: boolean;
  showActions?: boolean;
}

const FolderNode: React.FC<FolderNodeProps> = ({
  folder,
  level,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  showImageCount,
  showActions,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isSelected = selectedId === folder.id;
  const isExpanded = expandedIds.has(folder.id);
  const hasChildren = folder.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(folder);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(folder.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(!showMenu);
  };

  return (
    <div className="select-none">
      {/* 폴더 행 */}
      <div
        className={`
          group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer
          transition-colors duration-150
          ${isSelected
            ? 'bg-blue-600/30 text-blue-200'
            : 'hover:bg-neutral-800 text-neutral-300'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* 확장 화살표 */}
        <button
          className={`
            p-0.5 rounded hover:bg-neutral-700
            ${!hasChildren && 'invisible'}
          `}
          onClick={handleToggle}
        >
          {isExpanded ? (
            <ChevronDown size={14} className="text-neutral-500" />
          ) : (
            <ChevronRight size={14} className="text-neutral-500" />
          )}
        </button>

        {/* 폴더 아이콘 */}
        {isExpanded ? (
          <FolderOpen
            size={16}
            className="text-yellow-500 flex-shrink-0"
            style={folder.color ? { color: folder.color } : undefined}
          />
        ) : (
          <Folder
            size={16}
            className="text-yellow-500 flex-shrink-0"
            style={folder.color ? { color: folder.color } : undefined}
          />
        )}

        {/* 폴더 이름 */}
        <span className="flex-1 truncate text-sm">{folder.name}</span>

        {/* 이미지 개수 */}
        {showImageCount && folder.image_count !== undefined && folder.image_count > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-neutral-500">
            <Image size={10} />
            {folder.image_count}
          </span>
        )}

        {/* 액션 버튼 */}
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onCreateFolder && (
              <button
                className="p-1 rounded hover:bg-neutral-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder(folder.id);
                }}
                title="하위 폴더 추가"
              >
                <Plus size={12} />
              </button>
            )}
            <button
              className="p-1 rounded hover:bg-neutral-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreHorizontal size={12} />
            </button>
          </div>
        )}
      </div>

      {/* 컨텍스트 메뉴 */}
      {showMenu && (
        <div
          className="absolute z-50 mt-1 py-1 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 min-w-32"
          style={{ marginLeft: `${level * 16 + 24}px` }}
        >
          {onRenameFolder && (
            <button
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-700"
              onClick={() => {
                onRenameFolder(folder);
                setShowMenu(false);
              }}
            >
              이름 변경
            </button>
          )}
          {onCreateFolder && (
            <button
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-700"
              onClick={() => {
                onCreateFolder(folder.id);
                setShowMenu(false);
              }}
            >
              하위 폴더 추가
            </button>
          )}
          {onDeleteFolder && (
            <button
              className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-neutral-700"
              onClick={() => {
                onDeleteFolder(folder);
                setShowMenu(false);
              }}
            >
              삭제
            </button>
          )}
        </div>
      )}

      {/* 자식 폴더 */}
      {isExpanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              onCreateFolder={onCreateFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              showImageCount={showImageCount}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  selectedId,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  showImageCount = true,
  showActions = true,
  className = '',
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = () => {
    onSelect?.(null);
  };

  return (
    <div className={`text-neutral-200 ${className}`}>
      {/* 전체 선택 */}
      <div
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer mb-1
          transition-colors duration-150
          ${selectedId === null
            ? 'bg-blue-600/30 text-blue-200'
            : 'hover:bg-neutral-800'
          }
        `}
        onClick={handleSelectAll}
      >
        <Folder size={16} className="text-neutral-400" />
        <span className="text-sm">전체</span>
      </div>

      {/* 새 폴더 버튼 */}
      {onCreateFolder && (
        <button
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 mb-2"
          onClick={() => onCreateFolder()}
        >
          <Plus size={16} />
          <span className="text-sm">새 폴더</span>
        </button>
      )}

      {/* 폴더 트리 */}
      {folders.length > 0 ? (
        folders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            level={0}
            selectedId={selectedId}
            expandedIds={expandedIds}
            onToggle={handleToggle}
            onSelect={onSelect}
            onCreateFolder={onCreateFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            showImageCount={showImageCount}
            showActions={showActions}
          />
        ))
      ) : (
        <p className="text-sm text-neutral-500 px-2 py-4 text-center">
          폴더가 없습니다
        </p>
      )}
    </div>
  );
};

export default FolderTree;

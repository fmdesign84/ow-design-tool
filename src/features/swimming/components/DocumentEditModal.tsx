/**
 * DocumentEditModal - 문서 페이지 관리 모달
 * 페이지 추가/삭제/순서변경, 레이아웃/스타일 할당
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { DocumentPageConfig } from '../types';
import styles from './SwimmingEditor.module.css';

// ===== 아이콘 컴포넌트 =====
interface IconProps {
  size?: number;
}

const XIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const PlusIcon = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const GripVerticalIcon = ({ size = 14 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
    <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
  </svg>
);

const Trash2Icon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const FileTextIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);

interface ConnectedItem {
  id: string;
  name: string;
}

interface DocumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  pages: DocumentPageConfig[];
  connectedLayouts: ConnectedItem[];
  connectedStyles: ConnectedItem[];
  onSave: (name: string, pages: DocumentPageConfig[]) => void;
}

export function DocumentEditModal({
  isOpen,
  onClose,
  documentName,
  pages: initialPages,
  connectedLayouts,
  connectedStyles,
  onSave,
}: DocumentEditModalProps) {
  const [name, setName] = useState(documentName);
  const [pages, setPages] = useState<DocumentPageConfig[]>(initialPages);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    initialPages[0]?.id || null
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const selectedPage = pages.find((p) => p.id === selectedPageId);

  // 페이지 추가
  const handleAddPage = () => {
    const newId = `page-${Date.now()}`;
    const newPage: DocumentPageConfig = {
      id: newId,
      name: `페이지 ${pages.length + 1}`,
      layoutIndex: 0,
      styleIndex: 0,
    };
    setPages([...pages, newPage]);
    setSelectedPageId(newId);
  };

  // 페이지 삭제
  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter((p) => p.id !== pageId);
    setPages(newPages);
    if (selectedPageId === pageId) {
      setSelectedPageId(newPages[0]?.id || null);
    }
  };

  // 페이지 속성 업데이트
  const updatePage = (pageId: string, updates: Partial<DocumentPageConfig>) => {
    setPages(pages.map((p) => (p.id === pageId ? { ...p, ...updates } : p)));
  };

  // 드래그 앤 드롭
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...pages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);
    setPages(newPages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // 저장
  const handleSave = () => {
    onSave(name, pages);
    onClose();
  };

  // Portal로 body에 직접 렌더링
  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <FileTextIcon />
            <span>문서 편집</span>
          </div>
          <button className={styles.modalCloseButton} onClick={onClose}>
            <XIcon />
          </button>
        </div>

        {/* 본문 */}
        <div className={styles.modalBody}>
          {/* 문서 이름 */}
          <div className={styles.modalSection}>
            <label className={styles.modalLabel}>문서 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.modalInput}
            />
          </div>

          {/* 페이지 목록 */}
          <div className={styles.modalSection}>
            <label className={styles.modalLabel}>페이지 목록</label>
            <div className={styles.pageList}>
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedPageId(page.id)}
                  className={`${styles.pageChip} ${selectedPageId === page.id ? styles.selected : ''}`}
                  style={{ opacity: draggedIndex === index ? 0.5 : 1 }}
                >
                  <span className={styles.pageChipGrip}>
                    <GripVerticalIcon />
                  </span>
                  <span className={styles.pageChipNumber}>{index + 1}</span>
                  <span className={styles.pageChipName}>{page.name}</span>
                </div>
              ))}
              <button onClick={handleAddPage} className={styles.pageAddButton}>
                <PlusIcon />
                <span>추가</span>
              </button>
            </div>
            <p className={styles.pageHint}>드래그하여 순서 변경 / 클릭하여 편집</p>
          </div>

          {/* 선택된 페이지 설정 */}
          {selectedPage && (
            <div className={styles.pageSettings}>
              <div className={styles.pageSettingsHeader}>
                <span className={styles.pageSettingsTitle}>선택된 페이지 설정</span>
                {pages.length > 1 && (
                  <button
                    className={styles.pageDeleteButton}
                    onClick={() => handleDeletePage(selectedPage.id)}
                  >
                    <Trash2Icon />
                  </button>
                )}
              </div>

              {/* 페이지 이름 */}
              <div className={styles.pageSettingsField}>
                <label className={styles.pageSettingsLabel}>페이지 이름</label>
                <input
                  type="text"
                  value={selectedPage.name}
                  onChange={(e) => updatePage(selectedPage.id, { name: e.target.value })}
                  className={styles.pageSettingsInput}
                />
              </div>

              {/* 레이아웃 선택 */}
              <div className={styles.pageSettingsField}>
                <label className={styles.pageSettingsLabel}>레이아웃</label>
                {connectedLayouts.length > 0 ? (
                  <select
                    value={selectedPage.layoutIndex}
                    onChange={(e) =>
                      updatePage(selectedPage.id, { layoutIndex: parseInt(e.target.value) })
                    }
                    className={styles.pageSettingsSelect}
                  >
                    {connectedLayouts.map((layout, index) => (
                      <option key={layout.id} value={index}>
                        {layout.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className={styles.pageSettingsEmpty}>연결된 레이아웃이 없습니다</p>
                )}
              </div>

              {/* 스타일 선택 */}
              <div className={styles.pageSettingsField}>
                <label className={styles.pageSettingsLabel}>스타일</label>
                {connectedStyles.length > 0 ? (
                  <select
                    value={selectedPage.styleIndex}
                    onChange={(e) =>
                      updatePage(selectedPage.id, { styleIndex: parseInt(e.target.value) })
                    }
                    className={styles.pageSettingsSelect}
                  >
                    {connectedStyles.map((style, index) => (
                      <option key={style.id} value={index}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className={styles.pageSettingsEmpty}>연결된 스타일이 없습니다</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.modalCancelButton}>
            취소
          </button>
          <button onClick={handleSave} className={styles.modalSaveButton}>
            적용
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DocumentEditModal;

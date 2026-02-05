import { useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { formatAmount } from '../utils';

/**
 * 기안문서 폼 공통 로직 훅
 *
 * @example
 * const {
 *   // 페이지 모드
 *   pageMode, isViewMode, isEditMode, isNewMode, id,
 *   // 모달 상태
 *   modals, openModal, closeModal,
 *   // 캘린더
 *   activeCalendarField, openCalendar, handleDateSelect,
 *   // 태그 관리
 *   referenceTags, addReferenceTag, removeTag,
 *   // 파일 관리
 *   files, isDragOver, fileInputRef, handleFileUpload, handleDrop, handleDragOver, handleDragLeave, removeFile,
 *   // 금액 포맷
 *   handleAmountChange
 * } = useApprovalForm(initialTags, initialFiles);
 */
export const useApprovalForm = (initialTags = [], initialFiles = []) => {
  // ========== 페이지 모드 (URL 기반) ==========
  const { id } = useParams();
  const location = useLocation();

  const pageMode = useMemo(() => {
    if (!id) return 'new';
    if (location.pathname.endsWith('/edit')) return 'edit';
    return 'view';
  }, [id, location.pathname]);

  const isViewMode = pageMode === 'view';
  const isEditMode = pageMode === 'edit';
  const isNewMode = pageMode === 'new';
  // ========== 모달 상태 통합 ==========
  const [modals, setModals] = useState({
    projectSearch: false,
    calendar: false,
    infoPopup: false,
    bmSearch: false,
    deptSearch: false,
    venueSearch: false,
    partnerSearch: false,
  });

  const openModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  // ========== 캘린더 ==========
  const [activeCalendarField, setActiveCalendarField] = useState(null);

  const openCalendar = useCallback((fieldName) => {
    setActiveCalendarField(fieldName);
    setModals(prev => ({ ...prev, calendar: true }));
  }, []);

  const handleDateSelect = useCallback((formatted, setFormData) => {
    if (activeCalendarField) {
      setFormData(prev => ({
        ...prev,
        [activeCalendarField]: formatted
      }));
    }
    setModals(prev => ({ ...prev, calendar: false }));
    setActiveCalendarField(null);
  }, [activeCalendarField]);

  // ========== 추가참조 태그 ==========
  const [referenceTags, setReferenceTags] = useState(initialTags);

  const addReferenceTag = useCallback((bm) => {
    if (!referenceTags.some(t => t.name.startsWith(bm.name))) {
      setReferenceTags(prev => [...prev, {
        id: Date.now(),
        name: `${bm.name} ${bm.role}`
      }]);
    }
  }, [referenceTags]);

  const removeTag = useCallback((id) => {
    const element = document.querySelector(`[data-tag-id="${id}"]`);
    if (element) {
      element.style.opacity = '0';
      element.style.transform = 'scale(0.8)';
      element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      setTimeout(() => {
        setReferenceTags(prev => prev.filter(t => t.id !== id));
      }, 200);
    } else {
      setReferenceTags(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  // ========== 파일 관리 ==========
  const [files, setFiles] = useState(initialFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const writingGuideRef = useRef(null);

  const handleFileUpload = useCallback((e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = uploadedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name
    }));
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles = droppedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id) => {
    const element = document.querySelector(`[data-file-id="${id}"]`);
    if (element) {
      element.style.opacity = '0';
      element.style.transform = 'translateX(-10px)';
      element.style.transition = 'all 0.2s ease';
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.id !== id));
      }, 200);
    } else {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  }, []);

  // ========== 금액 포맷 ==========
  const handleAmountChange = useCallback((field, value, setFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: formatAmount(value)
    }));
  }, []);

  return {
    // 페이지 모드
    pageMode,
    isViewMode,
    isEditMode,
    isNewMode,
    id,
    // 모달
    modals,
    openModal,
    closeModal,
    // 캘린더
    activeCalendarField,
    openCalendar,
    handleDateSelect,
    // 태그
    referenceTags,
    setReferenceTags,
    addReferenceTag,
    removeTag,
    // 파일
    files,
    setFiles,
    isDragOver,
    fileInputRef,
    writingGuideRef,
    handleFileUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFile,
    // 금액
    handleAmountChange,
  };
};

export default useApprovalForm;

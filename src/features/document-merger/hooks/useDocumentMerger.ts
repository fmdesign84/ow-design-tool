/**
 * 문서 스타일 통합기 Hook (새 설계)
 * 3가지 모드 지원: 스마트 병합 / 단순 병합 / 스타일만 적용
 */

import { useState, useCallback } from 'react';
import {
  DocumentStyleMap,
  MergeSettings,
  MergerState,
  ParsedDocument,
  DEFAULT_STYLE_MAP,
  DEFAULT_MERGE_SETTINGS,
  ElementStyle,
} from '../types';
import { parseDocx, parseTxt } from '../utils/docxParser';
import { processDocumentsV2 } from '../utils/docxCloner';

const initialState: MergerState = {
  documents: [],
  mainDocument: null,
  settings: DEFAULT_MERGE_SETTINGS,
  isProcessing: false,
  progress: 0,
  progressMessage: '',
  error: null,
};

export function useDocumentMerger() {
  const [state, setState] = useState<MergerState>(initialState);

  // ===== 파일 타입 확인 =====
  const getFileType = useCallback((file: File): 'docx' | 'pdf' | 'txt' | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'docx') return 'docx';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'txt') return 'txt';
    return null;
  }, []);

  // ===== 문서 추가 =====
  const addDocuments = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      progressMessage: '문서 분석 중...',
      error: null,
    }));

    try {
      const newDocs: ParsedDocument[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const type = getFileType(file);

        if (!type) {
          setState(prev => ({
            ...prev,
            error: `지원하지 않는 파일 형식: ${file.name}`,
          }));
          continue;
        }

        setState(prev => ({
          ...prev,
          progress: Math.round(((i + 0.5) / fileArray.length) * 100),
          progressMessage: `${file.name} 분석 중...`,
        }));

        // 파싱
        let parsed;
        if (type === 'docx') {
          parsed = await parseDocx(file);
        } else if (type === 'txt') {
          parsed = await parseTxt(file);
        } else {
          // PDF는 아직 미지원
          parsed = {
            elements: [],
            styleMap: DEFAULT_STYLE_MAP,
            structure: {
              hasHeadings: false,
              headingLevels: [],
              hasNumberedList: false,
              hasBulletList: false,
              lastHeadingNumbers: [0, 0, 0, 0],
            },
          };
        }

        const doc: ParsedDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type,
          file,
          elements: parsed.elements,
          styleMap: parsed.styleMap,
          structure: parsed.structure,
          isMainDocument: false,
          order: state.documents.length + newDocs.length,
        };

        newDocs.push(doc);

        setState(prev => ({
          ...prev,
          progress: Math.round(((i + 1) / fileArray.length) * 100),
        }));
      }

      setState(prev => {
        const allDocs = [...prev.documents, ...newDocs];

        // 첫 번째 문서를 자동으로 메인 문서로 설정
        let mainDoc = prev.mainDocument;
        if (!mainDoc && allDocs.length > 0) {
          allDocs[0].isMainDocument = true;
          mainDoc = allDocs[0];
        }

        return {
          ...prev,
          documents: allDocs,
          mainDocument: mainDoc,
          isProcessing: false,
          progress: 100,
          progressMessage: '완료',
        };
      });
    } catch (error) {
      console.error('문서 추가 오류:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: '문서를 분석하는 중 오류가 발생했습니다.',
      }));
    }
  }, [state.documents.length, getFileType]);

  // ===== 메인 문서 변경 =====
  const setMainDocument = useCallback((docId: string) => {
    setState(prev => {
      const doc = prev.documents.find(d => d.id === docId);
      if (!doc) return prev;

      return {
        ...prev,
        documents: prev.documents.map(d => ({
          ...d,
          isMainDocument: d.id === docId,
        })),
        mainDocument: doc,
      };
    });
  }, []);

  // ===== 문서 순서 변경 =====
  const reorderDocuments = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newDocs = [...prev.documents];
      const [removed] = newDocs.splice(fromIndex, 1);
      newDocs.splice(toIndex, 0, removed);

      return {
        ...prev,
        documents: newDocs.map((d, i) => ({ ...d, order: i })),
      };
    });
  }, []);

  // ===== 문서 삭제 =====
  const removeDocument = useCallback((docId: string) => {
    setState(prev => {
      const newDocs = prev.documents.filter(d => d.id !== docId);
      const wasMain = prev.mainDocument?.id === docId;

      let newMain = prev.mainDocument;
      if (wasMain && newDocs.length > 0) {
        newDocs[0].isMainDocument = true;
        newMain = newDocs[0];
      } else if (newDocs.length === 0) {
        newMain = null;
      }

      return {
        ...prev,
        documents: newDocs.map((d, i) => ({ ...d, order: i })),
        mainDocument: newMain,
      };
    });
  }, []);

  // ===== 설정 변경 =====
  const updateSettings = useCallback((settings: Partial<MergeSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  // ===== 스타일 수정 =====
  const updateMainStyle = useCallback((
    elementType: keyof Omit<DocumentStyleMap, 'numberingFormats' | 'pageMargins'>,
    style: Partial<ElementStyle>
  ) => {
    setState(prev => {
      if (!prev.mainDocument) return prev;

      const newStyleMap = {
        ...prev.mainDocument.styleMap,
        [elementType]: {
          ...prev.mainDocument.styleMap[elementType],
          ...style,
        },
      };

      const updatedMain = {
        ...prev.mainDocument,
        styleMap: newStyleMap,
      };

      return {
        ...prev,
        mainDocument: updatedMain,
        documents: prev.documents.map(d =>
          d.id === updatedMain.id ? updatedMain : d
        ),
      };
    });
  }, []);

  // ===== 넘버링 형식 수정 =====
  const updateNumberingFormat = useCallback((
    key: keyof DocumentStyleMap['numberingFormats'],
    format: string
  ) => {
    setState(prev => {
      if (!prev.mainDocument) return prev;

      const newStyleMap = {
        ...prev.mainDocument.styleMap,
        numberingFormats: {
          ...prev.mainDocument.styleMap.numberingFormats,
          [key]: format,
        },
      };

      const updatedMain = {
        ...prev.mainDocument,
        styleMap: newStyleMap,
      };

      return {
        ...prev,
        mainDocument: updatedMain,
        documents: prev.documents.map(d =>
          d.id === updatedMain.id ? updatedMain : d
        ),
      };
    });
  }, []);

  // ===== 처리 실행 (V2: 완전 복제 방식) =====
  const process = useCallback(async (): Promise<{ blob: Blob; filename: string }[]> => {
    if (state.documents.length === 0 || !state.mainDocument) {
      setState(prev => ({ ...prev, error: '처리할 문서가 없습니다.' }));
      return [];
    }

    // DOCX만 지원
    const mainDoc = state.mainDocument;
    if (mainDoc.type !== 'docx') {
      setState(prev => ({ ...prev, error: '메인 문서는 DOCX 형식이어야 합니다.' }));
      return [];
    }

    const otherDocs = state.documents.filter(d => d.id !== mainDoc.id && d.type === 'docx');
    if (otherDocs.length === 0 && state.settings.mode !== 'styleOnly') {
      setState(prev => ({ ...prev, error: '병합할 DOCX 문서가 없습니다.' }));
      return [];
    }

    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      progressMessage: '문서 처리 중...',
      error: null,
    }));

    try {
      setState(prev => ({ ...prev, progress: 20, progressMessage: '스타일 분석 중...' }));

      // V2 엔진 사용 (완전 복제 방식)
      const results = await processDocumentsV2(
        mainDoc.file,
        otherDocs.map(d => d.file),
        state.settings
      );

      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        progressMessage: '완료!',
      }));

      return results;
    } catch (error) {
      console.error('처리 오류:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: '문서 처리 중 오류가 발생했습니다: ' + (error as Error).message,
      }));
      return [];
    }
  }, [state.documents, state.mainDocument, state.settings]);

  // ===== 초기화 =====
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // ===== 반환 =====
  return {
    // 상태
    documents: state.documents,
    mainDocument: state.mainDocument,
    settings: state.settings,
    isProcessing: state.isProcessing,
    progress: state.progress,
    progressMessage: state.progressMessage,
    error: state.error,

    // 추출된 스타일맵 (호환성)
    extractedStyle: state.mainDocument?.styleMap || null,

    // 액션
    addDocuments,
    setMainDocument,
    reorderDocuments,
    removeDocument,
    updateSettings,
    updateMainStyle,
    updateNumberingFormat,
    processDocuments: process,
    reset,
  };
}

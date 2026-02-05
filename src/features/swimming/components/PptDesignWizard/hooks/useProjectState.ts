import { useReducer, useCallback } from 'react';
import {
  ProjectState,
  ProjectAction,
  DesignTokens,
  ParsedDocument,
  ImageAsset,
  ContentAnalysis,
  SlideConfig,
} from '../types';
import { defaultDesignTokens } from '../utils/designTokenExtractor';

/**
 * 프로젝트 상태 관리 훅
 */

// 초기 상태
const initialState: ProjectState = {
  designTokens: null,
  documents: [],
  images: [],
  analysis: null,
  slides: [],
  currentStep: 1,
  isProcessing: false,
  errors: [],
};

// 리듀서
function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_DESIGN_TOKENS':
      return { ...state, designTokens: action.payload };

    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload],
      };

    case 'REMOVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter((d) => d.filename !== action.payload),
      };

    case 'ADD_IMAGE':
      return {
        ...state,
        images: [...state.images, action.payload],
      };

    case 'REMOVE_IMAGE':
      return {
        ...state,
        images: state.images.filter((i) => i.id !== action.payload),
      };

    case 'SET_ANALYSIS':
      return { ...state, analysis: action.payload };

    case 'SET_SLIDES':
      return { ...state, slides: action.payload };

    case 'UPDATE_SLIDE':
      return {
        ...state,
        slides: state.slides.map((slide) =>
          slide.id === action.payload.id
            ? { ...slide, ...action.payload.updates }
            : slide
        ),
      };

    case 'REORDER_SLIDES':
      const slideMap = new Map(state.slides.map((s) => [s.id, s]));
      return {
        ...state,
        slides: action.payload
          .map((id, index) => {
            const slide = slideMap.get(id);
            return slide ? { ...slide, order: index } : null;
          })
          .filter((s): s is SlideConfig => s !== null),
      };

    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };

    case 'ADD_ERROR':
      return { ...state, errors: [...state.errors, action.payload] };

    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// 훅
export function useProjectState() {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // 액션 헬퍼 함수들
  const setDesignTokens = useCallback((tokens: DesignTokens) => {
    dispatch({ type: 'SET_DESIGN_TOKENS', payload: tokens });
  }, []);

  const addDocument = useCallback((doc: ParsedDocument) => {
    dispatch({ type: 'ADD_DOCUMENT', payload: doc });
  }, []);

  const removeDocument = useCallback((filename: string) => {
    dispatch({ type: 'REMOVE_DOCUMENT', payload: filename });
  }, []);

  const addImage = useCallback((image: ImageAsset) => {
    dispatch({ type: 'ADD_IMAGE', payload: image });
  }, []);

  const removeImage = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_IMAGE', payload: id });
  }, []);

  const setAnalysis = useCallback((analysis: ContentAnalysis) => {
    dispatch({ type: 'SET_ANALYSIS', payload: analysis });
  }, []);

  const setSlides = useCallback((slides: SlideConfig[]) => {
    dispatch({ type: 'SET_SLIDES', payload: slides });
  }, []);

  const updateSlide = useCallback((id: string, updates: Partial<SlideConfig>) => {
    dispatch({ type: 'UPDATE_SLIDE', payload: { id, updates } });
  }, []);

  const reorderSlides = useCallback((ids: string[]) => {
    dispatch({ type: 'REORDER_SLIDES', payload: ids });
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: isProcessing });
  }, []);

  const addError = useCallback((error: string) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // 현재 디자인 토큰 (기본값 포함)
  const currentTokens = state.designTokens || defaultDesignTokens;

  return {
    state,
    currentTokens,
    actions: {
      setDesignTokens,
      addDocument,
      removeDocument,
      addImage,
      removeImage,
      setAnalysis,
      setSlides,
      updateSlide,
      reorderSlides,
      setStep,
      setProcessing,
      addError,
      clearErrors,
      reset,
    },
  };
}

export type ProjectActions = ReturnType<typeof useProjectState>['actions'];

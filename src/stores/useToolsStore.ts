/**
 * 도구(Tools) 상태 관리 (Zustand)
 * - 업스케일
 * - 배경 제거
 * - 텍스트 보정
 */

import { create } from 'zustand';

// 업스케일 배율
export type UpscaleScale = '2x' | '4x';

// 배경 제거 엣지 모드
export type EdgeMode = 'soft' | 'medium' | 'sharp';

// 업로드된 이미지
interface UploadedImage {
  preview: string;
  name: string;
  file?: File;
  base64?: string;
}

// 텍스트 영역 정보
interface TextArea {
  text: string;
  confidence: number;
  bbox: [number, number, number, number];
  needsCorrection: boolean;
}

// 텍스트 분석 결과
interface TextAnalysisResult {
  hasText: boolean;
  textQuality: 'good' | 'poor' | 'none';
  suggestions: string[];
  regions?: Array<{
    text: string;
    confidence: number;
    bbox: [number, number, number, number];
  }>;
  textAreas?: TextArea[];
}

interface ToolsState {
  // 공통 업로드 이미지
  uploadedImage: UploadedImage | null;

  // 업스케일
  upscaleScale: UpscaleScale;
  upscaleResult: string | null;
  isUpscaling: boolean;

  // 배경 제거
  edgeMode: EdgeMode;
  removeBgResult: string | null;
  isRemovingBg: boolean;

  // 텍스트 보정
  textCorrectImage: UploadedImage | null;
  textAnalysis: TextAnalysisResult | null;
  textCorrectResult: string | null;
  isAnalyzing: boolean;
  isCorrecting: boolean;

  // 에러
  error: string | null;

  // Actions
  setUploadedImage: (image: UploadedImage | null) => void;
  setUpscaleScale: (scale: UpscaleScale) => void;
  setUpscaleResult: (result: string | null) => void;
  setIsUpscaling: (upscaling: boolean) => void;
  setEdgeMode: (mode: EdgeMode) => void;
  setRemoveBgResult: (result: string | null) => void;
  setIsRemovingBg: (removing: boolean) => void;
  setTextCorrectImage: (image: UploadedImage | null) => void;
  setTextAnalysis: (analysis: TextAnalysisResult | null) => void;
  setTextCorrectResult: (result: string | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setIsCorrecting: (correcting: boolean) => void;
  setError: (error: string | null) => void;
  resetToolsState: () => void;
}

const initialState = {
  uploadedImage: null,
  upscaleScale: '2x' as UpscaleScale,
  upscaleResult: null,
  isUpscaling: false,
  edgeMode: 'medium' as EdgeMode,
  removeBgResult: null,
  isRemovingBg: false,
  textCorrectImage: null,
  textAnalysis: null,
  textCorrectResult: null,
  isAnalyzing: false,
  isCorrecting: false,
  error: null,
};

export const useToolsStore = create<ToolsState>((set) => ({
  ...initialState,

  setUploadedImage: (image) => set({ uploadedImage: image }),
  setUpscaleScale: (scale) => set({ upscaleScale: scale }),
  setUpscaleResult: (result) => set({ upscaleResult: result }),
  setIsUpscaling: (upscaling) => set({ isUpscaling: upscaling }),
  setEdgeMode: (mode) => set({ edgeMode: mode }),
  setRemoveBgResult: (result) => set({ removeBgResult: result }),
  setIsRemovingBg: (removing) => set({ isRemovingBg: removing }),
  setTextCorrectImage: (image) => set({ textCorrectImage: image }),
  setTextAnalysis: (analysis) => set({ textAnalysis: analysis }),
  setTextCorrectResult: (result) => set({ textCorrectResult: result }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setIsCorrecting: (correcting) => set({ isCorrecting: correcting }),
  setError: (error) => set({ error }),
  resetToolsState: () => set(initialState),
}));

export default useToolsStore;

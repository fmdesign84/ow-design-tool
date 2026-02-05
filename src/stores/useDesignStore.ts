/**
 * 디자인 어시스턴트 상태 관리 (Zustand)
 * - 목업 생성
 * - PPT 생성
 */

import { create } from 'zustand';

// 목업 생성 결과
interface MockupResult {
  url: string;
  style: string;
  createdAt: string;
}

// PPT 생성 설정
interface PptConfig {
  template: string;
  content: {
    title?: string;
    subtitle?: string;
    bullets?: string[];
    leftColumn?: { title?: string; items?: string[] };
    rightColumn?: { title?: string; items?: string[] };
    imageUrl?: string;
    chartData?: { labels: string[]; values: number[] };
  };
  style: {
    fontSize: number;
    lineSpacing: number;
    charSpacing: number;
    fontFamily: string;
    primaryColor: string;
    backgroundColor: string;
  };
  backgroundImage?: string;
}

interface DesignState {
  // 목업 생성 - 로고
  logoFile: File | null;
  logoPreview: string | null;
  logoFileName: string;

  // 목업 생성 - 키비주얼
  keyVisualFile: File | null;
  keyVisualPreview: string | null;
  keyVisualFileName: string;

  // 목업 생성 - 공통
  selectedMockup: string;
  mockupResult: MockupResult | null;
  mockupHistory: MockupResult[];
  isGeneratingMockup: boolean;

  // PPT 생성
  pptConfig: PptConfig | null;
  isGeneratingPpt: boolean;

  // 에러
  error: string | null;

  // Actions - 로고
  setLogoFile: (file: File | null) => void;
  setLogoPreview: (preview: string | null) => void;
  setLogoFileName: (name: string) => void;
  clearLogo: () => void;

  // Actions - 키비주얼
  setKeyVisualFile: (file: File | null) => void;
  setKeyVisualPreview: (preview: string | null) => void;
  setKeyVisualFileName: (name: string) => void;
  clearKeyVisual: () => void;

  // Actions - 목업 공통
  setSelectedMockup: (mockup: string) => void;
  setMockupResult: (result: MockupResult | null) => void;
  addMockupToHistory: (result: MockupResult) => void;
  setIsGeneratingMockup: (generating: boolean) => void;

  // Actions - PPT
  setPptConfig: (config: PptConfig | null) => void;
  setIsGeneratingPpt: (generating: boolean) => void;

  // Actions - 공통
  setError: (error: string | null) => void;
  resetDesignState: () => void;
  clearAllMockupFiles: () => void;
}

const initialState = {
  // 로고
  logoFile: null,
  logoPreview: null,
  logoFileName: '',
  // 키비주얼
  keyVisualFile: null,
  keyVisualPreview: null,
  keyVisualFileName: '',
  // 공통
  selectedMockup: 'poster-a4',
  mockupResult: null,
  mockupHistory: [],
  isGeneratingMockup: false,
  pptConfig: null,
  isGeneratingPpt: false,
  error: null,
};

export const useDesignStore = create<DesignState>((set) => ({
  ...initialState,

  // 로고 액션
  setLogoFile: (file) => set({ logoFile: file }),
  setLogoPreview: (preview) => set({ logoPreview: preview }),
  setLogoFileName: (name) => set({ logoFileName: name }),
  clearLogo: () => set({ logoFile: null, logoPreview: null, logoFileName: '' }),

  // 키비주얼 액션
  setKeyVisualFile: (file) => set({ keyVisualFile: file }),
  setKeyVisualPreview: (preview) => set({ keyVisualPreview: preview }),
  setKeyVisualFileName: (name) => set({ keyVisualFileName: name }),
  clearKeyVisual: () => set({ keyVisualFile: null, keyVisualPreview: null, keyVisualFileName: '' }),

  // 목업 공통 액션
  setSelectedMockup: (mockup) => set({ selectedMockup: mockup }),
  setMockupResult: (result) => set({ mockupResult: result }),
  addMockupToHistory: (result) =>
    set((state) => ({
      mockupHistory: [result, ...state.mockupHistory].slice(0, 50),
    })),
  setIsGeneratingMockup: (generating) => set({ isGeneratingMockup: generating }),

  // PPT 액션
  setPptConfig: (config) => set({ pptConfig: config }),
  setIsGeneratingPpt: (generating) => set({ isGeneratingPpt: generating }),

  // 공통 액션
  setError: (error) => set({ error }),
  resetDesignState: () => set(initialState),
  clearAllMockupFiles: () =>
    set({
      logoFile: null,
      logoPreview: null,
      logoFileName: '',
      keyVisualFile: null,
      keyVisualPreview: null,
      keyVisualFileName: '',
    }),
}));

export default useDesignStore;

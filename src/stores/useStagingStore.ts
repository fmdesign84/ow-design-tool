/**
 * 연출 생성 (Portrait Staging) 상태 관리 (Zustand)
 * - 다중 이미지 업로드
 * - 프리셋 선택
 * - 생성 옵션
 */

import { create } from 'zustand';
import type { StagingCategoryKey, StagingAspectRatio } from '../pages/GenAI/constants/stagingPresets';

// 업로드된 이미지 정보
export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  fileName: string;
}

// 생성된 결과 이미지
interface GeneratedResult {
  url: string;
  presetKey: string;
  createdAt: string;
}

// 스텝 타입
export type StagingStep = 'upload' | 'preset' | 'generate' | 'result';

interface StagingState {
  // 스텝
  currentStep: StagingStep;

  // 이미지 업로드
  uploadedImages: UploadedImage[];
  mainImageIndex: number;

  // 프리셋 선택
  selectedCategory: StagingCategoryKey;
  selectedPreset: string | null;

  // 생성 옵션
  outputCount: 1 | 2 | 4;
  aspectRatioOverride: StagingAspectRatio | null;

  // 생성 상태
  isGenerating: boolean;
  generatedImages: string[];
  progress: number;

  // 히스토리
  history: GeneratedResult[];

  // 에러
  error: string | null;

  // Actions - 스텝
  setCurrentStep: (step: StagingStep) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;

  // Actions - 이미지
  setUploadedImages: (images: UploadedImage[]) => void;
  addImage: (image: UploadedImage) => void;
  removeImage: (id: string) => void;
  setMainImageIndex: (index: number) => void;
  clearImages: () => void;

  // Actions - 프리셋
  setSelectedCategory: (category: StagingCategoryKey) => void;
  setSelectedPreset: (preset: string | null) => void;

  // Actions - 옵션
  setOutputCount: (count: 1 | 2 | 4) => void;
  setAspectRatioOverride: (ratio: StagingAspectRatio | null) => void;

  // Actions - 생성
  setIsGenerating: (generating: boolean) => void;
  setGeneratedImages: (images: string[]) => void;
  setProgress: (progress: number) => void;
  addToHistory: (result: GeneratedResult) => void;

  // Actions - 에러
  setError: (error: string | null) => void;

  // Actions - 리셋
  reset: () => void;
  resetForNewGeneration: () => void;
}

const initialState = {
  currentStep: 'upload' as StagingStep,
  uploadedImages: [],
  mainImageIndex: 0,
  selectedCategory: 'corporate' as StagingCategoryKey,
  selectedPreset: null,
  outputCount: 1 as const,
  aspectRatioOverride: null,
  isGenerating: false,
  generatedImages: [],
  progress: 0,
  history: [],
  error: null,
};

const stepOrder: StagingStep[] = ['upload', 'preset', 'generate', 'result'];

export const useStagingStore = create<StagingState>((set, get) => ({
  ...initialState,

  // 스텝 관리
  setCurrentStep: (step) => set({ currentStep: step }),

  goToNextStep: () => {
    const { currentStep } = get();
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      set({ currentStep: stepOrder[currentIndex + 1] });
    }
  },

  goToPrevStep: () => {
    const { currentStep } = get();
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      set({ currentStep: stepOrder[currentIndex - 1] });
    }
  },

  // 이미지 관리
  setUploadedImages: (images) => set({ uploadedImages: images }),

  addImage: (image) =>
    set((state) => ({
      uploadedImages: [...state.uploadedImages, image].slice(0, 14), // 최대 14장
    })),

  removeImage: (id) =>
    set((state) => {
      const newImages = state.uploadedImages.filter((img) => img.id !== id);
      const newMainIndex =
        state.mainImageIndex >= newImages.length
          ? Math.max(0, newImages.length - 1)
          : state.mainImageIndex;
      return {
        uploadedImages: newImages,
        mainImageIndex: newMainIndex,
      };
    }),

  setMainImageIndex: (index) => set({ mainImageIndex: index }),

  clearImages: () =>
    set({
      uploadedImages: [],
      mainImageIndex: 0,
    }),

  // 프리셋 관리
  setSelectedCategory: (category) =>
    set({
      selectedCategory: category,
      selectedPreset: null, // 카테고리 변경 시 프리셋 초기화
    }),

  setSelectedPreset: (preset) => set({ selectedPreset: preset }),

  // 옵션 관리
  setOutputCount: (count) => set({ outputCount: count }),
  setAspectRatioOverride: (ratio) => set({ aspectRatioOverride: ratio }),

  // 생성 상태 관리
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setGeneratedImages: (images) => set({ generatedImages: images }),
  setProgress: (progress) => set({ progress }),

  addToHistory: (result) =>
    set((state) => ({
      history: [result, ...state.history].slice(0, 100),
    })),

  // 에러 관리
  setError: (error) => set({ error }),

  // 리셋
  reset: () => set(initialState),

  resetForNewGeneration: () =>
    set({
      generatedImages: [],
      progress: 0,
      error: null,
      currentStep: 'upload',
    }),
}));

export default useStagingStore;

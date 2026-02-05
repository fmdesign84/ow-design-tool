/**
 * 이미지 생성 상태 관리 (Zustand)
 * - 프롬프트, 모델, 품질, 비율, 스타일
 * - 참조 이미지
 * - 생성 결과
 */

import { create } from 'zustand';

// 업로드된 이미지
interface UploadedImage {
  preview: string;
  name: string;
  file?: File;
  base64?: string;
}

// 참조 이미지
interface ReferenceImage extends UploadedImage {
  id: string;
  role: 'style' | 'object' | 'person' | 'background';
  order: number;
}

interface ImageGenState {
  // 프롬프트
  prompt: string;
  negativePrompt: string;
  selectedNegativePresets: string[];

  // 모델 및 옵션
  selectedModel: string;
  quality: string;
  aspectRatio: string;
  stylePreset: string;

  // 참조 이미지 (이미지로 생성)
  uploadedImage: UploadedImage | null;
  referenceImages: ReferenceImage[];
  multiImageMode: boolean;

  // 인페인팅
  inpaintingImage: string | null;
  inpaintingMask: string | null;

  // 생성 상태
  isGenerating: boolean;
  generatedImage: string | null;

  // 추천 모델
  recommendedModel: string | null;
  recommendReason: string | null;

  // 에러
  error: string | null;

  // Actions - 프롬프트
  setPrompt: (prompt: string) => void;
  setNegativePrompt: (prompt: string) => void;
  toggleNegativePreset: (presetKey: string) => void;
  setSelectedNegativePresets: (presets: string[]) => void;

  // Actions - 모델 및 옵션
  setSelectedModel: (model: string) => void;
  setQuality: (quality: string) => void;
  setAspectRatio: (ratio: string) => void;
  setStylePreset: (style: string) => void;

  // Actions - 참조 이미지
  setUploadedImage: (image: UploadedImage | null) => void;
  setReferenceImages: (images: ReferenceImage[]) => void;
  addReferenceImage: (image: ReferenceImage) => void;
  removeReferenceImage: (id: string) => void;
  setMultiImageMode: (mode: boolean) => void;

  // Actions - 인페인팅
  setInpaintingImage: (image: string | null) => void;
  setInpaintingMask: (mask: string | null) => void;

  // Actions - 생성 상태
  setIsGenerating: (generating: boolean) => void;
  setGeneratedImage: (image: string | null) => void;

  // Actions - 추천 모델
  setRecommendedModel: (model: string | null) => void;
  setRecommendReason: (reason: string | null) => void;

  // Actions - 에러
  setError: (error: string | null) => void;

  // Actions - 리셋
  resetImageGenState: () => void;
  clearUploadedImages: () => void;
}

const initialState = {
  prompt: '',
  negativePrompt: '',
  selectedNegativePresets: [],
  selectedModel: 'gemini-2.0-flash-exp',
  quality: 'standard',
  aspectRatio: '1:1',
  stylePreset: 'auto',
  uploadedImage: null,
  referenceImages: [],
  multiImageMode: false,
  inpaintingImage: null,
  inpaintingMask: null,
  isGenerating: false,
  generatedImage: null,
  recommendedModel: null,
  recommendReason: null,
  error: null,
};

export const useImageGenStore = create<ImageGenState>((set) => ({
  ...initialState,

  // 프롬프트
  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (prompt) => set({ negativePrompt: prompt }),
  toggleNegativePreset: (presetKey) =>
    set((state) => ({
      selectedNegativePresets: state.selectedNegativePresets.includes(presetKey)
        ? state.selectedNegativePresets.filter((k) => k !== presetKey)
        : [...state.selectedNegativePresets, presetKey],
    })),
  setSelectedNegativePresets: (presets) => set({ selectedNegativePresets: presets }),

  // 모델 및 옵션
  setSelectedModel: (model) => set({ selectedModel: model }),
  setQuality: (quality) => set({ quality }),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setStylePreset: (style) => set({ stylePreset: style }),

  // 참조 이미지
  setUploadedImage: (image) => set({ uploadedImage: image }),
  setReferenceImages: (images) => set({ referenceImages: images }),
  addReferenceImage: (image) =>
    set((state) => ({
      referenceImages: [...state.referenceImages, image],
    })),
  removeReferenceImage: (id) =>
    set((state) => ({
      referenceImages: state.referenceImages.filter((img) => img.id !== id),
    })),
  setMultiImageMode: (mode) => set({ multiImageMode: mode }),

  // 인페인팅
  setInpaintingImage: (image) => set({ inpaintingImage: image }),
  setInpaintingMask: (mask) => set({ inpaintingMask: mask }),

  // 생성 상태
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setGeneratedImage: (image) => set({ generatedImage: image }),

  // 추천 모델
  setRecommendedModel: (model) => set({ recommendedModel: model }),
  setRecommendReason: (reason) => set({ recommendReason: reason }),

  // 에러
  setError: (error) => set({ error }),

  // 리셋
  resetImageGenState: () => set(initialState),
  clearUploadedImages: () =>
    set({
      uploadedImage: null,
      referenceImages: [],
      inpaintingImage: null,
      inpaintingMask: null,
    }),
}));

export default useImageGenStore;

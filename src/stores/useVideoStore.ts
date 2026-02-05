/**
 * 영상 생성 상태 관리 (Zustand)
 * - 영상 프롬프트 및 옵션
 * - 생성 결과
 */

import { create } from 'zustand';

// 영상 비율
export type VideoAspectRatio = '16:9' | '9:16' | '1:1';

// 영상 해상도
export type VideoResolution = '720p' | '1080p';

// 영상 길이
export type VideoDuration = '4' | '6' | '8';

// 업로드된 이미지
interface UploadedImage {
  preview: string;
  name: string;
  file?: File;
  base64?: string;
}

// 비율 불일치 정보
interface AspectRatioMismatch {
  original: string;
  target: string;
}

interface VideoState {
  // 프롬프트
  videoPrompt: string;
  videoNegativePrompt: string;

  // 옵션
  videoAspectRatio: VideoAspectRatio;
  videoAspectRatioLocked: boolean;
  videoAspectRatioMismatch: AspectRatioMismatch | null;
  videoResolution: VideoResolution;
  videoDuration: VideoDuration;
  videoGenerateAudio: boolean;

  // 이미지
  uploadedImage: UploadedImage | null;
  endImage: UploadedImage | null; // multi-image-to-video용

  // 결과
  generatedVideo: string | null;
  isGenerating: boolean;
  error: string | null;

  // Actions
  setVideoPrompt: (prompt: string) => void;
  setVideoNegativePrompt: (prompt: string) => void;
  setVideoAspectRatio: (ratio: VideoAspectRatio) => void;
  setVideoAspectRatioLocked: (locked: boolean) => void;
  setVideoAspectRatioMismatch: (mismatch: AspectRatioMismatch | null) => void;
  setVideoResolution: (resolution: VideoResolution) => void;
  setVideoDuration: (duration: VideoDuration) => void;
  setVideoGenerateAudio: (generate: boolean) => void;
  setUploadedImage: (image: UploadedImage | null) => void;
  setEndImage: (image: UploadedImage | null) => void;
  setGeneratedVideo: (video: string | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  resetVideoState: () => void;
}

const initialState = {
  videoPrompt: '',
  videoNegativePrompt: '',
  videoAspectRatio: '16:9' as VideoAspectRatio,
  videoAspectRatioLocked: false,
  videoAspectRatioMismatch: null,
  videoResolution: '720p' as VideoResolution,
  videoDuration: '4' as VideoDuration,
  videoGenerateAudio: true,
  uploadedImage: null,
  endImage: null,
  generatedVideo: null,
  isGenerating: false,
  error: null,
};

export const useVideoStore = create<VideoState>((set) => ({
  ...initialState,

  setVideoPrompt: (prompt) => set({ videoPrompt: prompt }),
  setVideoNegativePrompt: (prompt) => set({ videoNegativePrompt: prompt }),
  setVideoAspectRatio: (ratio) => set({ videoAspectRatio: ratio }),
  setVideoAspectRatioLocked: (locked) => set({ videoAspectRatioLocked: locked }),
  setVideoAspectRatioMismatch: (mismatch) => set({ videoAspectRatioMismatch: mismatch }),
  setVideoResolution: (resolution) => set({ videoResolution: resolution }),
  setVideoDuration: (duration) => set({ videoDuration: duration }),
  setVideoGenerateAudio: (generate) => set({ videoGenerateAudio: generate }),
  setUploadedImage: (image) => set({ uploadedImage: image }),
  setEndImage: (image) => set({ endImage: image }),
  setGeneratedVideo: (video) => set({ generatedVideo: video }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setError: (error) => set({ error }),
  resetVideoState: () => set(initialState),
}));

export default useVideoStore;

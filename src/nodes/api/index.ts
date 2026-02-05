/**
 * Orange Wave - Node API Utilities
 * 노드 시스템용 API 호출 유틸리티
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface ApiCallOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_OPTIONS: ApiCallOptions = {
  timeout: 60000, // 60초
  retries: 1,
  retryDelay: 1000,
};

/**
 * API 호출 래퍼 함수
 */
export async function callApi<T = unknown>(
  endpoint: string,
  payload: object,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.retries!; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.error || data.message || `HTTP ${response.status}`,
            code: data.code || `HTTP_${response.status}`,
          },
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            message: '요청 시간 초과',
            code: 'TIMEOUT',
          },
        };
      }

      // 재시도 전 대기
      if (attempt < opts.retries!) {
        await new Promise(resolve => setTimeout(resolve, opts.retryDelay));
      }
    }
  }

  return {
    success: false,
    error: {
      message: lastError?.message || '네트워크 오류',
      code: 'NETWORK_ERROR',
    },
  };
}

/**
 * 이미지 생성 API
 */
export interface GenerateImagePayload {
  prompt: string;
  referenceImage?: string | null;
  model?: string;
  aspectRatio?: string;
  style?: string;
  negativePrompt?: string;
}

export interface GenerateImageResponse {
  imageUrl: string;
  model?: string;
  enhancedPrompt?: string;
}

export async function generateImage(
  payload: GenerateImagePayload
): Promise<ApiResponse<GenerateImageResponse>> {
  return callApi<GenerateImageResponse>('/api/generate-image', payload);
}

/**
 * 비디오 생성 API
 */
export interface GenerateVideoPayload {
  prompt: string;
  referenceImage?: string | null;
  duration?: number;
  aspectRatio?: string;
}

export interface GenerateVideoResponse {
  videoUrl: string;
}

export async function generateVideo(
  payload: GenerateVideoPayload
): Promise<ApiResponse<GenerateVideoResponse>> {
  return callApi<GenerateVideoResponse>('/api/generate-video', payload, {
    timeout: 120000, // 비디오는 2분
  });
}

/**
 * 배경 제거 API
 */
export interface RemoveBackgroundPayload {
  imageUrl: string;
}

export interface RemoveBackgroundResponse {
  imageUrl: string;
  originalUrl: string;
}

export async function removeBackground(
  payload: RemoveBackgroundPayload
): Promise<ApiResponse<RemoveBackgroundResponse>> {
  return callApi<RemoveBackgroundResponse>('/api/remove-background', payload);
}

/**
 * 이미지 업스케일 API
 */
export interface UpscaleImagePayload {
  imageUrl: string;
  scale?: number;
}

export interface UpscaleImageResponse {
  imageUrl: string;
  width: number;
  height: number;
}

export async function upscaleImage(
  payload: UpscaleImagePayload
): Promise<ApiResponse<UpscaleImageResponse>> {
  return callApi<UpscaleImageResponse>('/api/upscale-image', payload);
}

/**
 * 프롬프트 개선 API
 */
export interface EnhancePromptPayload {
  prompt: string;
  style?: string;
  context?: string;
}

export interface EnhancePromptResponse {
  enhanced: string;
  original: string;
  suggestions?: string[];
}

export async function enhancePrompt(
  payload: EnhancePromptPayload
): Promise<ApiResponse<EnhancePromptResponse>> {
  return callApi<EnhancePromptResponse>('/api/enhance-prompt', payload);
}

/**
 * 이미지 편집 API (Inpainting)
 */
export interface EditImagePayload {
  imageUrl: string;
  maskUrl: string;
  prompt: string;
}

export interface EditImageResponse {
  imageUrl: string;
}

export async function editImage(
  payload: EditImagePayload
): Promise<ApiResponse<EditImageResponse>> {
  return callApi<EditImageResponse>('/api/edit-image', payload);
}

/**
 * 이미지 분석 API
 */
export interface AnalyzeImagePayload {
  imageUrl: string;
  prompt?: string;
}

export interface AnalyzeImageResponse {
  analysis: string;
  tags?: string[];
  colors?: string[];
}

export async function analyzeImage(
  payload: AnalyzeImagePayload
): Promise<ApiResponse<AnalyzeImageResponse>> {
  return callApi<AnalyzeImageResponse>('/api/analyze-image', payload);
}

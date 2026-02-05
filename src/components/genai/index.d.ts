// GenAI 컴포넌트 타입 선언

export interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  recommendedModel?: string | null;
  recommendReason?: string | null;
  disabled?: boolean;
  compact?: boolean;
  showCost?: boolean;
  quality?: string;
  className?: string;
  excludeModels?: string[];
}

export declare function ModelSelector(props: ModelSelectorProps): JSX.Element;
export declare function getModelInfo(modelId: string): Record<string, unknown> | null;
export declare function normalizeModelKey(key: string): string;
export declare function toLegacyModelKey(modelId: string): string;

export interface MaskEditorProps {
  image: string | { preview?: string; src?: string } | null;
  width?: number;
  height?: number;
  outputWidth?: number;  // 마스크 출력 크기 (원본 이미지 크기)
  outputHeight?: number; // 지정하지 않으면 display 크기 사용
  brushSize?: number;
  brushColor?: string;
  maskColor?: string;
  onMaskChange?: (mask: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export declare function MaskEditor(props: MaskEditorProps): JSX.Element;

export interface CostEstimateProps {
  model: string;
  quality?: string;
  count?: number;
}

export declare function CostEstimate(props: CostEstimateProps): JSX.Element;
export declare function calculateCost(model: string, quality: string, count: number): number;
export declare function formatCost(cost: number): string;

export interface ReferenceImage {
  id: string;
  file?: File;
  preview: string;
  name: string;
  role: 'style' | 'object' | 'person' | 'background';
  order: number;
}

export interface MultiImageUploadProps {
  images?: ReferenceImage[];
  onChange?: (images: ReferenceImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
  compact?: boolean;
  showRoles?: boolean;
  className?: string;
}

export declare function MultiImageUpload(props: MultiImageUploadProps): JSX.Element;

export interface AdvancedOptionsProps {
  options: Record<string, unknown>;
  onOptionsChange: (options: Record<string, unknown>) => void;
  disabled?: boolean;
}

export declare function AdvancedOptions(props: AdvancedOptionsProps): JSX.Element;

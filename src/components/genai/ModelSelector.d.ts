// ModelSelector 타입 정의

export interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  recommendedModel?: string;
  recommendReason?: string;
  disabled?: boolean;
  compact?: boolean;
  showCost?: boolean;
  quality?: string;
  className?: string;
}

export interface ModelInfo {
  id: string;
  key: string;
  name: string;
  shortName: string;
  badges: string[];
  description: string;
  bestFor: string[];
  costs: Record<string, number>;
}

export function ModelSelector(props: ModelSelectorProps): JSX.Element;
export function getModelInfo(modelId: string): ModelInfo | null;
export function normalizeModelKey(key: string): string;
export function toLegacyModelKey(modelId: string): string;

export default ModelSelector;

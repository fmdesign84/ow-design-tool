// AdvancedOptions 타입 정의

export interface AdvancedOptionsState {
  autoEnhance?: boolean;
  preserveFaces?: boolean;
  searchIntegration?: boolean;
  thinkingMode?: boolean;
}

export interface AdvancedOptionsProps {
  options?: AdvancedOptionsState;
  onChange?: (options: AdvancedOptionsState) => void;
  selectedModel?: string;
  fidelity?: number;
  onFidelityChange?: (fidelity: number) => void;
  disabled?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function AdvancedOptions(props: AdvancedOptionsProps): JSX.Element;

export default AdvancedOptions;

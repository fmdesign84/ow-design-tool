// MaskEditor 타입 정의

export interface MaskEditorProps {
  image: string | { preview?: string; src?: string } | null;
  width?: number;
  height?: number;
  brushSize?: number;
  brushColor?: string;
  maskColor?: string;
  onMaskChange?: (maskDataUrl: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function MaskEditor(props: MaskEditorProps): JSX.Element;

export default MaskEditor;

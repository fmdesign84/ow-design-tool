// MultiImageUpload 타입 정의
import type { ReferenceImage } from '../../features/studio/types';

export interface MultiImageUploadProps {
  images: ReferenceImage[];
  onChange: (images: ReferenceImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
  compact?: boolean;
  showRoles?: boolean;
  className?: string;
}

export function MultiImageUpload(props: MultiImageUploadProps): JSX.Element;

export default MultiImageUpload;

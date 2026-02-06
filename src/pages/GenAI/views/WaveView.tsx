/**
 * Wave View (노드 에디터)
 * - NodeEditor 컴포넌트 래핑
 */

import React from 'react';
import { NodeEditor } from '../../../components/NodeEditor';

interface WaveViewProps {
  onLightboxChange?: (isOpen: boolean) => void;
}

export const WaveView: React.FC<WaveViewProps> = ({ onLightboxChange }) => {
  return <NodeEditor embedded onLightboxChange={onLightboxChange} />;
};

export default WaveView;

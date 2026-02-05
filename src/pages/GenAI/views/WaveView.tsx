/**
 * Wave View (노드 에디터)
 * - NodeEditor 컴포넌트 래핑
 */

import React from 'react';
import { NodeEditor } from '../../../components/NodeEditor';

export const WaveView: React.FC = () => {
  return <NodeEditor embedded />;
};

export default WaveView;

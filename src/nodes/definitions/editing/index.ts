/**
 * Editing Nodes - 편집 노드 모음
 */

import { removeBackgroundNode } from './removeBackground';
import { upscaleNode } from './upscale';

export { removeBackgroundNode } from './removeBackground';
export { upscaleNode } from './upscale';

export const editingNodes = [
  removeBackgroundNode,
  upscaleNode,
];

export default editingNodes;

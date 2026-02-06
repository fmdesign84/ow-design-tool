/**
 * Editing Nodes - 편집 노드 모음
 */

import { removeBackgroundNode } from './removeBackground';
import { upscaleNode } from './upscale';
import { textCorrectNode } from './textCorrect';

export { removeBackgroundNode } from './removeBackground';
export { upscaleNode } from './upscale';
export { textCorrectNode } from './textCorrect';

export const editingNodes = [
  removeBackgroundNode,
  upscaleNode,
  textCorrectNode,
];

export default editingNodes;

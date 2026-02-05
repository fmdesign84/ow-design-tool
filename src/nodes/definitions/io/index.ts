/**
 * IO Nodes - 입출력 노드 모음
 */

import { workflowInputNode } from './workflowInput';
import { workflowOutputNode } from './workflowOutput';
import { imageUploadNode } from './imageUpload';
import { textInputNode } from './textInput';

export { workflowInputNode } from './workflowInput';
export { workflowOutputNode } from './workflowOutput';
export { imageUploadNode } from './imageUpload';
export { textInputNode } from './textInput';

export const ioNodes = [
  imageUploadNode,
  textInputNode,
  workflowInputNode,
  workflowOutputNode,  // 맨 밑 (특수 케이스용)
];

export default ioNodes;

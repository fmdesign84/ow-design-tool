/**
 * IO Nodes - 입출력 노드 모음
 */

import { workflowInputNode } from './workflowInput';
import { workflowOutputNode } from './workflowOutput';
import { imageUploadNode } from './imageUpload';
import { textInputNode } from './textInput';
import { imageOutputNode } from './imageOutput';
import { videoOutputNode } from './videoOutput';
import { textOutputNode } from './textOutput';

export { workflowInputNode } from './workflowInput';
export { workflowOutputNode } from './workflowOutput';
export { imageUploadNode } from './imageUpload';
export { textInputNode } from './textInput';
export { imageOutputNode } from './imageOutput';
export { videoOutputNode } from './videoOutput';
export { textOutputNode } from './textOutput';

export const ioNodes = [
  imageUploadNode,
  textInputNode,
  workflowInputNode,
  // 출력 노드들
  imageOutputNode,
  videoOutputNode,
  textOutputNode,
  workflowOutputNode,  // 레거시 호환용 (맨 밑)
];

export default ioNodes;

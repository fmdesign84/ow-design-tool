/**
 * Generation Nodes - 생성 노드 모음
 *
 * 이미지 생성:
 * - textToImage: 텍스트 → 이미지
 * - imageToImage: 이미지 → 이미지 (참조 기반)
 * - inpainting: 부분 편집
 * - idPhoto: 증명사진
 *
 * 영상 생성:
 * - textToVideo: 텍스트 → 영상
 * - imageToVideo: 이미지 → 영상
 * - multiImageVideo: 멀티 이미지 → 영상
 *
 * 디자인:
 * - mockup: 목업 생성
 */

// 이미지 생성 노드
import { textToImageNode } from './textToImage';
import { imageToImageNode } from './imageToImage';
import { inpaintingNode } from './inpainting';
import { idPhotoNode } from './idPhoto';

// 영상 생성 노드
import { textToVideoNode } from './textToVideo';
import { imageToVideoNode } from './imageToVideo';
import { multiImageVideoNode } from './multiImageVideo';

// 디자인 노드
import { mockupNode } from './mockup';

// 이미지 생성 노드 export
export { textToImageNode } from './textToImage';
export { imageToImageNode } from './imageToImage';
export { inpaintingNode } from './inpainting';
export { idPhotoNode } from './idPhoto';

// 영상 생성 노드 export
export { textToVideoNode } from './textToVideo';
export { imageToVideoNode } from './imageToVideo';
export { multiImageVideoNode } from './multiImageVideo';

// 디자인 노드 export
export { mockupNode } from './mockup';

export const generationNodes = [
  // 디자인 (맨 위)
  mockupNode,
  // 이미지 생성
  textToImageNode,
  imageToImageNode,
  inpaintingNode,
  idPhotoNode,
  // 영상 생성
  textToVideoNode,
  imageToVideoNode,
  multiImageVideoNode,
];

export default generationNodes;

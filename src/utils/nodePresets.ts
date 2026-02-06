/**
 * 노드 프리셋 유틸리티
 * 서브메뉴 → 전체 워크플로우 자동 생성
 */

import type { Node, Edge } from '@xyflow/react';

// 노드 데이터 타입
interface NodeData extends Record<string, unknown> {
  nodeId: string;
  config: Record<string, unknown>;
  status?: string;
}

// 프리셋 결과
interface NodePreset {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

// ID 생성 카운터
let nodeIdCounter = 0;

const getNewNodeId = () => {
  nodeIdCounter += 1;
  return `preset-${Date.now()}-${nodeIdCounter}`;
};

// 노드 간격
const NODE_GAP = 350;
const START_X = 100;
const START_Y = 200;

// 포트 색상
const PORT_COLORS = {
  text: '#3B82F6',    // 파란색
  image: '#9333EA',   // 보라색
  video: '#10B981',   // 초록색
  any: '#6B7280',     // 회색
};

/**
 * 노드 생성 헬퍼
 */
const createNode = (
  nodeId: string,
  config: Record<string, unknown>,
  x: number,
  y: number
): Node<NodeData> => ({
  id: getNewNodeId(),
  type: 'custom',
  position: { x, y },
  data: { nodeId, config, status: undefined },
});

/**
 * 엣지 생성 헬퍼
 */
const createEdge = (
  sourceId: string,
  targetId: string,
  sourceHandle: string,
  targetHandle: string,
  color: string
): Edge => ({
  id: `e-${sourceId}-${targetId}`,
  source: sourceId,
  target: targetId,
  sourceHandle,
  targetHandle,
  type: 'smoothstep',
  style: { stroke: color, strokeWidth: 2 },
});

// ============================================================
// 텍스트 기반 워크플로우 (텍스트 → 프롬프트 개선 → 생성 → 출력)
// ============================================================

const createTextWorkflow = (
  genNodeId: string,
  genConfig: Record<string, unknown>,
  outputType: 'image' | 'video' = 'image'
): NodePreset => {
  const textNode = createNode('text-input', { text: '' }, START_X, START_Y);
  const enhanceNode = createNode('enhance-prompt', {}, START_X + NODE_GAP, START_Y);
  const genNode = createNode(genNodeId, genConfig, START_X + NODE_GAP * 2, START_Y);
  // 출력 타입에 따라 적절한 출력 노드 사용
  const outputNodeId = outputType === 'video' ? 'video-output' : 'image-output';
  const outputNode = createNode(outputNodeId, {}, START_X + NODE_GAP * 3, START_Y);

  return {
    nodes: [textNode, enhanceNode, genNode, outputNode],
    edges: [
      createEdge(textNode.id, enhanceNode.id, 'text', 'prompt', PORT_COLORS.text),
      createEdge(enhanceNode.id, genNode.id, 'enhancedPrompt', 'prompt', PORT_COLORS.text),
      createEdge(genNode.id, outputNode.id, outputType, outputType, outputType === 'image' ? PORT_COLORS.image : PORT_COLORS.video),
    ],
  };
};

// ============================================================
// 이미지 기반 워크플로우 (이미지 → 처리 → 출력)
// ============================================================

const createImageWorkflow = (
  processNodeId: string,
  processConfig: Record<string, unknown>,
  inputHandle = 'image',
  outputHandle = 'image'
): NodePreset => {
  const imageNode = createNode('image-upload', {}, START_X, START_Y);
  const processNode = createNode(processNodeId, processConfig, START_X + NODE_GAP, START_Y);
  // 출력 핸들에 따라 적절한 출력 노드 사용
  const outputNodeId = outputHandle === 'video' ? 'video-output' : 'image-output';
  const outputNode = createNode(outputNodeId, {}, START_X + NODE_GAP * 2, START_Y);

  return {
    nodes: [imageNode, processNode, outputNode],
    edges: [
      createEdge(imageNode.id, processNode.id, 'image', inputHandle, PORT_COLORS.image),
      createEdge(processNode.id, outputNode.id, outputHandle, outputHandle, outputHandle === 'video' ? PORT_COLORS.video : PORT_COLORS.image),
    ],
  };
};

// ============================================================
// 이미지 + 텍스트 기반 워크플로우 (이미지 + 텍스트 → 생성 → 출력)
// ============================================================

const createImageTextWorkflow = (
  genNodeId: string,
  genConfig: Record<string, unknown>,
  imageInputHandle = 'image',
  outputType: 'image' | 'video' = 'image',
  textInputHandle = 'prompt'
): NodePreset => {
  const imageNode = createNode('image-upload', {}, START_X, START_Y - 100);
  const textNode = createNode('text-input', { text: '' }, START_X, START_Y + 100);
  const genNode = createNode(genNodeId, genConfig, START_X + NODE_GAP, START_Y);
  // 출력 타입에 따라 적절한 출력 노드 사용
  const outputNodeId = outputType === 'video' ? 'video-output' : 'image-output';
  const outputNode = createNode(outputNodeId, {}, START_X + NODE_GAP * 2, START_Y);

  return {
    nodes: [imageNode, textNode, genNode, outputNode],
    edges: [
      createEdge(imageNode.id, genNode.id, 'image', imageInputHandle, PORT_COLORS.image),
      createEdge(textNode.id, genNode.id, 'text', textInputHandle, PORT_COLORS.text),
      createEdge(genNode.id, outputNode.id, outputType, outputType, outputType === 'image' ? PORT_COLORS.image : PORT_COLORS.video),
    ],
  };
};

// ============================================================
// 복합 워크플로우 (여러 이미지 + 처리)
// ============================================================

const createMultiImageWorkflow = (
  genNodeId: string,
  genConfig: Record<string, unknown>
): NodePreset => {
  const startImage = createNode('image-upload', {}, START_X, START_Y - 100);
  const endImage = createNode('image-upload', {}, START_X, START_Y + 100);
  const textNode = createNode('text-input', { text: '' }, START_X, START_Y + 300);
  const genNode = createNode(genNodeId, genConfig, START_X + NODE_GAP, START_Y);
  // 멀티 이미지 워크플로우는 항상 비디오 출력
  const outputNode = createNode('video-output', {}, START_X + NODE_GAP * 2, START_Y);

  return {
    nodes: [startImage, endImage, textNode, genNode, outputNode],
    edges: [
      createEdge(startImage.id, genNode.id, 'image', 'startImage', PORT_COLORS.image),
      createEdge(endImage.id, genNode.id, 'image', 'endImage', PORT_COLORS.image),
      createEdge(textNode.id, genNode.id, 'text', 'prompt', PORT_COLORS.text),
      createEdge(genNode.id, outputNode.id, 'video', 'video', PORT_COLORS.video),
    ],
  };
};

// ============================================================
// 장소 합성 워크플로우 (배경 + 전경 + 텍스트 → 합성 → 출력)
// ============================================================

const createLocationCompositeWorkflow = (): NodePreset => {
  const bgImage = createNode('image-upload', {}, START_X, START_Y - 100);
  const fgImage = createNode('image-upload', {}, START_X, START_Y + 100);
  const textNode = createNode('text-input', { text: '' }, START_X, START_Y + 300);
  const compositeNode = createNode('location-composite', { aspectRatio: '1:1' }, START_X + NODE_GAP, START_Y);
  const outputNode = createNode('image-output', {}, START_X + NODE_GAP * 2, START_Y);

  return {
    nodes: [bgImage, fgImage, textNode, compositeNode, outputNode],
    edges: [
      createEdge(bgImage.id, compositeNode.id, 'image', 'backgroundImage', PORT_COLORS.image),
      createEdge(fgImage.id, compositeNode.id, 'image', 'foregroundImage', PORT_COLORS.image),
      createEdge(textNode.id, compositeNode.id, 'text', 'prompt', PORT_COLORS.text),
      createEdge(compositeNode.id, outputNode.id, 'image', 'image', PORT_COLORS.image),
    ],
  };
};

// ============================================================
// 가상 피팅 워크플로우 (인물 + 의류 → 피팅 → 출력)
// ============================================================

const createVirtualTryonWorkflow = (): NodePreset => {
  const humanImage = createNode('image-upload', {}, START_X, START_Y - 100);
  const garmentImage = createNode('image-upload', {}, START_X, START_Y + 100);
  const tryonNode = createNode('virtual-tryon', { category: 'upper_body' }, START_X + NODE_GAP, START_Y);
  const outputNode = createNode('image-output', {}, START_X + NODE_GAP * 2, START_Y);

  return {
    nodes: [humanImage, garmentImage, tryonNode, outputNode],
    edges: [
      createEdge(humanImage.id, tryonNode.id, 'image', 'humanImage', PORT_COLORS.image),
      createEdge(garmentImage.id, tryonNode.id, 'image', 'garmentImage', PORT_COLORS.image),
      createEdge(tryonNode.id, outputNode.id, 'image', 'image', PORT_COLORS.image),
    ],
  };
};

// ============================================================
// 연출 생성 워크플로우 (인물 + 키비주얼(선택) → 연출 → 출력)
// ============================================================

const createPortraitStagingWorkflow = (): NodePreset => {
  const portraitImage = createNode('image-upload', {}, START_X, START_Y - 100);
  const keyVisualImage = createNode('image-upload', {}, START_X, START_Y + 100);
  const stagingNode = createNode('portrait-staging', { presetKey: 'linkedin-pro' }, START_X + NODE_GAP, START_Y);
  const outputNode = createNode('image-output', {}, START_X + NODE_GAP * 2, START_Y);

  return {
    nodes: [portraitImage, keyVisualImage, stagingNode, outputNode],
    edges: [
      createEdge(portraitImage.id, stagingNode.id, 'image', 'portraitImage', PORT_COLORS.image),
      createEdge(keyVisualImage.id, stagingNode.id, 'image', 'keyVisualImage', PORT_COLORS.image),
      createEdge(stagingNode.id, outputNode.id, 'image', 'image', PORT_COLORS.image),
    ],
  };
};

/**
 * 서브메뉴 키 → 노드 프리셋 매핑
 */
export const getNodePreset = (menuKey: string, subMenuKey: string): NodePreset | null => {
  // ============================================================
  // 이미지 생성 메뉴
  // ============================================================
  if (menuKey === 'image') {
    switch (subMenuKey) {
      // 텍스트로 이미지: 텍스트 → 프롬프트개선 → 이미지생성 → 출력
      case 'text-to-image':
        return createTextWorkflow('text-to-image', { aspectRatio: '1:1' }, 'image');

      // 이미지로: 이미지 + 텍스트 → 이미지변환 → 출력
      case 'image-to-image':
        return createImageTextWorkflow('image-to-image', { aspectRatio: '1:1', strength: 0.7 }, 'image', 'image');

      // 부분편집 (인페인팅): 이미지 → 인페인팅 → 출력
      // correctionAreas는 노드 UI에서 직접 입력
      case 'inpainting':
        return createImageWorkflow('inpainting', { correctText: '' }, 'image', 'image');

      // 증명사진: 이미지 → ID포토 → 출력
      case 'id-photo-studio':
        return createImageWorkflow('id-photo', { purpose: 'resume', background: 'white' }, 'referenceImages', 'image');

      // 자유사진: 이미지 → ID포토(자유) → 출력
      case 'free-photo':
        return createImageWorkflow('id-photo', { purpose: 'free', background: 'transparent' }, 'referenceImages', 'image');

      // 장소합성: 배경이미지 + 전경이미지 + 텍스트 → 장소합성 → 출력
      case 'location-composite':
        return createLocationCompositeWorkflow();

      // 가상피팅: 인물이미지 + 의류이미지 → 가상피팅 → 출력
      case 'virtual-tryon':
        return createVirtualTryonWorkflow();

      // 배경생성: 이미지 + 텍스트 → 배경생성 → 출력
      case 'background-gen':
        return createImageTextWorkflow('background-gen', { refinePrompt: true }, 'image', 'image');

      // 캐릭터 생성: 이미지 → 캐릭터변환 → 출력
      case 'character-gen-studio':
        return createImageWorkflow('character-gen', { style: 'namoo', expression: 'happy' }, 'referenceImages', 'image');

      default:
        return null;
    }
  }

  // ============================================================
  // 편집 도구 메뉴
  // ============================================================
  if (menuKey === 'tools') {
    switch (subMenuKey) {
      // 업스케일: 이미지 → 업스케일 → 출력
      case 'upscale':
        return createImageWorkflow('upscale-image', { scale: '2' }, 'image', 'image');

      // 배경제거: 이미지 → 배경제거 → 출력
      case 'remove-bg':
        return createImageWorkflow('remove-background', {}, 'image', 'image');

      // 텍스트보정: 이미지 → 텍스트보정 → 출력
      case 'text-correct':
        return createImageWorkflow('text-correct', { correctText: '' }, 'image', 'image');

      default:
        return null;
    }
  }

  // ============================================================
  // 영상 생성 메뉴
  // ============================================================
  if (menuKey === 'video') {
    switch (subMenuKey) {
      // 텍스트로 영상: 텍스트 → 프롬프트개선 → 영상생성 → 출력
      case 'text-to-video':
        return createTextWorkflow('text-to-video', { aspectRatio: '16:9', duration: '4' }, 'video');

      // 이미지로 영상: 이미지 + 텍스트 → 영상생성 → 출력
      case 'image-to-video':
        return createImageTextWorkflow('image-to-video', { aspectRatio: '16:9', duration: '4' }, 'image', 'video');

      // 멀티이미지 영상: 이미지들 + 텍스트 → 멀티영상 → 출력
      case 'multi-image-to-video':
        return createMultiImageWorkflow('multi-image-video', { aspectRatio: '16:9', duration: '4' });

      default:
        return null;
    }
  }

  // ============================================================
  // 디자인(템플릿) 메뉴
  // ============================================================
  if (menuKey === 'design') {
    switch (subMenuKey) {
      // 목업생성: 제품이미지 → 목업 → 출력
      case 'mockup-generator':
        return createImageWorkflow('mockup', { mockupType: 'social-square' }, 'productImage', 'image');

      // 연출생성: 인물이미지 + 키비주얼(선택) → 연출생성 → 출력
      case 'portrait-staging':
        return createPortraitStagingWorkflow();

      default:
        return null;
    }
  }

  return null;
};

export default getNodePreset;

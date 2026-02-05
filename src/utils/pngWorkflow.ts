/**
 * PNG 메타데이터 워크플로우 유틸리티
 */

import extractChunks from 'png-chunks-extract';
import encodeChunks from 'png-chunks-encode';
import pngText from 'png-chunk-text';
import { toPng } from 'html-to-image';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { rlog, rerror, rwarn } from './debug';

// png-chunk-text 타입 수정 (실제 API: encode(keyword, text), decode(data))
const encodeText = pngText.encode as unknown as (keyword: string, text: string) => { name: string; data: Uint8Array };
const decodeText = pngText.decode as unknown as (data: Uint8Array) => { keyword: string; text: string };

// 워크플로우 데이터 타입
export interface WorkflowData {
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
  templateId?: string;
  version?: string;
}

// PNG 청크 타입
interface PngChunk {
  name: string;
  data: Uint8Array;
}

// 워크플로우 메타데이터 키
const WORKFLOW_CHUNK_KEY = 'workflow';
const WORKFLOW_VERSION = '1.0';

/**
 * URL 또는 base64에서 ArrayBuffer 가져오기
 */
async function fetchImageAsBuffer(imageSource: string | Blob): Promise<Uint8Array> {
  if (imageSource instanceof Blob) {
    const arrayBuffer = await imageSource.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  // base64 데이터 URL인 경우
  if (imageSource.startsWith('data:')) {
    const base64 = imageSource.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // HTTP URL인 경우
  const response = await fetch(imageSource);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * PNG 이미지에 워크플로우 JSON 임베딩
 * @param imageSource - 이미지 URL, base64 data URL, 또는 Blob
 * @param workflow - 워크플로우 데이터
 * @returns 워크플로우가 임베딩된 PNG Blob
 */
export async function embedWorkflowToPng(
  imageSource: string | Blob,
  workflow: WorkflowData
): Promise<Blob> {
  try {
    rlog('PNG Embed', '시작', { nodeCount: workflow.nodes?.length });

    // 이미지를 버퍼로 변환
    const pngBuffer = await fetchImageAsBuffer(imageSource);
    rlog('PNG Embed', '원본 버퍼', { size: pngBuffer.length });

    // PNG 청크 추출
    const chunks = extractChunks(pngBuffer) as PngChunk[];
    rlog('PNG Embed', '원본 청크', { count: chunks.length });

    // 기존 워크플로우 청크 제거 (중복 방지)
    const filteredChunks = chunks.filter(
      (chunk) => !(chunk.name === 'tEXt' && isWorkflowChunk(chunk))
    );

    // 워크플로우 JSON 생성 후 Base64 인코딩 (한글/특수문자 지원)
    const workflowJson = JSON.stringify({
      ...workflow,
      version: WORKFLOW_VERSION,
      savedAt: new Date().toISOString(),
    });
    const base64Data = btoa(unescape(encodeURIComponent(workflowJson)));
    rlog('PNG Embed', 'JSON 생성', { jsonSize: workflowJson.length, base64Size: base64Data.length });

    // tEXt 청크 생성
    const workflowChunk = encodeText(WORKFLOW_CHUNK_KEY, base64Data);

    // IEND 청크 전에 워크플로우 청크 삽입
    const iendIndex = filteredChunks.findIndex((chunk) => chunk.name === 'IEND');
    if (iendIndex !== -1) {
      filteredChunks.splice(iendIndex, 0, workflowChunk);
    } else {
      filteredChunks.push(workflowChunk);
    }

    // PNG 재인코딩
    const newPngBuffer = encodeChunks(filteredChunks);
    rlog('PNG Embed', '완료', { newSize: newPngBuffer.length, chunkCount: filteredChunks.length });

    // Uint8Array를 새 ArrayBuffer로 복사하여 Blob 생성
    const buffer = new ArrayBuffer(newPngBuffer.length);
    const view = new Uint8Array(buffer);
    view.set(newPngBuffer);
    return new Blob([buffer], { type: 'image/png' });
  } catch (error) {
    rerror('PNG Embed', '실패', { error: String(error) });
    throw new Error('워크플로우 임베딩 실패');
  }
}

/**
 * PNG 이미지에서 워크플로우 JSON 추출
 * @param imageSource - 이미지 URL, base64 data URL, 또는 Blob
 * @returns 워크플로우 데이터 또는 null
 */
export async function extractWorkflowFromPng(
  imageSource: string | Blob
): Promise<WorkflowData | null> {
  try {
    const sourceInfo = typeof imageSource === 'string' ? imageSource.substring(0, 100) : 'Blob';
    rlog('PNG Extract', '시작', { source: sourceInfo });

    const pngBuffer = await fetchImageAsBuffer(imageSource);
    rlog('PNG Extract', '버퍼 로드', { size: pngBuffer.length });

    const chunks = extractChunks(pngBuffer) as PngChunk[];
    rlog('PNG Extract', '청크 분석', { count: chunks.length, names: chunks.map(c => c.name).join(',') });

    // tEXt 청크에서 워크플로우 찾기
    for (const chunk of chunks) {
      if (chunk.name === 'tEXt') {
        try {
          const decoded = decodeText(chunk.data);
          rlog('PNG Extract', 'tEXt 발견', { keyword: decoded.keyword });
          if (decoded.keyword === WORKFLOW_CHUNK_KEY) {
            // Base64 디코딩 후 JSON 파싱 (한글/특수문자 지원)
            const jsonString = decodeURIComponent(escape(atob(decoded.text)));
            const workflow = JSON.parse(jsonString) as WorkflowData;
            rlog('PNG Extract', '추출 성공', { nodeCount: workflow.nodes?.length });
            return workflow;
          }
        } catch (e) {
          rwarn('PNG Extract', 'tEXt 파싱 실패', { error: String(e) });
          continue;
        }
      }
    }

    rwarn('PNG Extract', 'workflow 청크 없음');
    return null;
  } catch (error) {
    rerror('PNG Extract', '추출 실패', { error: String(error) });
    return null;
  }
}

/**
 * 청크가 워크플로우 청크인지 확인
 */
function isWorkflowChunk(chunk: PngChunk): boolean {
  try {
    const decoded = decodeText(chunk.data);
    return decoded.keyword === WORKFLOW_CHUNK_KEY;
  } catch {
    return false;
  }
}

/**
 * 기본 워크플로우 이미지 생성 (실행 결과가 없을 때)
 * 간단한 그라데이션 + 노드 개수 표시
 */
export async function createDefaultWorkflowImage(
  nodeCount: number,
  workflowName: string
): Promise<Blob> {
  // Canvas로 기본 이미지 생성
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // 배경 그라데이션
  const gradient = ctx.createLinearGradient(0, 0, 400, 300);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 300);

  // Wave 아이콘 (간단한 파도)
  ctx.strokeStyle = '#FF6B00';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, 150);
  ctx.bezierCurveTo(150, 100, 200, 200, 250, 150);
  ctx.bezierCurveTo(300, 100, 350, 200, 400, 150);
  ctx.stroke();

  // 노드 개수 텍스트
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${nodeCount} nodes`, 200, 220);

  // 워크플로우 이름 (축약)
  ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#9CA3AF';
  const truncatedName = workflowName.length > 30
    ? workflowName.substring(0, 27) + '...'
    : workflowName;
  ctx.fillText(truncatedName, 200, 250);

  // PNG로 변환
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create PNG blob'));
      }
    }, 'image/png');
  });
}

/**
 * 노드 에디터 캡쳐 (노드 영역만 정확히 캡처)
 * @param nodes - 현재 노드 배열
 * @param options - 캡쳐 옵션
 * @returns PNG data URL
 */
export async function captureNodeEditor(
  nodes: Node[],
  options: {
    backgroundColor?: string;
    padding?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<string> {
  const {
    backgroundColor = '#1a1a2e',
    padding = 50,
    maxWidth = 1920,
    maxHeight = 1080,
  } = options;

  try {
    // .react-flow__viewport 요소 찾기
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) {
      throw new Error('ReactFlow viewport not found');
    }

    // 노드 범위 계산
    const nodesBounds = getNodesBounds(nodes);
    rlog('Node Capture', '노드 범위', {
      x: nodesBounds.x,
      y: nodesBounds.y,
      width: nodesBounds.width,
      height: nodesBounds.height,
    });

    // 캡쳐할 이미지 크기 계산 (노드 범위 + 패딩)
    let imageWidth = nodesBounds.width + padding * 2;
    let imageHeight = nodesBounds.height + padding * 2;

    // 비율 유지하면서 최대 크기 제한
    if (imageWidth > maxWidth || imageHeight > maxHeight) {
      const widthRatio = maxWidth / imageWidth;
      const heightRatio = maxHeight / imageHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      imageWidth = Math.round(imageWidth * ratio);
      imageHeight = Math.round(imageHeight * ratio);
    }

    // 최소 크기 보장
    imageWidth = Math.max(400, imageWidth);
    imageHeight = Math.max(300, imageHeight);

    // 노드 영역을 이미지 크기에 맞추는 transform 계산
    const transform = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.2,  // minZoom
      2,    // maxZoom
      padding
    );

    // 캡처: viewport만 캡처하고 transform으로 노드 영역 맞춤
    const dataUrl = await toPng(viewport, {
      backgroundColor,
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
      filter: (node) => {
        // 미니맵, 컨트롤, 패널 제외
        const classList = (node as Element)?.classList;
        if (!classList) return true;
        return !(
          classList.contains('react-flow__minimap') ||
          classList.contains('react-flow__controls') ||
          classList.contains('react-flow__panel') ||
          classList.contains('react-flow__attribution')
        );
      },
    });

    rlog('Node Capture', '캡쳐 완료', {
      nodesBounds: `${Math.round(nodesBounds.width)}x${Math.round(nodesBounds.height)}`,
      capturedSize: `${imageWidth}x${imageHeight}`,
      zoom: transform.zoom.toFixed(2),
    });

    return dataUrl;
  } catch (error) {
    rerror('Node Capture', '캡쳐 실패', { error: String(error) });
    throw error;
  }
}

/**
 * 이미지를 썸네일 크기로 리사이즈 (저장 시 용량 줄이기)
 * @param imageSource - 이미지 URL 또는 base64
 * @param maxWidth - 최대 너비 (기본 400)
 * @param maxHeight - 최대 높이 (기본 300)
 */
export async function resizeImageForThumbnail(
  imageSource: string,
  maxWidth = 400,
  maxHeight = 300
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 비율 유지하면서 리사이즈
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create thumbnail blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('Failed to load image for resize'));
    img.src = imageSource;
  });
}

/**
 * Blob을 base64 데이터 URL로 변환
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 파일에서 워크플로우 추출 (드래그앤드롭용)
 */
export async function extractWorkflowFromFile(file: File): Promise<WorkflowData | null> {
  if (!file.type.includes('png')) {
    return null;
  }
  return extractWorkflowFromPng(file);
}

/**
 * MaskEditor 컴포넌트
 * Konva 기반 마스크 에디터 - 인페인팅/아웃페인팅용
 * - 브러시 도구로 영역 선택
 * - 지우개 모드
 * - 실행 취소/다시 실행
 * - 마스크 이미지 내보내기
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva';
import styles from './MaskEditor.module.css';

// 아이콘
const BrushIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
  </svg>
);

const EraserIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
    <path d="M22 21H7" />
    <path d="m5 11 9 9" />
  </svg>
);

const UndoIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

const RedoIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
  </svg>
);

const ClearIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

// 브러시 커서 생성 함수
const createBrushCursor = (size, isEraser = false) => {
  const cursorSize = Math.max(size, 10);
  const color = isEraser ? '#666666' : '#FF6B00';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 ${cursorSize} ${cursorSize}">
      <circle cx="${cursorSize/2}" cy="${cursorSize/2}" r="${cursorSize/2 - 1}" fill="none" stroke="${color}" stroke-width="2" opacity="0.8"/>
      <circle cx="${cursorSize/2}" cy="${cursorSize/2}" r="2" fill="${color}"/>
    </svg>
  `;
  const encoded = encodeURIComponent(svg);
  return `url("data:image/svg+xml,${encoded}") ${cursorSize/2} ${cursorSize/2}, crosshair`;
};

/**
 * MaskEditor 메인 컴포넌트
 */
export function MaskEditor({
  image,
  width = 512,
  height = 512,
  outputWidth,  // 마스크 출력 크기 (원본 이미지 크기)
  outputHeight, // 지정하지 않으면 display 크기 사용
  brushSize = 30,
  brushColor = 'rgba(255, 107, 0, 0.5)',
  maskColor = 'rgba(255, 107, 0, 0.6)',
  onMaskChange,
  disabled = false,
  className = '',
}) {
  // 마스크 출력 크기 (원본 크기 또는 display 크기)
  const maskOutputWidth = outputWidth || width;
  const maskOutputHeight = outputHeight || height;
  const stageRef = useRef(null);
  const [konvaImage, setKonvaImage] = useState(null);
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('brush'); // 'brush' | 'eraser'
  const [currentBrushSize, setCurrentBrushSize] = useState(brushSize);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 이미지 로드
  useEffect(() => {
    if (!image) {
      setKonvaImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setKonvaImage(img);
    };
    img.src = typeof image === 'string' ? image : image.preview || image.src;
  }, [image]);

  // 히스토리 저장
  const saveToHistory = useCallback((newLines) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newLines]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // 마우스/터치 시작
  const handleMouseDown = useCallback((e) => {
    if (disabled) return;
    setIsDrawing(true);

    const pos = e.target.getStage().getPointerPosition();
    const newLine = {
      tool,
      brushSize: currentBrushSize,
      points: [pos.x, pos.y],
    };
    setLines([...lines, newLine]);
  }, [disabled, tool, currentBrushSize, lines]);

  // 마우스/터치 이동
  const handleMouseMove = useCallback((e) => {
    if (!isDrawing || disabled) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];

    if (lastLine) {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      setLines([...lines.slice(0, -1), lastLine]);
    }
  }, [isDrawing, disabled, lines]);

  // 마우스/터치 종료
  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveToHistory(lines);

    // 마스크 변경 콜백
    if (onMaskChange && stageRef.current) {
      const maskDataUrl = getMaskDataUrl();
      onMaskChange(maskDataUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawing, lines, saveToHistory, onMaskChange]);

  // 실행 취소
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLines(history[historyIndex - 1] || []);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setLines([]);
    }
  }, [historyIndex, history]);

  // 다시 실행
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLines(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  // 전체 지우기
  const handleClear = useCallback(() => {
    setLines([]);
    saveToHistory([]);
    if (onMaskChange) {
      onMaskChange(null);
    }
  }, [saveToHistory, onMaskChange]);

  // 마스크 이미지 추출 (원본 이미지 크기로 스케일업)
  const getMaskDataUrl = useCallback(() => {
    if (!stageRef.current) return null;

    // 임시 캔버스로 마스크만 추출 (원본 크기로)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = maskOutputWidth;
    maskCanvas.height = maskOutputHeight;
    const ctx = maskCanvas.getContext('2d');

    // display → output 스케일 비율
    const scaleX = maskOutputWidth / width;
    const scaleY = maskOutputHeight / height;

    // 검은 배경
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, maskOutputWidth, maskOutputHeight);

    // 흰색으로 마스크 영역 그리기
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    lines.forEach((line) => {
      if (line.tool === 'eraser') return; // 지우개는 무시

      // 브러시 크기도 스케일 적용
      ctx.lineWidth = line.brushSize * Math.max(scaleX, scaleY);
      ctx.beginPath();

      const points = line.points;
      if (points.length >= 2) {
        // 좌표를 원본 크기로 스케일
        ctx.moveTo(points[0] * scaleX, points[1] * scaleY);
        for (let i = 2; i < points.length; i += 2) {
          ctx.lineTo(points[i] * scaleX, points[i + 1] * scaleY);
        }
        ctx.stroke();
      }
    });

    return maskCanvas.toDataURL('image/png');
  }, [lines, width, height, maskOutputWidth, maskOutputHeight]);

  // 이미지 크기 계산
  const getImageDimensions = useCallback(() => {
    if (!konvaImage) return { imgWidth: width, imgHeight: height, x: 0, y: 0 };

    const imgRatio = konvaImage.width / konvaImage.height;
    const canvasRatio = width / height;

    let imgWidth, imgHeight, x, y;

    if (imgRatio > canvasRatio) {
      imgWidth = width;
      imgHeight = width / imgRatio;
      x = 0;
      y = (height - imgHeight) / 2;
    } else {
      imgHeight = height;
      imgWidth = height * imgRatio;
      x = (width - imgWidth) / 2;
      y = 0;
    }

    return { imgWidth, imgHeight, x, y };
  }, [konvaImage, width, height]);

  const { imgWidth, imgHeight, x: imgX, y: imgY } = getImageDimensions();

  return (
    <div className={`${styles.container} ${className}`}>
      {/* 툴바 */}
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <button
            type="button"
            className={`${styles.toolBtn} ${tool === 'brush' ? styles.active : ''}`}
            onClick={() => setTool('brush')}
            disabled={disabled}
            title="브러시"
          >
            <BrushIcon size={18} />
          </button>
          <button
            type="button"
            className={`${styles.toolBtn} ${tool === 'eraser' ? styles.active : ''}`}
            onClick={() => setTool('eraser')}
            disabled={disabled}
            title="지우개"
          >
            <EraserIcon size={18} />
          </button>
        </div>

        <div className={styles.brushSizeGroup}>
          <span className={styles.brushSizeLabel}>{currentBrushSize}px</span>
          <input
            type="range"
            min="5"
            max="100"
            value={currentBrushSize}
            onChange={(e) => setCurrentBrushSize(Number(e.target.value))}
            className={styles.brushSizeSlider}
            disabled={disabled}
          />
        </div>

        <div className={styles.toolGroup}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleUndo}
            disabled={disabled || historyIndex < 0}
            title="실행 취소"
          >
            <UndoIcon size={18} />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleRedo}
            disabled={disabled || historyIndex >= history.length - 1}
            title="다시 실행"
          >
            <RedoIcon size={18} />
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleClear}
            disabled={disabled || lines.length === 0}
            title="전체 지우기"
          >
            <ClearIcon size={18} />
          </button>
        </div>
      </div>

      {/* 캔버스 영역 */}
      <div className={styles.canvasWrapper}>
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className={styles.canvas}
          style={{ cursor: disabled ? 'not-allowed' : createBrushCursor(currentBrushSize, tool === 'eraser') }}
        >
          {/* 배경 이미지 레이어 */}
          <Layer>
            {konvaImage && (
              <KonvaImage
                image={konvaImage}
                x={imgX}
                y={imgY}
                width={imgWidth}
                height={imgHeight}
              />
            )}
          </Layer>

          {/* 마스크 레이어 */}
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.tool === 'eraser' ? 'black' : maskColor}
                strokeWidth={line.brushSize}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>

        {/* 빈 이미지 안내 */}
        {!konvaImage && (
          <div className={styles.emptyOverlay}>
            <p>이미지를 먼저 업로드하세요</p>
          </div>
        )}
      </div>

      {/* 안내 문구 */}
      <p className={styles.hint}>
        {tool === 'brush'
          ? '수정할 영역을 브러시로 칠하세요'
          : '지우개로 마스크를 수정하세요'}
      </p>
    </div>
  );
}

export default MaskEditor;

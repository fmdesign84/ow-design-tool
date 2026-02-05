/**
 * Slide Editor - Swimming/Wave 다크 테마
 * 슬라이드 미리보기, 레이아웃 변경, 콘텐츠 편집 UI
 */
import React, { useState, useCallback } from 'react';
import { SlideConfig, SlideLayoutType, DesignTokens } from '../types';
import { SlidePreview } from './SlidePreview';

// Wave 라이트 테마 색상 상수
const COLORS = {
  bg: '#F5F6F8',
  card: '#FFFFFF',
  border: '#E5E7EB',
  hover: '#F9FAFB',
  text: '#1F2937',
  sub: '#6B7280',
  muted: '#9CA3AF',
  accent: '#FF6B00',
  accentHover: '#EA580C',
};

interface SlideEditorProps {
  slides: SlideConfig[];
  tokens: DesignTokens;
  onUpdateSlide: (id: string, updates: Partial<SlideConfig>) => void;
  onReorderSlides: (ids: string[]) => void;
}

export function SlideEditor({
  slides,
  tokens,
  onUpdateSlide,
  onReorderSlides,
}: SlideEditorProps) {
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(
    slides[0]?.id || null
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const selectedSlide = slides.find((s) => s.id === selectedSlideId);

  // 드래그 앤 드롭 핸들러
  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = slides.findIndex((s) => s.id === draggedId);
    const targetIndex = slides.findIndex((s) => s.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newOrder = [...slides.map((s) => s.id)];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedId);
      onReorderSlides(newOrder);
    }
  }, [draggedId, slides, onReorderSlides]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);

  // 레이아웃 변경
  const handleLayoutChange = useCallback(
    (layout: SlideLayoutType) => {
      if (selectedSlideId) {
        onUpdateSlide(selectedSlideId, { layout });
      }
    },
    [selectedSlideId, onUpdateSlide]
  );

  // 콘텐츠 변경
  const handleContentChange = useCallback(
    (field: string, value: string | string[]) => {
      if (selectedSlideId && selectedSlide) {
        onUpdateSlide(selectedSlideId, {
          content: {
            ...selectedSlide.content,
            [field]: value,
          },
        });
      }
    },
    [selectedSlideId, selectedSlide, onUpdateSlide]
  );

  return (
    <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
      {/* 슬라이드 목록 (왼쪽) */}
      <div
        style={{
          width: '200px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '8px',
          backgroundColor: COLORS.bg,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={() => handleDragStart(slide.id)}
            onDragOver={(e) => handleDragOver(e, slide.id)}
            onDragEnd={handleDragEnd}
            style={{
              opacity: draggedId === slide.id ? 0.5 : 1,
              cursor: 'grab',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  color: COLORS.muted,
                  width: '20px',
                }}
              >
                {index + 1}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: COLORS.sub,
                  textTransform: 'uppercase',
                }}
              >
                {slide.layout}
              </span>
            </div>
            <SlidePreview
              slide={slide}
              tokens={tokens}
              scale={0.55}
              isSelected={slide.id === selectedSlideId}
              onClick={() => setSelectedSlideId(slide.id)}
            />
          </div>
        ))}
      </div>

      {/* 메인 프리뷰 (중앙) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {selectedSlide && (
          <>
            <SlidePreview slide={selectedSlide} tokens={tokens} scale={1.8} />

            {/* 레이아웃 선택 */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 600, color: COLORS.text }}>
                레이아웃
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {LAYOUT_OPTIONS.map((layout) => (
                  <button
                    key={layout.value}
                    onClick={() => handleLayoutChange(layout.value)}
                    style={{
                      padding: '8px 14px',
                      border: selectedSlide.layout === layout.value
                        ? `2px solid ${COLORS.accent}`
                        : `1px solid ${COLORS.border}`,
                      borderRadius: '8px',
                      backgroundColor: selectedSlide.layout === layout.value
                        ? 'rgba(255, 107, 0, 0.15)'
                        : COLORS.card,
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: selectedSlide.layout === layout.value ? COLORS.accent : COLORS.sub,
                      transition: 'all 0.15s',
                    }}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 콘텐츠 편집 (오른쪽) */}
      <div
        style={{
          width: '280px',
          padding: '16px',
          backgroundColor: COLORS.card,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
          overflowY: 'auto',
        }}
      >
        {selectedSlide ? (
          <ContentEditor
            slide={selectedSlide}
            onContentChange={handleContentChange}
          />
        ) : (
          <p style={{ color: COLORS.muted, fontSize: '13px' }}>슬라이드를 선택하세요</p>
        )}
      </div>
    </div>
  );
}

// 콘텐츠 에디터
interface ContentEditorProps {
  slide: SlideConfig;
  onContentChange: (field: string, value: string | string[]) => void;
}

function ContentEditor({ slide, onContentChange }: ContentEditorProps) {
  const { content } = slide;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    fontSize: '13px',
    boxSizing: 'border-box',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: COLORS.muted,
    display: 'block',
    marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '14px', color: COLORS.text, fontWeight: 600 }}>
        콘텐츠 편집
      </h3>

      {/* 제목 */}
      <div>
        <label style={labelStyle}>제목</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onContentChange('title', e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* 부제목 */}
      <div>
        <label style={labelStyle}>부제목</label>
        <input
          type="text"
          value={content.subtitle || ''}
          onChange={(e) => onContentChange('subtitle', e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* 본문 */}
      <div>
        <label style={labelStyle}>본문</label>
        <textarea
          value={typeof content.body === 'string' ? content.body : content.body?.join('\n') || ''}
          onChange={(e) => onContentChange('body', e.target.value)}
          rows={4}
          style={{
            ...inputStyle,
            resize: 'vertical',
          }}
        />
      </div>

      {/* 불릿 포인트 */}
      <div>
        <label style={labelStyle}>불릿 포인트 (줄바꿈으로 구분)</label>
        <textarea
          value={content.bulletPoints?.join('\n') || ''}
          onChange={(e) =>
            onContentChange(
              'bulletPoints',
              e.target.value.split('\n').filter((line) => line.trim())
            )
          }
          rows={4}
          style={{
            ...inputStyle,
            resize: 'vertical',
          }}
        />
      </div>

      {/* 발표자 노트 */}
      <div>
        <label style={labelStyle}>발표자 노트</label>
        <textarea
          value={slide.notes || ''}
          onChange={(e) => onContentChange('notes', e.target.value)}
          rows={3}
          placeholder="발표 시 참고할 메모..."
          style={{
            ...inputStyle,
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  );
}

// 레이아웃 옵션
const LAYOUT_OPTIONS: { value: SlideLayoutType; label: string }[] = [
  { value: 'title', label: '타이틀' },
  { value: 'section-header', label: '섹션 헤더' },
  { value: 'content', label: '콘텐츠' },
  { value: 'two-column', label: '2단' },
  { value: 'image-left', label: '이미지 (좌)' },
  { value: 'image-right', label: '이미지 (우)' },
  { value: 'chart', label: '차트' },
  { value: 'quote', label: '인용' },
  { value: 'closing', label: '클로징' },
];

export default SlideEditor;

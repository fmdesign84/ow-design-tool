import React from 'react';
import { SlideConfig, DesignTokens, ChartData } from '../types';
import { generateChartColors } from '../utils/chartGenerator';

interface SlidePreviewProps {
  slide: SlideConfig;
  tokens: DesignTokens;
  scale?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SlidePreview({
  slide,
  tokens,
  scale = 1,
  isSelected = false,
  onClick,
}: SlidePreviewProps) {
  const width = 320 * scale;
  const height = 180 * scale;
  const fontSize = (size: number) => size * scale;

  return (
    <div
      onClick={onClick}
      style={{
        width,
        height,
        backgroundColor: tokens.colors.background,
        borderRadius: 8 * scale,
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isSelected
          ? '0 0 0 3px #0066ff, 0 4px 12px rgba(0,0,0,0.15)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* 악센트 바 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 3 * scale,
          height: '100%',
          backgroundColor: tokens.colors.primary,
        }}
      />

      {/* 레이아웃별 렌더링 */}
      {renderSlideContent(slide, tokens, scale, fontSize)}
    </div>
  );
}

function renderSlideContent(
  slide: SlideConfig,
  tokens: DesignTokens,
  scale: number,
  fontSize: (size: number) => number
): React.ReactNode {
  const { layout, content } = slide;

  switch (layout) {
    case 'title':
      return (
        <div style={{ padding: 20 * scale }}>
          <p
            style={{
              margin: 0,
              fontSize: fontSize(6),
              color: tokens.colors.primary,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {content.subtitle?.slice(0, 30) || 'PRESENTATION'}
          </p>
          <p
            style={{
              margin: `${8 * scale}px 0 0`,
              fontSize: fontSize(18),
              fontWeight: 700,
              color: tokens.colors.foreground,
              lineHeight: 1.2,
            }}
          >
            {content.title?.slice(0, 40) || '제목'}
          </p>
        </div>
      );

    case 'section-header':
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: tokens.colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20 * scale,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: fontSize(16),
              fontWeight: 700,
              color: tokens.colors.primaryForeground,
              textAlign: 'center',
            }}
          >
            {content.title?.slice(0, 50) || '섹션 제목'}
          </p>
        </div>
      );

    case 'content':
      return (
        <div style={{ padding: 16 * scale }}>
          <p
            style={{
              margin: 0,
              fontSize: fontSize(11),
              fontWeight: 700,
              color: tokens.colors.foreground,
            }}
          >
            {content.title?.slice(0, 40) || '슬라이드 제목'}
          </p>
          <div style={{ marginTop: 8 * scale }}>
            {content.bulletPoints?.slice(0, 3).map((point, i) => (
              <p
                key={i}
                style={{
                  margin: `${4 * scale}px 0 0`,
                  fontSize: fontSize(7),
                  color: tokens.colors.mutedForeground,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 4 * scale,
                }}
              >
                <span style={{ color: tokens.colors.primary }}>•</span>
                <span>{point.slice(0, 50)}</span>
              </p>
            )) ||
              (content.body && (
                <p
                  style={{
                    margin: `${4 * scale}px 0 0`,
                    fontSize: fontSize(7),
                    color: tokens.colors.mutedForeground,
                  }}
                >
                  {typeof content.body === 'string'
                    ? content.body.slice(0, 100)
                    : content.body[0]?.slice(0, 100)}
                </p>
              ))}
          </div>
        </div>
      );

    case 'image-left':
    case 'image-right':
      const isLeft = layout === 'image-left';
      return (
        <div style={{ display: 'flex', height: '100%' }}>
          {isLeft && (
            <div
              style={{
                width: '45%',
                backgroundColor: tokens.colors.muted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {content.image ? (
                <img
                  src={content.image.url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ImagePlaceholder size={24 * scale} color={tokens.colors.mutedForeground} />
              )}
            </div>
          )}
          <div style={{ flex: 1, padding: 12 * scale }}>
            <p
              style={{
                margin: 0,
                fontSize: fontSize(10),
                fontWeight: 700,
                color: tokens.colors.foreground,
              }}
            >
              {content.title?.slice(0, 30) || '제목'}
            </p>
            <p
              style={{
                margin: `${6 * scale}px 0 0`,
                fontSize: fontSize(6),
                color: tokens.colors.mutedForeground,
              }}
            >
              {typeof content.body === 'string' ? content.body.slice(0, 80) : ''}
            </p>
          </div>
          {!isLeft && (
            <div
              style={{
                width: '45%',
                backgroundColor: tokens.colors.muted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {content.image ? (
                <img
                  src={content.image.url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ImagePlaceholder size={24 * scale} color={tokens.colors.mutedForeground} />
              )}
            </div>
          )}
        </div>
      );

    case 'chart':
      return (
        <div style={{ padding: 12 * scale }}>
          <p
            style={{
              margin: 0,
              fontSize: fontSize(10),
              fontWeight: 700,
              color: tokens.colors.foreground,
            }}
          >
            {content.title?.slice(0, 40) || '차트'}
          </p>
          <div
            style={{
              marginTop: 8 * scale,
              height: 120 * scale,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              padding: `0 ${10 * scale}px`,
            }}
          >
            {content.chart ? (
              <MiniChart chart={content.chart} tokens={tokens} scale={scale} />
            ) : (
              <ChartPlaceholder size={40 * scale} color={tokens.colors.mutedForeground} />
            )}
          </div>
        </div>
      );

    case 'quote':
      return (
        <div
          style={{
            height: '100%',
            backgroundColor: tokens.colors.secondary,
            padding: 16 * scale,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: fontSize(24),
              color: tokens.colors.primary,
              fontFamily: 'Georgia, serif',
            }}
          >
            "
          </p>
          <p
            style={{
              margin: `${-8 * scale}px 0 ${8 * scale}px ${8 * scale}px`,
              fontSize: fontSize(9),
              fontStyle: 'italic',
              color: tokens.colors.foreground,
            }}
          >
            {content.quote?.text.slice(0, 80) || '인용문'}
          </p>
          {content.quote?.author && (
            <p
              style={{
                margin: 0,
                marginLeft: 8 * scale,
                fontSize: fontSize(6),
                color: tokens.colors.mutedForeground,
              }}
            >
              — {content.quote.author}
            </p>
          )}
        </div>
      );

    case 'closing':
      return (
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16 * scale,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: fontSize(16),
              fontWeight: 700,
              color: tokens.colors.foreground,
            }}
          >
            {content.title || '감사합니다'}
          </p>
          {content.subtitle && (
            <p
              style={{
                margin: `${8 * scale}px 0 0`,
                fontSize: fontSize(8),
                color: tokens.colors.mutedForeground,
              }}
            >
              {content.subtitle}
            </p>
          )}
        </div>
      );

    default:
      return (
        <div style={{ padding: 16 * scale }}>
          <p
            style={{
              margin: 0,
              fontSize: fontSize(10),
              fontWeight: 700,
              color: tokens.colors.foreground,
            }}
          >
            {content.title || '슬라이드'}
          </p>
        </div>
      );
  }
}

// 미니 차트 컴포넌트
function MiniChart({
  chart,
  tokens,
  scale,
}: {
  chart: ChartData;
  tokens: DesignTokens;
  scale: number;
}) {
  const colors = generateChartColors(chart.datasets.length, tokens);
  const maxValue = Math.max(...chart.datasets.flatMap((d) => d.values));

  if (chart.type === 'pie') {
    return (
      <div
        style={{
          width: 60 * scale,
          height: 60 * scale,
          borderRadius: '50%',
          background: `conic-gradient(${chart.datasets[0]?.values
            .map((v, i, arr) => {
              const start =
                arr.slice(0, i).reduce((a, b) => a + b, 0) / arr.reduce((a, b) => a + b, 0);
              const end = (start * 100 + (v / arr.reduce((a, b) => a + b, 0)) * 100);
              return `#${colors[i % colors.length]} ${start * 100}% ${end}%`;
            })
            .join(', ')})`,
        }}
      />
    );
  }

  // 바 차트
  return (
    <>
      {chart.datasets[0]?.values.slice(0, 5).map((value, i) => (
        <div
          key={i}
          style={{
            width: 16 * scale,
            height: `${(value / maxValue) * 100 * scale}px`,
            backgroundColor: `#${colors[0]}`,
            borderRadius: `${2 * scale}px ${2 * scale}px 0 0`,
          }}
        />
      ))}
    </>
  );
}

// 플레이스홀더 아이콘
function ImagePlaceholder({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function ChartPlaceholder({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export default SlidePreview;

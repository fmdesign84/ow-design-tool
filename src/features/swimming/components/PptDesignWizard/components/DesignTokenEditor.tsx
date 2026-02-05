/**
 * Design Token Editor - Swimming/Wave 다크 테마
 * PPT 디자인 토큰 (컬러, 폰트) 편집 UI
 */
import React, { useState, useCallback } from 'react';
import { DesignTokens } from '../types';
import { themePresets } from '../utils/designTokenExtractor';

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

interface DesignTokenEditorProps {
  tokens: DesignTokens;
  onChange: (tokens: DesignTokens) => void;
}

export function DesignTokenEditor({ tokens, onChange }: DesignTokenEditorProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'typography'>('presets');
  const [customizing, setCustomizing] = useState(false);

  // 프리셋 선택
  const selectPreset = useCallback(
    (presetKey: string) => {
      const preset = themePresets[presetKey];
      if (preset) {
        onChange(preset);
        setCustomizing(false);
      }
    },
    [onChange]
  );

  // 색상 변경
  const updateColor = useCallback(
    (colorKey: keyof DesignTokens['colors'], value: string) => {
      onChange({
        ...tokens,
        colors: {
          ...tokens.colors,
          [colorKey]: value,
        },
      });
      setCustomizing(true);
    },
    [tokens, onChange]
  );

  // 폰트 변경
  const updateFont = useCallback(
    (fontKey: keyof DesignTokens['typography']['fontFamily'], value: string) => {
      onChange({
        ...tokens,
        typography: {
          ...tokens.typography,
          fontFamily: {
            ...tokens.typography.fontFamily,
            [fontKey]: value,
          },
        },
      });
      setCustomizing(true);
    },
    [tokens, onChange]
  );

  return (
    <div style={{ backgroundColor: COLORS.card, borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
      {/* 탭 헤더 */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}` }}>
        {(['presets', 'colors', 'typography'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '14px 16px',
              border: 'none',
              backgroundColor: activeTab === tab ? COLORS.card : COLORS.bg,
              borderBottom: activeTab === tab ? `2px solid ${COLORS.accent}` : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? COLORS.accent : COLORS.muted,
              transition: 'all 0.15s',
            }}
          >
            {tab === 'presets' && '프리셋'}
            {tab === 'colors' && '컬러'}
            {tab === 'typography' && '타이포그래피'}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ padding: '20px' }}>
        {/* 프리셋 탭 */}
        {activeTab === 'presets' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {Object.entries(themePresets).map(([key, preset]) => (
              <PresetCard
                key={key}
                name={key}
                preset={preset}
                isSelected={!customizing && JSON.stringify(tokens.colors) === JSON.stringify(preset.colors)}
                onSelect={() => selectPreset(key)}
              />
            ))}
          </div>
        )}

        {/* 컬러 탭 */}
        {activeTab === 'colors' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {(Object.entries(tokens.colors) as [keyof DesignTokens['colors'], string][]).map(
              ([key, value]) => (
                <ColorInput
                  key={key}
                  label={formatColorLabel(key)}
                  value={value}
                  onChange={(v) => updateColor(key, v)}
                />
              )
            )}
          </div>
        )}

        {/* 타이포그래피 탭 */}
        {activeTab === 'typography' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 폰트 패밀리 */}
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: COLORS.text }}>
                폰트 패밀리
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {(Object.entries(tokens.typography.fontFamily) as [keyof DesignTokens['typography']['fontFamily'], string][]).map(
                  ([key, value]) => (
                    <div key={key}>
                      <label style={{ fontSize: '11px', color: COLORS.muted, display: 'block', marginBottom: '6px' }}>
                        {key === 'heading' ? '제목' : key === 'body' ? '본문' : '코드'}
                      </label>
                      <select
                        value={value.split(',')[0]}
                        onChange={(e) => updateFont(key, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: '8px',
                          fontSize: '13px',
                          backgroundColor: COLORS.bg,
                          color: COLORS.text,
                          cursor: 'pointer',
                        }}
                      >
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Impact">Impact</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 미리보기 */}
            <div style={{
              padding: '20px',
              backgroundColor: tokens.colors.background,
              borderRadius: '10px',
              border: `1px solid ${COLORS.border}`,
            }}>
              <h3 style={{
                fontFamily: tokens.typography.fontFamily.heading,
                fontSize: '20px',
                color: tokens.colors.foreground,
                margin: '0 0 10px',
              }}>
                제목 미리보기
              </h3>
              <p style={{
                fontFamily: tokens.typography.fontFamily.body,
                fontSize: '14px',
                color: tokens.colors.mutedForeground,
                margin: 0,
                lineHeight: 1.6,
              }}>
                본문 텍스트 미리보기입니다. 이 텍스트는 선택한 폰트로 표시됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 프리셋 카드 컴포넌트
interface PresetCardProps {
  name: string;
  preset: DesignTokens;
  isSelected: boolean;
  onSelect: () => void;
}

function PresetCard({ name, preset, isSelected, onSelect }: PresetCardProps) {
  const formatName = (key: string) => {
    return key
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '16px',
        borderRadius: '10px',
        border: isSelected ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
        cursor: 'pointer',
        backgroundColor: preset.colors.background,
        transition: 'all 0.2s ease',
      }}
    >
      {/* 컬러 팔레트 미리보기 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {[preset.colors.primary, preset.colors.secondary, preset.colors.accent, preset.colors.muted].map(
          (color, i) => (
            <div
              key={i}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                backgroundColor: color,
                border: color === '#ffffff' ? `1px solid ${COLORS.border}` : 'none',
              }}
            />
          )
        )}
      </div>

      {/* 이름 */}
      <p style={{
        margin: 0,
        fontSize: '13px',
        fontWeight: 600,
        color: preset.colors.foreground,
      }}>
        {formatName(name)}
      </p>
    </div>
  );
}

// 컬러 입력 컴포넌트
interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      backgroundColor: COLORS.bg,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
    }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '36px',
          height: '36px',
          padding: 0,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '8px',
          cursor: 'pointer',
          backgroundColor: 'transparent',
        }}
      />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: COLORS.text }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: COLORS.muted }}>{value}</p>
      </div>
    </div>
  );
}

// 라벨 포맷팅
function formatColorLabel(key: string): string {
  const labels: Record<string, string> = {
    primary: 'Primary',
    primaryForeground: 'Primary Text',
    secondary: 'Secondary',
    secondaryForeground: 'Secondary Text',
    accent: 'Accent',
    accentForeground: 'Accent Text',
    background: 'Background',
    foreground: 'Foreground',
    muted: 'Muted',
    mutedForeground: 'Muted Text',
    border: 'Border',
  };
  return labels[key] || key;
}

export default DesignTokenEditor;

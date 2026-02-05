import { DesignTokens } from '../types';

/**
 * 차트 색상 생성 유틸리티
 */

export function generateChartColors(count: number, tokens: DesignTokens): string[] {
  const baseColors = [
    tokens.colors.primary,
    tokens.colors.accent,
    tokens.colors.secondary,
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  return colors;
}

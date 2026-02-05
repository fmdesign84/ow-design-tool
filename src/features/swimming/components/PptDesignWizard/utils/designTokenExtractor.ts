import { DesignTokens } from '../types';

/**
 * 디자인 토큰 추출 유틸리티
 * PPT, CSS, JSON 등에서 디자인 토큰을 추출
 */

// 기본 디자인 토큰 (Deep Ocean 테마)
export const defaultDesignTokens: DesignTokens = {
  colors: {
    primary: '#64ffda',
    primaryForeground: '#0a192f',
    secondary: '#112240',
    secondaryForeground: '#8892b0',
    accent: '#64ffda',
    accentForeground: '#0a192f',
    background: '#0a192f',
    foreground: '#ccd6f6',
    muted: '#233554',
    mutedForeground: '#8892b0',
    border: '#233554',
  },
  typography: {
    fontFamily: {
      heading: 'Georgia, serif',
      body: 'Arial, sans-serif',
      mono: 'Courier New, monospace',
    },
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '40px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
};

// 프리셋 테마들
export const themePresets: Record<string, DesignTokens> = {
  'deep-ocean': defaultDesignTokens,

  'minimal-light': {
    ...defaultDesignTokens,
    colors: {
      primary: '#000000',
      primaryForeground: '#ffffff',
      secondary: '#f5f5f5',
      secondaryForeground: '#333333',
      accent: '#0066ff',
      accentForeground: '#ffffff',
      background: '#ffffff',
      foreground: '#1a1a1a',
      muted: '#f0f0f0',
      mutedForeground: '#666666',
      border: '#e0e0e0',
    },
  },

  'editorial-dark': {
    ...defaultDesignTokens,
    colors: {
      primary: '#e94560',
      primaryForeground: '#ffffff',
      secondary: '#16213e',
      secondaryForeground: '#a0a0a0',
      accent: '#e94560',
      accentForeground: '#ffffff',
      background: '#1a1a2e',
      foreground: '#ffffff',
      muted: '#16213e',
      mutedForeground: '#8888aa',
      border: '#2a2a4e',
    },
  },

  'art-deco': {
    ...defaultDesignTokens,
    colors: {
      primary: '#d4af37',
      primaryForeground: '#0f0f0f',
      secondary: '#1a1a1a',
      secondaryForeground: '#cccccc',
      accent: '#d4af37',
      accentForeground: '#0f0f0f',
      background: '#0f0f0f',
      foreground: '#ffffff',
      muted: '#1a1a1a',
      mutedForeground: '#999999',
      border: '#333333',
    },
    typography: {
      ...defaultDesignTokens.typography,
      fontFamily: {
        heading: 'Georgia, serif',
        body: 'Arial, sans-serif',
        mono: 'Courier New, monospace',
      },
    },
  },

  'organic-natural': {
    ...defaultDesignTokens,
    colors: {
      primary: '#5d4e37',
      primaryForeground: '#ffffff',
      secondary: '#e8dfd1',
      secondaryForeground: '#3d3d3d',
      accent: '#7a9e7e',
      accentForeground: '#ffffff',
      background: '#f5f0e8',
      foreground: '#3d3d3d',
      muted: '#e8dfd1',
      mutedForeground: '#666666',
      border: '#d4c9b9',
    },
  },
};

/**
 * CSS 파일에서 디자인 토큰 추출
 */
export function extractTokensFromCSS(cssContent: string): Partial<DesignTokens> {
  const tokens: Partial<DesignTokens> = {
    colors: {} as DesignTokens['colors'],
  };

  // CSS 변수 추출 (--color-xxx, --font-xxx 등)
  const cssVarRegex = /--([a-zA-Z-]+):\s*([^;]+);/g;
  let match;

  while ((match = cssVarRegex.exec(cssContent)) !== null) {
    const [, name, value] = match;
    const cleanValue = value.trim();

    // 컬러 변수
    if (name.startsWith('color-')) {
      const colorName = name.replace('color-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (tokens.colors) {
        (tokens.colors as Record<string, string>)[colorName] = cleanValue;
      }
    }

    // 폰트 변수
    if (name.startsWith('font-')) {
      if (!tokens.typography) {
        tokens.typography = {} as DesignTokens['typography'];
      }
      // 추가 처리 로직
    }
  }

  return tokens;
}

/**
 * JSON에서 디자인 토큰 추출
 */
export function extractTokensFromJSON(jsonContent: string): Partial<DesignTokens> {
  try {
    const parsed = JSON.parse(jsonContent);

    // 이미 DesignTokens 형식인 경우
    if (parsed.colors && parsed.typography) {
      return parsed as DesignTokens;
    }

    // Figma/Style Dictionary 형식 변환
    if (parsed.color || parsed.colors) {
      return convertFromFigmaTokens(parsed);
    }

    return {};
  } catch (e) {
    console.error('Failed to parse JSON tokens:', e);
    return {};
  }
}

/**
 * Figma 토큰 형식을 우리 형식으로 변환
 */
function convertFromFigmaTokens(figmaTokens: Record<string, unknown>): Partial<DesignTokens> {
  const tokens: Partial<DesignTokens> = {
    colors: {} as DesignTokens['colors'],
  };

  // Figma 컬러 토큰 변환
  const colors = figmaTokens.color || figmaTokens.colors;
  if (colors && typeof colors === 'object') {
    Object.entries(colors as Record<string, unknown>).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (tokens.colors) {
          (tokens.colors as Record<string, string>)[camelKey] = value;
        }
      } else if (typeof value === 'object' && value !== null && 'value' in value) {
        const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (tokens.colors) {
          (tokens.colors as Record<string, string>)[camelKey] = (value as { value: string }).value;
        }
      }
    });
  }

  return tokens;
}

/**
 * PPT에서 테마 색상 추출 (서버사이드에서 처리 필요)
 * 이 함수는 프론트엔드에서는 파일을 서버로 전송하는 역할만 함
 */
export async function extractTokensFromPPT(file: File): Promise<Partial<DesignTokens>> {
  // 실제 구현에서는 서버 API 호출
  // 여기서는 placeholder
  console.log('Extracting tokens from PPT:', file.name);

  return {
    colors: {
      ...defaultDesignTokens.colors,
    },
  };
}

/**
 * 디자인 토큰 병합 (기본값 + 추출된 값)
 */
export function mergeTokens(
  base: DesignTokens,
  overrides: Partial<DesignTokens>
): DesignTokens {
  return {
    colors: { ...base.colors, ...overrides.colors },
    typography: {
      fontFamily: { ...base.typography.fontFamily, ...overrides.typography?.fontFamily },
      fontSize: { ...base.typography.fontSize, ...overrides.typography?.fontSize },
      fontWeight: { ...base.typography.fontWeight, ...overrides.typography?.fontWeight },
      lineHeight: { ...base.typography.lineHeight, ...overrides.typography?.lineHeight },
    },
    spacing: { ...base.spacing, ...overrides.spacing },
    borderRadius: { ...base.borderRadius, ...overrides.borderRadius },
  };
}

/**
 * 디자인 토큰을 CSS 변수로 변환
 */
export function tokensToCSSVariables(tokens: DesignTokens): string {
  const lines: string[] = [':root {'];

  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    lines.push(`  --color-${cssKey}: ${value};`);
  });

  // Typography
  Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
    lines.push(`  --font-family-${key}: ${value};`);
  });
  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    lines.push(`  --font-size-${key}: ${value};`);
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    lines.push(`  --spacing-${key}: ${value};`);
  });

  // Border Radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });

  lines.push('}');
  return lines.join('\n');
}

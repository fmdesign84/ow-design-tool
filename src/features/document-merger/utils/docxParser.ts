/**
 * DOCX 완전 파싱 엔진
 * 문서 구조(헤딩/본문/목록)와 모든 스타일을 정확히 추출
 */

import {
  DocumentElement,
  DocumentStyleMap,
  ElementStyle,
  ElementType,
  ParsedDocument,
  TextRun,
  DEFAULT_STYLE_MAP,
} from '../types';

// ===== 헬퍼: 속성값 가져오기 =====
function getAttr(el: Element | null, attr: string): string | null {
  if (!el) return null;
  return el.getAttribute(`w:${attr}`) || el.getAttribute(attr);
}

function getAttrNum(el: Element | null, attr: string): number | null {
  const val = getAttr(el, attr);
  return val ? parseInt(val, 10) : null;
}

// ===== 스타일 ID를 ElementType으로 변환 =====
function styleIdToElementType(styleId: string, styleName: string): ElementType {
  const id = styleId.toLowerCase();
  const name = styleName.toLowerCase();

  // 헤딩 판별
  if (id.includes('heading1') || id === 'h1' || name.includes('제목 1') || name.includes('heading 1')) {
    return 'heading1';
  }
  if (id.includes('heading2') || id === 'h2' || name.includes('제목 2') || name.includes('heading 2')) {
    return 'heading2';
  }
  if (id.includes('heading3') || id === 'h3' || name.includes('제목 3') || name.includes('heading 3')) {
    return 'heading3';
  }
  if (id.includes('heading4') || id === 'h4' || name.includes('제목 4') || name.includes('heading 4')) {
    return 'heading4';
  }

  // 목록 판별 (나중에 numPr로 덮어씀)
  if (id.includes('listparagraph') || id.includes('list') || name.includes('목록')) {
    return 'listBullet';
  }

  return 'paragraph';
}

// ===== 스타일 문서(styles.xml) 파싱 =====
async function parseStyles(zip: any): Promise<{
  styleMap: Map<string, { type: ElementType; style: Partial<ElementStyle>; name: string }>;
  defaultStyle: Partial<ElementStyle>;
}> {
  const styleMap = new Map<string, { type: ElementType; style: Partial<ElementStyle>; name: string }>();
  let defaultStyle: Partial<ElementStyle> = {};

  try {
    const stylesXml = await zip.file('word/styles.xml')?.async('string');
    if (!stylesXml) return { styleMap, defaultStyle };

    const parser = new DOMParser();
    const doc = parser.parseFromString(stylesXml, 'application/xml');

    // 기본 스타일 (docDefaults)
    const docDefaults = doc.querySelector('docDefaults');
    if (docDefaults) {
      const rPrDefault = docDefaults.querySelector('rPrDefault rPr');
      if (rPrDefault) {
        defaultStyle = extractRunStyle(rPrDefault);
      }
      const pPrDefault = docDefaults.querySelector('pPrDefault pPr');
      if (pPrDefault) {
        defaultStyle = { ...defaultStyle, ...extractParaStyle(pPrDefault) };
      }
    }

    // 모든 스타일 파싱
    const styles = doc.querySelectorAll('style');
    styles.forEach(styleEl => {
      const styleId = getAttr(styleEl, 'styleId');
      const styleType = getAttr(styleEl, 'type');
      if (!styleId || styleType !== 'paragraph') return;

      const nameEl = styleEl.querySelector('name');
      const styleName = getAttr(nameEl, 'val') || styleId;

      const elementType = styleIdToElementType(styleId, styleName);
      const style: Partial<ElementStyle> = {};

      // 텍스트 스타일
      const rPr = styleEl.querySelector('rPr');
      if (rPr) {
        Object.assign(style, extractRunStyle(rPr));
      }

      // 단락 스타일
      const pPr = styleEl.querySelector('pPr');
      if (pPr) {
        Object.assign(style, extractParaStyle(pPr));
      }

      styleMap.set(styleId, { type: elementType, style, name: styleName });
    });
  } catch (e) {
    console.warn('스타일 파싱 오류:', e);
  }

  return { styleMap, defaultStyle };
}

// ===== 텍스트 런 스타일 추출 =====
function extractRunStyle(rPr: Element): Partial<ElementStyle> {
  const style: Partial<ElementStyle> = {};

  // 폰트
  const rFonts = rPr.querySelector('rFonts');
  if (rFonts) {
    const font = getAttr(rFonts, 'eastAsia') || getAttr(rFonts, 'ascii') || getAttr(rFonts, 'hAnsi');
    if (font) style.fontFamily = font;
  }

  // 크기 (half-points → points)
  const sz = rPr.querySelector('sz');
  if (sz) {
    const val = getAttrNum(sz, 'val');
    if (val) style.fontSize = val / 2;
  }

  // 색상
  const color = rPr.querySelector('color');
  if (color) {
    const val = getAttr(color, 'val');
    if (val && val !== 'auto') {
      style.fontColor = val.startsWith('#') ? val : `#${val}`;
    }
  }

  // Bold
  const b = rPr.querySelector('b');
  if (b) {
    const val = getAttr(b, 'val');
    style.bold = val !== '0' && val !== 'false';
  }

  // Italic
  const i = rPr.querySelector('i');
  if (i) {
    const val = getAttr(i, 'val');
    style.italic = val !== '0' && val !== 'false';
  }

  // Underline
  const u = rPr.querySelector('u');
  if (u) {
    const val = getAttr(u, 'val');
    style.underline = val !== 'none' && !!val;
  }

  return style;
}

// ===== 단락 스타일 추출 =====
function extractParaStyle(pPr: Element): Partial<ElementStyle> {
  const style: Partial<ElementStyle> = {};

  // 정렬
  const jc = pPr.querySelector('jc');
  if (jc) {
    const val = getAttr(jc, 'val');
    const alignMap: Record<string, 'left' | 'center' | 'right' | 'justify'> = {
      left: 'left',
      start: 'left',
      center: 'center',
      right: 'right',
      end: 'right',
      both: 'justify',
      justify: 'justify',
    };
    if (val) style.alignment = alignMap[val.toLowerCase()] || 'left';
  }

  // 줄간격
  const spacing = pPr.querySelector('spacing');
  if (spacing) {
    const line = getAttrNum(spacing, 'line');
    const lineRule = getAttr(spacing, 'lineRule');
    if (line) {
      // auto일 때 240 = 1줄
      if (lineRule === 'auto' || !lineRule) {
        style.lineSpacing = line / 240;
      }
    }

    const before = getAttrNum(spacing, 'before');
    if (before) style.spaceBefore = before / 20; // twips to pt

    const after = getAttrNum(spacing, 'after');
    if (after) style.spaceAfter = after / 20;
  }

  // 들여쓰기
  const ind = pPr.querySelector('ind');
  if (ind) {
    const left = getAttrNum(ind, 'left');
    if (left) style.indentLeft = left / 20;

    const firstLine = getAttrNum(ind, 'firstLine');
    if (firstLine) style.indentFirstLine = firstLine / 20;
  }

  return style;
}

// ===== 넘버링 정의 파싱 =====
async function parseNumbering(zip: any): Promise<Map<string, { numId: string; format: string; lvlText: string }[]>> {
  const numberingMap = new Map<string, { numId: string; format: string; lvlText: string }[]>();

  try {
    const numberingXml = await zip.file('word/numbering.xml')?.async('string');
    if (!numberingXml) return numberingMap;

    const parser = new DOMParser();
    const doc = parser.parseFromString(numberingXml, 'application/xml');

    // abstractNum 파싱
    const abstractNums = doc.querySelectorAll('abstractNum');
    const abstractMap = new Map<string, { format: string; lvlText: string }[]>();

    abstractNums.forEach(abstractNum => {
      const abstractNumId = getAttr(abstractNum, 'abstractNumId');
      if (!abstractNumId) return;

      const levels: { format: string; lvlText: string }[] = [];
      const lvls = abstractNum.querySelectorAll('lvl');

      lvls.forEach(lvl => {
        const numFmt = lvl.querySelector('numFmt');
        const lvlText = lvl.querySelector('lvlText');

        levels.push({
          format: getAttr(numFmt, 'val') || 'decimal',
          lvlText: getAttr(lvlText, 'val') || '%1.',
        });
      });

      abstractMap.set(abstractNumId, levels);
    });

    // num → abstractNum 매핑
    const nums = doc.querySelectorAll('num');
    nums.forEach(num => {
      const numId = getAttr(num, 'numId');
      const abstractNumIdRef = num.querySelector('abstractNumId');
      const abstractNumId = getAttr(abstractNumIdRef, 'val');

      if (numId && abstractNumId) {
        const levels = abstractMap.get(abstractNumId);
        if (levels) {
          numberingMap.set(numId, levels.map(l => ({ numId, ...l })));
        }
      }
    });
  } catch (e) {
    console.warn('넘버링 파싱 오류:', e);
  }

  return numberingMap;
}

// ===== 텍스트 런 파싱 =====
function parseTextRuns(paragraph: Element): TextRun[] {
  const runs: TextRun[] = [];

  const rElements = paragraph.querySelectorAll('r');
  rElements.forEach(r => {
    const texts: string[] = [];

    // 모든 텍스트 노드 수집
    r.querySelectorAll('t').forEach(t => {
      texts.push(t.textContent || '');
    });

    if (texts.length === 0) return;

    const run: TextRun = {
      text: texts.join(''),
    };

    // 런 스타일
    const rPr = r.querySelector('rPr');
    if (rPr) {
      const style = extractRunStyle(rPr);
      if (style.bold) run.bold = true;
      if (style.italic) run.italic = true;
      if (style.underline) run.underline = true;
      if (style.fontSize) run.fontSize = style.fontSize;
      if (style.fontFamily) run.fontFamily = style.fontFamily;
      if (style.fontColor) run.color = style.fontColor;
    }

    runs.push(run);
  });

  return runs;
}

// ===== 메인 문서 파싱 =====
export async function parseDocx(file: File): Promise<{
  elements: DocumentElement[];
  styleMap: DocumentStyleMap;
  structure: ParsedDocument['structure'];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 스타일과 넘버링 파싱
  const { styleMap: styleDefMap, defaultStyle } = await parseStyles(zip);
  const numberingMap = await parseNumbering(zip);

  // 스타일맵 구성
  const resultStyleMap: DocumentStyleMap = JSON.parse(JSON.stringify(DEFAULT_STYLE_MAP));

  // 스타일 정의에서 추출한 스타일 적용
  styleDefMap.forEach(({ type, style }) => {
    const typeStr = type as string;
    if (typeStr in resultStyleMap && typeStr !== 'numberingFormats' && typeStr !== 'pageMargins') {
      Object.assign(resultStyleMap[typeStr as keyof Omit<DocumentStyleMap, 'numberingFormats' | 'pageMargins'>], style);
    }
  });

  // 기본 스타일 적용
  if (defaultStyle.fontFamily) {
    Object.keys(resultStyleMap).forEach(key => {
      if (key !== 'numberingFormats' && key !== 'pageMargins') {
        const styleKey = key as keyof Omit<DocumentStyleMap, 'numberingFormats' | 'pageMargins'>;
        if (!resultStyleMap[styleKey].fontFamily || resultStyleMap[styleKey].fontFamily === '맑은 고딕') {
          resultStyleMap[styleKey].fontFamily = defaultStyle.fontFamily!;
        }
      }
    });
  }

  // document.xml 파싱
  const documentXml = await zip.file('word/document.xml')?.async('string');
  if (!documentXml) {
    return {
      elements: [],
      styleMap: resultStyleMap,
      structure: {
        hasHeadings: false,
        headingLevels: [],
        hasNumberedList: false,
        hasBulletList: false,
        lastHeadingNumbers: [0, 0, 0, 0],
      },
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(documentXml, 'application/xml');

  const elements: DocumentElement[] = [];
  const structure: ParsedDocument['structure'] = {
    hasHeadings: false,
    headingLevels: [],
    hasNumberedList: false,
    hasBulletList: false,
    lastHeadingNumbers: [0, 0, 0, 0],
  };

  // 넘버링 카운터
  const listCounters = new Map<string, number[]>(); // numId → level별 카운터

  // 모든 단락 파싱
  const paragraphs = doc.querySelectorAll('p');
  let elementId = 0;

  paragraphs.forEach(p => {
    const runs = parseTextRuns(p);
    if (runs.length === 0 || runs.every(r => !r.text.trim())) return;

    const element: DocumentElement = {
      id: `el-${elementId++}`,
      type: 'paragraph',
      runs,
    };

    const pPr = p.querySelector('pPr');

    if (pPr) {
      // 스타일 ID 확인
      const pStyle = pPr.querySelector('pStyle');
      const styleId = getAttr(pStyle, 'val');

      if (styleId) {
        element.rawStyleId = styleId;
        const styleDef = styleDefMap.get(styleId);
        if (styleDef) {
          element.type = styleDef.type;
          element.rawStyleName = styleDef.name;
        }
      }

      // 넘버링 확인 (목록)
      const numPr = pPr.querySelector('numPr');
      if (numPr) {
        const numIdEl = numPr.querySelector('numId');
        const ilvlEl = numPr.querySelector('ilvl');
        const numId = getAttr(numIdEl, 'val');
        const ilvl = getAttrNum(ilvlEl, 'val') || 0;

        if (numId && numId !== '0') {
          const numDef = numberingMap.get(numId);
          if (numDef && numDef[ilvl]) {
            const format = numDef[ilvl].format;

            // 카운터 관리
            if (!listCounters.has(numId)) {
              listCounters.set(numId, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }
            const counters = listCounters.get(numId)!;

            // 현재 레벨 증가, 하위 레벨 리셋
            counters[ilvl]++;
            for (let i = ilvl + 1; i < counters.length; i++) {
              counters[i] = 0;
            }

            element.listLevel = ilvl;
            element.listNumber = counters[ilvl];

            // 타입 결정
            if (format === 'bullet') {
              element.type = 'listBullet';
              structure.hasBulletList = true;
            } else {
              element.type = 'listNumber';
              structure.hasNumberedList = true;

              // 번호 형식 생성
              const lvlText = numDef[ilvl].lvlText;
              let listFormat = lvlText;
              for (let i = 0; i <= ilvl; i++) {
                listFormat = listFormat.replace(`%${i + 1}`, String(counters[i]));
              }
              element.listFormat = listFormat;
            }
          }
        }
      }

      // 단락 스타일
      const paraStyle = extractParaStyle(pPr);
      if (paraStyle.alignment) element.alignment = paraStyle.alignment;
      if (paraStyle.lineSpacing) element.lineSpacing = paraStyle.lineSpacing;
      if (paraStyle.spaceBefore) element.spaceBefore = paraStyle.spaceBefore;
      if (paraStyle.spaceAfter) element.spaceAfter = paraStyle.spaceAfter;
      if (paraStyle.indentLeft) element.indentLeft = paraStyle.indentLeft;
      if (paraStyle.indentFirstLine) element.indentFirstLine = paraStyle.indentFirstLine;
    }

    // 구조 분석
    if (element.type.startsWith('heading')) {
      structure.hasHeadings = true;
      const level = parseInt(element.type.replace('heading', ''));
      if (!structure.headingLevels.includes(level)) {
        structure.headingLevels.push(level);
      }

      // 헤딩 번호 추적
      structure.lastHeadingNumbers[level - 1]++;
      for (let i = level; i < 4; i++) {
        structure.lastHeadingNumbers[i] = 0;
      }
    }

    elements.push(element);
  });

  structure.headingLevels.sort();

  return { elements, styleMap: resultStyleMap, structure };
}

// ===== 텍스트 파일 파싱 (구조 추론) =====
export async function parseTxt(file: File): Promise<{
  elements: DocumentElement[];
  styleMap: DocumentStyleMap;
  structure: ParsedDocument['structure'];
}> {
  const text = await file.text();
  const lines = text.split('\n');

  const elements: DocumentElement[] = [];
  const structure: ParsedDocument['structure'] = {
    hasHeadings: false,
    headingLevels: [],
    hasNumberedList: false,
    hasBulletList: false,
    lastHeadingNumbers: [0, 0, 0, 0],
  };

  let elementId = 0;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        // 패턴으로 타입 추론
        let type: ElementType = 'paragraph';

        // 헤딩 패턴: "제1장", "1.", "1.1", "#", "##" 등
        if (/^(제\d+장|제\d+절|Chapter\s+\d+|CHAPTER\s+\d+)/i.test(text)) {
          type = 'heading1';
          structure.hasHeadings = true;
          if (!structure.headingLevels.includes(1)) structure.headingLevels.push(1);
        } else if (/^(\d+\.\s+[^\d]|[IVX]+\.\s+)/i.test(text)) {
          type = 'heading2';
          structure.hasHeadings = true;
          if (!structure.headingLevels.includes(2)) structure.headingLevels.push(2);
        } else if (/^(\d+\.\d+\.?\s+|[가-힣]\.\s+)/i.test(text)) {
          type = 'heading3';
          structure.hasHeadings = true;
          if (!structure.headingLevels.includes(3)) structure.headingLevels.push(3);
        } else if (/^[-•●○]\s+/.test(text)) {
          type = 'listBullet';
          structure.hasBulletList = true;
        } else if (/^\d+[).]\s+/.test(text)) {
          type = 'listNumber';
          structure.hasNumberedList = true;
        }

        elements.push({
          id: `el-${elementId++}`,
          type,
          runs: [{ text }],
        });
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
    } else {
      currentParagraph.push(trimmed);
    }
  }

  flushParagraph();

  return {
    elements,
    styleMap: DEFAULT_STYLE_MAP,
    structure,
  };
}

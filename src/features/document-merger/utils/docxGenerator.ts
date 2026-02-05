/**
 * DOCX 생성 엔진
 * 3가지 모드로 문서 병합/변환
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun as DocxTextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';

import {
  DocumentElement,
  DocumentStyleMap,
  ElementStyle,
  MergeMode,
  MergeSettings,
  ParsedDocument,
  TextRun,
} from '../types';

// ===== 정렬 매핑 =====
const ALIGNMENT_MAP: Record<string, typeof AlignmentType[keyof typeof AlignmentType]> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

// ===== 헤딩 레벨 매핑 =====
const HEADING_LEVEL_MAP: Record<string, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
  heading1: HeadingLevel.HEADING_1,
  heading2: HeadingLevel.HEADING_2,
  heading3: HeadingLevel.HEADING_3,
  heading4: HeadingLevel.HEADING_4,
};

// ===== 텍스트 런 생성 =====
function createTextRuns(
  runs: TextRun[],
  baseStyle: ElementStyle
): DocxTextRun[] {
  return runs.map(run => new DocxTextRun({
    text: run.text,
    font: run.fontFamily || baseStyle.fontFamily,
    size: (run.fontSize || baseStyle.fontSize) * 2, // pt to half-pt
    color: (run.color || baseStyle.fontColor).replace('#', ''),
    bold: run.bold ?? baseStyle.bold,
    italics: run.italic ?? baseStyle.italic,
    underline: run.underline ?? baseStyle.underline ? {} : undefined,
  }));
}

// ===== 단락 생성 =====
function createParagraph(
  element: DocumentElement,
  styleMap: DocumentStyleMap,
  options?: {
    overrideText?: string;
    addNumberPrefix?: string;
  }
): Paragraph {
  const elementType = element.type;
  let baseStyle: ElementStyle;

  // 요소 타입에 맞는 스타일 선택
  if (elementType.startsWith('heading')) {
    baseStyle = styleMap[elementType as keyof Omit<DocumentStyleMap, 'numberingFormats' | 'pageMargins'>] || styleMap.paragraph;
  } else if (elementType === 'listBullet') {
    baseStyle = styleMap.listBullet;
  } else if (elementType === 'listNumber') {
    baseStyle = styleMap.listNumber;
  } else {
    baseStyle = styleMap.paragraph;
  }

  // 텍스트 런 생성
  let runs = element.runs;

  // 텍스트 오버라이드 (번호 프리픽스 추가 등)
  if (options?.overrideText) {
    runs = [{ text: options.overrideText }];
  } else if (options?.addNumberPrefix && runs.length > 0) {
    runs = [
      { text: options.addNumberPrefix, bold: runs[0].bold },
      ...runs,
    ];
  }

  const textRuns = createTextRuns(runs, baseStyle);

  // 단락 속성
  const paragraphOptions: any = {
    children: textRuns,
    alignment: ALIGNMENT_MAP[element.alignment || baseStyle.alignment] || AlignmentType.LEFT,
    spacing: {
      before: (element.spaceBefore ?? baseStyle.spaceBefore) * 20, // pt to twips
      after: (element.spaceAfter ?? baseStyle.spaceAfter) * 20,
      line: (element.lineSpacing ?? baseStyle.lineSpacing) * 240, // 240 = single
    },
  };

  // 들여쓰기
  const indentLeft = element.indentLeft ?? baseStyle.indentLeft;
  const indentFirstLine = element.indentFirstLine ?? baseStyle.indentFirstLine;
  if (indentLeft > 0 || indentFirstLine > 0) {
    paragraphOptions.indent = {
      left: indentLeft * 20,
      firstLine: indentFirstLine * 20,
    };
  }

  // 헤딩 레벨
  if (elementType.startsWith('heading')) {
    paragraphOptions.heading = HEADING_LEVEL_MAP[elementType];
  }

  // 목록 (간단한 텍스트 프리픽스 방식)
  if (elementType === 'listBullet' && !options?.overrideText) {
    const bulletChar = '•  ';
    if (textRuns.length > 0 && !runs[0]?.text.startsWith('•')) {
      textRuns.unshift(new DocxTextRun({ text: bulletChar, font: baseStyle.fontFamily }));
    }
    paragraphOptions.indent = { left: (element.listLevel || 0) * 360 + 360 };
  }

  if (elementType === 'listNumber' && element.listFormat && !options?.overrideText) {
    const prefix = element.listFormat + '  ';
    if (textRuns.length > 0 && !runs[0]?.text.match(/^\d/)) {
      textRuns.unshift(new DocxTextRun({ text: prefix, font: baseStyle.fontFamily }));
    }
    paragraphOptions.indent = { left: (element.listLevel || 0) * 360 + 360 };
  }

  return new Paragraph(paragraphOptions);
}

// ===== 구분선 단락 생성 =====
function createSeparator(style: 'line' | 'pageBreak' | 'title', title?: string): Paragraph[] {
  if (style === 'pageBreak') {
    return [
      new Paragraph({
        children: [new PageBreak()],
      }),
    ];
  }

  if (style === 'line') {
    return [
      new Paragraph({
        spacing: { before: 400, after: 400 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
        },
        children: [],
      }),
    ];
  }

  // title
  if (title) {
    return [
      new Paragraph({
        spacing: { before: 600, after: 200 },
        children: [
          new DocxTextRun({
            text: `━━━ ${title} ━━━`,
            color: '666666',
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ];
  }

  return [];
}

// ===== 번호 형식 생성 =====
function formatNumber(template: string, numbers: number[]): string {
  let result = template;

  // {n} 패턴을 순서대로 치환
  let idx = 0;
  result = result.replace(/\{n\}/g, () => {
    const num = numbers[idx] || 1;
    idx++;
    return String(num);
  });

  return result;
}

// ===== 모드 1: 스마트 병합 (번호 연결) =====
export async function smartMerge(
  documents: ParsedDocument[],
  mainStyleMap: DocumentStyleMap,
  settings: MergeSettings
): Promise<Blob> {
  const paragraphs: Paragraph[] = [];

  // 메인 문서의 마지막 번호 추적
  let headingCounters = [0, 0, 0, 0]; // heading1~4
  let listCounters = new Map<number, number>(); // level → count

  for (let docIdx = 0; docIdx < documents.length; docIdx++) {
    const doc = documents[docIdx];
    const isFirst = docIdx === 0;

    // 첫 문서가 아니면 섹션 구분
    if (!isFirst && settings.addSectionBreak) {
      paragraphs.push(...createSeparator(settings.separatorStyle, doc.name));
    }

    // 요소 순회
    for (const element of doc.elements) {
      let processedElement = { ...element };

      // 헤딩 번호 연결
      if (settings.continueNumbering && element.type.startsWith('heading')) {
        const level = parseInt(element.type.replace('heading', ''));

        if (!isFirst) {
          // 번호 이어가기
          headingCounters[level - 1]++;
          for (let i = level; i < 4; i++) {
            headingCounters[i] = 0;
          }
        } else {
          // 첫 문서는 그대로 사용하되 카운터 업데이트
          headingCounters = [...doc.structure.lastHeadingNumbers];
        }

        // 번호 프리픽스 생성 (필요시)
        // 원본에 번호가 없으면 추가
        const text = element.runs.map(r => r.text).join('');
        const hasNumber = /^[\d제IVX가-힣]/.test(text);

        if (!hasNumber && mainStyleMap.numberingFormats) {
          const formatKey = `heading${level}` as keyof typeof mainStyleMap.numberingFormats;
          const format = mainStyleMap.numberingFormats[formatKey];
          if (format) {
            const prefix = formatNumber(format, headingCounters.slice(0, level)) + ' ';
            paragraphs.push(createParagraph(processedElement, mainStyleMap, { addNumberPrefix: prefix }));
            continue;
          }
        }
      }

      // 목록 번호 연결
      if (settings.continueNumbering && element.type === 'listNumber') {
        const level = element.listLevel || 0;

        if (!isFirst) {
          const currentCount = listCounters.get(level) || 0;
          listCounters.set(level, currentCount + 1);

          // 하위 레벨 리셋
          for (let i = level + 1; i < 9; i++) {
            listCounters.set(i, 0);
          }

          processedElement.listNumber = (listCounters.get(level) || 0);
          processedElement.listFormat = `${processedElement.listNumber}.`;
        } else {
          // 첫 문서의 마지막 번호 기억
          if (element.listNumber) {
            listCounters.set(level, element.listNumber);
          }
        }
      }

      paragraphs.push(createParagraph(processedElement, mainStyleMap));
    }
  }

  const document = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: mainStyleMap.pageMargins.top * 20,
            bottom: mainStyleMap.pageMargins.bottom * 20,
            left: mainStyleMap.pageMargins.left * 20,
            right: mainStyleMap.pageMargins.right * 20,
          },
        },
      },
      children: paragraphs,
    }],
  });

  return await Packer.toBlob(document);
}

// ===== 모드 2: 단순 병합 (순서대로만) =====
export async function simpleMerge(
  documents: ParsedDocument[],
  mainStyleMap: DocumentStyleMap,
  settings: MergeSettings
): Promise<Blob> {
  const paragraphs: Paragraph[] = [];

  for (let docIdx = 0; docIdx < documents.length; docIdx++) {
    const doc = documents[docIdx];
    const isFirst = docIdx === 0;

    // 구분자 추가
    if (!isFirst && settings.addSeparator) {
      paragraphs.push(...createSeparator(settings.separatorStyle, doc.name));
    }

    // 요소를 메인 스타일로 변환
    for (const element of doc.elements) {
      paragraphs.push(createParagraph(element, mainStyleMap));
    }
  }

  const document = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: mainStyleMap.pageMargins.top * 20,
            bottom: mainStyleMap.pageMargins.bottom * 20,
            left: mainStyleMap.pageMargins.left * 20,
            right: mainStyleMap.pageMargins.right * 20,
          },
        },
      },
      children: paragraphs,
    }],
  });

  return await Packer.toBlob(document);
}

// ===== 모드 3: 스타일만 적용 (개별 파일) =====
export async function applyStyleOnly(
  document: ParsedDocument,
  mainStyleMap: DocumentStyleMap
): Promise<Blob> {
  const paragraphs: Paragraph[] = [];

  for (const element of document.elements) {
    paragraphs.push(createParagraph(element, mainStyleMap));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: mainStyleMap.pageMargins.top * 20,
            bottom: mainStyleMap.pageMargins.bottom * 20,
            left: mainStyleMap.pageMargins.left * 20,
            right: mainStyleMap.pageMargins.right * 20,
          },
        },
      },
      children: paragraphs,
    }],
  });

  return await Packer.toBlob(doc);
}

// ===== 메인 처리 함수 =====
export async function processDocuments(
  documents: ParsedDocument[],
  mainDocument: ParsedDocument,
  settings: MergeSettings
): Promise<{ blob: Blob; filename: string }[]> {
  const results: { blob: Blob; filename: string }[] = [];
  const mainStyleMap = mainDocument.styleMap;

  switch (settings.mode) {
    case 'smartMerge': {
      // 모든 문서를 스마트하게 병합
      const blob = await smartMerge(documents, mainStyleMap, settings);
      results.push({ blob, filename: 'merged_smart.docx' });
      break;
    }

    case 'simpleMerge': {
      // 단순 병합
      const blob = await simpleMerge(documents, mainStyleMap, settings);
      results.push({ blob, filename: 'merged_simple.docx' });
      break;
    }

    case 'styleOnly': {
      // 메인 제외한 각 문서를 개별 변환
      for (const doc of documents) {
        if (doc.id === mainDocument.id) continue;

        const blob = await applyStyleOnly(doc, mainStyleMap);
        const newName = doc.name.replace(/\.[^.]+$/, '_styled.docx');
        results.push({ blob, filename: newName });
      }
      break;
    }
  }

  return results;
}

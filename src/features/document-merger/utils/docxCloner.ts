/**
 * DOCX 완전 복제 엔진
 * A문서의 styles.xml을 그대로 사용하고 B문서의 내용을 스타일 매핑
 *
 * 핵심: DOCX는 ZIP 파일이므로 내부 XML을 직접 조작
 * - word/styles.xml: 스타일 정의 (A에서 복사)
 * - word/document.xml: 실제 내용 (B에서 가져와서 스타일ID 교체)
 * - word/numbering.xml: 넘버링 정의 (A에서 복사)
 */

import { MergeMode, MergeSettings } from '../types';

// ===== A문서에서 스타일 ID 목록 추출 =====
async function extractStyleIds(zip: any): Promise<Map<string, { name: string; type: string }>> {
  const styleMap = new Map<string, { name: string; type: string }>();

  const stylesXml = await zip.file('word/styles.xml')?.async('string');
  if (!stylesXml) return styleMap;

  const parser = new DOMParser();
  const doc = parser.parseFromString(stylesXml, 'application/xml');

  const styles = doc.querySelectorAll('w\\:style, style');
  styles.forEach(style => {
    const styleId = style.getAttribute('w:styleId') || style.getAttribute('styleId');
    const styleType = style.getAttribute('w:type') || style.getAttribute('type');
    const nameEl = style.querySelector('w\\:name, name');
    const name = nameEl?.getAttribute('w:val') || nameEl?.getAttribute('val') || styleId;

    if (styleId) {
      styleMap.set(styleId, { name: name || styleId, type: styleType || 'paragraph' });
    }
  });

  return styleMap;
}

// ===== 스타일 매핑 생성 =====
function createStyleMapping(
  sourceStyles: Map<string, { name: string; type: string }>,
  targetStyles: Map<string, { name: string; type: string }>,
  defaultStyleId: string = 'Normal'
): Map<string, string> {
  const mapping = new Map<string, string>();

  // 타겟에 있는 스타일 ID 목록
  const targetIds = new Set(targetStyles.keys());
  const targetNames = new Map<string, string>();
  targetStyles.forEach((v, k) => {
    targetNames.set(v.name.toLowerCase(), k);
  });

  sourceStyles.forEach((sourceInfo, sourceId) => {
    // 1. 같은 ID가 있으면 그대로
    if (targetIds.has(sourceId)) {
      mapping.set(sourceId, sourceId);
      return;
    }

    // 2. 같은 이름이 있으면 매핑
    const targetId = targetNames.get(sourceInfo.name.toLowerCase());
    if (targetId) {
      mapping.set(sourceId, targetId);
      return;
    }

    // 3. 헤딩 유사 매핑
    const lowerName = sourceInfo.name.toLowerCase();
    const lowerId = sourceId.toLowerCase();

    if (lowerName.includes('heading') || lowerId.includes('heading')) {
      // Heading 번호 추출
      const match = (lowerName + lowerId).match(/heading\s*(\d)/i);
      if (match) {
        const level = match[1];
        // 타겟에서 같은 레벨 찾기
        for (const [tId, tInfo] of targetStyles.entries()) {
          if (tInfo.name.toLowerCase().includes(`heading`) &&
              (tInfo.name.includes(level) || tId.includes(level))) {
            mapping.set(sourceId, tId);
            return;
          }
        }
        // 못 찾으면 아무 Heading이라도
        for (const [tId, tInfo] of targetStyles.entries()) {
          if (tInfo.name.toLowerCase().includes('heading') || tId.toLowerCase().includes('heading')) {
            mapping.set(sourceId, tId);
            return;
          }
        }
      }
    }

    // 4. 목록 매핑
    if (lowerName.includes('list') || lowerId.includes('list')) {
      for (const [tId, tInfo] of targetStyles.entries()) {
        if (tInfo.name.toLowerCase().includes('list') || tId.toLowerCase().includes('list')) {
          mapping.set(sourceId, tId);
          return;
        }
      }
    }

    // 5. 기본값으로 폴백
    mapping.set(sourceId, defaultStyleId);
  });

  return mapping;
}

// ===== document.xml에서 스타일 ID 교체 =====
function remapDocumentStyles(
  documentXml: string,
  styleMapping: Map<string, string>
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(documentXml, 'application/xml');

  // 모든 pStyle (단락 스타일) 교체
  const pStyles = doc.querySelectorAll('w\\:pStyle, pStyle');
  pStyles.forEach(pStyle => {
    const val = pStyle.getAttribute('w:val') || pStyle.getAttribute('val');
    if (val && styleMapping.has(val)) {
      const newVal = styleMapping.get(val)!;
      if (pStyle.hasAttribute('w:val')) {
        pStyle.setAttribute('w:val', newVal);
      } else {
        pStyle.setAttribute('val', newVal);
      }
    }
  });

  // 모든 rStyle (런 스타일) 교체
  const rStyles = doc.querySelectorAll('w\\:rStyle, rStyle');
  rStyles.forEach(rStyle => {
    const val = rStyle.getAttribute('w:val') || rStyle.getAttribute('val');
    if (val && styleMapping.has(val)) {
      const newVal = styleMapping.get(val)!;
      if (rStyle.hasAttribute('w:val')) {
        rStyle.setAttribute('w:val', newVal);
      } else {
        rStyle.setAttribute('val', newVal);
      }
    }
  });

  // tblStyle (표 스타일) 교체
  const tblStyles = doc.querySelectorAll('w\\:tblStyle, tblStyle');
  tblStyles.forEach(tblStyle => {
    const val = tblStyle.getAttribute('w:val') || tblStyle.getAttribute('val');
    if (val && styleMapping.has(val)) {
      const newVal = styleMapping.get(val)!;
      if (tblStyle.hasAttribute('w:val')) {
        tblStyle.setAttribute('w:val', newVal);
      } else {
        tblStyle.setAttribute('val', newVal);
      }
    }
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

// ===== 인라인 서식 제거 (스타일만 사용하도록) =====
function removeInlineFormatting(documentXml: string, keepBasic: boolean = false): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(documentXml, 'application/xml');

  // rPr (런 프로퍼티) 내의 인라인 서식 제거
  // 단, bold/italic 같은 의미있는 서식은 유지할 수 있음
  const rPrs = doc.querySelectorAll('w\\:rPr, rPr');
  rPrs.forEach(rPr => {
    if (!keepBasic) {
      // 폰트 관련 제거 (스타일에서 정의된 것 사용)
      const toRemove = ['rFonts', 'sz', 'szCs', 'color'];
      toRemove.forEach(tag => {
        const els = rPr.querySelectorAll(`w\\:${tag}, ${tag}`);
        els.forEach(el => el.remove());
      });
    }
  });

  // pPr (단락 프로퍼티) 내의 인라인 서식도 필요시 제거
  // spacing, ind 등은 스타일에서 정의된 것 사용

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

// ===== 문서 body 추출 =====
function extractDocumentBody(documentXml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(documentXml, 'application/xml');

  const body = doc.querySelector('w\\:body, body');
  if (!body) return '';

  const serializer = new XMLSerializer();
  return serializer.serializeToString(body);
}

// ===== body를 다른 document.xml에 삽입 =====
function replaceDocumentBody(targetDocXml: string, newBodyXml: string): string {
  const parser = new DOMParser();
  const targetDoc = parser.parseFromString(targetDocXml, 'application/xml');
  const newBodyDoc = parser.parseFromString(newBodyXml, 'application/xml');

  const targetBody = targetDoc.querySelector('w\\:body, body');
  const newBody = newBodyDoc.querySelector('w\\:body, body') || newBodyDoc.documentElement;

  if (targetBody && newBody) {
    // 기존 body 내용 제거
    while (targetBody.firstChild) {
      targetBody.removeChild(targetBody.firstChild);
    }

    // 새 body 내용 복사
    Array.from(newBody.childNodes).forEach(child => {
      const imported = targetDoc.importNode(child, true);
      targetBody.appendChild(imported);
    });
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(targetDoc);
}

// ===== 두 body를 병합 =====
function mergeBodies(
  body1Xml: string,
  body2Xml: string,
  addSeparator: boolean = true,
  separatorType: 'pageBreak' | 'section' | 'none' = 'pageBreak'
): string {
  const parser = new DOMParser();
  const doc1 = parser.parseFromString(body1Xml, 'application/xml');
  const doc2 = parser.parseFromString(body2Xml, 'application/xml');

  const body1 = doc1.querySelector('w\\:body, body') || doc1.documentElement;
  const body2 = doc2.querySelector('w\\:body, body') || doc2.documentElement;

  // body1의 sectPr (섹션 속성) 임시 저장 및 제거
  const sectPr = body1.querySelector('w\\:sectPr, sectPr');
  if (sectPr) {
    sectPr.remove();
  }

  // 페이지 브레이크 추가
  if (addSeparator && separatorType === 'pageBreak') {
    const pageBreakP = doc1.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:p');
    const pageBreakR = doc1.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:r');
    const pageBreakBr = doc1.createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:br');
    pageBreakBr.setAttribute('w:type', 'page');
    pageBreakR.appendChild(pageBreakBr);
    pageBreakP.appendChild(pageBreakR);
    body1.appendChild(pageBreakP);
  }

  // body2의 내용을 body1에 추가 (sectPr 제외)
  Array.from(body2.childNodes).forEach(child => {
    const el = child as Element;
    if (el.localName === 'sectPr') return; // 섹션 속성은 마지막 것만 사용

    const imported = doc1.importNode(child, true);
    body1.appendChild(imported);
  });

  // sectPr 복원 (맨 마지막에)
  if (sectPr) {
    body1.appendChild(sectPr);
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc1);
}

// ===== 메인: 스타일 복제하여 새 문서 생성 =====
export async function cloneWithStyle(
  mainDocFile: File,      // A 문서 (스타일 소스)
  contentDocFile: File,   // B 문서 (내용 소스)
  options: {
    removeInlineStyles?: boolean;  // B의 인라인 서식 제거 여부
    keepBoldItalic?: boolean;      // bold/italic은 유지할지
  } = {}
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;

  // 두 문서 로드
  const mainZip = await JSZip.loadAsync(await mainDocFile.arrayBuffer());
  const contentZip = await JSZip.loadAsync(await contentDocFile.arrayBuffer());

  // 스타일 ID 추출
  const mainStyles = await extractStyleIds(mainZip);
  const contentStyles = await extractStyleIds(contentZip);

  // 스타일 매핑 생성
  const styleMapping = createStyleMapping(contentStyles, mainStyles, 'Normal');

  // B의 document.xml 가져오기
  let contentDocXml = await contentZip.file('word/document.xml')?.async('string') || '';

  // 스타일 ID 교체
  contentDocXml = remapDocumentStyles(contentDocXml, styleMapping);

  // 인라인 서식 제거 (옵션)
  if (options.removeInlineStyles) {
    contentDocXml = removeInlineFormatting(contentDocXml, options.keepBoldItalic);
  }

  // A 문서를 기반으로 새 ZIP 생성
  const resultZip = await JSZip.loadAsync(await mainDocFile.arrayBuffer());

  // document.xml만 B의 내용으로 교체 (A의 스타일은 유지)
  const mainDocXml = await mainZip.file('word/document.xml')?.async('string') || '';
  const newDocXml = replaceDocumentBody(mainDocXml, contentDocXml);

  resultZip.file('word/document.xml', newDocXml);

  // Blob으로 반환
  return await resultZip.generateAsync({ type: 'blob' });
}

// ===== 메인: 여러 문서 병합 =====
export async function mergeWithStyle(
  mainDocFile: File,      // A 문서 (스타일 소스 + 첫 내용)
  contentDocFiles: File[], // B, C, D... 문서들 (내용)
  options: {
    mode: MergeMode;
    addPageBreak?: boolean;
    removeInlineStyles?: boolean;
  } = { mode: 'simpleMerge', addPageBreak: true }
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;

  // 메인 문서 로드
  const mainZip = await JSZip.loadAsync(await mainDocFile.arrayBuffer());
  const mainStyles = await extractStyleIds(mainZip);
  let mainDocXml = await mainZip.file('word/document.xml')?.async('string') || '';

  // 각 문서 처리하여 병합
  for (const contentFile of contentDocFiles) {
    const contentZip = await JSZip.loadAsync(await contentFile.arrayBuffer());
    const contentStyles = await extractStyleIds(contentZip);

    // 스타일 매핑
    const styleMapping = createStyleMapping(contentStyles, mainStyles, 'Normal');

    // document.xml 가져와서 스타일 교체
    let contentDocXml = await contentZip.file('word/document.xml')?.async('string') || '';
    contentDocXml = remapDocumentStyles(contentDocXml, styleMapping);

    if (options.removeInlineStyles) {
      contentDocXml = removeInlineFormatting(contentDocXml, true);
    }

    // body 추출 및 병합
    const mainBody = extractDocumentBody(mainDocXml);
    const contentBody = extractDocumentBody(contentDocXml);

    const mergedBody = mergeBodies(
      `<w:body xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${mainBody}</w:body>`,
      `<w:body xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${contentBody}</w:body>`,
      options.addPageBreak ?? true,
      'pageBreak'
    );

    mainDocXml = replaceDocumentBody(mainDocXml, mergedBody);
  }

  // 결과 ZIP 생성
  const resultZip = await JSZip.loadAsync(await mainDocFile.arrayBuffer());
  resultZip.file('word/document.xml', mainDocXml);

  return await resultZip.generateAsync({ type: 'blob' });
}

// ===== 편의 함수: processDocumentsV2 =====
export async function processDocumentsV2(
  mainDocFile: File,
  otherDocFiles: File[],
  settings: MergeSettings
): Promise<{ blob: Blob; filename: string }[]> {
  const results: { blob: Blob; filename: string }[] = [];

  switch (settings.mode) {
    case 'smartMerge':
    case 'simpleMerge': {
      // 병합 모드
      const blob = await mergeWithStyle(mainDocFile, otherDocFiles, {
        mode: settings.mode,
        addPageBreak: settings.addSeparator && settings.separatorStyle === 'pageBreak',
        removeInlineStyles: true,
      });
      results.push({
        blob,
        filename: settings.mode === 'smartMerge' ? 'merged_smart.docx' : 'merged_simple.docx',
      });
      break;
    }

    case 'styleOnly': {
      // 개별 변환 모드
      for (const file of otherDocFiles) {
        const blob = await cloneWithStyle(mainDocFile, file, {
          removeInlineStyles: true,
          keepBoldItalic: true,
        });
        const newName = file.name.replace(/\.[^.]+$/, '_styled.docx');
        results.push({ blob, filename: newName });
      }
      break;
    }
  }

  return results;
}

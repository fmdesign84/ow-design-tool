import {
  ParsedDocument,
  ContentSection,
  DocumentType,
} from '../types';
import mammoth from 'mammoth';

/**
 * 문서 파서 유틸리티 (브라우저 호환 버전)
 * Markdown, 텍스트, DOCX 파일 파싱
 */

// ============================================
// 파일 타입 감지
// ============================================
export function detectDocumentType(file: File): DocumentType | null {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'txt':
      return 'markdown'; // 텍스트도 마크다운으로 처리
    case 'docx':
      return 'docx';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'svg':
      return 'image';
    default:
      return null;
  }
}

// ============================================
// Markdown 파싱 (간단 버전)
// ============================================
export async function parseMarkdown(file: File): Promise<ParsedDocument> {
  const text = await file.text();
  const lines = text.split('\n');
  const sections: ContentSection[] = [];

  let currentParagraph: string[] = [];
  let sectionId = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const content = currentParagraph.join('\n').trim();
      if (content) {
        sections.push({
          id: `section-${sectionId++}`,
          type: 'paragraph',
          content,
        });
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // 헤딩 처리
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      sections.push({
        id: `section-${sectionId++}`,
        type: 'heading',
        level,
        content: headingMatch[2],
      });
      continue;
    }

    // 리스트 처리
    const listMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      sections.push({
        id: `section-${sectionId++}`,
        type: 'list',
        items: [listMatch[1]],
        content: listMatch[1],
      });
      continue;
    }

    // 빈 줄
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // 일반 텍스트
    currentParagraph.push(trimmed);
  }

  flushParagraph();

  return {
    type: 'markdown',
    filename: file.name,
    content: {
      sections,
      rawText: text,
    },
  };
}

// ============================================
// DOCX 파싱 (mammoth 사용)
// ============================================
export async function parseDocx(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;

  // HTML을 간단히 파싱해서 섹션으로 변환
  const sections: ContentSection[] = [];
  let sectionId = 0;

  // 간단한 HTML 파싱 (DOM Parser 사용)
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const elements = doc.body.children;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const tagName = el.tagName.toLowerCase();
    const text = el.textContent?.trim() || '';

    if (!text) continue;

    // 헤딩 처리
    if (tagName.match(/^h[1-6]$/)) {
      const level = parseInt(tagName[1]);
      sections.push({
        id: `section-${sectionId++}`,
        type: 'heading',
        level,
        content: text,
      });
    }
    // 리스트 처리
    else if (tagName === 'ul' || tagName === 'ol') {
      const items = el.querySelectorAll('li');
      const listItems: string[] = [];
      items.forEach(item => {
        const itemText = item.textContent?.trim();
        if (itemText) listItems.push(itemText);
      });
      if (listItems.length > 0) {
        sections.push({
          id: `section-${sectionId++}`,
          type: 'list',
          items: listItems,
          content: listItems.join('\n'),
        });
      }
    }
    // 단락 처리
    else if (tagName === 'p') {
      sections.push({
        id: `section-${sectionId++}`,
        type: 'paragraph',
        content: text,
      });
    }
    // 기타 요소
    else {
      sections.push({
        id: `section-${sectionId++}`,
        type: 'paragraph',
        content: text,
      });
    }
  }

  // rawText 생성
  const rawText = sections.map(s => s.content).join('\n\n');

  return {
    type: 'docx',
    filename: file.name,
    content: {
      sections,
      rawText,
    },
  };
}

// ============================================
// 메인 파싱 함수
// ============================================
export async function parseDocument(file: File): Promise<ParsedDocument | null> {
  const type = detectDocumentType(file);

  if (!type || type === 'image') {
    return null;
  }

  switch (type) {
    case 'markdown':
      return parseMarkdown(file);
    case 'docx':
      return parseDocx(file);
    default:
      return null;
  }
}

// ============================================
// 다중 문서 통합
// ============================================
export function mergeDocuments(documents: ParsedDocument[]): ContentSection[] {
  const allSections: ContentSection[] = [];

  for (const doc of documents) {
    allSections.push(...doc.content.sections);
  }

  return allSections;
}

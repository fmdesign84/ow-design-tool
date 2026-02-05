import {
  ContentSection,
  ContentAnalysis,
  ImageAsset,
  ChartData,
  SlideConfig,
  SlideLayoutType,
  ParsedDocument,
} from '../types';

/**
 * AI 콘텐츠 분석기
 * 문서 내용을 분석하여 슬라이드 구성을 제안
 */

// ============================================
// 콘텐츠 분석
// ============================================
export function analyzeContent(
  sections: ContentSection[],
  images: ImageAsset[]
): ContentAnalysis {
  const headings = sections.filter((s) => s.type === 'heading');
  const paragraphs = sections.filter((s) => s.type === 'paragraph');
  const tables = sections.filter((s) => s.type === 'table');
  const chartDataSections = sections.filter((s) => s.type === 'chart-data');
  const lists = sections.filter((s) => s.type === 'list');

  // 주요 토픽 추출 (H1, H2 기반)
  const mainTopics = headings
    .filter((h) => h.level && h.level <= 2)
    .map((h) => String(h.content));

  // 슬라이드 수 추천
  const suggestedSlideCount = calculateSlideCount(sections);

  // 인트로/결론 감지
  const hasIntro = detectIntroSection(sections);
  const hasConclusion = detectConclusionSection(sections);

  // 데이터 시각화 제안
  const dataVisualizations = suggestDataVisualizations(sections);

  // 이미지-텍스트 매칭
  const imageMatches = matchImagesToContent(images, sections);

  // 전체 요약 생성
  const summary = generateSummary(sections);

  return {
    summary,
    mainTopics,
    suggestedSlideCount,
    structure: {
      hasIntro,
      hasConclusion,
      sectionCount: headings.filter((h) => h.level === 1 || h.level === 2).length,
    },
    dataVisualizations,
    imageMatches,
  };
}

/**
 * 슬라이드 수 계산
 */
function calculateSlideCount(sections: ContentSection[]): number {
  let count = 1; // 타이틀 슬라이드

  const h1Sections = sections.filter((s) => s.type === 'heading' && s.level === 1);
  const h2Sections = sections.filter((s) => s.type === 'heading' && s.level === 2);
  const tables = sections.filter((s) => s.type === 'table');
  const charts = sections.filter((s) => s.type === 'chart-data');

  // 섹션 헤더마다 슬라이드
  count += h1Sections.length;
  count += h2Sections.length;

  // 테이블/차트마다 슬라이드
  count += tables.length;
  count += charts.length;

  // 클로징 슬라이드
  count += 1;

  // 최소 3, 최대 20
  return Math.min(Math.max(count, 3), 20);
}

/**
 * 인트로 섹션 감지
 */
function detectIntroSection(sections: ContentSection[]): boolean {
  const introKeywords = [
    '소개',
    '개요',
    '목차',
    '배경',
    'introduction',
    'overview',
    'agenda',
    'background',
  ];

  return sections.some(
    (s) =>
      s.type === 'heading' &&
      introKeywords.some((kw) =>
        String(s.content).toLowerCase().includes(kw.toLowerCase())
      )
  );
}

/**
 * 결론 섹션 감지
 */
function detectConclusionSection(sections: ContentSection[]): boolean {
  const conclusionKeywords = [
    '결론',
    '요약',
    '마무리',
    '다음 단계',
    'conclusion',
    'summary',
    'next steps',
    'wrap up',
  ];

  return sections.some(
    (s) =>
      s.type === 'heading' &&
      conclusionKeywords.some((kw) =>
        String(s.content).toLowerCase().includes(kw.toLowerCase())
      )
  );
}

/**
 * 데이터 시각화 제안
 */
function suggestDataVisualizations(
  sections: ContentSection[]
): ContentAnalysis['dataVisualizations'] {
  const suggestions: ContentAnalysis['dataVisualizations'] = [];

  sections.forEach((section) => {
    if (section.type === 'table' || section.type === 'chart-data') {
      let chartType: ChartData['type'] = 'bar';
      let reason = '';

      if (section.type === 'chart-data') {
        const chartData = section.content as ChartData;
        chartType = chartData.type;
        reason = `이미 ${chartType} 차트로 변환 가능한 데이터`;
      } else {
        // 테이블 분석
        const tableData = section.content as { headers: string[]; rows: (string | number)[][] };
        const hasTimeData = tableData.headers.some((h) =>
          /년|월|분기|year|month|quarter/i.test(h)
        );
        const hasCategoryData = tableData.rows.length <= 6;

        if (hasTimeData) {
          chartType = 'line';
          reason = '시계열 데이터가 포함되어 있어 라인 차트 추천';
        } else if (hasCategoryData) {
          chartType = 'bar';
          reason = '카테고리 비교에 적합한 바 차트 추천';
        }
      }

      suggestions.push({
        sectionId: section.id,
        suggestedChartType: chartType,
        reason,
      });
    }
  });

  return suggestions;
}

/**
 * 이미지-콘텐츠 매칭
 */
function matchImagesToContent(
  images: ImageAsset[],
  sections: ContentSection[]
): ContentAnalysis['imageMatches'] {
  const matches: ContentAnalysis['imageMatches'] = [];

  images.forEach((image) => {
    // 파일명에서 키워드 추출
    const imageKeywords = extractKeywordsFromFilename(image.filename);

    // 각 섹션과 매칭 점수 계산
    let bestMatch = { sectionId: '', confidence: 0, reason: '' };

    sections.forEach((section) => {
      if (section.type === 'heading' || section.type === 'paragraph') {
        const sectionText = String(section.content).toLowerCase();
        let matchScore = 0;
        const matchedKeywords: string[] = [];

        imageKeywords.forEach((keyword) => {
          if (sectionText.includes(keyword.toLowerCase())) {
            matchScore += 0.3;
            matchedKeywords.push(keyword);
          }
        });

        // 이미지 태그와 매칭 (AI 분석된 경우)
        if (image.tags) {
          image.tags.forEach((tag) => {
            if (sectionText.includes(tag.toLowerCase())) {
              matchScore += 0.2;
              matchedKeywords.push(tag);
            }
          });
        }

        if (matchScore > bestMatch.confidence) {
          bestMatch = {
            sectionId: section.id,
            confidence: Math.min(matchScore, 1),
            reason:
              matchedKeywords.length > 0
                ? `키워드 매칭: ${matchedKeywords.join(', ')}`
                : '위치 기반 매칭',
          };
        }
      }
    });

    if (bestMatch.confidence > 0.1) {
      matches.push({
        imageId: image.id,
        ...bestMatch,
      });
    }
  });

  return matches;
}

/**
 * 파일명에서 키워드 추출
 */
function extractKeywordsFromFilename(filename: string): string[] {
  // 확장자 제거
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');

  // 특수문자로 분리
  const words = nameWithoutExt.split(/[-_\s.]+/);

  // 불용어 제거 및 필터링
  const stopWords = ['img', 'image', 'photo', 'pic', 'screenshot', 'screen'];
  return words.filter(
    (word) => word.length > 2 && !stopWords.includes(word.toLowerCase())
  );
}

/**
 * 콘텐츠 요약 생성
 */
function generateSummary(sections: ContentSection[]): string {
  const headings = sections
    .filter((s) => s.type === 'heading')
    .map((s) => String(s.content));

  const paragraphCount = sections.filter((s) => s.type === 'paragraph').length;
  const tableCount = sections.filter((s) => s.type === 'table').length;
  const listCount = sections.filter((s) => s.type === 'list').length;

  const topicSummary =
    headings.length > 0
      ? `주요 주제: ${headings.slice(0, 3).join(', ')}`
      : '명확한 주제 구분 없음';

  return `${topicSummary}. 본문 ${paragraphCount}개, 테이블 ${tableCount}개, 리스트 ${listCount}개 포함.`;
}

// ============================================
// 슬라이드 자동 구성
// ============================================
export function generateSlideStructure(
  documents: ParsedDocument[],
  images: ImageAsset[],
  analysis: ContentAnalysis
): SlideConfig[] {
  const slides: SlideConfig[] = [];
  let slideOrder = 0;

  // 모든 섹션 통합
  const allSections: ContentSection[] = [];
  documents.forEach((doc) => {
    allSections.push(...doc.content.sections);
  });

  // 1. 타이틀 슬라이드
  const firstHeading = allSections.find(
    (s) => s.type === 'heading' && s.level === 1
  );
  slides.push({
    id: `slide-${slideOrder}`,
    order: slideOrder++,
    layout: 'title',
    content: {
      title: firstHeading ? String(firstHeading.content) : '프레젠테이션',
      subtitle: analysis.summary,
    },
  });

  // 2. 목차 슬라이드 (토픽이 3개 이상인 경우)
  if (analysis.mainTopics.length >= 3) {
    slides.push({
      id: `slide-${slideOrder}`,
      order: slideOrder++,
      layout: 'content',
      content: {
        title: '목차',
        bulletPoints: analysis.mainTopics,
      },
    });
  }

  // 3. 본문 슬라이드들
  let currentSectionSlides: ContentSection[] = [];
  let currentHeading: ContentSection | null = null;

  allSections.forEach((section, index) => {
    if (section.type === 'heading' && section.level && section.level <= 2) {
      // 이전 섹션 처리
      if (currentHeading || currentSectionSlides.length > 0) {
        const slide = createSlideFromSections(
          currentHeading,
          currentSectionSlides,
          images,
          analysis,
          slideOrder++
        );
        if (slide) slides.push(slide);
      }

      // 새 섹션 시작
      currentHeading = section;
      currentSectionSlides = [];
    } else {
      currentSectionSlides.push(section);
    }
  });

  // 마지막 섹션 처리
  if (currentHeading || currentSectionSlides.length > 0) {
    const slide = createSlideFromSections(
      currentHeading,
      currentSectionSlides,
      images,
      analysis,
      slideOrder++
    );
    if (slide) slides.push(slide);
  }

  // 4. 차트/데이터 슬라이드
  analysis.dataVisualizations.forEach((viz) => {
    const section = allSections.find((s) => s.id === viz.sectionId);
    if (section && section.type === 'chart-data') {
      slides.push({
        id: `slide-${slideOrder}`,
        order: slideOrder++,
        layout: 'chart',
        content: {
          title: (section.content as ChartData).title || '데이터 분석',
          chart: section.content as ChartData,
        },
        notes: viz.reason,
      });
    }
  });

  // 5. 클로징 슬라이드
  slides.push({
    id: `slide-${slideOrder}`,
    order: slideOrder++,
    layout: 'closing',
    content: {
      title: '감사합니다',
      subtitle: 'Q&A',
    },
  });

  return slides;
}

/**
 * 섹션들로부터 슬라이드 생성
 */
function createSlideFromSections(
  heading: ContentSection | null,
  sections: ContentSection[],
  images: ImageAsset[],
  analysis: ContentAnalysis,
  order: number
): SlideConfig | null {
  // 빈 섹션 스킵
  if (!heading && sections.length === 0) return null;

  const title = heading ? String(heading.content) : '';

  // 레이아웃 결정
  let layout: SlideLayoutType = 'content';
  const content: SlideConfig['content'] = { title };

  // 이미지 매칭 확인
  const matchedImage = images.find((img) =>
    analysis.imageMatches.some(
      (match) =>
        match.imageId === img.id &&
        (match.sectionId === heading?.id ||
          sections.some((s) => s.id === match.sectionId))
    )
  );

  if (matchedImage) {
    layout = 'image-right';
    content.image = matchedImage;
  }

  // 리스트가 있으면 bullet points로
  const listSection = sections.find((s) => s.type === 'list');
  if (listSection) {
    content.bulletPoints = listSection.content as string[];
  }

  // 문단이 있으면 body로
  const paragraphs = sections.filter((s) => s.type === 'paragraph');
  if (paragraphs.length > 0) {
    content.body = paragraphs.map((p) => String(p.content)).join('\n\n');
  }

  // 테이블이 있으면 테이블 레이아웃
  const tableSection = sections.find((s) => s.type === 'table');
  if (tableSection) {
    layout = 'content';
    content.table = tableSection.content as SlideConfig['content']['table'];
  }

  return {
    id: `slide-${order}`,
    order,
    layout,
    content,
  };
}

// ============================================
// 슬라이드 레이아웃 추천
// ============================================
export function recommendLayout(content: SlideConfig['content']): SlideLayoutType {
  // 이미지 + 텍스트
  if (content.image && (content.body || content.bulletPoints)) {
    return Math.random() > 0.5 ? 'image-left' : 'image-right';
  }

  // 이미지만
  if (content.image && !content.body && !content.bulletPoints) {
    return 'full-image';
  }

  // 차트
  if (content.chart) {
    return 'chart';
  }

  // 인용문
  if (content.quote) {
    return 'quote';
  }

  // 비교 (2개 항목)
  if (content.columns) {
    return 'comparison';
  }

  // 기본 콘텐츠
  return 'content';
}

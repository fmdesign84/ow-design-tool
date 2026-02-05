import PptxGenJS from 'pptxgenjs';
import { createClient } from '@supabase/supabase-js';

// Figma 좌표(1920x1080) → PPT 좌표(13.33x7.5인치) 변환
const FIGMA_W = 1920;
const FIGMA_H = 1080;
const PPT_W = 13.33;
const PPT_H = 7.5;
const px = (v, isW) => isW ? (v / FIGMA_W) * PPT_W : (v / FIGMA_H) * PPT_H;
// Figma px → PPT pt 폰트 크기 변환 (PPT 너비 960pt 기준)
const fontPx = (figmaPx) => Math.round(figmaPx * 0.5);

// Figma 기반 슬라이드 템플릿 - 원본 좌표 그대로
const SLIDE_TEMPLATES = {
    'slide-04': {
        id: '78:254',
        name: '기존방법 VS Orange Whale',
        width: PPT_W,
        height: PPT_H,
        background: { color: 'FFFFFF' },
        // 배경 이미지 (Figma에서 추출)
        backgroundImages: [
            {
                url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/12e47448-a202-4a58-ba87-201978a16c32',
                x: px(31, true), y: px(43, false), w: px(1858, true), h: px(993, false),
            },
            {
                url: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/17555b4b-e122-40ca-8589-7a023d71445c',
                x: 0, y: 0, w: PPT_W, h: PPT_H,
                opacity: 0.35,
            },
        ],
        elements: [
            // 로고 - CSA (Figma: x:128, y:28, fontSize:20)
            { id: '78:258', type: 'text', x: px(128, true), y: px(28, false), w: px(42, true), h: px(24, false), text: 'CSA', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 800, color: '000000', align: 'left' },
            // 로고 - Design (Figma: x:381, y:28, fontSize:20)
            { id: '78:259', type: 'text', x: px(381, true), y: px(28, false), w: px(67, true), h: px(24, false), text: 'Design', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 800, color: '000000', align: 'left' },
            // 사이드 텍스트 - 세로 (Figma: x:1867, y:86, fontSize:16)
            { id: '78:260', type: 'text', x: px(1867, true), y: px(86, false), w: px(19, true), h: px(91, false), text: 'CSA Design', fontSize: 16, fontFamily: 'Pretendard', fontWeight: 800, color: '000000', rotation: 90 },
            // 메인 타이틀 (Figma: x:128, y:108, fontSize:20)
            { id: '78:261', type: 'text', x: px(128, true), y: px(108, false), w: px(137, true), h: px(72, false), text: '기존방법\nVS\nOrange Whale', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 800, color: '1E1E1E', align: 'left', placeholder: '{{mainTitle}}' },
            // 푸터 (Figma: x:1588, y:1013, fontSize:16)
            { id: '78:257', type: 'text', x: px(1588, true), y: px(1013, false), w: px(202, true), h: px(19, false), text: 'FM COMMUNICATIONS Inc.', fontSize: 16, fontFamily: 'Pretendard', fontWeight: 500, color: '000000', align: 'right' },

            // 카드 1 배경 (Figma: x:498, y:243, w:1123, h:254, radius:15, stroke:rgba(0,0,0,0.2))
            { id: 'card-1', type: 'shape', x: px(498, true), y: px(243, false), w: px(1123, true), h: px(254, false), fill: 'FFFFFF', stroke: 'CCCCCC', strokeWidth: 1.5, rectRadius: 0.1, shadow: { type: 'outer', color: '000000', blur: 4, offset: 3, angle: 90, opacity: 0.06 } },
            // 카드 1 제목 (Figma: x:498, y:191, fontSize:30)
            { id: '78:263', type: 'text', x: px(498, true), y: px(191, false), w: px(1123, true), h: px(36, false), text: '크리에이티브 품질 상향 평준화', fontSize: 30, fontFamily: 'Pretendard', fontWeight: 800, color: '1E1E1E', align: 'left', placeholder: '{{card1Title}}' },
            // 기존방법 라벨 (Figma: x:538, y:297.5, fontSize:24)
            { id: '78:266', type: 'text', x: px(538, true), y: px(297.5, false), w: px(83, true), h: px(29, false), text: '기존방법', fontSize: 24, fontFamily: 'Pretendard', fontWeight: 800, color: '006EFF', align: 'left', valign: 'middle' },
            // 기존방법 설명 (Figma: x:671, y:278, fontSize:24)
            { id: '78:267', type: 'text', x: px(671, true), y: px(278, false), w: px(910, true), h: px(68, false), text: 'AI 잘 쓰는 직원 vs 못 쓰는 직원 격차가 굉장히 큼. 프롬프트 잘 쓰는 사람만 좋은 결과물.\n나머지는 "AI 별로던데? 내가 원하는 대로 안나오네"', fontSize: 24, fontFamily: 'Pretendard', fontWeight: 800, color: '000000', align: 'left', valign: 'middle', placeholder: '{{card1OldDesc}}' },
            // ORANGE 라벨 (Figma: x:538, y:409.5, fontSize:24)
            { id: '78:269', type: 'text', x: px(538, true), y: px(409.5, false), w: px(101, true), h: px(29, false), text: 'ORANGE', fontSize: 24, fontFamily: 'Pretendard', fontWeight: 800, color: 'FF3300', align: 'left', valign: 'middle' },
            // ORANGE 설명 (Figma: x:668, y:386, fontSize:24)
            { id: '78:270', type: 'text', x: px(668, true), y: px(386, false), w: px(913, true), h: px(76, false), text: '프리셋, 템플릿, 가이드 제공으로 누구나 일정 수준 이상 결과물. 잘하는 사람의 노하우가\n시스템에 축적되어 팀 전체 레벨업.', fontSize: 24, fontFamily: 'Pretendard', fontWeight: 800, color: '000000', align: 'left', valign: 'middle', placeholder: '{{card1NewDesc}}' },

            // 카드 2 배경 (Figma: x:498, y:627, w:1123, h:294)
            { id: 'card-2', type: 'shape', x: px(498, true), y: px(627, false), w: px(1123, true), h: px(294, false), fill: 'FFFFFF', stroke: 'CCCCCC', strokeWidth: 1.5, rectRadius: 0.1, shadow: { type: 'outer', color: '000000', blur: 4, offset: 3, angle: 90, opacity: 0.06 } },
            // 카드 2 제목 (Figma: x:498, y:575, fontSize:30)
            { id: '78:272', type: 'text', x: px(498, true), y: px(575, false), w: px(1123, true), h: px(36, false), text: '맞춤형 툴 조합', fontSize: 30, fontFamily: 'Pretendard', fontWeight: 800, color: '1E1E1E', align: 'left', placeholder: '{{card2Title}}' },
            // 기존방법 라벨 (Figma: x:538, y:685.5, fontSize:24)
            { id: '78:275', type: 'text', x: px(538, true), y: px(685.5, false), w: px(83, true), h: px(29, false), text: '기존방법', fontSize: 24, fontFamily: 'Pretendard', fontWeight: 800, color: '006EFF', align: 'left', valign: 'middle' },
            // 기존방법 설명 (Figma: x:671, y:662, fontSize:24)
            { id: '78:276', type: 'text', x: px(671, true), y: px(662, false), w: px(910, true), h: px(76, false), text: '"이 AI는 이거 잘하고, 저 AI는 저거 잘하고" 알면서도 따로따로 사용.\n정작 워크플로우 연결은 수동으로 복사-붙여넣기를 하게 됨.', fontSize: 24, fontFamily: 'Pretendard', fontWeight: 800, color: '000000', align: 'left', valign: 'middle', placeholder: '{{card2OldDesc}}' },
            // ORANGE 라벨 (Figma: x:538, y:817.5, fontSize:24)
            { id: '78:278', type: 'text', x: px(538, true), y: px(817.5, false), w: px(101, true), h: px(29, false), text: 'ORANGE', fontSize: 24, fontFamily: 'Pretendard', fontWeight: 800, color: 'FF3300', align: 'left', valign: 'middle' },
            // ORANGE 설명 (Figma: x:668, y:778, fontSize:24)
            { id: '78:279', type: 'text', x: px(668, true), y: px(778, false), w: px(913, true), h: px(108, false), text: 'Gemini Flash로 빠르게 분석, 나노바나나로 멀티모달 분석 후 생성\n→ GPT Image로 이미지 재가공과 편집 → Veo 3.1로 영상제작.\n한 플랫폼에서 이어지는 파이프라인. 필요에 따라 최적의 모델들을 조합.', fontSize: 24, fontFamily: 'Pretendard', fontWeight: 800, color: '000000', align: 'left', valign: 'middle', placeholder: '{{card2NewDesc}}' },
        ],
    },
};

// 템플릿 로드 함수
function loadTemplate(templateId) {
    return SLIDE_TEMPLATES[templateId] || null;
}

// 템플릿 기반 슬라이드 생성
function renderTemplateSlide(pptx, template, contentOverrides = {}) {
    const slide = pptx.addSlide();

    // 배경색 설정
    if (template.background?.color) {
        slide.background = { color: template.background.color };
    }

    // 배경 이미지들 추가 (z-index 순서)
    if (template.backgroundImages) {
        for (const img of template.backgroundImages) {
            const imgOpts = {
                path: img.url,
                x: img.x,
                y: img.y,
                w: img.w,
                h: img.h,
            };
            // 투명도 지원은 제한적 - 가능하면 적용
            if (img.opacity !== undefined && img.opacity < 1) {
                imgOpts.transparency = Math.round((1 - img.opacity) * 100);
            }
            slide.addImage(imgOpts);
        }
    }

    // 요소들 렌더링 (z-index 순서대로)
    for (const element of template.elements) {
        // 플레이스홀더 치환
        let text = element.text;
        if (element.placeholder && contentOverrides[element.placeholder]) {
            text = contentOverrides[element.placeholder];
        }

        if (element.type === 'text' && text) {
            slide.addText(text, {
                x: element.x,
                y: element.y,
                w: element.w,
                h: element.h,
                fontSize: fontPx(element.fontSize) || 12,
                fontFace: element.fontFamily || 'Pretendard',
                bold: (element.fontWeight || 400) >= 700,
                color: element.color || '000000',
                align: element.align || 'left',
                valign: element.valign || 'top',
                rotate: element.rotation || 0,
            });
        }

        if (element.type === 'shape') {
            const shapeOpts = {
                x: element.x,
                y: element.y,
                w: element.w,
                h: element.h,
            };

            if (element.fill) {
                const transparency = element.fillOpacity !== undefined
                    ? (1 - element.fillOpacity) * 100
                    : 0;
                shapeOpts.fill = { color: element.fill, transparency };
            }

            if (element.stroke) {
                shapeOpts.line = {
                    color: element.stroke,
                    width: element.strokeWidth || 1,
                };
            }

            // 라운드 처리 (PptxGenJS에서 rectRadius 인치 단위)
            if (element.rectRadius) {
                shapeOpts.rectRadius = element.rectRadius;
            }

            if (element.shadow) {
                shapeOpts.shadow = {
                    type: element.shadow.type || 'outer',
                    color: element.shadow.color,
                    blur: element.shadow.blur,
                    offset: element.shadow.offset,
                    angle: element.shadow.angle || 90,
                    opacity: element.shadow.opacity || 0.1,
                };
            }

            slide.addShape('roundRect', shapeOpts);
        }

        // 이미지
        if (element.type === 'image' && element.url) {
            slide.addImage({
                path: element.url,
                x: element.x,
                y: element.y,
                w: element.w,
                h: element.h,
            });
        }
    }

    return slide;
}

async function logError(errorType, errorMessage, requestData, responseData = null) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('error_logs').insert({
            service: 'generate-pptx',
            error_type: errorType,
            error_message: errorMessage,
            request_data: requestData,
            response_data: responseData,
            resolved: false
        });
        console.log('[ErrorLog] Logged:', errorType);
    } catch (e) {
        console.error('[ErrorLog] Exception:', e.message);
    }
}

// 컬러 무드 팔레트 정의 (프론트엔드와 동기화)
const COLOR_PALETTES = {
    warm: {
        name: '따뜻한',
        primary: 'E85A2C',      // 따뜻한 오렌지
        secondary: '8B5A3C',    // 브라운
        accent: 'D4A574',       // 베이지
        background: 'FFF8F5',   // 연한 크림
        text: '3D2B1F',         // 다크 브라운
        textLight: '6B5344',
        textOnPrimary: 'FFFFFF',
    },
    calm: {
        name: '차분한',
        primary: '2B579A',      // 네이비
        secondary: '4472C4',    // 블루
        accent: '70AD47',       // 그린
        background: 'F5F8FC',   // 연한 블루
        text: '2D3748',         // 다크 그레이
        textLight: '5A6578',
        textOnPrimary: 'FFFFFF',
    },
    modern: {
        name: '모던',
        primary: '00D4FF',      // 시안
        secondary: '7C3AED',    // 퍼플
        accent: '10B981',       // 민트
        background: '0F172A',   // 다크 네이비
        text: 'F1F5F9',         // 라이트
        textLight: 'CBD5E1',
        textOnPrimary: '0F172A',
    },
    minimal: {
        name: '미니멀',
        primary: '1A1A1A',      // 블랙
        secondary: '757575',    // 그레이
        accent: 'E53935',       // 레드 포인트
        background: 'FFFFFF',   // 화이트
        text: '1A1A1A',         // 블랙
        textLight: '757575',
        textOnPrimary: 'FFFFFF',
    },
};

// 단일 슬라이드 생성 헬퍼
function addSlideToPresentation(pptx, slideData, palette, index) {
    const slide = pptx.addSlide();
    const { type, title, subtitle, content, left, right } = slideData;

    // 배경색 설정
    slide.background = { color: palette.background };

    // 슬라이드 타입별 레이아웃
    if (type === 'title' || index === 0) {
        // ========== 표지 슬라이드 ==========
        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: 0.4, h: '100%',
            fill: { color: palette.primary },
        });

        slide.addShape(pptx.ShapeType.rect, {
            x: 0.4, y: 0, w: 9.6, h: 0.08,
            fill: { color: palette.accent },
        });

        slide.addText(title || `슬라이드 ${index + 1}`, {
            x: 0.8, y: 1.8, w: 8.5, h: 1.5,
            fontSize: 48,
            fontFace: 'Arial',
            color: palette.text,
            bold: true,
            valign: 'middle',
        });

        if (subtitle) {
            slide.addText(subtitle, {
                x: 0.8, y: 3.4, w: 8.5, h: 0.6,
                fontSize: 20,
                fontFace: 'Arial',
                color: palette.textLight,
                valign: 'middle',
            });
        }

        slide.addShape(pptx.ShapeType.rect, {
            x: 0.8, y: 5.0, w: 2.5, h: 0.06,
            fill: { color: palette.secondary },
        });

    } else if (type === 'two-column') {
        // ========== 2단 레이아웃 ==========
        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: 1.0,
            fill: { color: palette.primary },
        });

        slide.addText(title || `슬라이드 ${index + 1}`, {
            x: 0.5, y: 0.25, w: 9, h: 0.5,
            fontSize: 24,
            fontFace: 'Arial',
            color: palette.textOnPrimary,
            bold: true,
        });

        if (left) {
            slide.addText(left, {
                x: 0.5, y: 1.3, w: 4.3, h: 4,
                fontSize: 16,
                fontFace: 'Arial',
                color: palette.text,
                valign: 'top',
            });
        }

        if (right) {
            slide.addText(right, {
                x: 5.2, y: 1.3, w: 4.3, h: 4,
                fontSize: 16,
                fontFace: 'Arial',
                color: palette.text,
                valign: 'top',
            });
        }

    } else if (type === 'section') {
        // ========== 섹션 구분 슬라이드 ==========
        slide.background = { color: palette.primary };

        slide.addShape(pptx.ShapeType.rect, {
            x: 0.8, y: 1.5, w: 0.08, h: 2.5,
            fill: { color: palette.accent },
        });

        slide.addText(title || `섹션 ${index + 1}`, {
            x: 1.2, y: 2.0, w: 8, h: 1.2,
            fontSize: 44,
            fontFace: 'Arial',
            color: palette.textOnPrimary,
            bold: true,
        });

        if (subtitle) {
            slide.addText(subtitle, {
                x: 1.2, y: 3.3, w: 8, h: 0.6,
                fontSize: 18,
                fontFace: 'Arial',
                color: palette.textOnPrimary,
            });
        }

    } else if (type === 'ending') {
        // ========== 마무리 슬라이드 ==========
        slide.background = { color: palette.secondary };

        slide.addText(title || '감사합니다', {
            x: 0.5, y: 2.0, w: 9, h: 1.2,
            fontSize: 52,
            fontFace: 'Arial',
            color: 'FFFFFF',
            bold: true,
            align: 'center',
            valign: 'middle',
        });

        if (subtitle) {
            slide.addText(subtitle, {
                x: 0.5, y: 3.5, w: 9, h: 0.6,
                fontSize: 18,
                fontFace: 'Arial',
                color: 'FFFFFF',
                align: 'center',
            });
        }

        slide.addShape(pptx.ShapeType.rect, {
            x: 3.5, y: 4.3, w: 3, h: 0.06,
            fill: { color: palette.accent },
        });

    } else {
        // ========== 기본 콘텐츠 슬라이드 ==========
        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: 1.2,
            fill: { color: palette.primary },
        });

        slide.addText(title || `슬라이드 ${index + 1}`, {
            x: 0.5, y: 0.35, w: 9, h: 0.5,
            fontSize: 28,
            fontFace: 'Arial',
            color: palette.textOnPrimary,
            bold: true,
        });

        const bodyText = content || '• 내용을 입력하세요';
        slide.addText(bodyText, {
            x: 0.5, y: 1.5, w: 9, h: 3.8,
            fontSize: 18,
            fontFace: 'Arial',
            color: palette.text,
            valign: 'top',
            paraSpaceAfter: 12,
        });

        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 5.55, w: '100%', h: 0.08,
            fill: { color: palette.accent },
        });
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            // 단일 슬라이드 모드 (하위 호환)
            title, subtitle, description, mood = 'modern', slideType = 'title',
            // 다중 슬라이드 모드 (Swimming용)
            slides, documentName,
            // 템플릿 모드 (Figma 기반)
            templateId, contentOverrides
        } = req.body;

        const palette = COLOR_PALETTES[mood] || COLOR_PALETTES.modern;
        const pptx = new PptxGenJS();

        pptx.author = 'Orange Whale';
        pptx.company = 'FM COMMUNICATIONS';
        pptx.layout = 'LAYOUT_WIDE';

        // 템플릿 모드 (Figma 기반 PPT 생성)
        if (templateId) {
            const template = loadTemplate(templateId);
            if (!template) {
                return res.status(404).json({ error: `Template not found: ${templateId}` });
            }

            pptx.title = template.name || '프레젠테이션';
            renderTemplateSlide(pptx, template, contentOverrides || {});

            const pptxData = await pptx.write({ outputType: 'base64' });
            const filename = (template.name || 'slide').replace(/[^a-zA-Z0-9가-힣\s]/g, '').replace(/\s+/g, '_');

            return res.status(200).json({
                success: true,
                data: pptxData,
                filename: `${filename}.pptx`,
                templateId,
                mode: 'template',
            });
        }

        // 다중 슬라이드 모드
        if (slides && Array.isArray(slides) && slides.length > 0) {
            pptx.title = documentName || '프레젠테이션';

            slides.forEach((slideData, index) => {
                addSlideToPresentation(pptx, slideData, palette, index);
            });

            const pptxData = await pptx.write({ outputType: 'base64' });
            const filename = (documentName || '프레젠테이션').replace(/[^a-zA-Z0-9가-힣\s]/g, '').replace(/\s+/g, '_');

            return res.status(200).json({
                success: true,
                data: pptxData,
                filename: `${filename}.pptx`,
                slideCount: slides.length,
            });
        }

        // 단일 슬라이드 모드 (하위 호환)
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        pptx.title = title;
        pptx.subject = subtitle || '';

        addSlideToPresentation(pptx, {
            type: slideType,
            title,
            subtitle,
            content: description,
        }, palette, 0);

        const pptxData = await pptx.write({ outputType: 'base64' });

        res.status(200).json({
            success: true,
            data: pptxData,
            filename: `${title.replace(/[^a-zA-Z0-9가-힣\s]/g, '').replace(/\s+/g, '_')}.pptx`,
            mood: mood,
            slideType: slideType,
        });

    } catch (error) {
        console.error('PPTX generation error:', error);

        await logError(
            'GENERAL_ERROR',
            error.message,
            req.body,
            { stack: error.stack }
        );

        res.status(500).json({
            error: 'Failed to generate PPTX: ' + error.message,
            friendlyMessage: {
                message: 'PPT 생성 중 문제가 발생했어요. 다시 시도해주세요 🔄'
            }
        });
    }
}

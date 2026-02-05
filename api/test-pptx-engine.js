/**
 * PPTX Engine 테스트
 */

const fs = require('fs');
const path = require('path');
const { generatePptx } = require('./pptx-engine');

async function test() {
  // 슬라이드 템플릿 정의
  const template = {
    background: { color: 'F5F5F5' },
    elements: [
      // 메인 타이틀
      {
        type: 'text',
        x: 0.5,          // 인치
        y: 0.5,
        width: 5,
        height: 1,
        text: '기존방법\nVS\nOrange Whale',
        fontSize: 24,    // pt
        fontFamily: 'Pretendard',
        bold: true,
        color: '1E1E1E',
        lineSpacing: 36, // pt (행간)
        align: 'l',
      },
      // 카드 1 배경
      {
        type: 'shape',
        x: 3.5,
        y: 1.5,
        width: 8,
        height: 2,
        fill: 'FFFFFF',
        stroke: 'CCCCCC',
        strokeWidth: 1.5,
        borderRadius: 15,
        shadow: {
          color: '000000',
          blur: 6,
          offsetY: 4,
          opacity: 0.1,
        },
      },
      // 카드 1 제목
      {
        type: 'text',
        x: 3.7,
        y: 1.2,
        width: 7.5,
        height: 0.4,
        text: '크리에이티브 품질 상향 평준화',
        fontSize: 18,
        fontFamily: 'Pretendard',
        bold: true,
        color: '1E1E1E',
      },
      // 기존방법 라벨
      {
        type: 'text',
        x: 3.7,
        y: 1.8,
        width: 1,
        height: 0.3,
        text: '기존방법',
        fontSize: 14,
        fontFamily: 'Pretendard',
        bold: true,
        color: '006EFF',
      },
      // 기존방법 설명
      {
        type: 'text',
        x: 4.8,
        y: 1.7,
        width: 6.5,
        height: 0.6,
        text: 'AI 잘 쓰는 직원 vs 못 쓰는 직원 격차가 굉장히 큼.\n프롬프트 잘 쓰는 사람만 좋은 결과물.',
        fontSize: 12,
        fontFamily: 'Pretendard',
        bold: true,
        color: '000000',
        lineSpacing: 18, // 18pt 행간
      },
      // ORANGE 라벨
      {
        type: 'text',
        x: 3.7,
        y: 2.6,
        width: 1,
        height: 0.3,
        text: 'ORANGE',
        fontSize: 14,
        fontFamily: 'Pretendard',
        bold: true,
        color: 'FF3300',
      },
      // ORANGE 설명
      {
        type: 'text',
        x: 4.8,
        y: 2.5,
        width: 6.5,
        height: 0.6,
        text: '프리셋, 템플릿, 가이드 제공으로 누구나 일정 수준 이상.\n잘하는 사람의 노하우가 시스템에 축적.',
        fontSize: 12,
        fontFamily: 'Pretendard',
        bold: true,
        color: '000000',
        lineSpacing: 18,
      },
      // 푸터
      {
        type: 'text',
        x: 10,
        y: 7,
        width: 2.5,
        height: 0.3,
        text: 'FM COMMUNICATIONS Inc.',
        fontSize: 10,
        fontFamily: 'Pretendard',
        color: '666666',
        align: 'r',
      },
    ],
  };

  console.log('PPTX 생성 중...');
  const pptxBuffer = await generatePptx(template);

  const outputPath = path.join(__dirname, '..', 'test-engine-output.pptx');
  fs.writeFileSync(outputPath, pptxBuffer);
  console.log('완료:', outputPath);

  // Desktop에도 복사
  const desktopPath = '/Users/hilabs/Desktop/test-engine-output.pptx';
  fs.writeFileSync(desktopPath, pptxBuffer);
  console.log('Desktop 복사:', desktopPath);
}

test().catch(console.error);

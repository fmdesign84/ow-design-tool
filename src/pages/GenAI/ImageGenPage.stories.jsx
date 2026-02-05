import ImageGenPage from './ImageGenPage';

const meta = {
    title: 'Pages/GenAI/ImageGenPage',
    component: ImageGenPage,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
## AI Studio - 이미지 생성 페이지

Google Imagen 4 + Gemini를 활용한 AI 이미지 생성 페이지입니다.

### 주요 기능
- **이미지 생성**: 텍스트 프롬프트로 이미지 생성
- **이미지 변환**: 기존 이미지를 변환
- **업스케일**: 이미지 해상도 향상
- **배경 없애기**: 이미지에서 배경 제거

### 레이아웃 구조
- **1행**: 메뉴 카드 (탭 + 서브메뉴) - 전체 폭
- **2행**: 프롬프트 카드 | 이미지 카드 | 아카이브 카드

### 탭 구성
- 이미지 생성: 자유 생성, 이미지 변환, 업스케일, 배경 없애기
- 영상 생성: 자유 생성
- 디자인 생성: 자유 생성
                `,
            },
        },
    },
};
export default meta;

// 기본 상태
export const Default = () => <ImageGenPage />;
Default.storyName = '기본 상태';

// 사용 가이드
export const UsageGuide = () => (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '24px', color: '#212121' }}>AI Studio 사용 가이드</h2>

        <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#FF6B35', marginBottom: '12px' }}>1. 탭 선택</h3>
            <p style={{ color: '#5F5F5F', lineHeight: 1.6 }}>
                상단의 폴더 탭에서 이미지 생성, 영상 생성, 디자인 생성 중 원하는 기능을 선택합니다.
            </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#FF6B35', marginBottom: '12px' }}>2. 서브메뉴 선택</h3>
            <p style={{ color: '#5F5F5F', lineHeight: 1.6 }}>
                탭 아래의 서브메뉴에서 세부 기능을 선택합니다. (예: 자유 생성, 배경 없애기)
            </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#FF6B35', marginBottom: '12px' }}>3. 프롬프트 입력</h3>
            <p style={{ color: '#5F5F5F', lineHeight: 1.6 }}>
                왼쪽 프롬프트 카드에서 원하는 이미지를 설명합니다. 한글 또는 영어로 입력 가능합니다.
            </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#FF6B35', marginBottom: '12px' }}>4. 옵션 설정</h3>
            <p style={{ color: '#5F5F5F', lineHeight: 1.6 }}>
                이미지 품질, 비율, 스타일 프리셋, 네거티브 프롬프트를 설정합니다.
            </p>
        </div>

        <div>
            <h3 style={{ color: '#FF6B35', marginBottom: '12px' }}>5. 생성 및 확인</h3>
            <p style={{ color: '#5F5F5F', lineHeight: 1.6 }}>
                "이미지 생성하기" 버튼을 클릭하면 가운데 카드에 결과가 표시되고,
                오른쪽 아카이브에 히스토리가 저장됩니다.
            </p>
        </div>
    </div>
);
UsageGuide.storyName = '사용 가이드';

// PC 버전 - 갤러리 5개, 호버 blur 효과
export const DesktopView = () => <ImageGenPage />;
DesktopView.storyName = '🖥️ PC 버전';
DesktopView.parameters = {
    viewport: {
        defaultViewport: 'desktop',
    },
    docs: {
        description: {
            story: `
### PC 버전 특징
- **갤러리 아이템**: 5개씩 표시
- **호버 효과**: 이미지 blur + 오버레이 표시
- **검색창**: 70% 너비, 클릭 시 아래로만 확장
            `,
        },
    },
};

// 모바일 버전 - 갤러리 3개, 호버 없이 항상 오버레이 표시
export const MobileView = () => <ImageGenPage />;
MobileView.storyName = '📱 모바일 버전';
MobileView.parameters = {
    viewport: {
        defaultViewport: 'mobile1',
    },
    docs: {
        description: {
            story: `
### 모바일 버전 특징
- **갤러리 아이템**: 3개씩 표시 (3열 그리드)
- **호버 효과**: 없음 (항상 하단 오버레이 표시)
- **검색창**: 화면 너비에 맞춤, 옵션 항상 표시
- **순차 애니메이션**: 갤러리 → 아이디어 순서로 로딩
            `,
        },
    },
};

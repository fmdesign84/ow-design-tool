import { MemoryRouter } from 'react-router-dom';
import MobileGNB from './MobileGNB';

const meta = {
  title: 'Layout/MobileGNB',
  component: MobileGNB,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};
export default meta;

// 기본 모바일 GNB
export const Default = {
  args: {
    pageTitle: '페이지 제목',
    userName: '윤국현',
    userRole: 'BM Leader',
    notificationCount: 3,
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', background: '#F5F6F8' }}>
        <Story />
        <div style={{ padding: '72px 16px 16px 16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1A1A1A' }}>
            페이지 컨텐츠
          </h2>
          <p style={{ fontSize: '14px', color: '#5F5F5F', lineHeight: '1.6' }}>
            왼쪽 상단의 햄버거 메뉴를 클릭하면 네비게이션 메뉴가 나타납니다.
            메뉴는 왼쪽에서 슬라이드되어 나타나며, 반투명 배경 클릭 또는 X 버튼으로 닫을 수 있습니다.
          </p>
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #E8E8E8'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#212121' }}>
              주요 기능
            </h3>
            <ul style={{ fontSize: '13px', color: '#5F5F5F', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Glass morphism 스타일 (반투명 배경 + 블러 효과)</li>
              <li>터치 친화적 (최소 44px 탭 타겟)</li>
              <li>부드러운 슬라이드 애니메이션</li>
              <li>자동 메뉴 확장 (현재 경로에 따라)</li>
              <li>ESC 키로 메뉴 닫기</li>
              <li>메뉴 열릴 때 body 스크롤 방지</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  ],
};

// 알림 없음
export const NoNotifications = {
  args: {
    pageTitle: '전자결재',
    userName: '박지민',
    userRole: 'PM',
    notificationCount: 0,
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', background: '#F5F6F8' }}>
        <Story />
        <div style={{ padding: '72px 16px' }}>
          <p style={{ fontSize: '14px', color: '#5F5F5F' }}>알림이 없는 상태입니다.</p>
        </div>
      </div>
    ),
  ],
};

// 많은 알림
export const ManyNotifications = {
  args: {
    pageTitle: 'Dashboard',
    userName: '김철수',
    userRole: 'DCO',
    notificationCount: 99,
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', background: '#F5F6F8' }}>
        <Story />
        <div style={{ padding: '72px 16px' }}>
          <p style={{ fontSize: '14px', color: '#5F5F5F' }}>많은 알림이 있는 상태입니다 (99개).</p>
        </div>
      </div>
    ),
  ],
};

// 사용법 가이드
export const UsageGuide = () => (
  <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
    <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '700' }}>MobileGNB 사용법</h3>

    <div style={{ marginBottom: '24px' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>기본 사용</h4>
      <pre style={{
        background: '#F5F6F8',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '12px',
        overflow: 'auto',
        border: '1px solid #E8E8E8'
      }}>
{`import MobileGNB from '../components/layout/MobileGNB';

const MobileLayout = () => {
  return (
    <>
      <MobileGNB
        pageTitle="페이지 제목"
        userName="윤국현"
        userRole="BM Leader"
        notificationCount={3}
      />
      <main style={{ paddingTop: '56px' }}>
        {/* 페이지 내용 */}
      </main>
    </>
  );
};`}
      </pre>
    </div>

    <div style={{ marginBottom: '24px' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Props</h4>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px',
        border: '1px solid #E8E8E8'
      }}>
        <thead>
          <tr style={{ background: '#F5F6F8' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>Prop</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>Type</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>Default</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>pageTitle</td>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>string</td>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>'페이지'</td>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>헤더 중앙에 표시될 페이지 제목 (현재는 로고 표시)</td>
          </tr>
          <tr>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>userName</td>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>string</td>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>'윤국현'</td>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>사용자 이름</td>
          </tr>
          <tr>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>userRole</td>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>string</td>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>'BM Leader'</td>
            <td style={{ padding: '12px', borderBottom: '1px solid #E8E8E8' }}>사용자 직책/역할</td>
          </tr>
          <tr>
            <td style={{ padding: '12px' }}>notificationCount</td>
            <td style={{ padding: '12px' }}>number</td>
            <td style={{ padding: '12px' }}>3</td>
            <td style={{ padding: '12px' }}>읽지 않은 알림 수</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style={{ marginBottom: '24px' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>주요 기능</h4>
      <div style={{
        background: '#FFF5F0',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #FFE5D0'
      }}>
        <ul style={{ fontSize: '13px', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
          <li><strong>햄버거 메뉴</strong> - 왼쪽 상단 클릭 시 네비게이션 슬라이드</li>
          <li><strong>Glass Morphism</strong> - 반투명 배경 + 블러 효과</li>
          <li><strong>터치 친화적</strong> - 최소 44px 탭 타겟 크기</li>
          <li><strong>스무스 애니메이션</strong> - transform: translateX 사용</li>
          <li><strong>자동 메뉴 확장</strong> - 현재 경로에 따라 서브메뉴 자동 펼침</li>
          <li><strong>키보드 지원</strong> - ESC 키로 메뉴 닫기</li>
          <li><strong>스크롤 제어</strong> - 메뉴 열릴 때 body 스크롤 방지</li>
          <li><strong>배경 클릭</strong> - 반투명 배경 클릭으로 메뉴 닫기</li>
        </ul>
      </div>
    </div>

    <div style={{ marginBottom: '24px' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>메뉴 구조</h4>
      <div style={{
        background: '#F5F6F8',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #E8E8E8',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <div>├─ HOME</div>
        <div>├─ 프로젝트</div>
        <div>│  ├─ 부서별 프로젝트</div>
        <div>│  └─ 프로젝트 넘버</div>
        <div>├─ 전자결재</div>
        <div>│  ├─ 기안하기 (모달)</div>
        <div>│  ├─ 결재하기 ▼</div>
        <div>│  │  ├─ 결재대기</div>
        <div>│  │  └─ 결재예정</div>
        <div>│  └─ 문서함 ▼</div>
        <div>│     ├─ 기안 문서함</div>
        <div>│     ├─ 임시 저장함</div>
        <div>│     ├─ 결재 문서함</div>
        <div>│     ├─ 참조/열람 문서함</div>
        <div>│     ├─ 부서 문서함</div>
        <div>│     └─ 전체 문서함</div>
        <div>├─ 목표관리</div>
        <div>│  ├─ 전사 목표관리</div>
        <div>│  ├─ 부서 목표관리</div>
        <div>│  ├─ 프로젝트 기여도</div>
        <div>│  └─ 개인 목표관리</div>
        <div>├─ F&S</div>
        <div>│  ├─ 회계넘버 관리</div>
        <div>│  └─ 전사 재무목표 관리</div>
        <div>└─ FM AI STUDIO</div>
        <div>   ├─ 이미지 생성</div>
        <div>   ├─ 영상 생성</div>
        <div>   └─ 디자인 생성</div>
      </div>
    </div>

    <div>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>스타일 커스터마이징</h4>
      <p style={{ fontSize: '13px', color: '#5F5F5F', lineHeight: '1.6', marginBottom: '12px' }}>
        CSS Module을 통해 스타일을 커스터마이징할 수 있습니다. 주요 CSS 변수:
      </p>
      <div style={{
        background: '#F5F6F8',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #E8E8E8'
      }}>
        <pre style={{ margin: 0, fontSize: '12px' }}>
{`/* 헤더 높이 */
.mobileHeader { height: 56px; }

/* 메뉴 너비 */
.menuSlider { width: 280px; max-width: 85vw; }

/* 탭 타겟 최소 크기 */
.hamburgerBtn { min-height: 44px; }

/* Glass morphism 효과 */
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(30px);`}
        </pre>
      </div>
    </div>
  </div>
);

// 데모: 다양한 상태
export const InteractiveDemo = () => (
  <MemoryRouter>
    <div style={{ minHeight: '100vh', background: '#F5F6F8' }}>
      <MobileGNB
        pageTitle="Interactive Demo"
        userName="윤국현"
        userRole="BM Leader"
        notificationCount={5}
      />
      <div style={{ padding: '72px 16px' }}>
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #E8E8E8',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#212121' }}>
            인터랙티브 데모
          </h3>
          <p style={{ fontSize: '14px', color: '#5F5F5F', lineHeight: '1.6', marginBottom: '16px' }}>
            햄버거 메뉴를 클릭하여 다음 기능들을 테스트해보세요:
          </p>
          <ol style={{ fontSize: '13px', color: '#5F5F5F', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>햄버거 아이콘 클릭하여 메뉴 열기</li>
            <li>메뉴 항목 클릭하여 네비게이션</li>
            <li>서브메뉴 화살표 클릭하여 펼치기/접기</li>
            <li>반투명 배경 클릭하여 메뉴 닫기</li>
            <li>X 버튼 클릭하여 메뉴 닫기</li>
            <li>ESC 키 눌러서 메뉴 닫기</li>
            <li>기안하기 클릭하여 모달 열기</li>
          </ol>
        </div>
      </div>
    </div>
  </MemoryRouter>
);

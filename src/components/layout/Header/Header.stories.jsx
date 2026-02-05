import Header from './Header';

const meta = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};
export default meta;

// 기본 헤더
export const Default = {
  args: {
    pageTitle: '페이지 제목',
    userName: '윤국현',
    userRole: 'DCO',
    notificationCount: 3,
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#fff', minHeight: '100px' }}>
        <Story />
      </div>
    ),
  ],
};

// 다양한 페이지 제목
export const DifferentPages = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <Header pageTitle="Dashboard" userName="윤국현" userRole="DCO" notificationCount={5} />
    <Header pageTitle="부서별 프로젝트" userName="김철수" userRole="BM Leader" notificationCount={0} />
    <Header pageTitle="전자결재" userName="이영희" userRole="PM" notificationCount={12} />
  </div>
);

// 알림 없음
export const NoNotifications = {
  args: {
    pageTitle: '전자결재',
    userName: '박지민',
    userRole: 'BM',
    notificationCount: 0,
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#fff', minHeight: '100px' }}>
        <Story />
      </div>
    ),
  ],
};

// Props 설명
export const UsageGuide = () => (
  <div style={{ padding: '24px', maxWidth: '600px' }}>
    <h3 style={{ marginBottom: '16px' }}>Header 사용법</h3>

    <pre style={{ background: '#F5F6F8', padding: '16px', borderRadius: '8px', fontSize: '12px', overflow: 'auto' }}>
{`import Header from '../components/layout/Header';

const PageLayout = () => {
  return (
    <div className="page-container">
      <Header
        pageTitle="부서별 프로젝트"
        userName="윤국현"
        userRole="DCO"
        notificationCount={3}
      />
      <main>
        {/* 페이지 내용 */}
      </main>
    </div>
  );
};`}
    </pre>

    <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>Props</h4>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>
        <tr style={{ background: '#F5F6F8' }}>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>Prop</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>Type</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>Default</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #E8E8E8' }}>설명</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>pageTitle</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>string</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>'페이지'</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>페이지 제목</td></tr>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>userName</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>string</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>'윤국현'</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>사용자 이름</td></tr>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>userRole</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>string</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>'DCO'</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>사용자 직책/역할</td></tr>
        <tr><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>notificationCount</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>number</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>3</td><td style={{ padding: '10px', borderBottom: '1px solid #E8E8E8' }}>읽지 않은 알림 수</td></tr>
      </tbody>
    </table>

    <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>포함된 기능</h4>
    <ul style={{ fontSize: '13px', lineHeight: '1.8' }}>
      <li><strong>알림 벨</strong> - 클릭 시 NotificationPopup 표시</li>
      <li><strong>알림 배지</strong> - notificationCount가 0보다 크면 표시</li>
      <li><strong>사용자 정보</strong> - 이름, 직책, 아바타 표시</li>
    </ul>
  </div>
);

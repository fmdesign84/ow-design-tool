/**
 * Mock Data - 개발용 더미 데이터
 *
 * 실제 API 연동 시 이 파일 대신 API 호출로 교체
 * 프론트엔드 개발자 참고: 데이터 구조는 유지, fetch/axios로 교체하면 됨
 */

// 상태 컬러 (_variables.css와 동기화)
const STATUS_COLORS = {
  success: { color: '#22C55E', bg: '#DCFCE7' },      // --color-success 녹색
  info: { color: '#3B82F6', bg: '#DBEAFE' },         // --color-info 파란색
  warning: { color: '#FF6B35', bg: '#FFF5F0' },      // --color-primary 주황색
  gray: { color: '#607D8B', bg: '#ECEFF1' },         // --color-gray 그레이
};

// 공식 직책 (Position Titles)
export const POSITION_TITLES = {
  BM_LEADER: 'BM Leader',
  BM: 'BM',
  CEO: 'CEO',
  CKO: 'CKO',
  DCO: 'DCO',
  CDO: 'CDO',
  CSIO: 'CSIO',
  CHAIRMAN: '회장',
};

// 전사목표관리 - 부서 데이터
export const departmentData = [
  { dept: 'XP 01', head: '이지헌', position: 'BM Leader', achievement: 142.5, goal: '18,500,000,000', revenue: '19,200,000,000', profit: '5,760,000,000', rate: '32.5%', sales: '4,320,000,000' },
  { dept: 'XP 02', head: '염시윤', position: 'BM Leader', achievement: 98.2, goal: '12,000,000,000', revenue: '11,784,000,000', profit: '3,535,200,000', rate: '28.4%', sales: '2,651,400,000' },
  { dept: 'XP 03', head: '강찬구', position: 'BM Leader', achievement: 127.8, goal: '14,200,000,000', revenue: '18,147,600,000', profit: '5,444,280,000', rate: '35.2%', sales: '4,083,210,000' },
  { dept: 'XP 04', head: '강명현', position: 'BM Leader', achievement: 85.6, goal: '16,800,000,000', revenue: '14,380,800,000', profit: '4,314,240,000', rate: '26.8%', sales: '3,235,680,000' },
  { dept: 'XP 05', head: '조유정', position: 'BM Leader', achievement: 156.3, goal: '9,500,000,000', revenue: '14,848,500,000', profit: '4,454,550,000', rate: '38.1%', sales: '3,340,912,500' },
  { dept: 'XP 06', head: '조수경', position: 'BM Leader', achievement: 72.4, goal: '20,000,000,000', revenue: '14,480,000,000', profit: '4,344,000,000', rate: '24.5%', sales: '3,258,000,000' },
  { dept: 'XP 07', head: '박지인', position: 'BM Leader', achievement: 30.0, goal: '15,000,000,000', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', sales: '15,000,000,000' },
  { dept: 'XP 08', head: '김일영', position: 'BM Leader', achievement: 30.0, goal: '15,000,000,000', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', sales: '15,000,000,000' },
  { dept: 'XP 09', head: '김유란', position: 'BM Leader', achievement: 30.0, goal: '15,000,000,000', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', sales: '15,000,000,000' },
  { dept: 'XP 10', head: '조선', position: 'BM Leader', achievement: 30.0, goal: '15,000,000,000', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', sales: '15,000,000,000' },
  { dept: 'XP 11', head: '윤수현', position: 'BM Leader', achievement: 30.0, goal: '15,000,000,000', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', sales: '15,000,000,000' },
  { dept: 'XP 12', head: '김민선', position: 'BM Leader', achievement: 30.0, goal: '15,000,000,000', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', sales: '15,000,000,000' },
  { dept: 'DI labs', head: '양희리', position: 'BM Leader', achievement: 30.0, goal: '15,000,000,000', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', sales: '15,000,000,000' },
  { dept: 'FM Studio', head: '김철환', position: 'BM Leader', achievement: 30.0, goal: '15,000,000,000', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', sales: '15,000,000,000' },
];

// 부서별 프로젝트 - 프로젝트 데이터
// isChanged: 변동된 프로젝트 여부 (NEW 표시용)
// isPending: 재무팀 미승인 (부여대기) 상태
export const projectData = [
  { id: 'F02-1457', name: '2025 메이플스토리 퍼스트 클리어 패키지 제작', client: '넥슨코리아', startDate: '25-07-09', stage: '영업/기획', dept: 'XP 01', deptPercent: 50, contribDepts: [{ name: 'XP 02', percent: 20 }, { name: 'XP 06', percent: 15 }, { name: 'XP 08', percent: 15 }], pm: '이지헌', pmPosition: 'BM Leader', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', isChanged: true, isPending: false },
  { id: 'F02-1458', name: '2025 리니지W 글로벌 런칭 캠페인', client: '엔씨소프트', startDate: '25-06-17', stage: '영업/기획', dept: 'XP 02', deptPercent: 100, contribDepts: [], pm: '남궁현정', pmPosition: 'BM Leader', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', isChanged: true, isPending: true },
  { id: 'F02-1400', name: '삼성전자 AI 서밋 2025', client: '삼성전자', startDate: '24-12-01', stage: '재무팀 검토', dept: 'XP 03', deptPercent: 50, contribDepts: [{ name: 'XP 05', percent: 30 }, { name: 'XP 08', percent: 20 }], pm: '이수진', pmPosition: 'BM Leader', revenue: '12,000,000,000', profit: '12,000,000,000', rate: '25.0%', isChanged: false, isPending: false },
  { id: 'F02-1459', name: '카카오게임즈 오딘2 론칭 프로모션', client: '카카오게임즈', startDate: '25-03-24', stage: '영업/기획', dept: 'XP 04', deptPercent: 80, contribDepts: [{ name: 'XP 01', percent: 20 }], pm: '장병희', pmPosition: 'BM', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', isChanged: true, isPending: true },
  { id: 'F02-1460', name: '현대자동차 모빌리티 엑스포 2025', client: '현대자동차', startDate: '25-07-09', stage: '실적마감', dept: 'XP 05', deptPercent: 60, contribDepts: [{ name: 'XP 03', percent: 25 }, { name: 'XP 07', percent: 15 }], pm: '조선', pmPosition: 'CXO', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', isChanged: true, isPending: false },
  { id: 'F02-1461', name: '스마일게이트 로스트아크 페스티벌', client: '스마일게이트RPG', startDate: '25-06-17', stage: '실행', dept: 'XP 06', deptPercent: 100, contribDepts: [], pm: '남궁현정', pmPosition: 'BM Leader', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', isChanged: true, isPending: false },
  { id: 'F02-1462', name: '크래프톤 배틀그라운드 월드 챔피언십', client: '크래프톤', startDate: '25-03-24', stage: '사후정산', dept: 'XP 07', deptPercent: 45, contribDepts: [{ name: 'XP 02', percent: 35 }, { name: 'XP 09', percent: 20 }], pm: '장병희', pmPosition: 'BM', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', isChanged: false, isPending: false },
  { id: 'F02-1463', name: '펄어비스 검은사막 10주년 기념행사', client: '펄어비스', startDate: '24-12-21', stage: '탈락', dept: 'XP 08', deptPercent: 30, contribDepts: [{ name: 'XP 04', percent: 40 }, { name: 'XP 10', percent: 30 }], pm: '양서현정', pmPosition: 'BM Leader', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', isChanged: true, isPending: false },
  { id: 'F02-1464', name: 'LG전자 CES 2025 부스 운영', client: 'LG전자', startDate: '24-07-09', stage: '실적마감', dept: 'XP 09', deptPercent: 90, contribDepts: [{ name: 'XP 11', percent: 10 }], pm: '장은혁', pmPosition: 'CXO', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', isChanged: true, isPending: false },
  { id: 'F02-1465', name: 'G-STAR 2025 엔씨소프트 전시관', client: '엔씨소프트', startDate: '24-08-15', stage: '영업/기획', dept: 'XP 10', deptPercent: 55, contribDepts: [{ name: 'XP 06', percent: 45 }], pm: '조현주', pmPosition: 'BM Leader', revenue: '15,000,000,000', profit: '15,000,000,000', rate: '30.0%', isChanged: true, isPending: false },
  { id: 'F02-1466', name: '넥슨 블루아카이브 2주년 페스티벌', client: '넥슨게임즈', startDate: '25-01-15', stage: '실행', dept: 'XP 11', deptPercent: 75, contribDepts: [{ name: 'XP 01', percent: 25 }], pm: '김민수', pmPosition: 'BM', revenue: '8,500,000,000', profit: '2,550,000,000', rate: '30.0%', isChanged: true, isPending: false },
  { id: 'F02-1467', name: '롯데월드 어드벤처 스프링 페스타', client: '롯데월드', startDate: '25-02-28', stage: '행사취소', dept: 'XP 12', deptPercent: 70, contribDepts: [{ name: 'XP 03', percent: 30 }], pm: '김민선', pmPosition: 'BM Leader', revenue: '6,200,000,000', profit: '-', rate: '-', isChanged: false, isPending: false },
];

// 연도 옵션
export const yearOptions = [
  { value: '2025', label: '2025년' },
  { value: '2024', label: '2024년' },
  { value: '2023', label: '2023년' },
];

// 단계별 스타일 매핑 (STATUS_COLORS 사용)
export const stageStyles = {
  // 프로젝트 진행 중 - 녹색
  '영업/기획': { bg: STATUS_COLORS.success.bg, color: STATUS_COLORS.success.color, border: STATUS_COLORS.success.color },
  '실행': { bg: STATUS_COLORS.success.bg, color: STATUS_COLORS.success.color, border: STATUS_COLORS.success.color },
  '사후정산': { bg: STATUS_COLORS.success.bg, color: STATUS_COLORS.success.color, border: STATUS_COLORS.success.color },
  // 재무팀 검토 - 파란색
  '재무팀 검토': { bg: STATUS_COLORS.info.bg, color: STATUS_COLORS.info.color, border: STATUS_COLORS.info.color },
  // 실적마감 - 주황색
  '실적마감': { bg: STATUS_COLORS.warning.bg, color: STATUS_COLORS.warning.color, border: STATUS_COLORS.warning.color },
  // 탈락/행사취소 - 그레이
  '탈락': { bg: STATUS_COLORS.gray.bg, color: STATUS_COLORS.gray.color, border: STATUS_COLORS.gray.color },
  '행사취소': { bg: STATUS_COLORS.gray.bg, color: STATUS_COLORS.gray.color, border: STATUS_COLORS.gray.color },
};

/**
 * 전자결재 문서함 관련 상수
 */

// 문서 구분 타입
export const DOC_TYPES = {
  DRAFT: '기안',      // 내가 기안한 문서
  APPROVE: '결재',    // 내가 결재라인에 포함된 문서
  REFERENCE: '참조',  // 참조로 받은 문서
  VIEW: '열람',       // 열람 권한 문서
};

// 구분 필터 옵션 (드롭다운용)
export const TYPE_OPTIONS = [
  { value: '', label: '전체' },
  { value: DOC_TYPES.DRAFT, label: DOC_TYPES.DRAFT },
  { value: DOC_TYPES.APPROVE, label: DOC_TYPES.APPROVE },
  { value: DOC_TYPES.REFERENCE, label: DOC_TYPES.REFERENCE },
  { value: DOC_TYPES.VIEW, label: DOC_TYPES.VIEW },
];

// 문서 상태
export const DOC_STATUS = {
  PROGRESS: 'progress',
  COMPLETE: 'complete',
  REJECTED: 'rejected',
};

// 상태 라벨 매핑
export const STATUS_LABELS = {
  [DOC_STATUS.PROGRESS]: '진행중',
  [DOC_STATUS.COMPLETE]: '완료',
  [DOC_STATUS.REJECTED]: '반려',
};

// 상태 색상 매핑
export const STATUS_COLORS = {
  [DOC_STATUS.PROGRESS]: '#22C55E',
  [DOC_STATUS.COMPLETE]: '#FF6B35',
  [DOC_STATUS.REJECTED]: '#607D8B',
};

// 상태 필터 옵션 (드롭다운용)
export const STATUS_OPTIONS = [
  { value: '', label: '전체', color: '#5F5F5F' },
  { value: DOC_STATUS.PROGRESS, label: STATUS_LABELS[DOC_STATUS.PROGRESS], color: STATUS_COLORS[DOC_STATUS.PROGRESS] },
  { value: DOC_STATUS.COMPLETE, label: STATUS_LABELS[DOC_STATUS.COMPLETE], color: STATUS_COLORS[DOC_STATUS.COMPLETE] },
  { value: DOC_STATUS.REJECTED, label: STATUS_LABELS[DOC_STATUS.REJECTED], color: STATUS_COLORS[DOC_STATUS.REJECTED] },
];

// 필터 탭 옵션 (전체보기 포함)
export const FILTER_TABS_WITH_ALL = [
  { key: 'all', label: '전체보기' },
  { key: DOC_STATUS.PROGRESS, label: '진행' },
  { key: DOC_STATUS.COMPLETE, label: '완료' },
  { key: DOC_STATUS.REJECTED, label: '반려' },
];

// 필터 탭 옵션 (전체만)
export const FILTER_TABS_ALL_ONLY = [
  { key: 'all', label: '전체' },
];

// 문서양식 목록 (16개)
export const FORM_NAMES = [
  'PT 견적서',
  '사전발주검토서',
  '사후정산서',
  '외주비 지급요청서',
  '인건비 지급요청서',
  '진행비 품의서',
  '출장 품의서',
  '법인인감 사용 신청서',
  '법인카드 정산서 (개인)',
  '법인카드 정산서 (공용)',
  '개인카드 정산서',
  '업무기안',
  '구매요청서',
  '수금지급현황보고',
  '고객사 등록 품의',
  '퇴직금 품의서',
];

// 부서문서함에서 제외되는 문서양식 (개인 정산 관련)
export const EXCLUDED_FORM_NAMES_DEPT = [
  '법인카드 정산서 (개인)',
  '개인카드 정산서',
];

// 문서양식 필터 옵션 생성 함수
export const getFormNameOptions = (excludeList = []) => {
  const filteredNames = FORM_NAMES.filter(name => !excludeList.includes(name));
  return [
    { value: '', label: '전체' },
    ...filteredNames.map(name => ({ value: name, label: name })),
  ];
};

// 전체 문서양식 필터 옵션
export const FORM_NAME_OPTIONS = getFormNameOptions();

// 부서문서함용 문서양식 필터 옵션 (개인 정산 제외)
export const FORM_NAME_OPTIONS_DEPT = getFormNameOptions(EXCLUDED_FORM_NAMES_DEPT);

// 결재라인 상태
export const APPROVAL_STATUS = {
  APPROVED: 'approved',
  CURRENT: 'current',
  WAITING: 'waiting',
  REJECTED: 'rejected',
};

// 페이지당 표시 항목 수
export const ITEMS_PER_PAGE = 10;

// ============================================
// 테이블 컬럼 설정
// ============================================

// 컬럼 너비 상수
export const COLUMN_WIDTHS = {
  checkbox: '48px',
  type: '50px',
  formName: '100px',
  title: '150px',
  approvalLine: '420px',
  drafter: '100px',
  author: '120px',
  draftDate: '115px',
  completeDate: '115px',
  savedAt: '140px',
  status: '80px',
};

// 공통 컬럼 키
export const COLUMN_KEYS = {
  CHECKBOX: 'checkbox',
  TYPE: 'type',
  FORM_NAME: 'formName',
  TITLE: 'title',
  APPROVAL_LINE: 'approvalLine',
  DRAFTER: 'drafter',
  AUTHOR: 'author',
  DRAFT_DATE: 'draftDate',
  COMPLETE_DATE: 'completeDate',
  SAVED_AT: 'savedAt',
  STATUS: 'status',
};

// 기본 컬럼 라벨
export const COLUMN_LABELS = {
  [COLUMN_KEYS.TYPE]: '구분',
  [COLUMN_KEYS.FORM_NAME]: '문서양식',
  [COLUMN_KEYS.TITLE]: '문서 제목',
  [COLUMN_KEYS.APPROVAL_LINE]: '결재라인',
  [COLUMN_KEYS.DRAFTER]: '기안자',
  [COLUMN_KEYS.AUTHOR]: '작성자',
  [COLUMN_KEYS.DRAFT_DATE]: '기안일시',
  [COLUMN_KEYS.COMPLETE_DATE]: '결재완료일시',
  [COLUMN_KEYS.SAVED_AT]: '생성일시',
  [COLUMN_KEYS.STATUS]: '상태',
};

// ============================================
// 문서양식 라우트 관련
// ============================================

// 문서양식 → 기본 라우트 매핑 (16개)
export const FORM_BASE_ROUTES = {
  'PT 견적서': '/pt-estimate',
  '사전발주검토서': '/pre-order',
  '사후정산서': '/post-settlement',
  '외주비 지급요청서': '/outsourcing-payment',
  '인건비 지급요청서': '/personnel-expense',
  '진행비 품의서': '/progress-expense',
  '법인인감 사용 신청서': '/corporate-seal',
  '법인카드 정산서 (개인)': '/corp-card-personal',
  '법인카드 정산서 (공용)': '/corp-card-shared',
  '개인카드 정산서': '/personal-card',
  '업무기안': '/business-draft',
  '구매요청서': '/purchase-request',
  '수금지급현황보고': '/collection-report',
  '고객사 등록 품의': '/client-registration',
  '퇴직금 품의서': '/severance-pay',
  '출장 품의서': '/business-trip',
};

/**
 * 새 문서 작성 라우트 반환
 * @param {string} formName - 문서양식명
 * @param {string|number} projectId - 프로젝트 ID (선택)
 * @returns {string|null} 라우트 또는 null (미구현 양식)
 */
export const getNewDocumentRoute = (formName, projectId = null) => {
  const baseRoute = FORM_BASE_ROUTES[formName];
  if (!baseRoute) return null;
  const route = `${baseRoute}/new`;
  return projectId ? `${route}?projectId=${projectId}` : route;
};

/**
 * 문서 조회/결재 라우트 반환 (문서함에서 사용)
 * @param {string} formName - 문서양식명
 * @param {string|number} docId - 문서 ID
 * @returns {string|null} 라우트 또는 null (미구현 양식)
 */
export const getDocumentViewRoute = (formName, docId) => {
  const baseRoute = FORM_BASE_ROUTES[formName];
  if (!baseRoute) return null;
  return `${baseRoute}/${docId}`;
};

/**
 * 임시저장 문서 수정 라우트 반환 (임시저장함에서 사용)
 * @param {string} formName - 문서양식명
 * @param {string|number} docId - 문서 ID
 * @returns {string|null} 라우트 또는 null (미구현 양식)
 */
export const getDocumentEditRoute = (formName, docId) => {
  const baseRoute = FORM_BASE_ROUTES[formName];
  if (!baseRoute) return null;
  return `${baseRoute}/${docId}/edit`;
};

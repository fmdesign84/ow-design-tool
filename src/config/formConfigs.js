/**
 * 기안 양식 설정 파일
 * - 모든 양식의 필드 정의 (라벨, 타입, 순서)
 * - PreviewModal과 폼 페이지에서 공통 사용
 * - Single Source of Truth
 */

// 섹션 타입:
// - approval: 결재현황 (ApprovalLine)
// - grid: 2컬럼 그리드 (라벨-값 쌍)
// - textbox: 그레이 박스 (긴 텍스트)
// - badges: 뱃지 목록 (참조)
// - files: 첨부파일 목록
// - table: 테이블 (기여도 등)
// - cards: 카드 반복 (외주비 지급 등)

export const formConfigs = {
  // ========================================
  // PT견적서
  // ========================================
  ptEstimate: {
    id: 'ptEstimate',
    title: 'PT견적서',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'project', 'amount', 'schedule', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
        ],
      },
      {
        id: 'project',
        title: '프로젝트 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'projectNum', label: '프로젝트 넘버' },
          { key: 'projectName', label: '프로젝트명', full: true },
          { key: 'client', label: '고객사' },
          { key: 'schedule', label: '일정' },
          { key: 'pm', label: 'PM' },
          { key: 'deptName', label: '주관부서' },
          { key: 'eventContent', label: '행사내용', full: true },
        ],
      },
      {
        id: 'amount',
        title: '금액 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'expectedRevenue', label: '예상매출액', suffix: '원', isAmount: true },
          { key: 'expectedOutsourcing', label: '예상외주비', suffix: '원', isAmount: true },
          { key: 'expectedDomestic', label: '예상내수액', suffix: '원', isAmount: true },
          { key: 'feeRate', label: '매입수수료율', suffix: '%', isAmount: true },
        ],
      },
      {
        id: 'schedule',
        title: '일정 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'otDate', label: 'OT일' },
          { key: 'submitDate', label: '제출일' },
          { key: 'ptDate', label: 'PT일' },
          { key: 'estimateSubmitDate', label: '견적서 제출일' },
          { key: 'resultDate', label: '결과발표 예상일' },
        ],
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 사전발주 검토서 (선금품의서)
  // ========================================
  preOrder: {
    id: 'preOrder',
    title: '사전발주 검토서',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'project', 'event', 'amount', 'remarks', 'contributionTable', 'deptContributionTable'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
        ],
      },
      {
        id: 'project',
        title: '프로젝트 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'projectNum', label: '프로젝트 넘버' },
          { key: 'projectName', label: '프로젝트명', full: true },
          { key: 'client', label: '고객사' },
          { key: 'schedule', label: '일정' },
          { key: 'pm', label: 'PM' },
          { key: 'projectType', label: '프로젝트 유형' },
        ],
      },
      {
        id: 'event',
        title: '행사 일정 및 장소',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'eventStartDate', label: '행사 시작일' },
          { key: 'eventEndDate', label: '행사 종료일' },
          { key: 'eventLocation', label: '행사장소', full: true },
          { key: 'eventContent', label: '행사내용', full: true },
        ],
      },
      {
        id: 'amount',
        title: '금액 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'expectedRevenue', label: '예상매출액', suffix: '원', isAmount: true },
          { key: 'expectedOutsourcing', label: '예상외주비', suffix: '원', isAmount: true },
          { key: 'expectedDomestic', label: '예상내수액', suffix: '원', isAmount: true },
          { key: 'expectedDomesticRate', label: '예상내수율', suffix: '%', isAmount: true },
          { key: 'collectionSchedule', label: '수금일정', full: true },
          { key: 'progressExpenseRequest', label: '진행비요청', full: true },
        ],
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'contributionTable',
        title: '투입인력 기여도 분배',
        type: 'table',
        field: 'contributors',
        noBorder: true,
        columns: [
          { key: 'bm', label: '이름' },
          { key: 'contribution', label: '기여율', suffix: '%' },
        ],
      },
      {
        id: 'deptContributionTable',
        title: '공헌도 분배',
        type: 'table',
        field: 'deptContributions',
        noBorder: true,
        columns: [
          { key: 'dept', label: '공헌부서' },
          { key: 'contribution', label: '공헌도', suffix: '%' },
        ],
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 외주비 지급요청서
  // ========================================
  outsourcingPayment: {
    id: 'outsourcingPayment',
    title: '외주비 지급요청서',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'project', 'title', 'paymentItems', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
        ],
      },
      {
        id: 'project',
        title: '프로젝트 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'projectNum', label: '프로젝트 넘버' },
          { key: 'projectName', label: '프로젝트명', full: true },
          { key: 'client', label: '고객사' },
          { key: 'schedule', label: '일정' },
          { key: 'pm', label: 'PM' },
        ],
      },
      {
        id: 'title',
        title: '제목',
        type: 'textbox',
        field: 'title',
        noBorder: true,
      },
      {
        id: 'paymentItems',
        title: '외주비 지급',
        type: 'cards',
        field: 'paymentItems',
        noBorder: true,
        cardFields: [
          { key: 'partnerCompany', label: '파트너사' },
          { key: 'detailItem', label: '세부항목' },
          { key: 'orderAmount', label: '총 발주금액', suffix: '원', isAmount: true },
          { key: 'requestAmount', label: '지급요청금액', suffix: '원', isAmount: true },
          { key: 'requestDate', label: '희망지급요청일' },
          { key: 'expenseType', label: '지출구분' },
          { key: 'evidenceType', label: '증빙구분' },
        ],
      },
      {
        id: 'remarks',
        title: '비고',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 구매요청서 (물품 및 소프트웨어)
  // ========================================
  purchaseRequest: {
    id: 'purchaseRequest',
    title: '구매요청서 (물품 및 소프트웨어)',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'info', 'itemName', 'purpose', 'details'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
          { key: 'title', label: '제목', full: true },
        ],
      },
      {
        id: 'itemName',
        title: '필요물품명 (소프트웨어)',
        type: 'textbox',
        field: 'itemName',
        noBorder: true,
      },
      {
        id: 'purpose',
        title: '사용목적 (프로젝트)',
        type: 'textbox',
        field: 'purpose',
        noBorder: true,
      },
      {
        id: 'details',
        title: '세부 내용',
        type: 'textbox',
        field: 'details',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 업무기안
  // ========================================
  businessDraft: {
    id: 'businessDraft',
    title: '업무기안',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
          { key: 'title', label: '제목', full: true },
          { key: 'reportContent', label: '보고내용', full: true },
          { key: 'budgetAmount', label: '예산총액', suffix: '원', isAmount: true },
        ],
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 진행비 품의서
  // ========================================
  progressExpense: {
    id: 'progressExpense',
    title: '진행비 품의서',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'project', 'details', 'expense', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
        ],
      },
      {
        id: 'project',
        title: '프로젝트 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'projectNum', label: '프로젝트 넘버' },
          { key: 'projectName', label: '프로젝트명', full: true },
          { key: 'client', label: '고객사' },
          { key: 'schedule', label: '일정' },
          { key: 'pm', label: 'PM' },
        ],
      },
      {
        id: 'details',
        title: '세부내역',
        type: 'textbox',
        field: 'details',
        noBorder: true,
      },
      {
        id: 'expense',
        title: '진행비 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'usePeriod', label: '진행비 사용기간' },
          { key: 'totalRequestAmount', label: '총 요청금액', suffix: '원', isAmount: true },
          { key: 'requestType', label: '요청형태' },
        ],
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 사후정산서
  // ========================================
  postSettlement: {
    id: 'postSettlement',
    title: '사후정산서',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'project', 'event', 'settlement', 'planFile', 'contributionTable', 'remarks', 'deptContributionTable', 'note'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
        ],
      },
      {
        id: 'project',
        title: '프로젝트 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'projectNum', label: '프로젝트 넘버' },
          { key: 'projectName', label: '프로젝트명', full: true },
          { key: 'client', label: '고객사' },
          { key: 'schedule', label: '일정' },
          { key: 'pm', label: 'PM' },
          { key: 'deptName', label: '주관부서' },
        ],
      },
      {
        id: 'event',
        title: '행사 일정 및 장소',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'projectType', label: '프로젝트 유형' },
          { key: 'eventStartDate', label: '행사 시작일' },
          { key: 'eventEndDate', label: '행사 종료일' },
          { key: 'eventLocation', label: '행사장소', full: true },
          { key: 'eventContent', label: '행사내용', full: true },
        ],
      },
      {
        id: 'settlement',
        title: '정산 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'finalRevenue', label: '매출액', suffix: '원', isAmount: true },
          { key: 'finalOutsourcing', label: '외주비', suffix: '원', isAmount: true },
          { key: 'finalDomestic', label: '내수액', suffix: '원', isAmount: true },
          { key: 'finalDomesticRate', label: '내수율', suffix: '%', isAmount: true },
          { key: 'collectionStatus', label: '수금상황', full: true },
        ],
      },
      {
        id: 'planFile',
        title: '기획서 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'planFileStatus', label: '기획서 등록파일' },
          { key: 'clientContact', label: '클라이언트 담당자' },
        ],
      },
      {
        id: 'contributionTable',
        title: '투입인력 기여도',
        type: 'table',
        field: 'contributors',
        noBorder: true,
        columns: [
          { key: 'bm', label: '이름' },
          { key: 'contribution', label: '기여도', suffix: '%' },
        ],
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'deptContributionTable',
        title: '공헌도 분배',
        type: 'table',
        field: 'deptContributions',
        noBorder: true,
        columns: [
          { key: 'dept', label: '공헌부서' },
          { key: 'contribution', label: '공헌도', suffix: '%' },
        ],
      },
      {
        id: 'note',
        title: '비고',
        type: 'textbox',
        field: 'note',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 법인인감 사용신청서
  // ========================================
  corporateSeal: {
    id: 'corporateSeal',
    title: '법인인감 사용신청서',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'project', 'reason', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
          { key: 'sealType', label: '신청구분' },
        ],
      },
      {
        id: 'project',
        title: '프로젝트 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'projectNum', label: '프로젝트 넘버' },
          { key: 'projectName', label: '프로젝트명', full: true },
          { key: 'client', label: '고객사' },
          { key: 'schedule', label: '일정' },
          { key: 'pm', label: 'PM' },
        ],
      },
      {
        id: 'reason',
        title: '신청사유',
        type: 'textbox',
        field: 'reason',
        noBorder: true,
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 법인카드 정산서 (개인)
  // ========================================
  corpCardPersonal: {
    id: 'corpCardPersonal',
    title: '법인카드정산서(개인)',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'settlement', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
        ],
      },
      {
        id: 'settlement',
        title: '정산 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'settlementPeriod', label: '정산기간' },
          { key: 'settlementAmount', label: '정산총액', suffix: '원', isAmount: true },
          { key: 'bankAccountType', label: '결제은행 및 결제계좌' },
        ],
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 법인카드정산서 (공용)
  // ========================================
  corpCardShared: {
    id: 'corpCardShared',
    title: '법인카드정산서(공용)',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'project', 'settlement', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
        ],
      },
      {
        id: 'project',
        title: '프로젝트 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'projectNumber', label: '프로젝트 넘버' },
          { key: 'projectName', label: '프로젝트명', full: true },
          { key: 'client', label: '고객사' },
          { key: 'schedule', label: '일정' },
          { key: 'pm', label: 'PM' },
        ],
      },
      {
        id: 'settlement',
        title: '정산 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'settlementAmount', label: '정산총액', suffix: '원', isAmount: true },
        ],
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 개인카드정산서
  // ========================================
  personalCard: {
    id: 'personalCard',
    title: '개인카드정산서',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'settlement', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
        ],
      },
      {
        id: 'settlement',
        title: '정산 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'settlementPeriod', label: '정산기간' },
          { key: 'settlementAmount', label: '정산총액', suffix: '원', isAmount: true },
          { key: 'bankAccountType', label: '결제은행 및 결제계좌' },
        ],
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 수금지급현황보고
  // ========================================
  collectionReport: {
    id: 'collectionReport',
    title: '수금지급현황보고',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'reportSummary'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
          { key: 'title', label: '제목', full: true },
          { key: 'reportDate', label: '날짜' },
        ],
      },
      {
        id: 'reportSummary',
        title: '보고내용 개요',
        type: 'textbox',
        field: 'reportSummary',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 고객사 등록 품의 (신규/변경)
  // ========================================
  clientRegistration: {
    id: 'clientRegistration',
    title: '고객사 등록 품의 (신규/변경)',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'approvalContent', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
          { key: 'title', label: '제목', full: true },
          { key: 'clientName', label: '고객사명' },
        ],
      },
      {
        id: 'approvalContent',
        title: '품의 내용',
        type: 'textbox',
        field: 'approvalContent',
        noBorder: true,
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 퇴직금 품의서
  // ========================================
  severancePay: {
    id: 'severancePay',
    title: '퇴직금 품의서',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'payment', 'details', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
          { key: 'title', label: '제목', full: true },
        ],
      },
      {
        id: 'payment',
        title: '퇴직금 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'recipientName', label: '퇴직금 수령자' },
          { key: 'employmentPeriod', label: '입·퇴사일' },
          { key: 'settlementPeriod', label: '정산기간' },
          { key: 'amount', label: '금액', suffix: '원', isAmount: true },
          { key: 'paymentDate', label: '지급예정일' },
        ],
      },
      {
        id: 'details',
        title: '세부내용',
        type: 'textbox',
        field: 'details',
        noBorder: true,
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 출장 품의서
  // ========================================
  businessTrip: {
    id: 'businessTrip',
    title: '출장 품의서',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'project', 'trip', 'expense', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
        ],
      },
      {
        id: 'project',
        title: '프로젝트 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'projectNum', label: '프로젝트 넘버' },
          { key: 'projectName', label: '프로젝트명', full: true },
          { key: 'client', label: '고객사' },
          { key: 'schedule', label: '일정' },
          { key: 'pm', label: 'PM' },
        ],
      },
      {
        id: 'trip',
        title: '출장 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'tripPeriod', label: '출장기간' },
          { key: 'tripLocation', label: '출장장소', full: true },
          { key: 'tripPurpose', label: '출장목적', full: true },
        ],
      },
      {
        id: 'expense',
        title: '비용 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'transportCost', label: '교통비', suffix: '원', isAmount: true },
          { key: 'otherCost', label: '기타비용', full: true },
          { key: 'cashPayment', label: '현금결제 (선지급금)', suffix: '원', isAmount: true },
          { key: 'cardPayment', label: '법인카드 결제 (선지급금)', suffix: '원', isAmount: true },
        ],
      },
      {
        id: 'remarks',
        title: '기타보고사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },

  // ========================================
  // 인건비 지급요청서
  // ========================================
  personnelExpense: {
    id: 'personnelExpense',
    title: '인건비 지급요청서',
    sectionGroups: [
      { id: 'approvalGroup', sectionIds: ['approval'] },
      { id: 'bodyGroup', sectionIds: ['drafter', 'project', 'title', 'paymentItems', 'remarks'] },
      { id: 'footerGroup', sectionIds: ['reference', 'files'] },
    ],
    sections: [
      {
        id: 'approval',
        title: '결재현황',
        type: 'approval',
        noBorder: true,
      },
      {
        id: 'drafter',
        title: '기안 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'drafter', label: '기안자' },
          { key: 'department', label: '기안부서' },
        ],
      },
      {
        id: 'project',
        title: '프로젝트 정보',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'projectNum', label: '프로젝트 넘버' },
          { key: 'projectName', label: '프로젝트명', full: true },
          { key: 'client', label: '고객사' },
          { key: 'schedule', label: '일정' },
          { key: 'pm', label: 'PM' },
        ],
      },
      {
        id: 'title',
        title: '제목',
        type: 'grid',
        noBorder: true,
        fields: [
          { key: 'title', label: '제목', full: true },
        ],
      },
      {
        id: 'paymentItems',
        title: '인건비 지급',
        type: 'cards',
        field: 'paymentItems',
        noBorder: true,
        cardFields: [
          { key: 'personnelName', label: '인건비명' },
          { key: 'calculationDate', label: '생년월일' },
          { key: 'workContent', label: '근무내용' },
          { key: 'workDate', label: '근무일자' },
          { key: 'totalOrderAmount', label: '총 발주금액', suffix: '원', isAmount: true },
          { key: 'requestAmount', label: '지급요청금액', suffix: '원', isAmount: true },
          { key: 'requestDate', label: '희망지급요청일' },
          { key: 'expenseType', label: '지출구분' },
        ],
      },
      {
        id: 'remarks',
        title: '특이사항',
        type: 'textbox',
        field: 'remarks',
        noBorder: true,
      },
      {
        id: 'reference',
        title: '참조',
        type: 'badges',
        field: 'reference',
        noBorder: true,
      },
      {
        id: 'files',
        title: '첨부파일',
        type: 'files',
        field: 'files',
        noBorder: true,
      },
    ],
  },
};

// 양식 타입 목록
export const formTypes = Object.keys(formConfigs);

// 양식 타입으로 설정 가져오기
export const getFormConfig = (formType) => {
  return formConfigs[formType] || null;
};

export default formConfigs;

/**
 * 글로벌 아이콘 컴포넌트
 * 재사용 가능한 SVG 아이콘 모음
 *
 * 사용법:
 * - size를 지정하면 해당 크기로 렌더링
 * - className만 지정하면 CSS에서 크기 제어 가능
 */

// 검색 아이콘
export const SearchIcon = ({ size = 14, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

// 캘린더 아이콘
export const CalendarIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// 닫기(X) 아이콘
export const CloseIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth="1.5"
  >
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

// 플러스 아이콘
export const PlusIcon = ({ size = 12, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
  >
    <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// 잠금 아이콘
export const LockIcon = ({ size = 12, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// 정보 아이콘 (i)
export const InfoIcon = ({ size = 14, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
  >
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="5" r="0.75" fill="currentColor"/>
  </svg>
);

// 아바타 아이콘
export const AvatarIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9E9E9E"/>
  </svg>
);

// 왼쪽 화살표 (페이지네이션)
export const ChevronLeftIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

// 오른쪽 화살표 (페이지네이션)
export const ChevronRightIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// 아래 화살표 (드롭다운)
export const ChevronDownIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// 편집 아이콘 (연필)
export const EditIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// 삭제 아이콘 (휴지통)
export const TrashIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

// 체크 아이콘
export const CheckIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// 눈 아이콘 (보기/숨기기 토글)
export const EyeIcon = ({ active = true, size = 16, className = '' }) => (
  active ? (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
);

// 이미지 파일 아이콘
export const ImageFileIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--color-neutral-500, #9E9E9E)"
    strokeWidth="1.5"
  >
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
);

// PDF 파일 아이콘
export const PdfFileIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#E53935"
    strokeWidth="1.5"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

// 일반 파일 아이콘
export const FileIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

// 엑셀 파일 아이콘
export const ExcelFileIcon = ({ size = 16, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1D6F42"
    strokeWidth="1.5"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

// 저장 아이콘 (플로피 디스크)
export const SaveIcon = ({ size = 12, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

// 업로드 아이콘
export const UploadIcon = ({ size = 14, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

// 다운로드 아이콘
export const DownloadIcon = ({ size = 14, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// 설정 아이콘 (톱니바퀴)
export const SettingsIcon = ({ size = 18, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

// 문서 아이콘
export const DocumentIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

// 파일 타입에 따른 아이콘 반환 헬퍼
export const getFileIcon = (fileName, size = 16, className = '') => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    return <ImageFileIcon size={size} className={className} />;
  } else if (ext === 'pdf') {
    return <PdfFileIcon size={size} className={className} />;
  } else if (['xls', 'xlsx'].includes(ext)) {
    return <ExcelFileIcon size={size} className={className} />;
  }
  return <FileIcon size={size} className={className} />;
};

// ========== 날씨 아이콘 ==========

// 맑음 (해)
export const WeatherSunIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

// 흐림 (구름)
export const WeatherCloudIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
  </svg>
);

// 비
export const WeatherRainIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="16" y1="13" x2="16" y2="21"/>
    <line x1="8" y1="13" x2="8" y2="21"/>
    <line x1="12" y1="15" x2="12" y2="23"/>
    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
  </svg>
);

// 눈 (눈결정)
export const WeatherSnowIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 심플 별 모양 */}
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/>
  </svg>
);

// ========== FM AI Studio 아이콘 ==========

// 고래 아이콘 (단색 stroke 버전 - 기존 아이콘 톤앤매너)
export const WhaleIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 51 65"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 고래 몸통 */}
    <path d="M29.3,57.93c-7.12,1.45-7.16,6.72-7.16,6.72-5.26-8.22,3.2-10.61,3.2-10.61-5.61-3.19-2.3-8.26-2.3-8.26,6,.5,6.21,7.39,6.21,7.39,10.72.69,8.25-9.44-4.32-11.11C2.3,39.06-3.71,16.41,3.22,11.63c5.09-3.51,22,2.75,29.03,7.08,4.63,2.85,8.88,6.41,11.89,10.94,0,0,15.48,22.12-14.84,28.28Z"/>
    {/* 눈 */}
    <circle cx="16" cy="21" r="2" strokeMiterlimit="10"/>
    {/* 배 라인 */}
    <path d="M2.39,12.54s1.43,14.8,17.41,19.72" strokeMiterlimit="10"/>
    {/* 지느러미 */}
    <path d="M19.64,29.04s0,8.63,6.02,10.49c.8.25,1.62-.35,1.61-1.19-.02-2.35.17-6.82,1.78-8.72" strokeMiterlimit="10"/>
    <path d="M27.78,34.7s7.27,2.33,10.24,7.23c3.3,5.44-1.78,10.81-5.81,11.11"/>
    {/* 물줄기 */}
    <path d="M42.48,6.27h0c-1.18,1.05-1.74,2.63-1.5,4.19l1.86,12.1,6.71-10.09c.91-1.37,1.04-3.13.32-4.61l-.07-.14c-1.35-2.81-5.01-3.53-7.33-1.46Z"/>
    <path d="M25.62,5.58h0c-.15,1.86.64,3.68,2.12,4.83l11.45,8.89-2.43-14.13c-.33-1.92-1.65-3.53-3.48-4.23l-.17-.06c-3.44-1.32-7.18,1.04-7.49,4.71Z"/>
  </svg>
);

// ========== 스타일 프리셋 아이콘 ==========

// Auto 아이콘 (스파클/마법 지팡이)
export const StyleAutoIcon = ({ size = 24, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
);

// 사진 아이콘 (카메라)
export const StylePhotoIcon = ({ size = 24, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

// 벡터 아이콘 (펜 툴)
export const StyleVectorIcon = ({ size = 24, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="M2 2l7.586 7.586"/>
    <circle cx="11" cy="11" r="2"/>
  </svg>
);

// 유화 아이콘 (브러시)
export const StyleOilIcon = ({ size = 24, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
  </svg>
);

// 수채화 아이콘 (물방울)
export const StyleWatercolorIcon = ({ size = 24, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);

// 이미지 생성 아이콘
export const ImageGenIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

// 영상 생성 아이콘
export const VideoGenIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="3" ry="3"/>
    <polygon points="10 8 16 12 10 16 10 8"/>
  </svg>
);

// 디자인 생성 아이콘
export const DesignGenIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="M2 2l7.586 7.586"/>
    <circle cx="11" cy="11" r="2"/>
  </svg>
);

// 3D 아이콘 (큐브)
export const Style3DIcon = ({ size = 24, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

// 배경 제거
export const RemoveBgIcon = ({ size = 20, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/>
    <path d="M8.12 8.12 12 12"/>
    <path d="M20 4 8.12 15.88"/>
    <circle cx="6" cy="18" r="3"/>
    <path d="M14.8 14.8 20 20"/>
  </svg>
);

// 오렌지 고래 아이콘 (FM AI Studio - 컬러 버전)
export const OrangeWhaleIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
  >
    <defs>
      <filter id="whaleShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="-1" dy="1" stdDeviation="0" floodColor="#00000018"/>
      </filter>
    </defs>
    <g filter="url(#whaleShadow)">
      {/* 고래 몸통 */}
      <path d="M30.508 13.9746C30.508 21.3394 27.405 27.4565 20.8627 28.6686C20.0847 28.8222 19.2611 28.8945 18.3829 28.8945H16.3928C13.597 28.8945 11.0549 27.7637 9.21728 25.9272C7.38972 24.0908 6.25 21.5564 6.25 18.7605C6.25 18.7149 6.25 18.6615 6.2589 18.6159C6.33124 16.0281 8.43929 13.9746 11.0448 13.9746H30.5069H30.508Z" fill="#FF9748"/>
      {/* 꼬리 위 */}
      <path d="M31.4186 11.5675C31.4186 13.4686 30.0029 15.0101 29.6923 15.0101C29.4853 15.0101 27.9661 13.4686 27.9661 11.5675C27.9661 9.66652 29.5154 8.125 29.6923 8.125C29.8548 8.125 31.4186 9.66652 31.4186 11.5675Z" fill="#FF9748"/>
      {/* 꼬리 옆 */}
      <path d="M32.7419 16.3432C30.8408 16.3432 29.2993 14.9274 29.2993 14.6169C29.2993 14.3064 30.8408 12.8906 32.7419 12.8906C34.6429 12.8906 36.1844 14.4399 36.1844 14.6169C36.1844 14.7794 34.6429 16.3432 32.7419 16.3432Z" fill="#FF9748"/>
      {/* 배 */}
      <path d="M20.8627 28.6679C20.0847 28.8215 19.2611 28.8939 18.3829 28.8939H16.3928C13.597 28.8939 11.0549 27.7631 9.21728 25.9266C7.38972 24.0901 6.25 21.5558 6.25 18.7599C6.25 18.7143 6.25 18.6609 6.2589 18.6152C7.0547 19.9909 9.14828 24.7045 16.8815 24.7045L20.8627 28.6679Z" fill="#FFE7C5"/>
      {/* 지느러미 */}
      <path d="M16.885 24.71C16.885 24.71 18.2362 29.9134 23.9526 30.3975C24.3578 30.432 24.6661 30.0324 24.5203 29.6529L22.6081 24.6855L16.885 24.71Z" fill="#FF9748"/>
      {/* 눈 */}
      <path d="M16.2058 22.6118C16.6336 22.6118 16.9805 22.265 16.9805 21.8372C16.9805 21.4093 16.6336 21.0625 16.2058 21.0625C15.778 21.0625 15.4312 21.4093 15.4312 21.8372C15.4312 22.265 15.778 22.6118 16.2058 22.6118Z" fill="#84471F"/>
    </g>
  </svg>
);

// 오렌지 고래 아이콘 - 선만 버전 (GNB 사이드바용)
export const OrangeWhaleOutlinedIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="4 6 34 28"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 고래 몸통 */}
    <path d="M30.508 13.9746C30.508 21.3394 27.405 27.4565 20.8627 28.6686C20.0847 28.8222 19.2611 28.8945 18.3829 28.8945H16.3928C13.597 28.8945 11.0549 27.7637 9.21728 25.9272C7.38972 24.0908 6.25 21.5564 6.25 18.7605C6.25 18.7149 6.25 18.6615 6.2589 18.6159C6.33124 16.0281 8.43929 13.9746 11.0448 13.9746H30.5069H30.508Z"/>
    {/* 꼬리 위 */}
    <path d="M31.4186 11.5675C31.4186 13.4686 30.0029 15.0101 29.6923 15.0101C29.4853 15.0101 27.9661 13.4686 27.9661 11.5675C27.9661 9.66652 29.5154 8.125 29.6923 8.125C29.8548 8.125 31.4186 9.66652 31.4186 11.5675Z"/>
    {/* 꼬리 옆 */}
    <path d="M32.7419 16.3432C30.8408 16.3432 29.2993 14.9274 29.2993 14.6169C29.2993 14.3064 30.8408 12.8906 32.7419 12.8906C34.6429 12.8906 36.1844 14.4399 36.1844 14.6169C36.1844 14.7794 34.6429 16.3432 32.7419 16.3432Z"/>
    {/* 지느러미 */}
    <path d="M16.885 24.71C16.885 24.71 18.2362 29.9134 23.9526 30.3975C24.3578 30.432 24.6661 30.0324 24.5203 29.6529L22.6081 24.6855L16.885 24.71Z"/>
    {/* 눈 */}
    <circle cx="16.2" cy="21.84" r="0.9" fill="currentColor" stroke="none"/>
  </svg>
);

// 업스케일 아이콘
export const UpscaleIcon = ({ size = 20, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" x2="14" y1="3" y2="10"/>
    <line x1="3" x2="10" y1="21" y2="14"/>
  </svg>
);

// 별 아이콘 (추천/즐겨찾기)
export const StarIcon = ({ size = 20, className = '', filled = false }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// Copilot 아이콘 (말풍선 + AI)
export const CopilotIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 말풍선 */}
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    {/* AI 점 3개 */}
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
  </svg>
);

// 실험실 플라스크 아이콘
export const FlaskIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 플라스크 목 */}
    <path d="M9 3h6" />
    <path d="M10 3v6.5" />
    <path d="M14 3v6.5" />
    {/* 플라스크 몸체 */}
    <path d="M10 9.5L5 19a2 2 0 0 0 1.75 3h10.5A2 2 0 0 0 19 19l-5-9.5" />
  </svg>
);

// ========== 목업 타입 아이콘 ==========

// 가로 배너 아이콘
export const BannerHorizontalIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="8" width="20" height="8" rx="1" />
    <path d="M6 11h4" />
    <circle cx="16" cy="12" r="2" />
  </svg>
);

// 세로 배너 아이콘
export const BannerVerticalIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="2" width="8" height="20" rx="1" />
    <circle cx="12" cy="7" r="2" />
    <path d="M10 14h4" />
    <path d="M10 17h4" />
  </svg>
);

// 빌보드 아이콘
export const BillboardIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="12" rx="1" />
    <path d="M8 16v4" />
    <path d="M16 16v4" />
    <path d="M6 20h12" />
    <circle cx="7" cy="10" r="2" />
    <path d="M12 8h6" />
    <path d="M12 12h4" />
  </svg>
);

// 포스터 아이콘
export const PosterIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="2" width="16" height="20" rx="1" />
    <rect x="7" y="5" width="10" height="8" rx="0.5" />
    <path d="M7 16h10" />
    <path d="M7 19h6" />
  </svg>
);

// 소셜 정사각 아이콘
export const SocialSquareIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="12" cy="10" r="4" />
    <path d="M8 18h8" />
  </svg>
);

// 소셜 스토리 아이콘
export const SocialStoryIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <circle cx="12" cy="8" r="3" />
    <path d="M9 14h6" />
    <path d="M9 17h6" />
  </svg>
);

// 프레젠테이션 아이콘
export const PresentationIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="14" rx="1" />
    <path d="M12 18v3" />
    <path d="M8 21h8" />
    <circle cx="8" cy="11" r="2" />
    <path d="M13 9h5" />
    <path d="M13 13h3" />
  </svg>
);

// 명함 아이콘
export const NamecardIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="6" width="20" height="12" rx="1" />
    <circle cx="7" cy="12" r="2" />
    <path d="M12 10h7" />
    <path d="M12 14h5" />
  </svg>
);

// 사이니지 아이콘
export const SignageIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="16" rx="1" />
    <path d="M12 18v4" />
    <path d="M8 22h8" />
    <circle cx="12" cy="7" r="2" />
    <path d="M9 12h6" />
    <path d="M9 15h6" />
  </svg>
);

// 매거진 아이콘
export const MagazineIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M3 7h18" />
    <rect x="6" y="10" width="5" height="7" rx="0.5" />
    <path d="M14 10h4" />
    <path d="M14 13h4" />
    <path d="M14 16h2" />
  </svg>
);

// 홈 아이콘
export const HomeIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// 라이브러리 아이콘
export const LibraryIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8" />
    <path d="M8 11h6" />
  </svg>
);

// 인페인팅 (부분 편집) 아이콘
export const InpaintIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9h6v6H9z" strokeDasharray="2 2" />
    <path d="M15.5 8.5l2-2" />
    <path d="M17.5 6.5l-1.5-1.5" />
  </svg>
);

// 대화형 편집 아이콘
export const ChatEditIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M14 9l-4 4" />
    <path d="M10 9l4 4" />
  </svg>
);

// ========== 하위 메뉴 전용 아이콘 ==========

// 텍스트로 (커서 + 스파클)
export const WandSparkleIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v18"/>
    <path d="M8 7h8"/>
    <path d="M18 4l1 2 2-1-1 2 2 1-2 1 1 2-2-1-1 2-1-2-2 1 1-2-2-1 2-1-1-2 2 1z"/>
  </svg>
);

// 이미지로 (이미지 + 새로고침)
export const ImageRefIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5-8 10"/>
    <path d="M20 4h-3m3 0v3"/>
  </svg>
);

// 텍스트로 영상
export const TextToVideoIcon = ({ size = 20, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11V4h16v7"/>
    <path d="M9 4v7"/>
    <path d="M4 15h16"/>
    <path d="M4 19h16"/>
    <rect x="14" y="11" width="8" height="10" rx="1"/>
    <path d="m17 14 2 2-2 2"/>
  </svg>
);

// 이미지로 영상
export const ImageToVideoIcon = ({ size = 20, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" x2="7" y1="2" y2="22"/>
    <line x1="17" x2="17" y1="2" y2="22"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <line x1="2" x2="7" y1="7" y2="7"/>
    <line x1="2" x2="7" y1="17" y2="17"/>
    <line x1="17" x2="22" y1="7" y2="7"/>
    <line x1="17" x2="22" y1="17" y2="17"/>
  </svg>
);

// 멀티 이미지
export const MultiImageIcon = ({ size = 20, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 22H4a2 2 0 0 1-2-2V6"/>
    <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/>
    <circle cx="12" cy="8" r="2"/>
    <rect x="6" y="2" width="16" height="16" rx="2"/>
  </svg>
);

// 목업 - Lucide monitor-smartphone 기반
export const MockupFrameIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
    <path d="M10 19v-3.96 3.15" />
    <path d="M7 19h5" />
    <rect width="6" height="10" x="16" y="12" rx="2" />
  </svg>
);

// 전체 (그리드)
export const GridAllIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
  </svg>
);

// 이미지들 (갤러리)
export const PhotoFrameIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

// 영상들 (필름)
export const FilmReelIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="2"/>
    <rect x="7" y="7" width="10" height="10" rx="1"/>
    <line x1="2" y1="12" x2="7" y2="12"/>
    <line x1="17" y1="12" x2="22" y2="12"/>
  </svg>
);

// 업스케일 - Lucide maximize-2 기반 (간결한 확대)
export const ScaleUpIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

// ========== 이미지 생성 하위 메뉴 아이콘 (v5 - Lucide 스타일) ==========

// 텍스트로 (Type 아이콘 + 스파클)
export const TextToIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* T 글자 */}
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
    <line x1="8" y1="20" x2="16" y2="20"/>
  </svg>
);

// 이미지로 (사진 프레임 + 순환 화살표)
export const ImageToIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 이미지 프레임 */}
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    {/* 태양 */}
    <circle cx="8.5" cy="8.5" r="1.5"/>
    {/* 산 */}
    <path d="M21 15l-5-5L5 21"/>
    {/* 새로고침 표시 */}
    <path d="M21 3h-4m4 0v4"/>
  </svg>
);

// 부분편집 (마법봉 - Lucide wand-sparkles 스타일)
export const InpaintToIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 마법봉 막대 */}
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/>
    <path d="m14 7 3 3"/>
    {/* 반짝임 */}
    <path d="M5 6v4"/>
    <path d="M3 8h4"/>
  </svg>
);

// 대화형 (말풍선)
export const ChatToIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 말풍선 */}
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    {/* 말줄임표 */}
    <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

// 증명사진 - Lucide id-card 기반
export const IdPhotoIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 10h2" />
    <path d="M16 14h2" />
    <path d="M6.17 15a3 3 0 0 1 5.66 0" />
    <circle cx="9" cy="11" r="2" />
    <rect x="2" y="5" width="20" height="14" rx="2" />
  </svg>
);

// 자유사진 - Lucide sparkles 기반
export const PoseChangeIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    <path d="M20 2v4" />
    <path d="M22 4h-4" />
    <circle cx="4" cy="20" r="2" />
  </svg>
);

// 합성 사진 - Lucide layers 기반
export const CompositeIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
  </svg>
);

// 장소 합성
export const LocationCompositeIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// 가상 피팅
export const VirtualTryonIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z" />
  </svg>
);

// 배경 생성
export const BackgroundGenIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 20 8 6l5 8 4-4 4 10H3z" />
  </svg>
);

// 제품 사진 - Lucide shopping-bag 기반
export const ProductPhotoIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 10a4 4 0 0 1-8 0" />
    <path d="M3.103 6.034h17.794" />
    <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
  </svg>
);

// 텍스트 보정
export const TextCorrectIcon = ({ size = 20, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    <path d="m9 15 2 2 4-4"/>
  </svg>
);

// ========== 공통 액션 아이콘 ==========

// 전송 아이콘 (종이비행기)
export const SendIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

// 이미지 아이콘 (사진 프레임)
export const ImageIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

// 뒤로가기 아이콘 (화살표)
export const BackIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// 실행 취소 아이콘 (Undo)
export const UndoIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

// 새로고침 아이콘
export const RefreshIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 4v6h-6M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// Wave 아이콘 (노드 에디터) - 심플한 물결
export const OrangeWaveIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 6c.6-.6 1.5-1 2.5-1 2 0 3 2 5 2s3-2 5-2 3 2 5 2c1 0 1.9-.4 2.5-1" />
    <path d="M2 12c.6-.6 1.5-1 2.5-1 2 0 3 2 5 2s3-2 5-2 3 2 5 2c1 0 1.9-.4 2.5-1" />
    <path d="M2 18c.6-.6 1.5-1 2.5-1 2 0 3 2 5 2s3-2 5-2 3 2 5 2c1 0 1.9-.4 2.5-1" />
  </svg>
);

// Swimming 아이콘
export const SwimmingIcon = ({ size = 20, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
  </svg>
);

// ========== PPT Design Wizard 아이콘 ==========
// 출처: Lucide Icons (https://lucide.dev)

// 왼쪽 화살표
export const ArrowLeftIcon = ({ size = 16, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

// 오른쪽 화살표
export const ArrowRightIcon = ({ size = 16, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

// 최대화
export const MaximizeIcon = ({ size = 16, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

// 최소화
export const MinimizeIcon = ({ size = 16, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

// 스피너 (로딩)
export const SpinnerIcon = ({ size = 16, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// PPT 아이콘 (프레젠테이션 슬라이드 + 차트)
export const PptIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 슬라이드 프레임 */}
    <rect x="2" y="3" width="20" height="14" rx="2" />
    {/* 막대 차트 */}
    <path d="M6 13v-2" />
    <path d="M10 13v-4" />
    <path d="M14 13v-3" />
    <path d="M18 13v-5" />
    {/* 스탠드 */}
    <path d="M12 17v4" />
    <path d="M8 21h8" />
  </svg>
);

// 연출 생성
export const PortraitStagingIcon = ({ size = 20, className = '' }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
);

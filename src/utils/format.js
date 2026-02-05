/**
 * 공통 포맷팅 유틸리티 함수
 */

// 금액 포맷팅 함수 (숫자에 콤마 추가)
export const formatAmount = (value) => {
  const numValue = String(value).replace(/[^0-9]/g, '');
  if (numValue) {
    return parseInt(numValue, 10).toLocaleString('ko-KR');
  }
  return '';
};

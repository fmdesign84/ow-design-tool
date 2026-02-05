/**
 * Document Style Merger - 문서 스타일 통합기
 *
 * 3가지 병합 모드:
 * 1. smartMerge: 스마트 병합 - 번호/챕터 자동 연결
 * 2. simpleMerge: 단순 병합 - 순서대로만
 * 3. styleOnly: 스타일만 적용 - 별도 파일로
 */

// DocumentMerger 컴포넌트는 hook과 불일치로 임시 제외
// export { DocumentMerger } from './components/DocumentMerger';
export { useDocumentMerger } from './hooks/useDocumentMerger';
export * from './types';
export { parseDocx, parseTxt } from './utils/docxParser';
export { processDocuments, smartMerge, simpleMerge, applyStyleOnly } from './utils/docxGenerator';
export { cloneWithStyle, mergeWithStyle, processDocumentsV2 } from './utils/docxCloner';

/**
 * Document Merger Wizard
 * Swimming/Wave 라이트 테마 가운데 윈도우 스타일
 * 문서 스타일 통합 기능
 */

import React, { useCallback, useRef, useState } from 'react';
import { useDocumentMerger } from '../../../document-merger/hooks/useDocumentMerger';
import { ElementStyle } from '../../../document-merger/types';

// 아이콘 - src/components/common/Icons
import {
  DownloadIcon,
} from '../../../../components/common/Icons';

import styles from './DocumentMergerWizard.module.css';

// ===== Props =====
interface DocumentMergerWizardProps {
  onBack: () => void;
}

// ===== 메인 컴포넌트 =====
const DocumentMergerWizard: React.FC<DocumentMergerWizardProps> = ({ onBack }) => {
  const {
    documents,
    extractedStyle,
    settings,
    isProcessing,
    progress,
    error,
    addDocuments,
    setMainDocument,
    reorderDocuments,
    removeDocument,
    updateSettings,
    updateMainStyle,
    processDocuments,
    reset,
  } = useDocumentMerger();

  // extractedStyle에서 paragraph 스타일 추출
  const paragraphStyle = extractedStyle?.paragraph || null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<{ url: string; filename: string }[]>([]);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addDocuments(e.target.files);
    }
  }, [addDocuments]);

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addDocuments(e.dataTransfer.files);
    }
  }, [addDocuments]);

  // 처리 실행
  const handleProcess = useCallback(async () => {
    try {
      const results = await processDocuments();
      const links = results.map(result => ({
        url: URL.createObjectURL(result.blob),
        filename: result.filename,
      }));
      setDownloadLinks(links);
    } catch (err) {
      setErrors(prev => [...prev, '문서 처리 중 오류가 발생했습니다.']);
    }
  }, [processDocuments]);

  // 다운로드
  const handleDownload = useCallback((url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  // 모두 다운로드
  const handleDownloadAll = useCallback(() => {
    downloadLinks.forEach(link => {
      handleDownload(link.url, link.filename);
    });
  }, [downloadLinks, handleDownload]);

  // 새로 시작
  const handleReset = useCallback(() => {
    reset();
    setDownloadLinks([]);
    setErrors([]);
  }, [reset]);

  // 파일 아이콘
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'docx': return '📄';
      case 'pdf': return '📕';
      case 'txt': return '📝';
      default: return '📎';
    }
  };

  // 완료 여부
  const isComplete = downloadLinks.length > 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.wizard}>
        {/* 윈도우 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.windowControls}>
              <button
                className={`${styles.windowBtn} ${styles.close}`}
                onClick={onBack}
                title="닫기"
              />
              <button className={`${styles.windowBtn} ${styles.minimize}`} title="최소화" />
              <button className={`${styles.windowBtn} ${styles.maximize}`} title="최대화" />
            </div>
            <div className={styles.headerTitle}>
              <h1>문서 스타일 통합</h1>
              <span className={styles.badge}>NEW</span>
            </div>
          </div>

          <div className={styles.headerStatus}>
            {documents.length > 0 && (
              <span className={styles.docCount}>{documents.length}개 문서</span>
            )}
          </div>
        </div>

        {/* 에러 메시지 */}
        {(error || errors.length > 0) && (
          <div className={styles.errors}>
            {error && (
              <div className={styles.error}>
                {error}
                <button onClick={() => reset()}>×</button>
              </div>
            )}
            {errors.map((err, i) => (
              <div key={i} className={styles.error}>
                {err}
                <button onClick={() => setErrors(prev => prev.filter((_, idx) => idx !== i))}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* 콘텐츠 영역 */}
        <div className={styles.content}>
          {/* 완료 화면 */}
          {isComplete ? (
            <div className={styles.panel}>
              <div className={styles.complete}>
                <div className={styles.completeIcon}>✓</div>
                <h2>문서 변환 완료</h2>
                <p>{downloadLinks.length}개 파일이 생성되었습니다</p>

                <div className={styles.downloadList}>
                  {downloadLinks.map((link, index) => (
                    <div key={index} className={styles.downloadItem}>
                      <span className={styles.fileIcon}>📄</span>
                      <span className={styles.fileName}>{link.filename}</span>
                      <button
                        className={styles.downloadItemBtn}
                        onClick={() => handleDownload(link.url, link.filename)}
                      >
                        <DownloadIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {downloadLinks.length > 1 && (
                  <button className={styles.downloadBtn} onClick={handleDownloadAll}>
                    <DownloadIcon size={16} />
                    모두 다운로드
                  </button>
                )}

                <button className={styles.resetBtn} onClick={handleReset}>
                  새로 시작
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 파일 업로드 영역 */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>문서 업로드</h2>
                  <p>스타일을 통합할 문서들을 업로드하세요</p>
                </div>
                <div className={styles.panelBody}>
                  <div
                    className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".docx,.pdf,.txt"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <div className={styles.uploadIcon}>📂</div>
                    <p className={styles.uploadText}>파일을 드래그하거나 클릭하여 업로드</p>
                    <p className={styles.uploadHint}>지원 형식: DOCX, PDF, TXT</p>
                  </div>

                  {/* 문서 목록 */}
                  {documents.length > 0 && (
                    <div className={styles.fileList}>
                      <h3>업로드된 문서</h3>
                      <div className={styles.files}>
                        {documents.map((doc, index) => (
                          <div
                            key={doc.id}
                            className={`${styles.fileItem} ${doc.isMainDocument ? styles.mainDoc : ''}`}
                          >
                            <div className={styles.fileInfo}>
                              <span className={styles.fileIcon}>{getFileIcon(doc.type)}</span>
                              <span className={styles.fileName}>{doc.name}</span>
                              {doc.isMainDocument && <span className={styles.mainBadge}>메인</span>}
                            </div>
                            <div className={styles.fileActions}>
                              {!doc.isMainDocument && (
                                <button
                                  className={styles.fileActionBtn}
                                  onClick={() => setMainDocument(doc.id)}
                                  title="메인 문서로 설정"
                                >
                                  ⭐
                                </button>
                              )}
                              {index > 0 && (
                                <button
                                  className={styles.fileActionBtn}
                                  onClick={() => reorderDocuments(index, index - 1)}
                                  title="위로 이동"
                                >
                                  ↑
                                </button>
                              )}
                              {index < documents.length - 1 && (
                                <button
                                  className={styles.fileActionBtn}
                                  onClick={() => reorderDocuments(index, index + 1)}
                                  title="아래로 이동"
                                >
                                  ↓
                                </button>
                              )}
                              <button
                                className={`${styles.fileActionBtn} ${styles.remove}`}
                                onClick={() => removeDocument(doc.id)}
                                title="삭제"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 추출된 스타일 */}
              {paragraphStyle && (
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>추출된 스타일</h2>
                    <button
                      className={styles.editStyleBtn}
                      onClick={() => setShowStyleEditor(!showStyleEditor)}
                    >
                      {showStyleEditor ? '닫기' : '수정'}
                    </button>
                  </div>
                  <div className={styles.panelBody}>
                    <div className={styles.stylePreview}>
                      <div className={styles.styleItem}>
                        <label>폰트</label>
                        <span>{paragraphStyle.fontFamily}</span>
                      </div>
                      <div className={styles.styleItem}>
                        <label>크기</label>
                        <span>{paragraphStyle.fontSize}pt</span>
                      </div>
                      <div className={styles.styleItem}>
                        <label>색상</label>
                        <span style={{ color: paragraphStyle.fontColor }}>
                          {paragraphStyle.fontColor}
                        </span>
                      </div>
                      <div className={styles.styleItem}>
                        <label>정렬</label>
                        <span>{paragraphStyle.alignment}</span>
                      </div>
                      <div className={styles.styleItem}>
                        <label>줄간격</label>
                        <span>{paragraphStyle.lineSpacing}배</span>
                      </div>
                    </div>

                    {showStyleEditor && (
                      <StyleEditor
                        style={paragraphStyle}
                        onUpdate={(style) => updateMainStyle('paragraph', style)}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 출력 설정 */}
              {documents.length > 1 && (
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h2>출력 설정</h2>
                  </div>
                  <div className={styles.panelBody}>
                    <div className={styles.settingGroup}>
                      <label className={styles.settingLabel}>출력 방식</label>
                      <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            checked={settings.mode === 'smartMerge'}
                            onChange={() => updateSettings({ mode: 'smartMerge' })}
                          />
                          <span>스마트 병합</span>
                        </label>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            checked={settings.mode === 'styleOnly'}
                            onChange={() => updateSettings({ mode: 'styleOnly' })}
                          />
                          <span>스타일만 적용</span>
                        </label>
                      </div>
                    </div>

                    {settings.mode !== 'styleOnly' && (
                      <div className={styles.settingGroup}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={settings.addSectionBreak}
                            onChange={(e) => updateSettings({ addSectionBreak: e.target.checked })}
                          />
                          <span>문서 구분 표시 유지</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 푸터 */}
        {!isComplete && (
          <div className={styles.footer}>
            <button className={styles.navBtn} onClick={onBack}>
              취소
            </button>

            <div className={styles.footerActions}>
              {isProcessing ? (
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                  <span className={styles.progressText}>처리 중... {progress}%</span>
                </div>
              ) : (
                <button
                  className={styles.primaryBtn}
                  onClick={handleProcess}
                  disabled={documents.length === 0 || !paragraphStyle}
                >
                  스타일 적용 및 변환
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 스타일 에디터 컴포넌트
function StyleEditor({
  style,
  onUpdate,
}: {
  style: ElementStyle;
  onUpdate: (style: Partial<ElementStyle>) => void;
}) {
  return (
    <div className={styles.styleEditor}>
      <div className={styles.editorRow}>
        <label>폰트</label>
        <select
          value={style.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        >
          <option value="Malgun Gothic">맑은 고딕</option>
          <option value="Nanum Gothic">나눔고딕</option>
          <option value="Batang">바탕</option>
          <option value="Gulim">굴림</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>
      </div>

      <div className={styles.editorRow}>
        <label>크기 (pt)</label>
        <input
          type="number"
          min="8"
          max="72"
          value={style.fontSize}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
        />
      </div>

      <div className={styles.editorRow}>
        <label>색상</label>
        <input
          type="color"
          value={style.fontColor}
          onChange={(e) => onUpdate({ fontColor: e.target.value })}
        />
      </div>

      <div className={styles.editorRow}>
        <label>정렬</label>
        <select
          value={style.alignment}
          onChange={(e) => onUpdate({ alignment: e.target.value as ElementStyle['alignment'] })}
        >
          <option value="left">왼쪽</option>
          <option value="center">가운데</option>
          <option value="right">오른쪽</option>
          <option value="justify">양쪽</option>
        </select>
      </div>

      <div className={styles.editorRow}>
        <label>줄간격</label>
        <select
          value={style.lineSpacing}
          onChange={(e) => onUpdate({ lineSpacing: Number(e.target.value) })}
        >
          <option value="1">1.0</option>
          <option value="1.15">1.15</option>
          <option value="1.5">1.5</option>
          <option value="2">2.0</option>
        </select>
      </div>

      <div className={styles.editorRow}>
        <label>스타일</label>
        <div className={styles.styleButtons}>
          <button
            className={style.bold ? styles.active : ''}
            onClick={() => onUpdate({ bold: !style.bold })}
          >
            <strong>B</strong>
          </button>
          <button
            className={style.italic ? styles.active : ''}
            onClick={() => onUpdate({ italic: !style.italic })}
          >
            <em>I</em>
          </button>
          <button
            className={style.underline ? styles.active : ''}
            onClick={() => onUpdate({ underline: !style.underline })}
          >
            <u>U</u>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentMergerWizard;

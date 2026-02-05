/**
 * PPT Design Wizard
 * Swimming/Wave 톤앤매너에 맞춘 프레젠테이션 제작 UI
 *
 * 아이콘 출처: src/components/common/Icons (Lucide Icons 기반)
 */

import React, { useCallback, useState } from 'react';
import { useProjectState } from './hooks/useProjectState';
import { FileUploader } from './components/FileUploader';
import { DesignTokenEditor } from './components/DesignTokenEditor';
import { SlideEditor } from './components/SlideEditor';
import { analyzeContent, generateSlideStructure } from './utils/contentAnalyzer';
import { mergeDocuments } from './utils/documentParser';
import { generatePPTX } from './utils/pptxGenerator';
import { ParsedDocument, ImageAsset } from './types';

// 아이콘 - src/components/common/Icons에서 import
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadIcon,
  CheckIcon,
  SpinnerIcon,
} from '../../../../components/common/Icons';

import styles from './PptDesignWizard.module.css';

// ===== 스텝 정의 =====
const STEPS = [
  { id: 1, title: '디자인', desc: '스타일 설정' },
  { id: 2, title: '콘텐츠', desc: '파일 업로드' },
  { id: 3, title: '슬라이드', desc: '편집 & 정렬' },
  { id: 4, title: '완료', desc: '다운로드' },
];

// ===== Props =====
interface PptDesignWizardProps {
  onBack: () => void;
}

// ===== 메인 컴포넌트 =====
const PptDesignWizard: React.FC<PptDesignWizardProps> = ({ onBack }) => {
  const { state, currentTokens, actions } = useProjectState();
  const [isExporting, setIsExporting] = useState(false);

  // 문서 추가
  const handleDocumentParsed = useCallback((doc: ParsedDocument) => {
    actions.addDocument(doc);
  }, [actions]);

  // 이미지 추가
  const handleImageAdded = useCallback((image: ImageAsset) => {
    actions.addImage(image);
  }, [actions]);

  // 에러 처리
  const handleError = useCallback((error: string) => {
    actions.addError(error);
  }, [actions]);

  // AI 분석 및 슬라이드 생성
  const handleAnalyzeAndGenerate = useCallback(() => {
    if (state.documents.length === 0 && state.images.length === 0) {
      actions.addError('먼저 문서나 이미지를 업로드해주세요.');
      return;
    }

    actions.setProcessing(true);

    try {
      const allSections = mergeDocuments(state.documents);
      const analysis = analyzeContent(allSections, state.images);
      actions.setAnalysis(analysis);

      const slides = generateSlideStructure(state.documents, state.images, analysis);
      actions.setSlides(slides);
      actions.setStep(3);
    } catch (error) {
      actions.addError('콘텐츠 분석 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      actions.setProcessing(false);
    }
  }, [state.documents, state.images, actions]);

  // PPTX 내보내기
  const handleExport = useCallback(async () => {
    if (state.slides.length === 0) {
      actions.addError('내보낼 슬라이드가 없습니다.');
      return;
    }

    setIsExporting(true);

    try {
      const blob = await generatePPTX(state.slides, currentTokens, {
        title: state.slides[0]?.content.title || 'Presentation',
        author: 'FM Group AI Studio',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.slides[0]?.content.title || 'presentation'}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      actions.setStep(4);
    } catch (error) {
      actions.addError('PPTX 생성 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }, [state.slides, currentTokens, actions]);

  return (
    <div className={styles.overlay}>
      <div className={styles.wizard}>
        {/* 윈도우 헤더 (타이틀바) */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {/* macOS 스타일 윈도우 컨트롤 */}
            <div className={styles.windowControls}>
              <button
                className={`${styles.windowBtn} ${styles.close}`}
                onClick={onBack}
                title="닫기"
              />
              <button
                className={`${styles.windowBtn} ${styles.minimize}`}
                title="최소화"
              />
              <button
                className={`${styles.windowBtn} ${styles.maximize}`}
                title="최대화"
              />
            </div>
            <div className={styles.headerTitle}>
              <h1>PPT Design</h1>
              <span className={styles.badge}>NEW</span>
            </div>
          </div>

          {/* 스텝 인디케이터 */}
          <div className={styles.steps}>
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  className={`${styles.step} ${state.currentStep === step.id ? styles.active : ''} ${state.currentStep > step.id ? styles.done : ''}`}
                  onClick={() => actions.setStep(step.id)}
                >
                  <span className={styles.stepNum}>
                    {state.currentStep > step.id ? <CheckIcon size={12} /> : step.id}
                  </span>
                  <span className={styles.stepLabel}>{step.title}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <span className={`${styles.stepLine} ${state.currentStep > step.id ? styles.active : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{ width: 76 }} /> {/* 좌우 밸런스용 */}
        </div>

      {/* 에러 메시지 */}
      {state.errors.length > 0 && (
        <div className={styles.errors}>
          {state.errors.map((error, i) => (
            <div key={i} className={styles.error}>
              {error}
              <button onClick={() => actions.clearErrors()}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className={styles.content}>
        {/* Step 1: 디자인 스타일 */}
        {state.currentStep === 1 && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>디자인 스타일</h2>
              <p>프레젠테이션의 컬러, 폰트를 설정하세요</p>
            </div>
            <div className={styles.panelBody}>
              <DesignTokenEditor tokens={currentTokens} onChange={actions.setDesignTokens} />
            </div>
          </div>
        )}

        {/* Step 2: 콘텐츠 */}
        {state.currentStep === 2 && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>콘텐츠 가져오기</h2>
              <p>Markdown 파일이나 이미지를 업로드하세요</p>
            </div>
            <div className={styles.panelBody}>
              <FileUploader
                onDocumentParsed={handleDocumentParsed}
                onImageAdded={handleImageAdded}
                onError={handleError}
              />

              {(state.documents.length > 0 || state.images.length > 0) && (
                <div className={styles.fileList}>
                  <h3>업로드된 파일</h3>
                  <div className={styles.files}>
                    {state.documents.map((doc) => (
                      <div key={doc.filename} className={styles.fileItem}>
                        <span>📄 {doc.filename}</span>
                        <button onClick={() => actions.removeDocument(doc.filename)}>×</button>
                      </div>
                    ))}
                    {state.images.map((img) => (
                      <div key={img.id} className={styles.fileItem}>
                        <span>🖼️ {img.filename}</span>
                        <button onClick={() => actions.removeImage(img.id)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: 슬라이드 */}
        {state.currentStep === 3 && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>슬라이드 편집</h2>
              <p>{state.slides.length}개 슬라이드</p>
            </div>
            <div className={styles.panelBody}>
              {state.slides.length > 0 ? (
                <SlideEditor
                  slides={state.slides}
                  tokens={currentTokens}
                  onUpdateSlide={actions.updateSlide}
                  onReorderSlides={actions.reorderSlides}
                />
              ) : (
                <div className={styles.empty}>
                  <p>슬라이드가 없습니다</p>
                  <button onClick={() => actions.setStep(2)}>콘텐츠 업로드하기</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: 완료 */}
        {state.currentStep === 4 && (
          <div className={styles.panel}>
            <div className={styles.complete}>
              <div className={styles.completeIcon}>✓</div>
              <h2>PPT 생성 완료</h2>
              <p>{state.slides.length}개 슬라이드가 생성되었습니다</p>
              <button className={styles.downloadBtn} onClick={handleExport}>
                <DownloadIcon size={16} />
                다시 다운로드
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className={styles.footer}>
        <button
          className={styles.navBtn}
          onClick={() => actions.setStep(Math.max(1, state.currentStep - 1))}
          disabled={state.currentStep === 1}
        >
          <ArrowLeftIcon size={14} />
          이전
        </button>

        <div className={styles.footerActions}>
          {state.currentStep === 2 && (
            <button
              className={styles.primaryBtn}
              onClick={handleAnalyzeAndGenerate}
              disabled={state.isProcessing || (state.documents.length === 0 && state.images.length === 0)}
            >
              {state.isProcessing ? (
                <>
                  <SpinnerIcon size={14} className={styles.spin} />
                  분석 중...
                </>
              ) : (
                'AI 분석 & 생성'
              )}
            </button>
          )}
          {state.currentStep === 3 && state.slides.length > 0 && (
            <button
              className={styles.primaryBtn}
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <SpinnerIcon size={14} className={styles.spin} />
                  생성 중...
                </>
              ) : (
                <>
                  <DownloadIcon size={14} />
                  PPTX 다운로드
                </>
              )}
            </button>
          )}
        </div>

        <button
          className={`${styles.navBtn} ${styles.next}`}
          onClick={() => actions.setStep(Math.min(4, state.currentStep + 1))}
          disabled={state.currentStep === 4}
        >
          다음
          <ArrowRightIcon size={14} />
        </button>
      </div>
      </div>
    </div>
  );
};

export default PptDesignWizard;

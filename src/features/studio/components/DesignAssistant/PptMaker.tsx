/**
 * PptMaker 컴포넌트
 * AI 기반 PPT 슬라이드 생성 UI
 * OOXML 직접 조작 엔진으로 미세 컨트롤 지원
 */
import React, { useState, useRef } from 'react';
import { UploadIcon, DownloadIcon } from '../../../../components/common/Icons';
import styles from './PptMaker.module.css';

// PPT 템플릿 타입
interface PptTemplate {
  key: string;
  label: string;
  description: string;
  thumbnail?: string;
}

// 슬라이드 콘텐츠 타입
interface SlideContent {
  title: string;
  subtitle?: string;
  body?: string;
  bulletPoints?: string[];
}

interface PptMakerProps {
  isLoading: boolean;
  onGenerate: (config: PptConfig) => void;
}

// PPT 생성 설정
export interface PptConfig {
  template: string;
  content: SlideContent;
  style: {
    fontSize: number;
    lineSpacing: number;
    charSpacing: number;
    fontFamily: string;
    primaryColor: string;
    backgroundColor: string;
  };
  backgroundImage?: string;
}

// 템플릿 목록
const PPT_TEMPLATES: PptTemplate[] = [
  {
    key: 'comparison',
    label: '비교 슬라이드',
    description: '기존 방법 vs 새로운 방법 비교',
  },
  {
    key: 'title',
    label: '타이틀 슬라이드',
    description: '프레젠테이션 제목 및 소개',
  },
  {
    key: 'bullet',
    label: '불릿 포인트',
    description: '항목별 내용 정리',
  },
  {
    key: 'chart',
    label: '차트 슬라이드',
    description: '데이터 시각화 (준비중)',
  },
];

// 폰트 목록
const FONT_OPTIONS = [
  { key: 'Pretendard', label: 'Pretendard' },
  { key: 'Noto Sans KR', label: 'Noto Sans KR' },
  { key: 'Spoqa Han Sans Neo', label: 'Spoqa Han Sans' },
  { key: 'Arial', label: 'Arial' },
];

// 색상 프리셋
const COLOR_PRESETS = [
  { key: 'blue', primary: '006EFF', bg: 'F5F5F5', label: '블루' },
  { key: 'orange', primary: 'FF3300', bg: 'FFF8F0', label: '오렌지' },
  { key: 'green', primary: '00AA55', bg: 'F0FFF5', label: '그린' },
  { key: 'purple', primary: '7C3AED', bg: 'F5F0FF', label: '퍼플' },
  { key: 'dark', primary: 'FFFFFF', bg: '1E1E1E', label: '다크' },
];

export const PptMaker: React.FC<PptMakerProps> = ({
  isLoading,
  onGenerate,
}) => {
  // 템플릿 선택
  const [selectedTemplate, setSelectedTemplate] = useState<string>('comparison');

  // 콘텐츠 입력
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [body, setBody] = useState<string>('');

  // 스타일 설정
  const [fontSize, setFontSize] = useState<number>(24);
  const [lineSpacing, setLineSpacing] = useState<number>(36);
  const [charSpacing, setCharSpacing] = useState<number>(0);
  const [fontFamily, setFontFamily] = useState<string>('Pretendard');
  const [colorPreset, setColorPreset] = useState<string>('blue');

  // 배경 이미지
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgImageName, setBgImageName] = useState<string>('');
  const bgInputRef = useRef<HTMLInputElement>(null);

  // 선택된 색상 프리셋 정보
  const selectedColor = COLOR_PRESETS.find(c => c.key === colorPreset) || COLOR_PRESETS[0];

  // 배경 이미지 업로드 핸들러
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBgImageName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setBgImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 배경 이미지 제거
  const handleRemoveBg = () => {
    setBgImage(null);
    setBgImageName('');
    if (bgInputRef.current) {
      bgInputRef.current.value = '';
    }
  };

  // PPT 생성
  const handleGenerate = () => {
    const config: PptConfig = {
      template: selectedTemplate,
      content: {
        title,
        subtitle,
        body,
        bulletPoints: body.split('\n').filter(line => line.trim()),
      },
      style: {
        fontSize,
        lineSpacing,
        charSpacing,
        fontFamily,
        primaryColor: selectedColor.primary,
        backgroundColor: selectedColor.bg,
      },
      backgroundImage: bgImage || undefined,
    };
    onGenerate(config);
  };

  // 생성 가능 여부
  const canGenerate = title.trim().length > 0;

  return (
    <div className={styles.container}>
      {/* 템플릿 선택 */}
      <div className={styles.section}>
        <label className={styles.label}>템플릿 선택</label>
        <div className={styles.templateGrid}>
          {PPT_TEMPLATES.map((template) => (
            <button
              key={template.key}
              className={`${styles.templateBtn} ${selectedTemplate === template.key ? styles.active : ''}`}
              onClick={() => setSelectedTemplate(template.key)}
              disabled={isLoading || template.key === 'chart'}
            >
              <span className={styles.templateLabel}>{template.label}</span>
              <span className={styles.templateDesc}>{template.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 입력 */}
      <div className={styles.section}>
        <label className={styles.label}>슬라이드 내용</label>
        <input
          type="text"
          className={styles.input}
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
        <input
          type="text"
          className={styles.input}
          placeholder="부제목 (선택)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          disabled={isLoading}
        />
        <textarea
          className={styles.textarea}
          placeholder="본문 내용 (각 줄이 불릿 포인트가 됩니다)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isLoading}
          rows={4}
        />
      </div>

      {/* 배경 이미지 업로드 */}
      <div className={styles.section}>
        <label className={styles.label}>배경 이미지 (선택)</label>
        <input
          type="file"
          ref={bgInputRef}
          onChange={handleBgUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        {!bgImage ? (
          <button
            className={styles.uploadBtn}
            onClick={() => bgInputRef.current?.click()}
            disabled={isLoading}
          >
            <UploadIcon size={16} />
            <span>이미지 업로드</span>
          </button>
        ) : (
          <div className={styles.bgPreview}>
            <img src={bgImage} alt="배경 미리보기" />
            <button className={styles.removeBtn} onClick={handleRemoveBg}>✕</button>
            <span className={styles.bgFileName}>{bgImageName}</span>
          </div>
        )}
      </div>

      {/* 스타일 설정 */}
      <div className={styles.section}>
        <label className={styles.label}>스타일 설정</label>

        {/* 폰트 선택 */}
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>폰트</span>
          <select
            className={styles.select}
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            disabled={isLoading}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.key} value={font.key}>{font.label}</option>
            ))}
          </select>
        </div>

        {/* 색상 프리셋 */}
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>색상</span>
          <div className={styles.colorPresets}>
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.key}
                className={`${styles.colorBtn} ${colorPreset === color.key ? styles.active : ''}`}
                onClick={() => setColorPreset(color.key)}
                disabled={isLoading}
                title={color.label}
                style={{
                  backgroundColor: `#${color.bg}`,
                  borderColor: colorPreset === color.key ? `#${color.primary}` : 'transparent',
                }}
              >
                <span style={{ color: `#${color.primary}` }}>A</span>
              </button>
            ))}
          </div>
        </div>

        {/* 폰트 크기 슬라이더 */}
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>글자 크기</span>
          <div className={styles.sliderWrapper}>
            <input
              type="range"
              min="14"
              max="48"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              disabled={isLoading}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{fontSize}pt</span>
          </div>
        </div>

        {/* 행간 슬라이더 */}
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>행간</span>
          <div className={styles.sliderWrapper}>
            <input
              type="range"
              min="18"
              max="72"
              value={lineSpacing}
              onChange={(e) => setLineSpacing(Number(e.target.value))}
              disabled={isLoading}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{lineSpacing}pt</span>
          </div>
        </div>

        {/* 자간 슬라이더 */}
        <div className={styles.settingRow}>
          <span className={styles.settingLabel}>자간</span>
          <div className={styles.sliderWrapper}>
            <input
              type="range"
              min="-5"
              max="10"
              value={charSpacing}
              onChange={(e) => setCharSpacing(Number(e.target.value))}
              disabled={isLoading}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{charSpacing > 0 ? '+' : ''}{charSpacing}pt</span>
          </div>
        </div>
      </div>

      {/* 생성 버튼 */}
      <button
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={!canGenerate || isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner} />
            PPT 생성 중...
          </>
        ) : (
          <>
            <DownloadIcon size={16} />
            PPT 생성하기
          </>
        )}
      </button>

      <p className={styles.hint}>
        OOXML 엔진으로 행간, 자간, 위치 등 미세 컨트롤 가능
      </p>
    </div>
  );
};

export default PptMaker;

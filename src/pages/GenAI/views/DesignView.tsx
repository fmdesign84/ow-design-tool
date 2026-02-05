/**
 * Design View (디자인 어시스턴트)
 * - 목업 생성 (로고 + 키비주얼 두 개 이미지)
 */

import React, { useCallback, useRef, useState } from 'react';
import { MockupGenerator, PortraitStagingStudio } from '../../../features/studio';
import { useDesignStore } from '../../../stores/useDesignStore';
import { MOCKUP_CATEGORIES, MOCKUP_PRESETS } from '../constants';

// 서브메뉴 타입
type DesignSubMenu = 'mockup-generator' | 'portrait-staging';

// 목업 생성 결과 타입
interface MockupGeneratedResult {
  url: string;
  style: string;
  mockupLabel: string;
}

interface DesignViewProps {
  activeSubMenu: DesignSubMenu;
  // 공유 상태
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // 생성 결과 콜백
  onMockupGenerated?: (result: MockupGeneratedResult) => void;
  // 에러
  onError?: (error: string) => void;
}

export const DesignView: React.FC<DesignViewProps> = ({
  activeSubMenu,
  isLoading,
  setIsLoading,
  onMockupGenerated,
  onError,
}) => {
  // Design Store - 로고/키비주얼 분리
  const {
    logoPreview,
    logoFileName,
    keyVisualPreview,
    keyVisualFileName,
    selectedMockup,
    mockupResult,
    setLogoFile,
    setLogoPreview,
    setLogoFileName,
    clearLogo,
    setKeyVisualFile,
    setKeyVisualPreview,
    setKeyVisualFileName,
    clearKeyVisual,
    setSelectedMockup,
    setMockupResult,
    addMockupToHistory,
    isGeneratingMockup,
    setIsGeneratingMockup,
    setError,
  } = useDesignStore();

  // 파일 입력 ref
  const logoInputRef = useRef<HTMLInputElement>(null);
  const keyVisualInputRef = useRef<HTMLInputElement>(null);

  // 로고 업로드 핸들러
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setLogoFile(file);
    setLogoFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  }, [setLogoFile, setLogoFileName, setLogoPreview, onError]);

  // 키비주얼 업로드 핸들러
  const handleKeyVisualUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setKeyVisualFile(file);
    setKeyVisualFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setKeyVisualPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  }, [setKeyVisualFile, setKeyVisualFileName, setKeyVisualPreview, onError]);

  // 파일 선택 다이얼로그 열기
  const handleOpenLogoPicker = useCallback(() => {
    logoInputRef.current?.click();
  }, []);

  const handleOpenKeyVisualPicker = useCallback(() => {
    keyVisualInputRef.current?.click();
  }, []);

  // 목업 선택
  const handleMockupSelect = useCallback((key: string) => {
    setSelectedMockup(key);
  }, [setSelectedMockup]);

  // 목업 생성 가능 여부 (로고 또는 키비주얼 중 하나 이상 필요)
  const canGenerate = (!!logoPreview || !!keyVisualPreview) && !!selectedMockup;

  // 목업 생성
  const handleGenerateMockup = useCallback(async () => {
    if (!canGenerate) return;

    setIsGeneratingMockup(true);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoImage: logoPreview || null,
          keyVisualImage: keyVisualPreview || null,
          mockupType: selectedMockup,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '목업 생성 실패');
      }

      const resultUrl = data.image || data.url;
      const result = {
        url: resultUrl,
        style: selectedMockup,
        createdAt: new Date().toISOString(),
      };

      setMockupResult(result);
      addMockupToHistory(result);

      // ImageGenPage의 imageHistory에 추가하기 위한 콜백
      const presetInfo = MOCKUP_PRESETS.find(p => p.key === selectedMockup);
      onMockupGenerated?.({
        url: resultUrl,
        style: selectedMockup,
        mockupLabel: presetInfo?.label || selectedMockup,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '목업 생성 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGeneratingMockup(false);
      setIsLoading(false);
    }
  }, [
    canGenerate,
    logoPreview,
    keyVisualPreview,
    selectedMockup,
    setIsGeneratingMockup,
    setIsLoading,
    setError,
    setMockupResult,
    addMockupToHistory,
    onMockupGenerated,
    onError,
  ]);

  // 연출 생성 헤더 변경 핸들러
  const [, setStagingHeader] = useState<{ title: string; showBack: boolean; onBack?: () => void }>({ title: '연출 생성', showBack: false });

  // 서브메뉴별 렌더링
  switch (activeSubMenu) {
    case 'portrait-staging':
      return (
        <PortraitStagingStudio
          onHeaderChange={(header) => setStagingHeader({ title: header.title, showBack: header.showBack, onBack: header.onBack })}
        />
      );

    case 'mockup-generator':
    default:
      return (
        <MockupGenerator
          logoInputRef={logoInputRef}
          onLogoUpload={handleLogoUpload}
          onOpenLogoPicker={handleOpenLogoPicker}
          logoPreview={logoPreview}
          logoFileName={logoFileName}
          onRemoveLogo={clearLogo}
          keyVisualInputRef={keyVisualInputRef}
          onKeyVisualUpload={handleKeyVisualUpload}
          onOpenKeyVisualPicker={handleOpenKeyVisualPicker}
          keyVisualPreview={keyVisualPreview}
          keyVisualFileName={keyVisualFileName}
          onRemoveKeyVisual={clearKeyVisual}
          mockupCategories={MOCKUP_CATEGORIES}
          mockupPresets={MOCKUP_PRESETS}
          selectedMockup={selectedMockup}
          onMockupSelect={handleMockupSelect}
          isLoading={isGeneratingMockup}
          canGenerate={canGenerate}
          onGenerate={handleGenerateMockup}
          mockupResult={mockupResult}
        />
      );
  }
};

export default DesignView;

import React, { useCallback, useRef } from 'react';
import { DocumentType, ImageAsset, ParsedDocument } from '../types';
import { parseDocument, detectDocumentType } from '../utils/documentParser';

interface FileUploaderProps {
  onDocumentParsed: (doc: ParsedDocument) => void;
  onImageAdded: (image: ImageAsset) => void;
  onError: (error: string) => void;
  acceptedTypes?: DocumentType[];
  multiple?: boolean;
  className?: string;
}

export function FileUploader({
  onDocumentParsed,
  onImageAdded,
  onError,
  acceptedTypes = ['excel', 'word', 'docx', 'markdown', 'image'],
  multiple = true,
  className = '',
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // 파일 타입 -> accept 문자열 변환
  const getAcceptString = () => {
    const typeMap: Record<DocumentType, string> = {
      excel: '.xlsx,.xls,.csv',
      word: '.docx,.doc',
      docx: '.docx',
      markdown: '.md,.markdown',
      image: '.png,.jpg,.jpeg,.gif,.webp,.svg',
    };
    return acceptedTypes.map((t) => typeMap[t]).join(',');
  };

  // 파일 처리
  const processFile = useCallback(
    async (file: File) => {
      const docType = detectDocumentType(file);

      if (!docType) {
        onError(`지원하지 않는 파일 형식입니다: ${file.name}`);
        return;
      }

      if (!acceptedTypes.includes(docType)) {
        onError(`허용되지 않은 파일 형식입니다: ${file.name}`);
        return;
      }

      try {
        if (docType === 'image') {
          // 이미지 처리
          const url = await fileToDataURL(file);
          const dimensions = await getImageDimensions(url);

          const imageAsset: ImageAsset = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            filename: file.name,
            url,
            width: dimensions.width,
            height: dimensions.height,
            aspectRatio: dimensions.width / dimensions.height,
          };

          onImageAdded(imageAsset);
        } else {
          // 문서 처리
          const doc = await parseDocument(file);
          if (doc) {
            onDocumentParsed(doc);
          }
        }
      } catch (error) {
        onError(`파일 처리 중 오류가 발생했습니다: ${file.name}`);
        console.error(error);
      }
    },
    [acceptedTypes, onDocumentParsed, onImageAdded, onError]
  );

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setIsProcessing(true);

      try {
        const fileArray = Array.from(files);
        await Promise.all(fileArray.map(processFile));
      } finally {
        setIsProcessing(false);
      }
    },
    [processFile]
  );

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  // 클릭으로 파일 선택
  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={className}
      style={{
        border: `2px dashed ${isDragging ? '#FF6B00' : '#E5E7EB'}`,
        borderRadius: '12px',
        padding: '40px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragging ? 'rgba(255, 107, 0, 0.08)' : '#F9FAFB',
        transition: 'all 0.2s ease',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={getAcceptString()}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />

      {isProcessing ? (
        <div style={{ color: '#6B7280' }}>
          <Spinner />
          <p style={{ margin: '16px 0 0' }}>파일 처리 중...</p>
        </div>
      ) : (
        <>
          <UploadIcon />
          <p style={{ margin: '16px 0 8px', fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>
            파일을 드래그하거나 클릭하여 업로드
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>
            DOCX, Markdown, 이미지 파일 지원
          </p>
        </>
      )}
    </div>
  );
}

// 헬퍼 함수들
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
}

// 아이콘 컴포넌트 - Wave 라이트 스타일
function UploadIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9CA3AF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ margin: '0 auto' }}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF6B00"
      strokeWidth="2"
      style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

export default FileUploader;

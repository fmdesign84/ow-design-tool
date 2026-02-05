/**
 * ConversationalEditor 컴포넌트
 * 대화형 이미지 편집 UI (Multi-turn)
 * - Gemini 3 Pro 전용
 * - 채팅형 인터페이스로 연속 수정
 * - 편집 히스토리 관리
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ConversationalEditor.module.css';
import { processImage } from '../../../../utils/imageUtils';

// 아이콘 (중앙 시스템에서 import)
import { SendIcon, ImageIcon, UndoIcon, DownloadIcon } from '../../../../components/common/Icons';

// 메시지 타입
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

// 편집 히스토리 아이템
interface EditHistoryItem {
  id: string;
  prompt: string;
  image: string;
  timestamp: Date;
}

interface ConversationalEditorProps {
  // 초기 이미지
  initialImage?: string;
  onImageChange?: (image: string) => void;

  // 생성 함수
  onGenerate: (prompt: string, currentImage: string) => Promise<string>;

  // 상태
  isLoading?: boolean;

  // 스타일
  className?: string;
}

export const ConversationalEditor: React.FC<ConversationalEditorProps> = ({
  initialImage,
  onImageChange,
  onGenerate,
  isLoading = false,
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(initialImage || null);
  const [inputValue, setInputValue] = useState('');
  const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 메시지 스크롤
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 초기 이미지 설정 (마운트 시 1회만 실행)
  useEffect(() => {
    if (initialImage && !currentImage) {
      setCurrentImage(initialImage);
      addInitialImageMessage(initialImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImage]);

  // 초기 이미지 메시지
  const addInitialImageMessage = (image: string) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: '이미지가 준비되었습니다. 어떻게 수정할까요?',
      image,
      timestamp: new Date(),
    };
    setMessages([message]);
  };

  // 이미지 업로드 - 압축 포함 (413 에러 방지)
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawImageData = event.target?.result as string;
      try {
        // 이미지 압축 (최대 1536px, JPEG 85%)
        const imageData = await processImage(rawImageData, {
          maxWidth: 1536,
          maxHeight: 1536,
          quality: 0.85,
          format: 'jpeg',
        });
        setCurrentImage(imageData);
        setMessages([]);
        setEditHistory([]);
        setHistoryIndex(-1);
        addInitialImageMessage(imageData);
      } catch (error) {
        console.error('[ConversationalEditor] Image compression failed:', error);
        // 압축 실패 시 원본 사용
        setCurrentImage(rawImageData);
        setMessages([]);
        setEditHistory([]);
        setHistoryIndex(-1);
        addInitialImageMessage(rawImageData);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // 메시지 전송
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !currentImage || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    try {
      // 생성 요청
      const newImage = await onGenerate(inputValue.trim(), currentImage);

      // 히스토리에 현재 상태 저장
      const historyItem: EditHistoryItem = {
        id: `hist-${Date.now()}`,
        prompt: inputValue.trim(),
        image: newImage,
        timestamp: new Date(),
      };

      setEditHistory((prev) => [...prev.slice(0, historyIndex + 1), historyItem]);
      setHistoryIndex((prev) => prev + 1);

      // 응답 메시지
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '수정을 완료했습니다.',
        image: newImage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentImage(newImage);
      onImageChange?.(newImage);
    } catch (error) {
      // 에러 메시지
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '수정 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [inputValue, currentImage, isLoading, onGenerate, historyIndex, onImageChange]);

  // 키보드 입력
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 실행 취소
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;

    const prevIndex = historyIndex - 1;
    const prevItem = editHistory[prevIndex];

    if (prevItem) {
      setCurrentImage(prevItem.image);
      setHistoryIndex(prevIndex);
      onImageChange?.(prevItem.image);
    }
  }, [historyIndex, editHistory, onImageChange]);

  // 이미지 다운로드
  const handleDownload = useCallback(() => {
    if (!currentImage) return;

    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `edited-image-${Date.now()}.png`;
    link.click();
  }, [currentImage]);

  return (
    <div className={`${styles.container} ${className}`}>
      {/* 안내 문구 */}
      <div className={styles.notice}>
        💡 대화형 편집은 아카이브에 자동 저장되지 않습니다. 원하는 이미지는 다운로드해주세요.
      </div>

      {/* 이미지 업로드 섹션 */}
      <div className={styles.section}>
        <label className={styles.sectionLabel}>
          편집할 이미지
          <span className={styles.badge}>Gemini 전용</span>
        </label>
        <div className={styles.imageSection}>
          {currentImage ? (
            <div className={styles.imageWrapper}>
              <img src={currentImage} alt="Current" className={styles.currentImage} />
              <div className={styles.imageActions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleUndo}
                  disabled={historyIndex <= 0 || isLoading}
                  title="이전 상태로"
                >
                  <UndoIcon size={14} />
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleDownload}
                  disabled={isLoading}
                  title="다운로드"
                >
                  <DownloadIcon size={14} />
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  title="이미지 변경"
                >
                  <ImageIcon size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className={styles.uploadArea}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon size={28} />
              <p className={styles.uploadText}>이미지를 업로드하세요</p>
              <p className={styles.uploadHint}>클릭하거나 파일을 드래그하세요</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* 대화 기록 */}
      {messages.length > 0 && (
        <div className={styles.section}>
          <label className={styles.sectionLabel}>대화 기록</label>
          <div className={styles.chatSection}>
            <div className={styles.messages}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${styles[msg.role]}`}
                >
                  <div className={styles.messageContent}>
                    <span className={styles.messageIcon}>
                      {msg.role === 'user' ? '💬' : '🤖'}
                    </span>
                    <p>{msg.content}</p>
                  </div>
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Result"
                      className={styles.messageImage}
                    />
                  )}
                </div>
              ))}

              {isLoading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.messageContent}>
                    <span className={styles.messageIcon}>🤖</span>
                    <p className={styles.loading}>수정 중...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* 편집 입력 */}
      <div className={styles.section}>
        <label className={styles.sectionLabel}>편집 요청</label>
        <div className={styles.inputSection}>
          <textarea
            ref={inputRef}
            className={styles.input}
            placeholder="예: 배경을 바다로 바꿔줘"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!currentImage || isLoading}
            rows={2}
          />
          <button
            type="button"
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!inputValue.trim() || !currentImage || isLoading}
          >
            <SendIcon size={18} />
          </button>
        </div>
        <p className={styles.hint}>Enter를 눌러 전송 (Shift+Enter: 줄바꿈)</p>
      </div>

      {/* 히스토리 표시 */}
      {editHistory.length > 0 && (
        <div className={styles.historyBar}>
          <span className={styles.historyLabel}>편집 기록:</span>
          <div className={styles.historyDots}>
            {editHistory.map((item, idx) => (
              <span
                key={item.id}
                className={`${styles.historyDot} ${idx === historyIndex ? styles.active : ''}`}
                title={item.prompt}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationalEditor;

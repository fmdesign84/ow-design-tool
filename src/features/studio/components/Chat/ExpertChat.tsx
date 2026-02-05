/**
 * ExpertChat 컴포넌트
 * 전문가 챗봇 메인 인터페이스
 *
 * v2: 새 아키텍처 - 이미지 URL 기반 (413 에러 해결)
 * - 이미지 업로드 → /api/upload-chat-image → URL 반환
 * - 대화 전송 → /api/generate-conversational → Function Calling
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ExpertSelector, ExpertPersona } from './ExpertSelector';
import { processImage } from '../../../../utils/imageUtils';
import styles from './ExpertChat.module.css';

// 아이콘 (중앙 시스템에서 import)
import { SendIcon, BackIcon, ImageIcon, DownloadIcon } from '../../../../components/common/Icons';

// 메시지 타입
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string;
  timestamp: Date;
  actions?: QuickAction[];
}

// 빠른 액션 버튼
interface QuickAction {
  label: string;
  value: string;
  icon?: string;
}

// 작업 상태
interface TaskStatus {
  step: string;
  progress: number;
  isComplete: boolean;
}

// 대화 히스토리 타입 (API 전송용)
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ExpertChatProps {
  className?: string;
  fullWidth?: boolean;
}

export const ExpertChat: React.FC<ExpertChatProps> = ({
  className = '',
  fullWidth = false,
}) => {
  const [selectedExpert, setSelectedExpert] = useState<ExpertPersona | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);  // URL 기반
  const [isLoading, setIsLoading] = useState(false);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

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

  // 전문가 선택
  const handleSelectExpert = useCallback((expert: ExpertPersona) => {
    setSelectedExpert(expert);

    // 웰컴 메시지
    const welcomeMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: expert.welcomeMessage,
      timestamp: new Date(),
      actions: expert.suggestedPrompts.map(prompt => ({
        label: prompt,
        value: prompt,
      })),
    };

    setMessages([welcomeMessage]);
  }, []);

  // 자유 모드
  const handleFreeMode = useCallback(() => {
    const freeExpert: ExpertPersona = {
      id: 'free',
      name: '자유 대화',
      icon: '💬',
      description: '자유롭게 요청하세요',
      color: '#FF6B00',
      welcomeMessage: '안녕하세요! 어떤 이미지를 만들어 드릴까요? 자유롭게 설명해주세요.',
      suggestedPrompts: ['이미지 생성', '이미지 편집', '배경 변경', '업스케일'],
    };
    handleSelectExpert(freeExpert);
  }, [handleSelectExpert]);

  // 뒤로 가기
  const handleBack = useCallback(() => {
    setSelectedExpert(null);
    setMessages([]);
    setCurrentImageUrl(null);
    setTaskStatus(null);
    setConversationHistory([]);
  }, []);

  // 빠른 액션 클릭
  const handleQuickAction = useCallback((action: QuickAction) => {
    setInputValue(action.value);
    // 자동 전송
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // 이미지 업로드 - 새 아키텍처: API로 업로드 → URL 반환
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isLoading) return;

    setIsLoading(true);
    setTaskStatus({ step: '이미지 업로드 중...', progress: 30, isComplete: false });

    try {
      // 1. 파일을 base64로 변환
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const rawBase64 = await base64Promise;

      // 1.5. 이미지 압축 (413 에러 방지)
      const base64Data = await processImage(rawBase64, {
        maxWidth: 1536,
        maxHeight: 1536,
        quality: 0.85,
        format: 'jpeg',
      });

      // 2. /api/upload-chat-image 호출
      const response = await fetch('/api/upload-chat-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data }),
      });

      if (!response.ok) {
        throw new Error('이미지 업로드 실패');
      }

      const data = await response.json();
      const imageUrl = data.imageUrl;

      setCurrentImageUrl(imageUrl);
      setTaskStatus({ step: '업로드 완료!', progress: 100, isComplete: true });

      // 이미지 업로드 메시지 (썸네일용으로 base64 사용)
      const uploadMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: '이미지를 업로드했어요',
        image: imageUrl,  // URL 사용
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, uploadMessage]);

      // AI 응답
      const responseMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '이미지를 확인했어요! 어떻게 수정할까요?',
        timestamp: new Date(),
        actions: [
          { label: '배경 변경', value: '배경을 변경해줘' },
          { label: '스타일 변경', value: '스타일을 변경해줘' },
          { label: '업스케일', value: '해상도를 높여줘' },
          { label: '부분 편집', value: '일부분만 수정해줘' },
        ],
      };
      setMessages(prev => [...prev, responseMessage]);

      setTimeout(() => setTaskStatus(null), 1500);

    } catch (error) {
      console.error('Image upload error:', error);
      setTaskStatus(null);

      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: '이미지 업로드 중 문제가 발생했어요. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isLoading]);

  // 메시지 전송 - 새 아키텍처: /api/generate-conversational 호출
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userContent = inputValue.trim();
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 작업 상태 시작
    setTaskStatus({
      step: '요청 분석 중...',
      progress: 10,
      isComplete: false,
    });

    try {
      // /api/generate-conversational 호출
      setTaskStatus({ step: 'AI가 생각하는 중...', progress: 30, isComplete: false });

      const response = await fetch('/api/generate-conversational', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: selectedExpert?.id || 'free',
          message: userContent,
          imageUrl: currentImageUrl || undefined,
          history: conversationHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.response || data.error || '요청 처리 실패');
      }

      // 이미지 생성 중이면 진행률 업데이트
      if (data.action?.type === 'generate_image') {
        setTaskStatus({ step: '이미지 생성 중...', progress: 70, isComplete: false });
      }

      setTaskStatus({ step: '완료!', progress: 100, isComplete: true });

      // AI 응답 메시지
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.response,
        image: data.imageUrl || undefined,
        timestamp: new Date(),
        actions: data.suggestions?.map((s: string) => ({
          label: s,
          value: s,
        })) || [],
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 새 이미지가 생성되었으면 업데이트
      if (data.imageUrl) {
        setCurrentImageUrl(data.imageUrl);
      }

      // 대화 히스토리 업데이트
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userContent },
        { role: 'assistant', content: data.response },
      ]);

      // 작업 상태 초기화
      setTimeout(() => setTaskStatus(null), 2000);

    } catch (error) {
      console.error('Send error:', error);
      setTaskStatus(null);

      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: error instanceof Error ? error.message : '죄송해요, 문제가 발생했어요. 다시 시도해주세요.',
        timestamp: new Date(),
        actions: [
          { label: '다시 시도', value: userContent },
        ],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, currentImageUrl, selectedExpert, conversationHistory]);

  // 키보드 입력
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 이미지 다운로드
  const handleDownload = useCallback(() => {
    if (!currentImageUrl) return;

    const link = document.createElement('a');
    link.href = currentImageUrl;
    link.download = `${selectedExpert?.name || 'image'}-${Date.now()}.png`;
    link.target = '_blank';  // Supabase URL은 새 탭에서 다운로드
    link.click();
  }, [currentImageUrl, selectedExpert]);

  // 전문가 미선택 시 선택 화면
  if (!selectedExpert) {
    return (
      <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
        <ExpertSelector onSelect={handleSelectExpert} onFreeMode={handleFreeMode} />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <BackIcon size={18} />
        </button>
        <div className={styles.expertInfo}>
          <span className={styles.expertIcon}>{selectedExpert.icon}</span>
          <span className={styles.expertName}>{selectedExpert.name}</span>
        </div>
        {currentImageUrl && (
          <button className={styles.downloadBtn} onClick={handleDownload}>
            <DownloadIcon size={18} />
          </button>
        )}
      </div>

      {/* 채팅 영역 */}
      <div className={styles.chatArea}>
        <div className={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${styles[msg.role]}`}
            >
              {msg.role === 'assistant' && (
                <span className={styles.messageAvatar}>{selectedExpert.icon}</span>
              )}
              <div className={styles.messageBody}>
                <p className={styles.messageText}>{msg.content}</p>
                {msg.image && (
                  <img src={msg.image} alt="Result" className={styles.messageImage} />
                )}
                {msg.actions && msg.actions.length > 0 && (
                  <div className={styles.quickActions}>
                    {msg.actions.map((action, idx) => (
                      <button
                        key={idx}
                        className={styles.quickActionBtn}
                        onClick={() => handleQuickAction(action)}
                      >
                        {action.icon && <span>{action.icon}</span>}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 작업 상태 표시 */}
          {taskStatus && !taskStatus.isComplete && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <span className={styles.messageAvatar}>{selectedExpert.icon}</span>
              <div className={styles.messageBody}>
                <div className={styles.taskStatus}>
                  <span className={styles.taskStep}>{taskStatus.step}</span>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${taskStatus.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className={styles.inputArea}>
        <button
          className={styles.attachBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <ImageIcon size={20} />
        </button>
        <textarea
          ref={inputRef}
          className={styles.input}
          placeholder="메시지를 입력하세요..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
        >
          <SendIcon size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default ExpertChat;

/**
 * TextToVideo 컴포넌트
 * 텍스트만으로 영상을 생성하는 UI
 */
import React from 'react';
import styles from './TextToVideo.module.css';

export type VideoAspectRatio = '16:9' | '9:16' | '1:1';
export type VideoDuration = '4' | '6' | '8';
export type VideoResolution = '720p' | '1080p';

interface TextToVideoProps {
  // 영상 설정
  videoAspectRatio: VideoAspectRatio;
  onVideoAspectRatioChange: (ratio: VideoAspectRatio) => void;
  videoDuration: VideoDuration;
  onVideoDurationChange: (duration: VideoDuration) => void;
  videoResolution: VideoResolution;
  onVideoResolutionChange: (resolution: VideoResolution) => void;
  videoGenerateAudio: boolean;
  onVideoGenerateAudioChange: (checked: boolean) => void;

  // 생성 관련
  videoPrompt: string;
  isLoading: boolean;
  onGenerateVideo: () => void;
  generatedVideo: string | null;
}

export const TextToVideo: React.FC<TextToVideoProps> = ({
  videoAspectRatio,
  onVideoAspectRatioChange,
  videoDuration,
  onVideoDurationChange,
  videoResolution,
  onVideoResolutionChange,
  videoGenerateAudio,
  onVideoGenerateAudioChange,
  videoPrompt,
  isLoading,
  onGenerateVideo,
  generatedVideo,
}) => {
  return (
    <>
      {/* 영상 비율 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>영상 비율</label>
        <div className={styles.qualitySelector}>
          <button
            className={`${styles.qualityBtn} ${videoAspectRatio === '16:9' ? styles.active : ''}`}
            onClick={() => onVideoAspectRatioChange('16:9')}
            disabled={isLoading}
          >
            16:9
          </button>
          <button
            className={`${styles.qualityBtn} ${videoAspectRatio === '9:16' ? styles.active : ''}`}
            onClick={() => onVideoAspectRatioChange('9:16')}
            disabled={isLoading}
          >
            9:16
          </button>
        </div>
      </div>

      {/* 영상 길이 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>영상 길이</label>
        <div className={styles.qualitySelector}>
          <button
            className={`${styles.qualityBtn} ${videoDuration === '4' ? styles.active : ''}`}
            onClick={() => onVideoDurationChange('4')}
            disabled={isLoading}
          >
            4초
          </button>
          <button
            className={`${styles.qualityBtn} ${videoDuration === '6' ? styles.active : ''}`}
            onClick={() => onVideoDurationChange('6')}
            disabled={isLoading}
          >
            6초
          </button>
          <button
            className={`${styles.qualityBtn} ${videoDuration === '8' ? styles.active : ''}`}
            onClick={() => onVideoDurationChange('8')}
            disabled={isLoading}
          >
            8초
          </button>
        </div>
      </div>

      {/* 해상도 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>해상도</label>
        <div className={styles.qualitySelector}>
          <button
            className={`${styles.qualityBtn} ${videoResolution === '720p' ? styles.active : ''}`}
            onClick={() => onVideoResolutionChange('720p')}
            disabled={isLoading}
          >
            720p
          </button>
          <button
            className={`${styles.qualityBtn} ${videoResolution === '1080p' ? styles.active : ''}`}
            onClick={() => onVideoResolutionChange('1080p')}
            disabled={isLoading}
          >
            1080p
          </button>
        </div>
        <p className={styles.hint}>1080p는 처리 시간이 더 걸립니다.</p>
      </div>

      {/* 오디오 생성 */}
      <div className={styles.settingGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={videoGenerateAudio}
            onChange={(e) => onVideoGenerateAudioChange(e.target.checked)}
            disabled={isLoading}
          />
          <span>오디오 자동 생성</span>
        </label>
        <p className={styles.hint}>환경음과 대화를 AI가 생성합니다.</p>
      </div>

      {/* 영상 생성 버튼 */}
      <button
        className={styles.generateBtn}
        onClick={onGenerateVideo}
        disabled={isLoading || !videoPrompt.trim()}
      >
        {isLoading ? '영상 생성 중...' : '영상 만들기'}
      </button>

      <p className={styles.hint}>
        처리 시간: 약 1~6분 소요
      </p>

      {/* 생성된 영상 결과 */}
      {generatedVideo && (
        <div className={styles.settingGroup}>
          <label className={styles.label}>생성된 영상</label>
          <video
            src={generatedVideo}
            controls
            autoPlay
            loop
            className={styles.generatedVideo}
          />
          <a
            href={generatedVideo}
            download={`video-${Date.now()}.mp4`}
            className={styles.downloadBtn}
          >
            영상 다운로드
          </a>
        </div>
      )}
    </>
  );
};

/**
 * VideoToWebP 컴포넌트
 * ffmpeg.wasm을 사용한 영상→애니메이션 WebP 변환
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadIcon, CloseIcon, DownloadIcon } from '../../../../components/common/Icons';
import styles from './VideoToWebP.module.css';

// ffmpeg.wasm 동적 import
let FFmpeg: any = null;
let fetchFile: any = null;

interface VideoToWebPProps {
  // 처리 상태
  isLoading?: boolean;
}

type QualityOption = 'low' | 'medium' | 'high';

interface ConversionProgress {
  percent: number;
  status: string;
}

export const VideoToWebP: React.FC<VideoToWebPProps> = () => {
  // 상태
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [resultWebP, setResultWebP] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress>({ percent: 0, status: '' });
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualityOption>('medium');
  const [fps, setFps] = useState<number>(15);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<any>(null);

  // ffmpeg 로드 (lazy loading)
  const loadFFmpeg = useCallback(async () => {
    if (ffmpegLoaded || isLoadingFfmpeg) return;

    setIsLoadingFfmpeg(true);
    setProgress({ percent: 0, status: 'ffmpeg 로딩 중...' });

    try {
      // 동적 import
      const ffmpegModule = await import('@ffmpeg/ffmpeg');
      const utilModule = await import('@ffmpeg/util');

      FFmpeg = ffmpegModule.FFmpeg;
      fetchFile = utilModule.fetchFile;

      const ffmpeg = new FFmpeg();

      // 진행 상황 로깅
      ffmpeg.on('log', ({ message }: { message: string }) => {
        console.log('[FFmpeg]', message);
      });

      ffmpeg.on('progress', ({ progress: p }: { progress: number }) => {
        setProgress(prev => ({
          ...prev,
          percent: Math.round(p * 100)
        }));
      });

      // Core 로드 (jsdelivr CDN 사용)
      await ffmpeg.load({
        coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
      });

      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
      setProgress({ percent: 0, status: '' });
    } catch (err) {
      console.error('FFmpeg 로드 실패:', err);
      setError('FFmpeg 로드에 실패했습니다. 페이지를 새로고침해주세요.');
    } finally {
      setIsLoadingFfmpeg(false);
    }
  }, [ffmpegLoaded, isLoadingFfmpeg]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((file: File) => {
    // 비디오 파일 체크
    if (!file.type.startsWith('video/')) {
      setError('비디오 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 체크 (100MB 제한)
    if (file.size > 100 * 1024 * 1024) {
      setError('파일 크기는 100MB 이하만 가능합니다.');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setResultWebP(null);
    setError(null);
  }, []);

  // 드래그 이벤트 핸들러
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

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // 파일 인풋 변경 핸들러
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // 파일 제거
  const handleRemoveVideo = useCallback(() => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setResultWebP(null);
    setError(null);
    setProgress({ percent: 0, status: '' });
  }, [videoPreview]);

  // 변환 실행
  const handleConvert = useCallback(async () => {
    if (!videoFile) return;

    // ffmpeg 먼저 로드
    if (!ffmpegLoaded) {
      await loadFFmpeg();
    }

    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) {
      setError('FFmpeg가 로드되지 않았습니다.');
      return;
    }

    setIsConverting(true);
    setError(null);
    setProgress({ percent: 0, status: '변환 준비 중...' });

    try {
      // 품질별 설정
      const qualitySettings = {
        low: { scale: 320, quality: 50, lossless: 0 },
        medium: { scale: 480, quality: 75, lossless: 0 },
        high: { scale: 640, quality: 90, lossless: 0 },
      };

      const settings = qualitySettings[quality];

      setProgress({ percent: 10, status: '파일 읽는 중...' });

      // 입력 파일 쓰기
      const inputData = await fetchFile(videoFile);
      await ffmpeg.writeFile('input.mp4', inputData);

      setProgress({ percent: 30, status: '변환 중...' });

      // WebP로 변환
      // -vf: 비디오 필터 (스케일, fps)
      // -loop: 무한 반복
      // -quality: WebP 품질 (0-100)
      // -lossless: 무손실 여부 (0=손실)
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `scale=${settings.scale}:-1,fps=${fps}`,
        '-loop', '0',
        '-quality', settings.quality.toString(),
        '-lossless', settings.lossless.toString(),
        '-y',
        'output.webp'
      ]);

      setProgress({ percent: 90, status: '결과 저장 중...' });

      // 결과 읽기
      const outputData = await ffmpeg.readFile('output.webp');
      const blob = new Blob([outputData], { type: 'image/webp' });
      const url = URL.createObjectURL(blob);

      setResultWebP(url);
      setProgress({ percent: 100, status: '완료!' });
    } catch (err) {
      console.error('변환 실패:', err);
      setError('변환에 실패했습니다. 다른 영상을 시도해주세요.');
    } finally {
      setIsConverting(false);
    }
  }, [videoFile, ffmpegLoaded, loadFFmpeg, quality, fps]);

  // 다운로드
  const handleDownload = useCallback(() => {
    if (!resultWebP || !videoFile) return;

    const link = document.createElement('a');
    link.href = resultWebP;
    link.download = `${videoFile.name.replace(/\.[^/.]+$/, '')}_animated.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [resultWebP, videoFile]);

  // 컴포넌트 언마운트 시 URL 정리
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (resultWebP) URL.revokeObjectURL(resultWebP);
    };
  }, [videoPreview, resultWebP]);

  return (
    <>
      {/* 영상 업로드 영역 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>
          영상 업로드
          <span className={styles.required}>*</span>
        </label>
        <div
          className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''} ${videoFile ? styles.hasFile : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !videoFile && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
          {videoFile ? (
            <div className={styles.uploadedPreview}>
              <video
                src={videoPreview || undefined}
                className={styles.previewVideo}
                controls
                muted
                loop
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveVideo();
                }}
              >
                <CloseIcon size={16} />
              </button>
              <span className={styles.fileName}>{videoFile.name}</span>
            </div>
          ) : (
            <div className={styles.uploadPlaceholder}>
              <div className={styles.uploadIconWrapper}>
                <UploadIcon size={32} />
              </div>
              <p className={styles.uploadText}>
                영상을 드래그하거나 클릭하여 업로드
              </p>
              <p className={styles.uploadHint}>MP4, MOV, AVI, WebM (최대 100MB)</p>
            </div>
          )}
        </div>
      </div>

      {/* 품질 선택 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>품질</label>
        <div className={styles.qualitySelector}>
          <button
            className={`${styles.qualityBtn} ${quality === 'low' ? styles.active : ''}`}
            onClick={() => setQuality('low')}
            disabled={isConverting}
          >
            낮음
          </button>
          <button
            className={`${styles.qualityBtn} ${quality === 'medium' ? styles.active : ''}`}
            onClick={() => setQuality('medium')}
            disabled={isConverting}
          >
            보통
          </button>
          <button
            className={`${styles.qualityBtn} ${quality === 'high' ? styles.active : ''}`}
            onClick={() => setQuality('high')}
            disabled={isConverting}
          >
            높음
          </button>
        </div>
        <p className={styles.hint}>높은 품질일수록 파일 크기가 커집니다.</p>
      </div>

      {/* FPS 선택 */}
      <div className={styles.settingGroup}>
        <label className={styles.label}>프레임 속도 (FPS)</label>
        <div className={styles.qualitySelector}>
          <button
            className={`${styles.qualityBtn} ${fps === 10 ? styles.active : ''}`}
            onClick={() => setFps(10)}
            disabled={isConverting}
          >
            10
          </button>
          <button
            className={`${styles.qualityBtn} ${fps === 15 ? styles.active : ''}`}
            onClick={() => setFps(15)}
            disabled={isConverting}
          >
            15
          </button>
          <button
            className={`${styles.qualityBtn} ${fps === 24 ? styles.active : ''}`}
            onClick={() => setFps(24)}
            disabled={isConverting}
          >
            24
          </button>
          <button
            className={`${styles.qualityBtn} ${fps === 30 ? styles.active : ''}`}
            onClick={() => setFps(30)}
            disabled={isConverting}
          >
            30
          </button>
        </div>
        <p className={styles.hint}>낮은 FPS는 파일 크기를 줄입니다.</p>
      </div>

      {/* 진행 상태 */}
      {(isConverting || isLoadingFfmpeg) && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className={styles.progressText}>{progress.status} ({progress.percent}%)</p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* 변환 버튼 */}
      <div className={styles.buttonGroup}>
        <button
          className={styles.generateBtn}
          onClick={handleConvert}
          disabled={isConverting || !videoFile}
        >
          {isConverting ? '변환 중...' : isLoadingFfmpeg ? 'ffmpeg 로딩 중...' : '변환하기'}
        </button>
        <p className={styles.hint}>
          브라우저에서 직접 변환됩니다. 서버에 업로드되지 않습니다.
        </p>
      </div>

      {/* 결과 미리보기 */}
      {resultWebP && (
        <div className={styles.resultContainer}>
          <label className={styles.label}>변환 결과</label>
          <div className={styles.resultPreview}>
            <img src={resultWebP} alt="Converted WebP" className={styles.resultImage} />
          </div>
          <button
            className={styles.downloadBtn}
            onClick={handleDownload}
          >
            <DownloadIcon size={16} />
            WebP 다운로드
          </button>
        </div>
      )}
    </>
  );
};

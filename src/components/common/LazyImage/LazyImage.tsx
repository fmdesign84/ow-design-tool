/**
 * LazyImage - Intersection Observer 기반 이미지 lazy loading
 * 화면에 보일 때만 이미지를 로드하여 초기 로드 성능 개선
 */

import React, { useRef, useState, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
  placeholderColor?: string;
  onClick?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = '',
  className = '',
  placeholderColor = '#1a1a1a',
  onClick,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // 100px 전에 미리 로드 시작
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      data-src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onLoad={() => setIsLoaded(true)}
      style={{
        backgroundColor: isLoaded ? 'transparent' : placeholderColor,
        transition: 'opacity 0.3s ease',
        opacity: isLoaded ? 1 : 0.5,
      }}
    />
  );
};

export default LazyImage;

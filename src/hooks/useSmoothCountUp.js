import { useState, useEffect, useRef } from 'react';

/**
 * useSmoothCountUp Hook
 * 0에서 목표값까지 부드럽게 올라가는 애니메이션
 * 전사목표관리 페이지용 (홈페이지의 슬롯머신 스타일과 다름)
 *
 * @param {number} target - 목표 숫자
 * @param {number} duration - 전체 애니메이션 시간 (ms)
 * @returns {number} 현재 카운트 값
 */
const useSmoothCountUp = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = null;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      setCount(Math.floor(target * easedProgress));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration]);

  return count;
};

export default useSmoothCountUp;

import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp Hook
 * 랜덤 숫자 4개 후 최종값으로 부드럽게 정착하는 애니메이션
 * isSettled로 투명도 제어 가능
 *
 * @param {number} target - 목표 숫자
 * @param {number} duration - 전체 애니메이션 시간 (ms)
 * @returns {{ count: number, isSettled: boolean }}
 */
const useCountUp = (target, duration = 250) => {
  const [count, setCount] = useState(0);
  const [isSettled, setIsSettled] = useState(false);
  const timeoutRefs = useRef([]);

  useEffect(() => {
    setIsSettled(false);

    // 이전 타이머들 정리
    timeoutRefs.current.forEach(t => clearTimeout(t));
    timeoutRefs.current = [];

    // 목표값과 다른 랜덤 숫자 생성
    const getRandomExcept = (exclude) => {
      let num;
      do {
        num = Math.floor(Math.random() * 10);
      } while (num === exclude);
      return num;
    };

    const random1 = getRandomExcept(target);
    const random2 = getRandomExcept(target);
    const random3 = getRandomExcept(target);
    const random4 = getRandomExcept(target);
    const random5 = getRandomExcept(target);
    const sequence = [random1, random2, random3, random4, random5, target];

    // 점점 느려지는 간격 (부드러운 감속)
    const intervals = [
      duration * 0.12,  // 빠르게
      duration * 0.14,
      duration * 0.17,
      duration * 0.20,
      duration * 0.22,  // 느려지며
      duration * 0.15   // 마지막
    ];

    setCount(sequence[0]);

    let elapsed = 0;
    for (let i = 1; i < sequence.length; i++) {
      elapsed += intervals[i - 1];
      const t = setTimeout(() => {
        setCount(sequence[i]);
        if (i === sequence.length - 1) {
          setIsSettled(true);
        }
      }, elapsed);
      timeoutRefs.current.push(t);
    }

    return () => {
      timeoutRefs.current.forEach(t => clearTimeout(t));
    };
  }, [target, duration]);

  return { count, isSettled };
};

export default useCountUp;

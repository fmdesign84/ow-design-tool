import { useState, useRef, useEffect } from 'react';

/**
 * Select 컴포넌트 공통 로직 훅
 * - 열기/닫기 상태 관리
 * - 외부 클릭 시 닫기
 * - 옵션 선택 처리
 */
const useSelect = (options = [], value, onChange) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  const selectedOption = options.find(opt => opt.value === value);

  return {
    isOpen,
    selectRef,
    selectedOption,
    toggle,
    close,
    handleSelect,
  };
};

export default useSelect;

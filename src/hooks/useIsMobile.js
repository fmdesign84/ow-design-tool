import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the viewport is mobile size (768px or below)
 * @returns {boolean} true if viewport width is <= 768px, false otherwise
 */
const useIsMobile = () => {
  // Initialize with false for SSR compatibility
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query matcher
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    // Handler function to update state
    const handleMediaQueryChange = (e) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Add event listener
    // Use addEventListener for better browser compatibility
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    // Cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;

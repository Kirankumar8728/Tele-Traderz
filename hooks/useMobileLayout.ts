import { useState, useEffect } from 'react';

export interface MobileLayoutInfo {
  isMobile: boolean;
  width: number;
  height: number;
  isLandscape: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const useMobileLayout = (): MobileLayoutInfo => {
  const [layout, setLayout] = useState<MobileLayoutInfo>({
    isMobile: typeof window !== 'undefined' ? (window.innerWidth < 1024 || (('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1280)) : false,
    width: typeof window !== 'undefined' ? window.innerWidth : 360,
    height: typeof window !== 'undefined' ? window.innerHeight : 640,
    isLandscape: typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const hasTouch = 'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
      // Treat screens under 1024px, or touch devices under 1280px as mobile/tablet layout
      const isMobile = width < 1024 || (hasTouch && width < 1280);
      const isLandscape = width > height;

      // Estimate safe area insets (web fallback)
      const top = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0', 10);
      const bottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0', 10);

      setLayout({
        isMobile,
        width,
        height,
        isLandscape,
        safeAreaInsets: {
          top: isNaN(top) ? 0 : top,
          bottom: isNaN(bottom) ? 0 : bottom,
          left: 0,
          right: 0,
        },
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return layout;
};

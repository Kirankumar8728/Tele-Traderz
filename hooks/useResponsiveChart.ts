import { useEffect, useRef, useCallback } from 'react';

export const useResponsiveChart = (chartInstance: any) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const resizeChart = useCallback(() => {
    if (chartInstance && typeof chartInstance.resize === 'function') {
      chartInstance.resize();
    }
  }, [chartInstance]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !chartInstance) return;

    // Trigger immediate resize
    const timer = setTimeout(resizeChart, 50);

    // Create ResizeObserver to monitor container dimensions
    const observer = new ResizeObserver(() => {
      // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded" warning
      requestAnimationFrame(() => {
        resizeChart();
      });
    });

    observer.observe(container);
    resizeObserverRef.current = observer;

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [chartInstance, resizeChart]);

  return containerRef;
};

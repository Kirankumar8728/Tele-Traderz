// useToolbar.ts
import { useState, useEffect } from 'react';
import { ChartUIService, ChartUIConfig, ScaleType } from '../services/ChartUIService';

export const useToolbar = () => {
  const [config, setConfig] = useState<ChartUIConfig>({
    magnetMode: false,
    scaleType: 'auto',
    showGrid: true,
    theme: 'dark'
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const service = ChartUIService.getInstance();

    const handleConfigChange = (currentConfig: ChartUIConfig) => {
      setConfig(currentConfig);
    };

    service.registerListener(handleConfigChange);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      service.unregisterListener(handleConfigChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleMagnetMode = () => {
    ChartUIService.getInstance().toggleMagnetMode();
  };

  const setScaleType = (type: ScaleType) => {
    ChartUIService.getInstance().setScaleType(type);
  };

  const toggleGrid = () => {
    ChartUIService.getInstance().toggleGrid();
  };

  const toggleTheme = () => {
    ChartUIService.getInstance().toggleTheme();
  };

  const fitContent = () => {
    ChartUIService.getInstance().fitContent();
  };

  const zoomIn = () => {
    ChartUIService.getInstance().zoomIn();
  };

  const zoomOut = () => {
    ChartUIService.getInstance().zoomOut();
  };

  const toggleFullscreen = (element: HTMLElement | null) => {
    if (!element) return;
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const takeScreenshot = (container: HTMLDivElement | null) => {
    ChartUIService.getInstance().takeScreenshot(container);
  };

  return {
    ...config,
    isFullscreen,
    toggleMagnetMode,
    setScaleType,
    toggleGrid,
    toggleTheme,
    fitContent,
    zoomIn,
    zoomOut,
    toggleFullscreen,
    takeScreenshot,
  };
};

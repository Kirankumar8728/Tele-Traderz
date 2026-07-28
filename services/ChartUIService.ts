// ChartUIService.ts
import { Chart } from 'klinecharts';

export type ScaleType = 'auto' | 'log' | 'percentage' | 'invert';

export interface ChartUIConfig {
  magnetMode: boolean;
  scaleType: ScaleType;
  showGrid: boolean;
  theme: 'light' | 'dark';
}

export class ChartUIService {
  private static instance: ChartUIService | null = null;
  private config: ChartUIConfig = {
    magnetMode: false,
    scaleType: 'auto',
    showGrid: true,
    theme: 'dark',
  };
  private chart: Chart | null = null;
  private listeners: Set<(config: ChartUIConfig) => void> = new Set();

  private constructor() {
    try {
      const saved = localStorage.getItem('bynex_chart_ui_config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load chart UI config:', e);
    }
  }

  public static getInstance(): ChartUIService {
    if (!ChartUIService.instance) {
      ChartUIService.instance = new ChartUIService();
    }
    return ChartUIService.instance;
  }

  public setChart(chart: Chart) {
    this.chart = chart;
    this.applyConfig();
  }

  public registerListener(listener: (config: ChartUIConfig) => void) {
    this.listeners.add(listener);
    listener({ ...this.config });
  }

  public unregisterListener(listener: (config: ChartUIConfig) => void) {
    this.listeners.delete(listener);
  }

  private notify() {
    try {
      localStorage.setItem('bynex_chart_ui_config', JSON.stringify(this.config));
    } catch (e) {
      console.error(e);
    }
    this.listeners.forEach(l => l({ ...this.config }));
  }

  public getConfig(): ChartUIConfig {
    return this.config;
  }

  public toggleMagnetMode() {
    this.config.magnetMode = !this.config.magnetMode;
    this.applyConfig();
    this.notify();
  }

  public setScaleType(type: ScaleType) {
    this.config.scaleType = type;
    this.applyConfig();
    this.notify();
  }

  public toggleGrid() {
    this.config.showGrid = !this.config.showGrid;
    this.applyConfig();
    this.notify();
  }

  public toggleTheme() {
    this.config.theme = this.config.theme === 'dark' ? 'light' : 'dark';
    this.applyConfig();
    this.notify();
  }

  public fitContent() {
    if (this.chart) {
      // @ts-ignore
      this.chart.setOffset(0);
    }
  }

  public zoomIn() {
    if (this.chart) {
      // @ts-ignore
      this.chart.zoom(1.1);
    }
  }

  public zoomOut() {
    if (this.chart) {
      // @ts-ignore
      this.chart.zoom(0.9);
    }
  }

  public takeScreenshot(containerElement: HTMLDivElement | null) {
    if (!containerElement) return;
    try {
      // Render screenshot or export as image
      // KLineChart's getConvertPictureUrl is the standard method for screenshots:
      if (this.chart) {
        // @ts-ignore
        const url = this.chart.getConvertPictureUrl('png', '#0b0e14');
        const link = document.createElement('a');
        link.download = `bynex_trader_chart_${Date.now()}.png`;
        link.href = url;
        link.click();
      }
    } catch (e) {
      console.error('Failed to take screenshot:', e);
    }
  }

  private applyConfig() {
    if (!this.chart) return;

    // Apply grid visibility
    this.chart.setStyles({
      grid: {
        show: this.config.showGrid,
      }
    });

    // Apply scale styles based on scaleType
    const styles: any = {};
    if (this.config.scaleType === 'log') {
      styles.yAxis = { type: 'log' };
    } else if (this.config.scaleType === 'percentage') {
      styles.yAxis = { type: 'percentage' };
    } else {
      styles.yAxis = { type: 'normal' };
    }

    if (this.config.scaleType === 'invert') {
      styles.yAxis = { ...styles.yAxis, reverse: true };
    } else {
      styles.yAxis = { ...styles.yAxis, reverse: false };
    }

    this.chart.setStyles(styles);
  }
}

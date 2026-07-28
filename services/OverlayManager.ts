// OverlayManager.ts
import { Chart } from 'klinecharts';

export interface OverlayConfig {
  id: string;
  name: string;
  label: string;
  enabled: boolean;
  color?: string;
}

export class OverlayManager {
  private static instance: OverlayManager | null = null;
  private overlays: OverlayConfig[] = [
    { id: 'watermark', name: 'Watermark', label: 'Watermark', enabled: true },
    { id: 'symbolLabel', name: 'Symbol Label', label: 'Symbol Label', enabled: true },
    { id: 'currentPrice', name: 'Current Price', label: 'Current Price Line', enabled: true },
    { id: 'bidLine', name: 'Bid Line', label: 'Bid Price Line', enabled: false, color: '#22c55e' },
    { id: 'askLine', name: 'Ask Line', label: 'Ask Price Line', enabled: false, color: '#ef4444' },
    { id: 'spread', name: 'Spread', label: 'Spread Display', enabled: false },
    { id: 'sessionHighLow', name: 'Session High Low', label: 'Session High / Low', enabled: false, color: '#eab308' },
    { id: 'openPrice', name: 'Open Price', label: 'Open Price Line', enabled: false, color: '#3b82f6' },
    { id: 'prevClose', name: 'Previous Close', label: 'Previous Close Line', enabled: false, color: '#6b7280' },
  ];
  private chart: Chart | null = null;
  private listeners: Set<(overlays: OverlayConfig[]) => void> = new Set();

  private constructor() {
    try {
      const saved = localStorage.getItem('bynex_overlays_config');
      if (saved) {
        const loaded = JSON.parse(saved);
        this.overlays = this.overlays.map(o => {
          const match = loaded.find((l: any) => l.id === o.id);
          return match ? { ...o, enabled: match.enabled } : o;
        });
      }
    } catch (e) {
      console.error('Failed to load overlay configs:', e);
    }
  }

  public static getInstance(): OverlayManager {
    if (!OverlayManager.instance) {
      OverlayManager.instance = new OverlayManager();
    }
    return OverlayManager.instance;
  }

  public setChart(chart: Chart) {
    this.chart = chart;
    this.syncToChart();
  }

  public registerListener(listener: (overlays: OverlayConfig[]) => void) {
    this.listeners.add(listener);
    listener([...this.overlays]);
  }

  public unregisterListener(listener: (overlays: OverlayConfig[]) => void) {
    this.listeners.delete(listener);
  }

  private notify() {
    try {
      localStorage.setItem('bynex_overlays_config', JSON.stringify(this.overlays));
    } catch (e) {
      console.error(e);
    }
    this.listeners.forEach(l => l([...this.overlays]));
  }

  public getOverlays(): OverlayConfig[] {
    return this.overlays;
  }

  public toggleOverlay(id: string) {
    this.overlays = this.overlays.map(o => {
      if (o.id === id) {
        const nextEnabled = !o.enabled;
        return { ...o, enabled: nextEnabled };
      }
      return o;
    });
    this.syncToChart();
    this.notify();
  }

  private syncToChart() {
    if (!this.chart) return;
    
    // Apply styling changes directly on KLineChart based on overlay toggles
    this.overlays.forEach(overlay => {
      if (overlay.id === 'watermark') {
        // Toggle watermark styles
        this.chart?.setStyles({
          // @ts-ignore
          watermark: {
            show: overlay.enabled,
          }
        });
      }
      
      if (overlay.id === 'currentPrice') {
        this.chart?.setStyles({
          candle: {
            priceMark: {
              last: {
                show: overlay.enabled
              }
            }
          }
        });
      }

      // Other indicators or lines can be implemented or managed here as chart overlays
    });
  }
}

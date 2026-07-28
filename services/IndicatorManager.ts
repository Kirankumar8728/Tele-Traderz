// IndicatorManager.ts
import { Chart } from 'klinecharts';

export interface IndicatorMeta {
  type: string;
  name: string;
  category: 'Trend' | 'Momentum' | 'Volume' | 'Volatility' | 'Oscillators' | 'Custom';
  description?: string;
  isMain: boolean; // Main candle panel or sub-panel
}

export interface ActiveIndicator {
  id: string;
  type: string;
  name: string;
  visible: boolean;
  paneId: string;
  params?: any;
}

export const INDICATOR_METAS: IndicatorMeta[] = [
  // Trend
  { type: 'MA', name: 'Moving Average', category: 'Trend', isMain: true },
  { type: 'EMA', name: 'Exponential Moving Average', category: 'Trend', isMain: true },
  { type: 'SMA', name: 'Simple Moving Average', category: 'Trend', isMain: true },
  { type: 'BOLL', name: 'Bollinger Bands', category: 'Trend', isMain: true },
  { type: 'SAR', name: 'Parabolic SAR', category: 'Trend', isMain: true },
  { type: 'BBI', name: 'Bull and Bear Index', category: 'Trend', isMain: true },
  
  // Oscillators & Momentum
  { type: 'MACD', name: 'MACD', category: 'Oscillators', isMain: false },
  { type: 'RSI', name: 'Relative Strength Index', category: 'Oscillators', isMain: false },
  { type: 'KDJ', name: 'KDJ Oscillator', category: 'Oscillators', isMain: false },
  { type: 'WR', name: 'Williams %R', category: 'Oscillators', isMain: false },
  { type: 'CCI', name: 'Commodity Channel Index', category: 'Oscillators', isMain: false },
  { type: 'TRIX', name: 'Triple Exponential Average', category: 'Oscillators', isMain: false },
  { type: 'DMA', name: 'Different of Moving Average', category: 'Oscillators', isMain: false },
  { type: 'DMI', name: 'Directional Movement Index', category: 'Oscillators', isMain: false },
  { type: 'PSY', name: 'Psychological Line', category: 'Oscillators', isMain: false },
  { type: 'BIAS', name: 'Bias Ratio', category: 'Oscillators', isMain: false },
  { type: 'ROC', name: 'Rate of Change', category: 'Oscillators', isMain: false },
  { type: 'MTM', name: 'Momentum', category: 'Oscillators', isMain: false },
  { type: 'CR', name: 'Energy Index', category: 'Oscillators', isMain: false },
  { type: 'EMV', name: 'Ease of Movement', category: 'Oscillators', isMain: false },

  // Volume
  { type: 'VOL', name: 'Volume', category: 'Volume', isMain: false },
  { type: 'OBV', name: 'On Balance Volume', category: 'Volume', isMain: false },
  { type: 'VR', name: 'Volume Ratio', category: 'Volume', isMain: false },

  // Volatility
  { type: 'ATR', name: 'Average True Range', category: 'Volatility', isMain: false },
];

export class IndicatorManager {
  private static instance: IndicatorManager | null = null;
  private activeIndicators: ActiveIndicator[] = [];
  private favorites: string[] = [];
  private recentlyUsed: string[] = [];
  private chart: Chart | null = null;
  private listeners: Set<(indicators: ActiveIndicator[]) => void> = new Set();
  private metaListeners: Set<() => void> = new Set();

  private constructor() {
    try {
      const savedFavs = localStorage.getItem('bynex_indicator_favs');
      if (savedFavs) this.favorites = JSON.parse(savedFavs);

      const savedRecent = localStorage.getItem('bynex_indicator_recent');
      if (savedRecent) this.recentlyUsed = JSON.parse(savedRecent);

      // Reset and remove active indicators as requested by the user
      this.activeIndicators = [];
      localStorage.removeItem('bynex_indicators_active');
    } catch (e) {
      console.error('Failed to load indicator settings:', e);
    }
  }

  public static getInstance(): IndicatorManager {
    if (!IndicatorManager.instance) {
      IndicatorManager.instance = new IndicatorManager();
    }
    return IndicatorManager.instance;
  }

  public setChart(chart: Chart) {
    this.chart = chart;
    this.syncToChart();
  }

  public registerListener(listener: (indicators: ActiveIndicator[]) => void) {
    this.listeners.add(listener);
    listener([...this.activeIndicators]);
  }

  public unregisterListener(listener: (indicators: ActiveIndicator[]) => void) {
    this.listeners.delete(listener);
  }

  public registerMetaListener(listener: () => void) {
    this.metaListeners.add(listener);
  }

  public unregisterMetaListener(listener: () => void) {
    this.metaListeners.delete(listener);
  }

  private notify() {
    try {
      localStorage.setItem('bynex_indicators_active', JSON.stringify(this.activeIndicators));
    } catch (e) {
      console.error(e);
    }
    this.listeners.forEach(l => l([...this.activeIndicators]));
  }

  private notifyMeta() {
    try {
      localStorage.setItem('bynex_indicator_favs', JSON.stringify(this.favorites));
      localStorage.setItem('bynex_indicator_recent', JSON.stringify(this.recentlyUsed));
    } catch (e) {
      console.error(e);
    }
    this.metaListeners.forEach(l => l());
  }

  public getActiveIndicators(): ActiveIndicator[] {
    return this.activeIndicators;
  }

  public getFavorites(): string[] {
    return this.favorites;
  }

  public getRecentlyUsed(): string[] {
    return this.recentlyUsed;
  }

  public toggleFavorite(type: string) {
    if (this.favorites.includes(type)) {
      this.favorites = this.favorites.filter(f => f !== type);
    } else {
      this.favorites.push(type);
    }
    this.notifyMeta();
  }

  public addIndicator(type: string): string | null {
    if (!this.chart) return null;

    const meta = INDICATOR_METAS.find(m => m.type === type);
    if (!meta) return null;

    // Track recently used
    this.recentlyUsed = [type, ...this.recentlyUsed.filter(r => r !== type)].slice(0, 5);
    this.notifyMeta();

    const paneId = meta.isMain 
      ? 'candle_pane' 
      : (type === 'VOL' ? 'vol_pane' : `pane_${Math.random().toString(36).substr(2, 9)}`);

    try {
      const id = this.chart.createIndicator(type, meta.isMain, { id: paneId });
      if (id) {
        const uniqueId = `${type}_${Math.random().toString(36).substr(2, 9)}`;
        const active: ActiveIndicator = {
          id: uniqueId,
          type,
          name: meta.name,
          visible: true,
          paneId: id as string,
        };
        this.activeIndicators.push(active);
        this.notify();
        return uniqueId;
      }
    } catch (e) {
      console.error(`Failed to create indicator ${type}:`, e);
    }
    return null;
  }

  public removeIndicator(id: string) {
    const active = this.activeIndicators.find(i => i.id === id);
    if (active) {
      if (this.chart) {
        try {
          this.chart.removeIndicator(active.paneId, active.type);
        } catch (e) {
          console.error(e);
        }
      }
      this.activeIndicators = this.activeIndicators.filter(i => i.id !== id);
      this.syncToChart();
    }
  }

  public toggleVisibility(id: string) {
    this.activeIndicators = this.activeIndicators.map(ind => {
      if (ind.id === id) {
        return { ...ind, visible: !ind.visible };
      }
      return ind;
    });
    this.syncToChart();
  }

  public hideAll() {
    this.activeIndicators = this.activeIndicators.map(ind => ({ ...ind, visible: false }));
    this.syncToChart();
  }

  public showAll() {
    this.activeIndicators = this.activeIndicators.map(ind => ({ ...ind, visible: true }));
    this.syncToChart();
  }

  public setIndicatorParams(id: string, params: any) {
    this.activeIndicators = this.activeIndicators.map(ind => {
      if (ind.id === id) {
        return { ...ind, params };
      }
      return ind;
    });
    this.syncToChart();
  }

  public clearAll() {
    if (this.chart) {
      this.activeIndicators.forEach(ind => {
        try {
          this.chart?.removeIndicator(ind.paneId, ind.type);
        } catch (e) {
          console.error(e);
        }
      });
    }
    this.activeIndicators = [];
    this.notify();
  }

  private syncToChart() {
    if (!this.chart) return;
    const temp = [...this.activeIndicators];
    this.activeIndicators = []; // Clear local so sync can rebuild properly
    temp.forEach(ind => {
      // Clean previous indicator on chart first to prevent overlays or drawing bugs
      if (this.chart) {
        try {
          this.chart.removeIndicator(ind.paneId, ind.type);
        } catch (e) {
          // Safe ignore if not added yet
        }
      }

      // Re-create the indicator if it is visible
      if (ind.visible !== false) {
        const meta = INDICATOR_METAS.find(m => m.type === ind.type);
        if (meta && this.chart) {
          try {
            const id = this.chart.createIndicator(ind.type, meta.isMain, { id: ind.paneId });
            if (id) {
              const updatedInd = {
                ...ind,
                id: ind.id,
                paneId: id as string,
              };
              this.activeIndicators.push(updatedInd);

              if (ind.params) {
                this.chart.overrideIndicator({
                  name: ind.type,
                  calcParams: ind.params,
                }, id as string);
              }
            }
          } catch (e) {
            console.error(`Failed to recreate indicator ${ind.type} on chart sync:`, e);
          }
        }
      } else {
        // Just push to active list so state stays in sync
        this.activeIndicators.push(ind);
      }
    });
    this.notify();
  }
}

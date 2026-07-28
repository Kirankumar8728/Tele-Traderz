// TemplateManager.ts

export interface ChartTemplate {
  id: string;
  name: string;
  indicators: any[];
  chartType: string;
  styles: any;
}

export class TemplateManager {
  private static instance: TemplateManager | null = null;
  private templates: ChartTemplate[] = [
    {
      id: 'default',
      name: 'Standard Trading',
      indicators: ['MA', 'VOL'],
      chartType: 'candle_solid',
      styles: {}
    },
    {
      id: 'scalping',
      name: 'Scalping',
      indicators: ['EMA', 'RSI', 'VOL'],
      chartType: 'candle_solid',
      styles: {}
    },
    {
      id: 'swing',
      name: 'Swing Trading',
      indicators: ['EMA', 'MACD'],
      chartType: 'candle_solid',
      styles: {}
    },
    {
      id: 'trend_following',
      name: 'Trend Following',
      indicators: ['EMA', 'ATR'],
      chartType: 'candle_solid',
      styles: {}
    },
    {
      id: 'breakout',
      name: 'Breakout',
      indicators: ['BOLL', 'ATR', 'VOL'],
      chartType: 'candle_solid',
      styles: {}
    },
    {
      id: 'momentum',
      name: 'Momentum',
      indicators: ['RSI', 'MACD', 'KDJ'],
      chartType: 'candle_solid',
      styles: {}
    },
    {
      id: 'mean_reversion',
      name: 'Mean Reversion',
      indicators: ['BOLL', 'RSI', 'CCI'],
      chartType: 'candle_solid',
      styles: {}
    },
    {
      id: 'volatility',
      name: 'Volatility',
      indicators: ['ATR', 'BOLL'],
      chartType: 'candle_solid',
      styles: {}
    },
    {
      id: 'synthetic_indices',
      name: 'Synthetic Indices',
      indicators: ['EMA', 'RSI', 'ATR', 'MACD'],
      chartType: 'candle_solid',
      styles: {}
    },
    {
      id: 'beginner',
      name: 'Beginner',
      indicators: ['EMA', 'VOL'],
      chartType: 'candle_solid',
      styles: {}
    },
    {
      id: 'advanced',
      name: 'Advanced',
      indicators: ['EMA', 'MACD', 'ATR', 'RSI', 'VOL', 'OBV'],
      chartType: 'candle_solid',
      styles: {}
    }
  ];
  private listeners: Set<(templates: ChartTemplate[]) => void> = new Set();

  private constructor() {
    try {
      const saved = localStorage.getItem('bynex_templates');
      if (saved) {
        this.templates = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load templates:', e);
    }
  }

  public static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }

  public registerListener(listener: (templates: ChartTemplate[]) => void) {
    this.listeners.add(listener);
    listener([...this.templates]);
  }

  public unregisterListener(listener: (templates: ChartTemplate[]) => void) {
    this.listeners.delete(listener);
  }

  private notify() {
    try {
      localStorage.setItem('bynex_templates', JSON.stringify(this.templates));
    } catch (e) {
      console.error(e);
    }
    this.listeners.forEach(l => l([...this.templates]));
  }

  public getTemplates(): ChartTemplate[] {
    return this.templates;
  }

  public saveTemplate(name: string, indicators: any[], chartType: string, styles: any) {
    const newTemplate: ChartTemplate = {
      id: `tpl_${Date.now()}`,
      name,
      indicators,
      chartType,
      styles
    };
    this.templates.push(newTemplate);
    this.notify();
  }

  public deleteTemplate(id: string) {
    this.templates = this.templates.filter(t => t.id !== id);
    this.notify();
  }
}

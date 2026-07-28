// LayoutManager.ts

export interface DockPanel {
  id: string;
  label: string;
  visible: boolean;
  collapsed: boolean;
  height: number; // in pixels
}

export class LayoutManager {
  private static instance: LayoutManager | null = null;
  private panels: DockPanel[] = [
    { id: 'open_positions', label: 'Open Positions', visible: true, collapsed: false, height: 180 },
    { id: 'trade_history', label: 'Trade History', visible: true, collapsed: true, height: 180 },
    { id: 'order_history', label: 'Order History', visible: false, collapsed: true, height: 180 },
    { id: 'vol', label: 'Volume Oscillator', visible: false, collapsed: false, height: 140 },
    { id: 'macd', label: 'MACD Panel', visible: false, collapsed: false, height: 140 },
    { id: 'rsi', label: 'RSI Panel', visible: false, collapsed: false, height: 140 },
    { id: 'atr', label: 'ATR Panel', visible: false, collapsed: false, height: 140 },
  ];
  private listeners: Set<(panels: DockPanel[]) => void> = new Set();

  private constructor() {
    try {
      const saved = localStorage.getItem('bynex_layout_panels');
      if (saved) {
        const loaded = JSON.parse(saved);
        this.panels = this.panels.map(p => {
          const match = loaded.find((l: any) => l.id === p.id);
          return match ? { ...p, visible: match.visible, collapsed: match.collapsed, height: match.height } : p;
        });
      }
    } catch (e) {
      console.error('Failed to load layout panels:', e);
    }
  }

  public static getInstance(): LayoutManager {
    if (!LayoutManager.instance) {
      LayoutManager.instance = new LayoutManager();
    }
    return LayoutManager.instance;
  }

  public registerListener(listener: (panels: DockPanel[]) => void) {
    this.listeners.add(listener);
    listener([...this.panels]);
  }

  public unregisterListener(listener: (panels: DockPanel[]) => void) {
    this.listeners.delete(listener);
  }

  private notify() {
    try {
      localStorage.setItem('bynex_layout_panels', JSON.stringify(this.panels));
    } catch (e) {
      console.error(e);
    }
    this.listeners.forEach(l => l([...this.panels]));
  }

  public getPanels(): DockPanel[] {
    return this.panels;
  }

  public togglePanelVisibility(id: string) {
    this.panels = this.panels.map(p => {
      if (p.id === id) {
        return { ...p, visible: !p.visible, collapsed: false }; // Expand if toggled visible
      }
      return p;
    });
    this.notify();
  }

  public togglePanelCollapse(id: string) {
    this.panels = this.panels.map(p => {
      if (p.id === id) {
        return { ...p, collapsed: !p.collapsed };
      }
      return p;
    });
    this.notify();
  }

  public setPanelHeight(id: string, height: number) {
    this.panels = this.panels.map(p => {
      if (p.id === id) {
        return { ...p, height: Math.max(80, Math.min(600, height)) };
      }
      return p;
    });
    this.notify();
  }

  public closePanel(id: string) {
    this.panels = this.panels.map(p => {
      if (p.id === id) {
        return { ...p, visible: false };
      }
      return p;
    });
    this.notify();
  }
}

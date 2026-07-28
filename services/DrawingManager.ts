// DrawingManager.ts
import { Chart } from 'klinecharts';

export interface Drawing {
  id: string;
  type: string;
  label: string;
  locked: boolean;
  visible: boolean;
  styles?: any;
  points?: any[];
}

export class DrawingManager {
  private static instance: DrawingManager | null = null;
  private drawings: Drawing[] = [];
  private selectedDrawingId: string | null = null;
  private clipboard: Drawing | null = null;
  private undoStack: Drawing[][] = [];
  private redoStack: Drawing[][] = [];
  private chart: Chart | null = null;
  private listeners: Set<(drawings: Drawing[]) => void> = new Set();

  private constructor() {
    // Load from local storage if available
    try {
      const saved = localStorage.getItem('bynex_drawings');
      if (saved) {
        this.drawings = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load drawings:', e);
    }
  }

  public static getInstance(): DrawingManager {
    if (!DrawingManager.instance) {
      DrawingManager.instance = new DrawingManager();
    }
    return DrawingManager.instance;
  }

  public setChart(chart: Chart) {
    this.chart = chart;
    this.syncToChart();
  }

  public registerListener(listener: (drawings: Drawing[]) => void) {
    this.listeners.add(listener);
    listener([...this.drawings]);
  }

  public unregisterListener(listener: (drawings: Drawing[]) => void) {
    this.listeners.delete(listener);
  }

  private notify() {
    // Save to local storage
    try {
      localStorage.setItem('bynex_drawings', JSON.stringify(this.drawings));
    } catch (e) {
      console.error('Failed to save drawings:', e);
    }
    this.listeners.forEach(l => l([...this.drawings]));
  }

  private saveState() {
    this.undoStack.push(JSON.parse(JSON.stringify(this.drawings)));
    this.redoStack = []; // Clear redo stack on new action
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  public undo() {
    if (this.undoStack.length === 0) return;
    const previous = this.undoStack.pop()!;
    this.redoStack.push(JSON.parse(JSON.stringify(this.drawings)));
    this.drawings = previous;
    this.syncToChart();
    this.notify();
  }

  public redo() {
    if (this.redoStack.length === 0) return;
    const next = this.redoStack.pop()!;
    this.undoStack.push(JSON.parse(JSON.stringify(this.drawings)));
    this.drawings = next;
    this.syncToChart();
    this.notify();
  }

  public getDrawings(): Drawing[] {
    return this.drawings;
  }

  public getSelectedDrawingId(): string | null {
    return this.selectedDrawingId;
  }

  public selectDrawing(id: string | null) {
    this.selectedDrawingId = id;
    this.notify();
  }

  public addDrawing(drawing: Omit<Drawing, 'id'>): Drawing {
    this.saveState();
    const newDrawing: Drawing = {
      ...drawing,
      id: `draw_${Math.random().toString(36).substr(2, 9)}`,
    };
    this.drawings.push(newDrawing);
    this.syncToChart();
    this.notify();
    return newDrawing;
  }

  public removeDrawing(id: string) {
    this.saveState();
    this.drawings = this.drawings.filter(d => d.id !== id);
    if (this.selectedDrawingId === id) {
      this.selectedDrawingId = null;
    }
    if (this.chart) {
      this.chart.removeOverlay(id);
    }
    this.notify();
  }

  public updateDrawing(id: string, updates: Partial<Drawing>) {
    this.saveState();
    this.drawings = this.drawings.map(d => {
      if (d.id === id) {
        const updated = { ...d, ...updates };
        if (this.chart) {
          this.chart.overrideOverlay({
            id: d.id,
            lock: updated.locked,
            visible: updated.visible,
            styles: updated.styles,
          });
        }
        return updated;
      }
      return d;
    });
    this.notify();
  }

  public toggleLock(id: string) {
    const drawing = this.drawings.find(d => d.id === id);
    if (drawing) {
      this.updateDrawing(id, { locked: !drawing.locked });
    }
  }

  public toggleVisibility(id: string) {
    const drawing = this.drawings.find(d => d.id === id);
    if (drawing) {
      this.updateDrawing(id, { visible: !drawing.visible });
    }
  }

  public duplicateDrawing(id: string) {
    const drawing = this.drawings.find(d => d.id === id);
    if (drawing) {
      const duplicated: Omit<Drawing, 'id'> = {
        ...JSON.parse(JSON.stringify(drawing)),
        label: `${drawing.label} (Copy)`,
      };
      // Shift points slightly so it doesn't overlap perfectly
      if (duplicated.points && duplicated.points.length > 0) {
        duplicated.points = duplicated.points.map(p => ({
          ...p,
          value: p.value ? p.value * 1.001 : undefined,
        }));
      }
      this.addDrawing(duplicated);
    }
  }

  public copy(id: string) {
    const drawing = this.drawings.find(d => d.id === id);
    if (drawing) {
      this.clipboard = JSON.parse(JSON.stringify(drawing));
    }
  }

  public paste() {
    if (!this.clipboard) return;
    const pasted: Omit<Drawing, 'id'> = {
      ...JSON.parse(JSON.stringify(this.clipboard)),
      label: `${this.clipboard.label} (Pasted)`,
    };
    if (pasted.points && pasted.points.length > 0) {
      pasted.points = pasted.points.map(p => ({
        ...p,
        value: p.value ? p.value * 1.002 : undefined,
      }));
    }
    this.addDrawing(pasted);
  }

  public clearAll() {
    this.saveState();
    if (this.chart) {
      this.drawings.forEach(d => this.chart?.removeOverlay(d.id));
    }
    this.drawings = [];
    this.selectedDrawingId = null;
    this.notify();
  }

  public lockAll() {
    this.saveState();
    this.drawings = this.drawings.map(d => {
      const updated = { ...d, locked: true };
      if (this.chart) {
        this.chart.overrideOverlay({ id: d.id, lock: true });
      }
      return updated;
    });
    this.notify();
  }

  public unlockAll() {
    this.saveState();
    this.drawings = this.drawings.map(d => {
      const updated = { ...d, locked: false };
      if (this.chart) {
        this.chart.overrideOverlay({ id: d.id, lock: false });
      }
      return updated;
    });
    this.notify();
  }

  public hideAll() {
    this.saveState();
    this.drawings = this.drawings.map(d => {
      const updated = { ...d, visible: false };
      if (this.chart) {
        this.chart.overrideOverlay({ id: d.id, visible: false });
      }
      return updated;
    });
    this.notify();
  }

  public showAll() {
    this.saveState();
    this.drawings = this.drawings.map(d => {
      const updated = { ...d, visible: true };
      if (this.chart) {
        this.chart.overrideOverlay({ id: d.id, visible: true });
      }
      return updated;
    });
    this.notify();
  }

  private syncToChart() {
    if (!this.chart) return;
    // First remove all existing drawings from chart to prevent duplicates or incorrect order rendering
    this.drawings.forEach(d => {
      try {
        this.chart?.removeOverlay(d.id);
      } catch (e) {}
    });
    // Re-create them in the current order
    this.drawings.forEach(d => {
      try {
        this.chart?.createOverlay({
          id: d.id,
          name: d.type,
          lock: d.locked,
          visible: d.visible,
          styles: d.styles,
          points: d.points,
        });
      } catch (e) {
        console.error(`Failed to load drawing ${d.id} on chart:`, e);
      }
    });
  }

  public moveUp(id: string) {
    this.saveState();
    const index = this.drawings.findIndex(d => d.id === id);
    if (index > 0) {
      const temp = this.drawings[index];
      this.drawings[index] = this.drawings[index - 1];
      this.drawings[index - 1] = temp;
      this.syncToChart();
      this.notify();
    }
  }

  public moveDown(id: string) {
    this.saveState();
    const index = this.drawings.findIndex(d => d.id === id);
    if (index >= 0 && index < this.drawings.length - 1) {
      const temp = this.drawings[index];
      this.drawings[index] = this.drawings[index + 1];
      this.drawings[index + 1] = temp;
      this.syncToChart();
      this.notify();
    }
  }
}

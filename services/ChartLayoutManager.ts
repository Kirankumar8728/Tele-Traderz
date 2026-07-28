export class ChartLayoutManager {
  private static instance: ChartLayoutManager;
  private subscribers: Set<() => void> = new Set();
  private chartHeightRatio: number = 0.65; // 65% of screen height by default

  private constructor() {}

  public static getInstance(): ChartLayoutManager {
    if (!ChartLayoutManager.instance) {
      ChartLayoutManager.instance = new ChartLayoutManager();
    }
    return ChartLayoutManager.instance;
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    this.subscribers.forEach((cb) => cb());
  }

  public getChartHeightRatio(): number {
    return this.chartHeightRatio;
  }

  public setChartHeightRatio(ratio: number) {
    this.chartHeightRatio = Math.max(0.4, Math.min(0.85, ratio));
    this.notify();
  }

  public minimizeChart() {
    this.chartHeightRatio = 0.45;
    this.notify();
  }

  public maximizeChart() {
    this.chartHeightRatio = 0.75;
    this.notify();
  }
}

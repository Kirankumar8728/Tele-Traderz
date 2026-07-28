export class MobileLayoutManager {
  private static instance: MobileLayoutManager;
  private subscribers: Set<() => void> = new Set();
  private activeSheet: string | null = null;
  private bottomNavHeight: number = 56;
  private tradingPanelExpanded: boolean = false;

  private constructor() {}

  public static getInstance(): MobileLayoutManager {
    if (!MobileLayoutManager.instance) {
      MobileLayoutManager.instance = new MobileLayoutManager();
    }
    return MobileLayoutManager.instance;
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    this.subscribers.forEach((cb) => cb());
  }

  public getActiveSheet(): string | null {
    return this.activeSheet;
  }

  public setActiveSheet(sheet: string | null) {
    this.activeSheet = sheet;
    this.notify();
  }

  public isTradingPanelExpanded(): boolean {
    return this.tradingPanelExpanded;
  }

  public setTradingPanelExpanded(expanded: boolean) {
    this.tradingPanelExpanded = expanded;
    this.notify();
  }

  public getBottomNavHeight(): number {
    return this.bottomNavHeight;
  }
}

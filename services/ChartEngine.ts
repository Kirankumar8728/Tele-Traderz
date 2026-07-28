// ChartEngine.ts
import { ChartConnectionManager } from './ChartConnectionManager';
import { HistoryLoader } from './HistoryLoader';
import { TickSubscriptionManager } from './TickSubscriptionManager';
import { ChartCache } from './ChartCache';
import { ChartStateMachine, ChartState } from './ChartStateMachine';
import { WebSocketManager } from './WebSocketManager';

export class ChartEngine {
  private static instance: ChartEngine | null = null;
  private currentSymbol: string = '';
  private currentTimeframe: string = '';

  private constructor() {
    // Listen to tick updates to verify active streaming state transitions
    TickSubscriptionManager.getInstance().registerTickListener(() => {
      const stateMachine = ChartStateMachine.getInstance();
      if (stateMachine.getState() === ChartState.READY) {
        stateMachine.transition(ChartState.STREAMING);
      }
    });

    // Auto-recovery flow: When connection shifts back to CONNECTED, reload data
    ChartStateMachine.getInstance().registerListener((state) => {
      if (state === ChartState.CONNECTED) {
        if (this.currentSymbol && this.currentTimeframe) {
          console.log('[ChartEngine] Restoring active chart session on reconnect for:', this.currentSymbol, this.currentTimeframe);
          this.reloadCurrentSession();
        }
      }
    });
  }

  public static getInstance(): ChartEngine {
    if (!ChartEngine.instance) {
      ChartEngine.instance = new ChartEngine();
    }
    return ChartEngine.instance;
  }

  public connect() {
    ChartConnectionManager.getInstance().connect();
  }

  public disconnect() {
    TickSubscriptionManager.getInstance().unsubscribe();
    ChartConnectionManager.getInstance().disconnect();
    this.currentSymbol = '';
    this.currentTimeframe = '';
  }

  private async reloadCurrentSession() {
    const symbol = this.currentSymbol;
    const timeframe = this.currentTimeframe;
    if (!symbol || !timeframe) return;

    const stateMachine = ChartStateMachine.getInstance();
    stateMachine.transition(ChartState.LOADING_HISTORY);

    try {
      const candles = await HistoryLoader.getInstance().loadHistory(symbol, timeframe);
      const cache = ChartCache.getInstance();
      cache.setCandles(candles);
      if (candles.length > 0) {
        cache.setLastPrice(candles[candles.length - 1].close);
      }
      stateMachine.transition(ChartState.READY);

      // Subscribe live ticks
      TickSubscriptionManager.getInstance().subscribe(symbol, timeframe);
      stateMachine.transition(ChartState.STREAMING);
    } catch (e: any) {
      console.error('[ChartEngine] Failed to restore session during reconnect:', e);
      stateMachine.transition(ChartState.ERROR, e.message || 'Failed to reload data');
    }
  }

  public async setSymbolAndTimeframe(symbol: string, timeframe: string) {
    if (!symbol || !timeframe) return;

    const isSameSymbol = this.currentSymbol === symbol;
    const isSameTimeframe = this.currentTimeframe === timeframe;

    if (isSameSymbol && isSameTimeframe) {
      // Data matches current active stream. Skip redundant fetches.
      return;
    }

    console.log(`[ChartEngine] Modifying stream from ${this.currentSymbol}(${this.currentTimeframe}) to ${symbol}(${timeframe})`);

    // 1. Cancel previous live ticks
    TickSubscriptionManager.getInstance().unsubscribe();

    this.currentSymbol = symbol;
    this.currentTimeframe = timeframe;

    const cache = ChartCache.getInstance();
    cache.setSymbol(symbol);
    cache.setTimeframe(timeframe);

    const wsManager = WebSocketManager.getInstance();
    const stateMachine = ChartStateMachine.getInstance();

    if (!wsManager.isConnected()) {
      console.log('[ChartEngine] Socket not open. Initiating connection first.');
      stateMachine.transition(ChartState.CONNECTING);
      ChartConnectionManager.getInstance().connect();

      // Wait for connected state before proceeding to load history
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (wsManager.isConnected()) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
    }

    // 2. Load candles only (subscribe=0)
    stateMachine.transition(ChartState.LOADING_HISTORY);
    try {
      const candles = await HistoryLoader.getInstance().loadHistory(symbol, timeframe);
      cache.setCandles(candles);
      if (candles.length > 0) {
        cache.setLastPrice(candles[candles.length - 1].close);
      }
      stateMachine.transition(ChartState.READY);

      // 3. Subscribe live ticks
      TickSubscriptionManager.getInstance().subscribe(symbol, timeframe);
      stateMachine.transition(ChartState.STREAMING);
    } catch (e: any) {
      console.error('[ChartEngine] Error loading history or subscribing ticks:', e);
      stateMachine.transition(ChartState.ERROR, e.message || 'Failed to load chart data');
    }
  }

  public async changeSymbol(symbol: string) {
    await this.setSymbolAndTimeframe(symbol, this.currentTimeframe || '1m');
  }

  public async changeTimeframe(timeframe: string) {
    await this.setSymbolAndTimeframe(this.currentSymbol || 'R_100', timeframe);
  }

  public getCurrentSymbol(): string {
    return this.currentSymbol;
  }

  public getCurrentTimeframe(): string {
    return this.currentTimeframe;
  }

  public forceReload() {
    const sym = this.currentSymbol;
    const tf = this.currentTimeframe;
    this.currentSymbol = '';
    this.currentTimeframe = '';
    this.setSymbolAndTimeframe(sym, tf);
  }
}

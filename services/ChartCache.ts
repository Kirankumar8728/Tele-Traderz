// ChartCache.ts

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class ChartCache {
  private static instance: ChartCache | null = null;
  private candles: Candle[] = [];
  private symbol: string = '';
  private timeframe: string = '';
  private lastPrice: number = 0;
  private viewport: any = null;

  private constructor() {}

  public static getInstance(): ChartCache {
    if (!ChartCache.instance) {
      ChartCache.instance = new ChartCache();
    }
    return ChartCache.instance;
  }

  public getCandles(): Candle[] {
    return this.candles;
  }

  public setCandles(candles: Candle[]) {
    // Keep 1000–2000 candles as per spec
    if (candles.length > 2000) {
      this.candles = candles.slice(candles.length - 2000);
    } else {
      this.candles = [...candles];
    }
  }

  public updateLatestCandle(candle: Candle) {
    if (this.candles.length === 0) {
      this.candles.push(candle);
      return;
    }
    const lastIdx = this.candles.length - 1;
    if (this.candles[lastIdx].timestamp === candle.timestamp) {
      this.candles[lastIdx] = candle;
    } else if (candle.timestamp > this.candles[lastIdx].timestamp) {
      this.candles.push(candle);
      if (this.candles.length > 2000) {
        this.candles.shift();
      }
    }
  }

  public getSymbol(): string {
    return this.symbol;
  }

  public setSymbol(symbol: string) {
    this.symbol = symbol;
  }

  public getTimeframe(): string {
    return this.timeframe;
  }

  public setTimeframe(timeframe: string) {
    this.timeframe = timeframe;
  }

  public getLastPrice(): number {
    return this.lastPrice;
  }

  public setLastPrice(price: number) {
    this.lastPrice = price;
  }

  public getViewport(): any {
    return this.viewport;
  }

  public setViewport(viewport: any) {
    this.viewport = viewport;
  }

  public clear() {
    this.candles = [];
    this.symbol = '';
    this.timeframe = '';
    this.lastPrice = 0;
    this.viewport = null;
  }
}

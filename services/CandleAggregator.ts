// CandleAggregator.ts
import { Candle, ChartCache } from './ChartCache';
import { TIMEFRAME_GRANULARITY } from '../constants';

export class CandleAggregator {
  private static instance: CandleAggregator | null = null;

  private constructor() {}

  public static getInstance(): CandleAggregator {
    if (!CandleAggregator.instance) {
      CandleAggregator.instance = new CandleAggregator();
    }
    return CandleAggregator.instance;
  }

  public aggregateTick(symbol: string, timeframe: string, tickPrice: number, tickTimeMs: number): { update: Candle; isNew: boolean } {
    const granularity = TIMEFRAME_GRANULARITY[timeframe] || 60;
    
    let bucketTime: number;
    if (granularity === 0) {
      // Tick chart: Each tick gets its own unique timestamp
      bucketTime = tickTimeMs;
    } else {
      bucketTime = Math.floor(tickTimeMs / (granularity * 1000)) * (granularity * 1000);
    }

    const cache = ChartCache.getInstance();
    const candles = cache.getCandles();

    if (candles.length === 0) {
      const newCandle: Candle = {
        timestamp: bucketTime,
        open: tickPrice,
        high: tickPrice,
        low: tickPrice,
        close: tickPrice,
        volume: 1
      };
      cache.updateLatestCandle(newCandle);
      cache.setLastPrice(tickPrice);
      return { update: newCandle, isNew: true };
    }

    const latest = candles[candles.length - 1];
    
    if (granularity === 0) {
      // Tick chart continues with a new point per tick
      const newCandle: Candle = {
        timestamp: bucketTime,
        open: tickPrice,
        high: tickPrice,
        low: tickPrice,
        close: tickPrice,
        volume: 1
      };
      cache.updateLatestCandle(newCandle);
      cache.setLastPrice(tickPrice);
      return { update: newCandle, isNew: true };
    }

    if (bucketTime === latest.timestamp) {
      // Update properties on the existing newest candle
      const updatedCandle: Candle = {
        ...latest,
        high: Math.max(latest.high, tickPrice),
        low: Math.min(latest.low, tickPrice),
        close: tickPrice,
        volume: latest.volume + 1
      };
      cache.updateLatestCandle(updatedCandle);
      cache.setLastPrice(tickPrice);
      return { update: updatedCandle, isNew: false };
    } else if (bucketTime > latest.timestamp) {
      // Time bucket has advanced. Create and append a new candle
      const newCandle: Candle = {
        timestamp: bucketTime,
        open: tickPrice,
        high: tickPrice,
        low: tickPrice,
        close: tickPrice,
        volume: 1
      };
      cache.updateLatestCandle(newCandle);
      cache.setLastPrice(tickPrice);
      return { update: newCandle, isNew: true };
    } else {
      // Ignore historical or out-of-order ticks that fall before the latest candle
      return { update: latest, isNew: false };
    }
  }
}

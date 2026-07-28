// useChartSubscription.ts
import { useEffect, useState } from 'react';
import { TickSubscriptionManager } from '../services/TickSubscriptionManager';
import { Candle, ChartCache } from '../services/ChartCache';

export const useChartSubscription = (symbol?: string, timeframe?: string) => {
  const [latestCandle, setLatestCandle] = useState<Candle | null>(null);

  useEffect(() => {
    if (!symbol || !timeframe) return;

    const tsm = TickSubscriptionManager.getInstance();
    
    const handleTickUpdate = (candle: Candle, isNew: boolean) => {
      setLatestCandle(candle);
    };

    tsm.registerTickListener(handleTickUpdate);
    tsm.subscribe(symbol, timeframe);

    return () => {
      tsm.unregisterTickListener(handleTickUpdate);
    };
  }, [symbol, timeframe]);

  return {
    latestCandle,
    lastPrice: ChartCache.getInstance().getLastPrice()
  };
};

// useChartHistory.ts
import { useState, useEffect } from 'react';
import { ChartCache, Candle } from '../services/ChartCache';
import { ChartStateMachine, ChartState } from '../services/ChartStateMachine';
import { HistoryLoader } from '../services/HistoryLoader';

export const useChartHistory = () => {
  const [candles, setCandles] = useState<Candle[]>(ChartCache.getInstance().getCandles());
  const [isLoading, setIsLoading] = useState(
    ChartStateMachine.getInstance().getState() === ChartState.LOADING_HISTORY
  );

  useEffect(() => {
    const sm = ChartStateMachine.getInstance();
    const handleStateChange = (state: ChartState) => {
      setIsLoading(state === ChartState.LOADING_HISTORY);
      if (state === ChartState.READY || state === ChartState.STREAMING) {
        setCandles([...ChartCache.getInstance().getCandles()]);
      }
    };

    sm.registerListener(handleStateChange);
    return () => {
      sm.unregisterListener(handleStateChange);
    };
  }, []);

  const loadHistory = async (symbol: string, timeframe: string) => {
    try {
      const loaded = await HistoryLoader.getInstance().loadHistory(symbol, timeframe);
      ChartCache.getInstance().setCandles(loaded);
      setCandles(loaded);
      return loaded;
    } catch (e) {
      console.error('[useChartHistory] Failed to load history:', e);
      throw e;
    }
  };

  return {
    candles,
    isLoading,
    loadHistory
  };
};

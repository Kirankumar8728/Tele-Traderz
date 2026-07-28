// useChart.ts
import { useEffect, useState } from 'react';
import { ChartEngine } from '../services/ChartEngine';
import { ChartStateMachine, ChartState } from '../services/ChartStateMachine';
import { ChartCache, Candle } from '../services/ChartCache';
import { TickSubscriptionManager } from '../services/TickSubscriptionManager';

export const useChart = (symbol?: string, timeframe?: string) => {
  const [state, setState] = useState<ChartState>(ChartStateMachine.getInstance().getState());
  const [candles, setCandles] = useState<Candle[]>(ChartCache.getInstance().getCandles());
  const [latestCandle, setLatestCandle] = useState<Candle | null>(null);
  const [lastPrice, setLastPrice] = useState<number>(ChartCache.getInstance().getLastPrice());
  const [errorMessage, setErrorMessage] = useState<string | null>(ChartStateMachine.getInstance().getErrorMessage() || null);

  useEffect(() => {
    const engine = ChartEngine.getInstance();
    engine.connect();

    if (symbol && timeframe) {
      engine.setSymbolAndTimeframe(symbol, timeframe);
    }

    const sm = ChartStateMachine.getInstance();
    const handleStateChange = (newState: ChartState, errorMsg?: string) => {
      setState(newState);
      setErrorMessage(errorMsg || null);
      setCandles([...ChartCache.getInstance().getCandles()]);
      setLastPrice(ChartCache.getInstance().getLastPrice());
    };

    sm.registerListener(handleStateChange);

    const tsm = TickSubscriptionManager.getInstance();
    const handleTick = (candle: Candle, isNew: boolean) => {
      setLatestCandle(candle);
      setLastPrice(candle.close);
      if (isNew) {
        setCandles([...ChartCache.getInstance().getCandles()]);
      } else {
        setCandles(prev => {
          if (prev.length === 0) return [candle];
          const updated = [...prev];
          updated[updated.length - 1] = candle;
          return updated;
        });
      }
    };

    tsm.registerTickListener(handleTick);

    return () => {
      sm.unregisterListener(handleStateChange);
      tsm.unregisterTickListener(handleTick);
    };
  }, [symbol, timeframe]);

  const changeSymbol = (newSymbol: string) => {
    ChartEngine.getInstance().changeSymbol(newSymbol);
  };

  const changeTimeframe = (newTimeframe: string) => {
    ChartEngine.getInstance().changeTimeframe(newTimeframe);
  };

  const setSymbolAndTimeframe = (newSymbol: string, newTimeframe: string) => {
    ChartEngine.getInstance().setSymbolAndTimeframe(newSymbol, newTimeframe);
  };

  const forceReload = () => {
    ChartEngine.getInstance().forceReload();
  };

  return {
    state,
    candles,
    latestCandle,
    lastPrice,
    errorMessage,
    changeSymbol,
    changeTimeframe,
    setSymbolAndTimeframe,
    forceReload
  };
};

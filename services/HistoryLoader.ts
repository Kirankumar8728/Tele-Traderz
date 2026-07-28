// HistoryLoader.ts
import { WebSocketManager } from './WebSocketManager';
import { MessageRouter } from './MessageRouter';
import { Candle } from './ChartCache';
import { TIMEFRAME_GRANULARITY } from '../constants';

export class HistoryLoader {
  private static instance: HistoryLoader | null = null;

  private constructor() {}

  public static getInstance(): HistoryLoader {
    if (!HistoryLoader.instance) {
      HistoryLoader.instance = new HistoryLoader();
    }
    return HistoryLoader.instance;
  }

  public loadHistory(symbol: string, timeframe: string): Promise<Candle[]> {
    return new Promise((resolve, reject) => {
      const wsManager = WebSocketManager.getInstance();
      if (!wsManager.isConnected()) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const reqId = MessageRouter.getInstance().getNextReqId();
      const granularity = TIMEFRAME_GRANULARITY[timeframe] || 60;
      const isTick = timeframe.endsWith('t');

      const request: any = {
        ticks_history: symbol,
        count: 1000,
        end: 'latest',
        style: isTick ? 'ticks' : 'candles',
        req_id: reqId
      };

      if (!isTick) {
        request.granularity = granularity;
      }

      console.log(`[HistoryLoader] Loading history for ${symbol} (${timeframe}) with req_id: ${reqId}`);

      const timeout = setTimeout(() => {
        MessageRouter.getInstance().unregisterReqIdHandler(reqId);
        reject(new Error('History request timeout after 15 seconds'));
      }, 15000);

      MessageRouter.getInstance().registerReqIdHandler(reqId, (data: any) => {
        clearTimeout(timeout);
        MessageRouter.getInstance().unregisterReqIdHandler(reqId);

        if (data.error) {
          reject(new Error(data.error.message || 'Error loading history'));
          return;
        }

        try {
          if (data.candles) {
            const candles: Candle[] = data.candles.map((c: any) => ({
              timestamp: c.epoch * 1000,
              open: parseFloat(c.open),
              high: parseFloat(c.high),
              low: parseFloat(c.low),
              close: parseFloat(c.close),
              volume: parseFloat(c.volume || c.count || '0')
            }));
            resolve(candles);
          } else if (data.history) {
            if (!data.history.times || data.history.times.length === 0) {
              resolve([]);
              return;
            }
            const candles: Candle[] = data.history.times.map((t: number, i: number) => {
              const price = parseFloat(data.history.prices[i]);
              return {
                timestamp: t * 1000,
                open: price,
                high: price,
                low: price,
                close: price,
                volume: 1
              };
            });
            resolve(candles);
          } else {
            reject(new Error('Response missing candles or history data'));
          }
        } catch (e: any) {
          reject(new Error(`Failed to parse history response: ${e.message}`));
        }
      });

      const sent = wsManager.send(request);
      if (!sent) {
        clearTimeout(timeout);
        MessageRouter.getInstance().unregisterReqIdHandler(reqId);
        reject(new Error('Failed to send history request via WebSocket'));
      }
    });
  }
}

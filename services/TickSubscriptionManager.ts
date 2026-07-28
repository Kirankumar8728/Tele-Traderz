// TickSubscriptionManager.ts
import { WebSocketManager } from './WebSocketManager';
import { MessageRouter } from './MessageRouter';
import { SubscriptionStore } from './SubscriptionStore';
import { CandleAggregator } from './CandleAggregator';
import { Candle } from './ChartCache';

export type TickListener = (candle: Candle, isNew: boolean) => void;

export class TickSubscriptionManager {
  private static instance: TickSubscriptionManager | null = null;
  private currentSymbol: string = '';
  private currentTimeframe: string = '';
  private currentSubscriptionId: string | null = null;
  private listeners: Set<TickListener> = new Set();

  private constructor() {
    // Listen to messages globally from MessageRouter
    MessageRouter.getInstance().registerGlobalHandler((data: any) => {
      this.handleIncomingMessage(data);
    });
  }

  public static getInstance(): TickSubscriptionManager {
    if (!TickSubscriptionManager.instance) {
      TickSubscriptionManager.instance = new TickSubscriptionManager();
    }
    return TickSubscriptionManager.instance;
  }

  public registerTickListener(listener: TickListener) {
    this.listeners.add(listener);
  }

  public unregisterTickListener(listener: TickListener) {
    this.listeners.delete(listener);
  }

  public subscribe(symbol: string, timeframe: string): void {
    const wsManager = WebSocketManager.getInstance();
    if (!wsManager.isConnected()) return;

    // Unsubscribe from previous symbol if different
    if (this.currentSymbol && this.currentSymbol !== symbol) {
      this.unsubscribe();
    }

    this.currentSymbol = symbol;
    this.currentTimeframe = timeframe;

    const reqId = MessageRouter.getInstance().getNextReqId();
    console.log(`[TickSubscriptionManager] Subscribing to ticks for ${symbol} (req_id: ${reqId})`);

    // Register temporary handler for the subscription response to retrieve subscriptionId
    MessageRouter.getInstance().registerReqIdHandler(reqId, (data: any) => {
      if (data.error) {
        console.warn('[TickSubscriptionManager] Subscription notice:', data.error?.message || data.error);
        return;
      }
      if (data.subscription) {
        this.currentSubscriptionId = data.subscription.id;
        console.log(`[TickSubscriptionManager] Subscription confirmed. ID: ${this.currentSubscriptionId}`);
        SubscriptionStore.getInstance().addSubscription(symbol, {
          type: 'ticks',
          symbol: symbol,
          subscriptionId: data.subscription.id
        });
      }
    });

    const request = {
      ticks: symbol,
      subscribe: 1,
      req_id: reqId
    };

    wsManager.send(request);
  }

  public unsubscribe(): void {
    const wsManager = WebSocketManager.getInstance();
    if (!wsManager.isConnected()) return;

    if (this.currentSubscriptionId) {
      console.log(`[TickSubscriptionManager] Unsubscribing from ${this.currentSymbol} (ID: ${this.currentSubscriptionId})`);
      wsManager.send({
        forget: this.currentSubscriptionId
      });
      SubscriptionStore.getInstance().removeSubscription(this.currentSymbol);
      this.currentSubscriptionId = null;
    } else if (this.currentSymbol) {
      console.log(`[TickSubscriptionManager] Unsubscribing via forget_all ticks for ${this.currentSymbol}`);
      wsManager.send({
        forget_all: 'ticks'
      });
      SubscriptionStore.getInstance().removeSubscription(this.currentSymbol);
    }
    this.currentSymbol = '';
  }

  private handleIncomingMessage(data: any) {
    // Check if the message is a tick for our current symbol
    if (data.msg_type === 'tick' && data.tick) {
      const tick = data.tick;
      if (tick.symbol !== this.currentSymbol) return;

      const price = parseFloat(tick.quote);
      const timeMs = tick.epoch * 1000;

      // Aggregate tick to candle
      const { update, isNew } = CandleAggregator.getInstance().aggregateTick(
        this.currentSymbol,
        this.currentTimeframe,
        price,
        timeMs
      );

      // Notify listeners
      this.listeners.forEach(l => {
        try {
          l(update, isNew);
        } catch (e) {
          console.error('[TickSubscriptionManager] Error in tick listener:', e);
        }
      });
    }
  }

  public clear() {
    this.unsubscribe();
    this.listeners.clear();
  }
}

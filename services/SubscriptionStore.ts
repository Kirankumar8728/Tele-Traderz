// SubscriptionStore.ts

export interface ChartSubscription {
  type: 'ticks' | 'candles';
  symbol: string;
  subscriptionId?: string;
}

export class SubscriptionStore {
  private static instance: SubscriptionStore | null = null;
  private activeSubscriptions: Map<string, ChartSubscription> = new Map();

  private constructor() {}

  public static getInstance(): SubscriptionStore {
    if (!SubscriptionStore.instance) {
      SubscriptionStore.instance = new SubscriptionStore();
    }
    return SubscriptionStore.instance;
  }

  public addSubscription(key: string, sub: ChartSubscription) {
    this.activeSubscriptions.set(key, sub);
  }

  public getSubscription(key: string): ChartSubscription | undefined {
    return this.activeSubscriptions.get(key);
  }

  public removeSubscription(key: string) {
    this.activeSubscriptions.delete(key);
  }

  public getAllSubscriptions(): [string, ChartSubscription][] {
    return Array.from(this.activeSubscriptions.entries());
  }

  public clear() {
    this.activeSubscriptions.clear();
  }
}

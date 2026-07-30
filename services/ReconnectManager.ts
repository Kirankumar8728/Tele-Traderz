// ReconnectManager.ts

export class ReconnectManager {
  private static instance: ReconnectManager | null = null;
  private attempt = 0;
  private reconnectTimeout: any = null;
  private isReconnectingFlag = false;

  private constructor() {}

  public static getInstance(): ReconnectManager {
    if (!ReconnectManager.instance) {
      ReconnectManager.instance = new ReconnectManager();
    }
    return ReconnectManager.instance;
  }

  public triggerReconnect(reconnectFn: () => void) {
    if (this.reconnectTimeout) return; // Reconnection already scheduled

    this.isReconnectingFlag = true;
    const delay = 1000; // Always retry in 1 second on connection drop
    console.log(`[ReconnectManager] Scheduling reconnection in 1000ms (attempt ${this.attempt + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.attempt++;
      try {
        reconnectFn();
      } catch (e) {
        console.error('[ReconnectManager] Error during reconnection callback:', e);
      }
    }, delay);
  }

  public reset() {
    console.log('[ReconnectManager] Resetting backoff attempts');
    this.attempt = 0;
    this.isReconnectingFlag = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public isReconnecting(): boolean {
    return this.isReconnectingFlag;
  }

  public getAttemptCount(): number {
    return this.attempt;
  }
}

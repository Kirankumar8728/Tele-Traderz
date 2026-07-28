// HeartbeatManager.ts
import { WebSocketManager } from './WebSocketManager';
import { MessageRouter } from './MessageRouter';

export class HeartbeatManager {
  private static instance: HeartbeatManager | null = null;
  private pingInterval: any = null;
  private pongTimeout: any = null;
  private onTimeoutCallback: (() => void) | null = null;

  private constructor() {
    // Listen globally for ping or pong messages
    MessageRouter.getInstance().registerGlobalHandler((data: any) => {
      if (data.ping === 'pong' || data.msg_type === 'ping') {
        this.handlePong();
      }
    });
  }

  public static getInstance(): HeartbeatManager {
    if (!HeartbeatManager.instance) {
      HeartbeatManager.instance = new HeartbeatManager();
    }
    return HeartbeatManager.instance;
  }

  public start(onTimeout: () => void) {
    this.onTimeoutCallback = onTimeout;
    this.stop();

    console.log('[HeartbeatManager] Starting heartbeat monitor');
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 20000); // 20 seconds as per specification
  }

  public stop() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private sendPing() {
    const wsManager = WebSocketManager.getInstance();
    if (!wsManager.isConnected()) return;

    console.log('[HeartbeatManager] Sending ping to server');
    wsManager.send({ ping: 1 });

    if (!this.pongTimeout) {
      this.pongTimeout = setTimeout(() => {
        console.warn('[HeartbeatManager] Pong timeout reached (40 seconds). Triggering reconnection flow.');
        if (this.onTimeoutCallback) {
          this.onTimeoutCallback();
        }
      }, 40000); // 40 seconds as per specification
    }
  }

  private handlePong() {
    console.log('[HeartbeatManager] Pong received, clearing timeout');
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }
}

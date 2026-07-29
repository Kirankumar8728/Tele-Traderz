// WebSocketManager.ts
import { DERIV_WS_URL } from '../constants';
import { MessageRouter } from './MessageRouter';

export class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private ws: WebSocket | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: ((error?: string) => void) | null = null;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public registerCallbacks(onConnect: () => void, onDisconnect: (error?: string) => void) {
    this.onConnectCallback = onConnect;
    this.onDisconnectCallback = onDisconnect;
  }

  public connect(): void {
    if (this.ws) {
      const state = this.ws.readyState;
      if (state === WebSocket.OPEN) {
        if (this.onConnectCallback) this.onConnectCallback();
        return;
      }
      if (state === WebSocket.CONNECTING) {
        return;
      }
      this.disconnect();
    }

    console.log('[WebSocketManager] Establishing new WebSocket connection:', DERIV_WS_URL);
    try {
      this.ws = new WebSocket(DERIV_WS_URL);
    } catch (e: any) {
      console.error('[WebSocketManager] Sync connection error:', e);
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback(e.message || 'Failed to instantiate WebSocket');
      }
      return;
    }

    this.ws.onopen = () => {
      console.log('[WebSocketManager] WebSocket opened successfully');
      if (this.onConnectCallback) {
        this.onConnectCallback();
      }
    };

    this.ws.onmessage = (event: MessageEvent) => {
      MessageRouter.getInstance().routeMessage(event.data);
    };

    this.ws.onerror = (event: Event) => {
      console.error('[WebSocketManager] WebSocket error event:', event);
      MessageRouter.getInstance().rejectAllPending('WebSocket error occurred');
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log(`[WebSocketManager] WebSocket closed (code: ${event.code}, reason: ${event.reason})`);
      this.ws = null;
      MessageRouter.getInstance().rejectAllPending(event.reason || `Socket closed (code: ${event.code})`);
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback(event.reason || `Socket closed (code: ${event.code})`);
      }
    };
  }

  public disconnect(): void {
    if (!this.ws) return;
    console.log('[WebSocketManager] Explicit disconnect requested');
    // Clear handlers to avoid event triggers during deliberate teardown
    this.ws.onopen = null;
    this.ws.onmessage = null;
    this.ws.onerror = null;
    this.ws.onclose = null;
    try {
      this.ws.close();
    } catch (e) {
      console.error('[WebSocketManager] Error closing WebSocket:', e);
    }
    this.ws = null;
  }

  public send(data: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketManager] Attempted to send on non-open WebSocket. State is:', this.ws ? this.ws.readyState : 'NULL');
      return false;
    }
    try {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[WebSocketManager] Send error:', e);
      return false;
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public isConnecting(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.CONNECTING;
  }
}
